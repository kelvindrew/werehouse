/**
 * Firebase Firestore Real-Time Synchronization Engine
 * Bridges local in-memory & IndexedDB/localStorage data with Cloud Firestore (werehouse-wms)
 */
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch, 
  limit, 
  query,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { StockItem, Material, StorageLocation, StockMovement, StockIssueVoucher, AuditLog } from '@shared/types/models';

import seedMaterials from '../data/materials.json';
import seedStock from '../data/stock.json';
import seedWarehouses from '../data/warehouses.json';
import { DEFAULT_LOCATIONS } from './defaultLocations';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  isSeeded: boolean;
  lastSyncTime: Date | null;
  pendingCount: number;
  syncError: string | null;
}

class FirebaseSyncService {
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private dataListeners: (() => void)[] = [];
  private unsubscribers: (() => void)[] = [];
  private status: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    isSeeded: false,
    lastSyncTime: null,
    pendingCount: 0,
    syncError: null
  };
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateOnlineStatus(true));
      window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    callback(this.getStatus());
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  public onRemoteDataUpdated(callback: () => void): () => void {
    this.dataListeners.push(callback);
    return () => {
      this.dataListeners = this.dataListeners.filter(cb => cb !== callback);
    };
  }

  private notifyStatus(): void {
    const s = this.getStatus();
    this.syncListeners.forEach(cb => {
      try { cb(s); } catch (e) { console.error('Error in sync listener:', e); }
    });
  }

  private notifyData(): void {
    this.dataListeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('Error in data listener:', e); }
    });
  }

  private updateOnlineStatus(online: boolean): void {
    this.status.isOnline = online;
    this.notifyStatus();
  }

  /**
   * Initializes Firestore sync and listeners
   */
  public async initialize(
    onRemoteStock: (stocks: StockItem[]) => void,
    onRemoteLocations: (locations: StorageLocation[]) => void,
    onRemoteMovements: (movements: StockMovement[]) => void,
    onRemoteVouchers: (vouchers: StockIssueVoucher[]) => void
  ): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.status.isSyncing = true;
    this.notifyStatus();

    try {
      // 1. Check if Firestore stock collection is empty; if so, auto-seed with drew.xlsx
      await this.checkAndSeedFirestoreIfEmpty();

      // 2. Set up real-time listener for Stock
      const stockColl = collection(db, 'stock');
      const unsubStock = onSnapshot(stockColl, (snapshot) => {
        if (!snapshot.empty) {
          const items: StockItem[] = [];
          snapshot.forEach(docSnap => {
            items.push(docSnap.data() as StockItem);
          });
          onRemoteStock(items);
          this.status.lastSyncTime = new Date();
          this.status.syncError = null;
          this.notifyStatus();
          this.notifyData();
        }
      }, (err) => {
        console.warn('Firestore stock listener note:', err.message);
        this.status.syncError = err.message;
        this.notifyStatus();
      });
      this.unsubscribers.push(unsubStock);

      // 3. Set up real-time listener for Locations
      const locsColl = collection(db, 'locations');
      const unsubLocs = onSnapshot(locsColl, (snapshot) => {
        if (!snapshot.empty) {
          const locs: StorageLocation[] = [];
          snapshot.forEach(docSnap => {
            locs.push(docSnap.data() as StorageLocation);
          });
          onRemoteLocations(locs);
          this.notifyData();
        }
      }, (err) => {
        console.warn('Firestore locations listener note:', err.message);
      });
      this.unsubscribers.push(unsubLocs);

      // 4. Set up real-time listener for Movements
      const movsColl = collection(db, 'movements');
      const unsubMovs = onSnapshot(movsColl, (snapshot) => {
        if (!snapshot.empty) {
          const movs: StockMovement[] = [];
          snapshot.forEach(docSnap => {
            movs.push(docSnap.data() as StockMovement);
          });
          onRemoteMovements(movs);
          this.notifyData();
        }
      }, (err) => {
        console.warn('Firestore movements listener note:', err.message);
      });
      this.unsubscribers.push(unsubMovs);

      // 5. Set up real-time listener for Issue Vouchers
      const vouchersColl = collection(db, 'issue_vouchers');
      const unsubVouchers = onSnapshot(vouchersColl, (snapshot) => {
        if (!snapshot.empty) {
          const vouchers: StockIssueVoucher[] = [];
          snapshot.forEach(docSnap => {
            vouchers.push(docSnap.data() as StockIssueVoucher);
          });
          onRemoteVouchers(vouchers);
          this.notifyData();
        }
      }, (err) => {
        console.warn('Firestore vouchers listener note:', err.message);
      });
      this.unsubscribers.push(unsubVouchers);

      this.status.isSyncing = false;
      this.notifyStatus();
    } catch (err: any) {
      console.warn('Firebase sync initialization fallback to local:', err?.message);
      this.status.isSyncing = false;
      this.status.syncError = err?.message || 'Offline mode active';
      this.notifyStatus();
    }
  }

  /**
   * Seeds Firestore from drew.xlsx master JSON datasets if empty
   */
  public async checkAndSeedFirestoreIfEmpty(): Promise<boolean> {
    try {
      const stockRef = collection(db, 'stock');
      const q = query(stockRef, limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        console.log('🌱 Seeding Firestore with drew.xlsx database (1524 stock items, 1466 materials)...');
        this.status.isSyncing = true;
        this.notifyStatus();

        // Seed Locations
        const locsRef = collection(db, 'locations');
        const locBatch = writeBatch(db);
        DEFAULT_LOCATIONS.forEach(loc => {
          locBatch.set(doc(locsRef, loc.id), loc);
        });
        await locBatch.commit();

        // Seed Materials in chunks of 400
        const materialsList = seedMaterials as Material[];
        for (let i = 0; i < materialsList.length; i += 400) {
          const chunk = materialsList.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach(m => {
            const mDoc = doc(db, 'materials', m.id || m.materialCode);
            batch.set(mDoc, m);
          });
          await batch.commit();
        }

        // Seed Stock in chunks of 400
        const stockList = seedStock as StockItem[];
        for (let i = 0; i < stockList.length; i += 400) {
          const chunk = stockList.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach(s => {
            const sDoc = doc(db, 'stock', s.id);
            batch.set(sDoc, s);
          });
          await batch.commit();
        }

        console.log('✅ Firestore successfully seeded with real database ($4.09M, 98,630 units)!');
        this.status.isSeeded = true;
        this.status.isSyncing = false;
        this.status.lastSyncTime = new Date();
        this.notifyStatus();
        return true;
      } else {
        this.status.isSeeded = true;
        this.notifyStatus();
        return false;
      }
    } catch (e: any) {
      console.warn('Seeding check note:', e?.message);
      this.status.isSyncing = false;
      this.notifyStatus();
      return false;
    }
  }

  /**
   * Pushes a single or multiple stock items to Firestore
   */
  public async pushStockItems(items: StockItem[]): Promise<void> {
    if (!this.status.isOnline) return;
    try {
      for (let i = 0; i < items.length; i += 400) {
        const chunk = items.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          batch.set(doc(db, 'stock', item.id), item);
        });
        await batch.commit();
      }
      this.status.lastSyncTime = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn('Firestore push stock note:', err?.message);
    }
  }

  /**
   * Pushes a movement to Firestore
   */
  public async pushMovement(movement: StockMovement): Promise<void> {
    if (!this.status.isOnline) return;
    try {
      await setDoc(doc(db, 'movements', movement.id), movement);
      this.status.lastSyncTime = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn('Firestore push movement note:', err?.message);
    }
  }

  /**
   * Pushes a storage location to Firestore
   */
  public async pushLocation(location: StorageLocation): Promise<void> {
    if (!this.status.isOnline) return;
    try {
      await setDoc(doc(db, 'locations', location.id), location);
      this.status.lastSyncTime = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn('Firestore push location note:', err?.message);
    }
  }

  /**
   * Deletes a location from Firestore
   */
  public async deleteLocation(locationId: string): Promise<void> {
    if (!this.status.isOnline) return;
    try {
      await deleteDoc(doc(db, 'locations', locationId));
      this.status.lastSyncTime = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn('Firestore delete location note:', err?.message);
    }
  }

  /**
   * Pushes an issue voucher to Firestore
   */
  public async pushIssueVoucher(voucher: StockIssueVoucher): Promise<void> {
    if (!this.status.isOnline) return;
    try {
      await setDoc(doc(db, 'issue_vouchers', voucher.id), voucher);
      this.status.lastSyncTime = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn('Firestore push voucher note:', err?.message);
    }
  }

  /**
   * Pushes an audit log to Firestore
   */
  public async pushAuditLog(audit: AuditLog): Promise<void> {
    if (!this.status.isOnline) return;
    try {
      await setDoc(doc(db, 'audit_logs', audit.id), audit);
    } catch (err: any) {
      console.warn('Firestore push audit note:', err?.message);
    }
  }

  public destroy(): void {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}

export const firebaseSync = new FirebaseSyncService();
