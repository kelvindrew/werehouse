import { 
  Warehouse, 
  Material, 
  BinLocation, 
  StockItem, 
  StockMovement, 
  AuditLog, 
  ExcelImportSummary,
  User,
  SharedLink,
  SharedLinkFilters,
  SharedLinkColumn,
  SharedLinkStatus,
  StorageLocation,
  LocationType,
  AutocompleteFieldType,
  AutocompleteResult,
  AutocompleteSuggestion,
  StockIssueVoucher,
  IssueVoucherItem,
  IssueVoucherStatus
} from '@shared/types/models';
import { autocompleteService } from './autocompleteService';
import * as XLSX from 'xlsx';

// Import raw seed data generated from Copie de B1&B2 warehouse sheet-202602.xlsx
import seedWarehouses from '../data/warehouses.json';
import seedMaterials from '../data/materials.json';
import seedBins from '../data/bins.json';
import seedStock from '../data/stock.json';
import seedMovements from '../data/stock_movements.json';
import seedAuditReport from '../data/import_audit_report.json';

// Local storage keys for persistent offline/browser state
const STORAGE_KEY_STOCK = 'wms_b1_b2_stock_v1';
const STORAGE_KEY_MOVEMENTS = 'wms_b1_b2_movements_v1';
const STORAGE_KEY_AUDIT = 'wms_b1_b2_audit_v1';
const STORAGE_KEY_SHARED_LINKS = 'wms_b1_b2_shared_links_v1';
const STORAGE_KEY_LOCATIONS = 'wms_storage_locations_v2';
const STORAGE_KEY_ISSUE_VOUCHERS = 'wms_b1_b2_issue_vouchers_v1';

import { DEFAULT_LOCATIONS, getLocationParts, formatLocationSummary } from './defaultLocations';
export { DEFAULT_LOCATIONS, getLocationParts, formatLocationSummary };
import { firebaseSync } from './firebaseSync';
export { firebaseSync };


export const INDUSTRIAL_MATERIAL_IMAGES: {
  keywords: string[];
  images: string[];
}[] = [
  {
    keywords: ['VALVE', 'RELIEF', 'BALL', 'GATE', 'CHECK', 'BUTTERFLY', '安全阀', '球阀', '闸阀', '止回阀'],
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['PUMP', 'IMPELLER', 'LINER', 'INSERT', 'CASING', '泵', '叶轮', '后护板', '蜗壳'],
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['BEARING', 'ROLLER', 'BALL BEARING', 'BUSHING', '轴承', '滚子轴承', '衬套'],
    images: [
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['CABLE', 'WIRE', 'BREAKER', 'SWITCH', 'RELAY', 'SENSOR', 'ELECTR', '电缆', '断路器', '继电器', '传感器'],
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['BOLT', 'NUT', 'SCREW', 'WASHER', 'STUD', 'FASTENER', '螺栓', '螺母', '垫圈'],
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['FILTER', 'ELEMENT', 'GASKET', 'SEAL', 'O-RING', 'BELT', '过滤器', '垫片', '密封圈', '皮带'],
    images: [
      'https://images.unsplash.com/photo-1618090584176-7132b9911657?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['TOOL', 'WRENCH', 'PLIER', 'HAMMER', 'GAUGE', '工具', '扳手', '钳', '仪表'],
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    keywords: ['PAINT', 'OIL', 'GREASE', 'LUBRICANT', 'GLOVE', 'HELMET', '油漆', '润滑油', '手套', '安全帽'],
    images: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

export const FALLBACK_INDUSTRIAL_IMAGES = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618090584176-7132b9911657?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
];

export function assignSampleMaterialImage(m: Partial<Material>, idx: number = 0): string {
  if (m.imageUrl) return m.imageUrl;

  const targetText = `${m.name || ''} ${m.chineseName || ''} ${m.description || ''} ${m.category || ''}`.toUpperCase();
  
  for (const cat of INDUSTRIAL_MATERIAL_IMAGES) {
    if (cat.keywords.some(k => targetText.includes(k))) {
      const codeNum = m.materialCode ? parseInt(m.materialCode.slice(-3), 10) : idx;
      const imgIdx = Math.abs(Number.isNaN(codeNum) ? idx : codeNum) % cat.images.length;
      return cat.images[imgIdx];
    }
  }

  const hash = m.materialCode ? m.materialCode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : idx;
  return FALLBACK_INDUSTRIAL_IMAGES[Math.abs(hash) % FALLBACK_INDUSTRIAL_IMAGES.length];
}

class DataService {
  private warehouses: Warehouse[] = (seedWarehouses as unknown) as Warehouse[];
  private locations: Map<string, StorageLocation> = new Map();
  private materials: Map<string, Material> = new Map();
  private bins: Map<string, BinLocation> = new Map();
  private stock: Map<string, StockItem> = new Map();
  private movements: StockMovement[] = [];
  private auditLogs: AuditLog[] = [];
  private sharedLinks: Map<string, SharedLink> = new Map();
  private issueVouchers: Map<string, StockIssueVoucher> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initData();
    autocompleteService.setDataProvider(this);
    this.initFirestoreSync();
  }

  private initFirestoreSync() {
    if (typeof window === 'undefined') return;
    firebaseSync.initialize(
      (remoteStocks) => {
        remoteStocks.forEach(s => {
          this.stock.set(s.id, s);
        });
        this.saveStockToStorage();
        this.notify();
      },
      (remoteLocations) => {
        remoteLocations.forEach(l => {
          this.locations.set(l.id, l);
        });
        this.saveLocationsToStorage();
        this.notify();
      },
      (remoteMovements) => {
        const existingIds = new Set(this.movements.map(m => m.id));
        remoteMovements.forEach(m => {
          if (!existingIds.has(m.id)) {
            this.movements.unshift(m);
            existingIds.add(m.id);
          }
        });
        this.saveMovementsToStorage();
        this.notify();
      },
      (remoteVouchers) => {
        remoteVouchers.forEach(v => {
          this.issueVouchers.set(v.id, v);
        });
        this.saveIssueVouchersToStorage();
        this.notify();
      },
      (remoteSharedLinks) => {
        remoteSharedLinks.forEach(l => {
          this.sharedLinks.set(l.id, l);
        });
        this.saveSharedLinksToStorage();
        this.notify();
      }
    ).catch(err => {
      console.warn('initFirestoreSync note:', err?.message);
    });
  }

  private initData() {
    // Populate Locations (Magasins, Containers, Yard, Workshop...)
    const cachedLocations = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    if (cachedLocations) {
      try {
        const parsed = JSON.parse(cachedLocations) as StorageLocation[];
        parsed.forEach(l => {
          const def = DEFAULT_LOCATIONS.find(d => d.id === l.id || d.code === l.code);
          if (def) {
            if (!l.imageUrl) l.imageUrl = def.imageUrl;
            if (!l.images || l.images.length === 0) l.images = def.images;
          }
          this.locations.set(l.id, l);
        });
      } catch (e) {
        this.initDefaultLocations();
      }
    } else {
      this.initDefaultLocations();
    }

    // Populate Materials with realistic industrial sample images
    (seedMaterials as unknown as Material[]).forEach((m, idx) => {
      const mat = { ...m };
      if (!mat.imageUrl) {
        mat.imageUrl = assignSampleMaterialImage(mat, idx);
      }
      this.materials.set(mat.id, mat);
    });

    // Populate custom material images if any (user manual overrides take precedence)
    try {
      const cachedImages = localStorage.getItem('wms_material_images_v1');
      if (cachedImages) {
        const imgMap = JSON.parse(cachedImages) as Record<string, string>;
        for (const [matId, imgUrl] of Object.entries(imgMap)) {
          const mat = this.materials.get(matId);
          if (mat && imgUrl) mat.imageUrl = imgUrl;
        }
      }
    } catch (e) {}

    // Populate Bins
    (seedBins as unknown as BinLocation[]).forEach(b => {
      this.bins.set(b.id, b);
    });

    // Load Stock from local storage or seed
    const cachedStock = localStorage.getItem(STORAGE_KEY_STOCK);
    if (cachedStock) {
      try {
        const parsed = JSON.parse(cachedStock) as StockItem[];
        parsed.forEach(s => {
          if (!s.locationId) {
            s.locationId = s.warehouseId === 'B1' ? 'LOC-B1' : s.warehouseId === 'B2' ? 'LOC-B2' : undefined;
            s.locationType = s.locationType || (s.warehouseId.startsWith('CONT') ? 'CONTAINER' : s.warehouseId === 'YARD' ? 'YARD' : 'WAREHOUSE');
          }
          this.stock.set(s.id, s);
        });
        this.seedNonRigidLocationItems();
      } catch (e) {
        this.loadSeedStock();
      }
    } else {
      this.loadSeedStock();
    }

    // Load Movements
    const cachedMovements = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
    if (cachedMovements) {
      try {
        this.movements = JSON.parse(cachedMovements) as StockMovement[];
      } catch (e) {
        this.movements = (seedMovements as unknown) as StockMovement[];
      }
    } else {
      this.movements = (seedMovements as unknown) as StockMovement[];
    }

    // Load Audit Logs
    const cachedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (cachedAudit) {
      try {
        this.auditLogs = JSON.parse(cachedAudit) as AuditLog[];
      } catch (e) {
        this.createInitialAuditLogs();
      }
    } else {
      this.createInitialAuditLogs();
    }

    // Load Shared Links
    const cachedLinks = localStorage.getItem(STORAGE_KEY_SHARED_LINKS);
    if (cachedLinks) {
      try {
        const parsed = JSON.parse(cachedLinks) as SharedLink[];
        parsed.forEach(l => this.sharedLinks.set(l.id, l));
      } catch (e) {
        this.createSeedSharedLinks();
      }
    } else {
      this.createSeedSharedLinks();
    }

    // Load Issue Vouchers
    const cachedVouchers = localStorage.getItem(STORAGE_KEY_ISSUE_VOUCHERS);
    if (cachedVouchers) {
      try {
        const parsed = JSON.parse(cachedVouchers) as StockIssueVoucher[];
        parsed.forEach(v => this.issueVouchers.set(v.id, v));
      } catch (e) {
        this.createSeedIssueVouchers();
      }
    } else {
      this.createSeedIssueVouchers();
    }
  }

  private initDefaultLocations() {
    this.locations.clear();
    DEFAULT_LOCATIONS.forEach(l => {
      this.locations.set(l.id, { ...l });
    });
    this.saveLocationsToStorage();
  }

  private saveLocationsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(Array.from(this.locations.values())));
    } catch (e) {
      console.warn('Storage quota note for locations:', e);
    }
  }

  private loadSeedStock() {
    (seedStock as unknown as StockItem[]).forEach(s => {
      s.locationId = s.warehouseId === 'B1' ? 'LOC-B1' : s.warehouseId === 'B2' ? 'LOC-B2' : undefined;
      s.locationType = 'WAREHOUSE';
      this.stock.set(s.id, s);
    });
    this.seedNonRigidLocationItems();
    this.saveStockToStorage();
  }

  private seedNonRigidLocationItems() {
    const hasSpecial = Array.from(this.stock.values()).some(s => s.warehouseId === 'CONT-02' || s.warehouseId === 'YARD');
    if (hasSpecial) return;

    const materialsArr = Array.from(this.materials.values());
    if (materialsArr.length < 4) return;

    // 1. Container 02 (Côté gauche / C-04)
    const m1 = materialsArr[0];
    const id1 = `CONT-02_${m1.id}_C-04`;
    this.stock.set(id1, {
      id: id1,
      materialId: m1.id,
      materialCode: m1.materialCode,
      materialName: m1.name,
      chineseName: m1.chineseName,
      specification: m1.specification,
      warehouseId: 'CONT-02',
      locationId: 'LOC-CONT-02',
      locationType: 'CONTAINER',
      containerNumber: 'Container 02',
      zone: 'Côté gauche',
      position: 'C-04',
      binLocation: 'CONT-02 (Côté gauche / C-04)',
      uom: m1.uom,
      quantity: 14,
      reservedQuantity: 0,
      availableQuantity: 14,
      unitPrice: m1.standardPrice || 120,
      totalValue: 14 * (m1.standardPrice || 120),
      remarks: 'Stocké en container outillage',
      lastUpdated: new Date().toISOString()
    });

    // 2. Container 01 (Rack R01 / Étagère S02)
    const m2 = materialsArr[1];
    const id2 = `CONT-01_${m2.id}_R01-S02`;
    this.stock.set(id2, {
      id: id2,
      materialId: m2.id,
      materialCode: m2.materialCode,
      materialName: m2.name,
      chineseName: m2.chineseName,
      specification: m2.specification,
      warehouseId: 'CONT-01',
      locationId: 'LOC-CONT-01',
      locationType: 'CONTAINER',
      containerNumber: 'Container 01',
      rack: 'R01',
      shelf: 'S02',
      binLocation: 'CONT-01 (R01 / S02)',
      uom: m2.uom,
      quantity: 32,
      reservedQuantity: 0,
      availableQuantity: 32,
      unitPrice: m2.standardPrice || 85,
      totalValue: 32 * (m2.standardPrice || 85),
      remarks: 'Brides et raccords inox',
      lastUpdated: new Date().toISOString()
    });

    // 3. Yard (Zone Y-A)
    const m3 = materialsArr[2];
    const id3 = `YARD_${m3.id}_Zone-Y-A`;
    this.stock.set(id3, {
      id: id3,
      materialId: m3.id,
      materialCode: m3.materialCode,
      materialName: m3.name,
      chineseName: m3.chineseName,
      specification: m3.specification,
      warehouseId: 'YARD',
      locationId: 'LOC-YARD',
      locationType: 'YARD',
      zone: 'Zone Y-A',
      locationNotes: 'Au sol, travée Nord 3',
      binLocation: 'Yard (Zone Y-A)',
      uom: m3.uom,
      quantity: 8,
      reservedQuantity: 0,
      availableQuantity: 8,
      unitPrice: m3.standardPrice || 450,
      totalValue: 8 * (m3.standardPrice || 450),
      remarks: 'Stockage extérieur sous bâche renforcée',
      lastUpdated: new Date().toISOString()
    });

    // 4. Workshop (Établi 2)
    const m4 = materialsArr[3];
    const id4 = `WORKSHOP_${m4.id}_Etabli-2`;
    this.stock.set(id4, {
      id: id4,
      materialId: m4.id,
      materialCode: m4.materialCode,
      materialName: m4.name,
      chineseName: m4.chineseName,
      specification: m4.specification,
      warehouseId: 'WORKSHOP',
      locationId: 'LOC-WORKSHOP',
      locationType: 'WORKSHOP',
      zone: 'Établi 2',
      binLocation: 'Atelier (Établi 2)',
      uom: m4.uom,
      quantity: 3,
      reservedQuantity: 0,
      availableQuantity: 3,
      unitPrice: m4.standardPrice || 310,
      totalValue: 3 * (m4.standardPrice || 310),
      remarks: 'Pièces réservées pour maintenance pompes',
      lastUpdated: new Date().toISOString()
    });
  }

  private createInitialAuditLogs() {
    this.auditLogs = [
      {
        id: 'LOG-INIT-001',
        userId: 'system',
        userName: 'Migration System',
        userRole: 'ADMIN',
        action: 'EXCEL_IMPORT',
        targetCollection: 'stock',
        targetId: 'B1 & B2 Initial Excel Migration',
        description: 'Initial import of B1 (40,681 QTY) and B2 (57,949 QTY) from Excel sheet.',
        newValue: {
          b1Units: 40681,
          b2Units: 57949,
          totalRecords: this.stock.size
        },
        timestamp: new Date().toISOString()
      }
    ];
    this.saveAuditToStorage();
  }

  private saveStockToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(Array.from(this.stock.values())));
    } catch (e) {
      console.warn('Storage quota note for stock:', e);
    }
  }

  private saveMovementsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(this.movements.slice(0, 3000)));
    } catch (e) {
      console.warn('Storage quota note for movements:', e);
    }
  }

  private saveAuditToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs.slice(0, 1000)));
    } catch (e) {
      console.warn('Storage quota note for audit logs:', e);
    }
  }

  private saveSharedLinksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_SHARED_LINKS, JSON.stringify(Array.from(this.sharedLinks.values())));
    } catch (e) {
      console.warn('Storage quota note for shared links:', e);
    }
  }

  private saveIssueVouchersToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_ISSUE_VOUCHERS, JSON.stringify(Array.from(this.issueVouchers.values())));
    } catch (e) {
      console.warn('Storage quota note for issue vouchers:', e);
    }
  }

  private createSeedSharedLinks() {
    const now = new Date();
    // 1 Active link for Valves in B1, expiring in 48 hours
    const link1Expires = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();
    const link1: SharedLink = {
      id: 'SL-DEMO-VALVES-B1',
      token: '8fK92xLmQp7',
      title: 'Pièces de robinetterie & vannes — Magasin B1 (MD01)',
      filters: {
        warehouseId: 'B1',
        searchQuery: 'VALVE',
        binLocation: 'MD01',
        status: 'IN_STOCK'
      },
      visibleColumns: [
        'materialCode',
        'materialName',
        'chineseName',
        'specification',
        'warehouseId',
        'binLocation',
        'quantity',
        'availableQuantity',
        'uom',
        'photo'
      ],
      createdBy: 'USR-ADMIN-01',
      createdByName: 'Landry (Admin)',
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      expiresAt: link1Expires,
      status: 'ACTIVE',
      accessCount: 4,
      lastAccessedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      permission: 'READ_ONLY'
    };

    // 1 Expired link for Bearings, expired 2 hours ago
    const link2Expires = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const link2: SharedLink = {
      id: 'SL-DEMO-BEARINGS',
      token: '4nZ8wR3yT1m',
      title: 'Roulements (Bearings) — Magasin B1 & B2',
      filters: {
        warehouseId: 'ALL',
        searchQuery: 'BEARING',
        status: 'ALL'
      },
      visibleColumns: [
        'materialCode',
        'materialName',
        'warehouseId',
        'binLocation',
        'quantity',
        'uom'
      ],
      createdBy: 'USR-SUP-02',
      createdByName: 'Chef d\'Équipe (Supervisor)',
      createdAt: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
      expiresAt: link2Expires,
      status: 'EXPIRED',
      accessCount: 12,
      lastAccessedAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      permission: 'READ_ONLY'
    };

    this.sharedLinks.set(link1.id, link1);
    this.sharedLinks.set(link2.id, link2);
    this.saveSharedLinksToStorage();
  }

  private createSeedIssueVouchers() {
    const stockArr = Array.from(this.stock.values());
    const b1Items = stockArr.filter(s => s.warehouseId === 'B1' && s.quantity > 5).slice(0, 2);
    const b2Items = stockArr.filter(s => s.warehouseId === 'B2' && s.quantity > 5).slice(0, 2);
    if (b1Items.length === 0) return;

    const now = new Date();
    const d1 = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
    const d2 = new Date(now.getTime() - 20 * 3600 * 1000).toISOString();
    const d3 = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();

    const voucher1: StockIssueVoucher = {
      id: 'VOUCH-2026-000148',
      voucherNumber: 'OUT-2026-000148',
      warehouseId: 'B1',
      date: d1,
      buyerName: 'Jean-Pierre Kalala',
      department: 'Maintenance Mécanique',
      agentId: 'USR-CLK-01',
      agentName: 'Agent Magasin (Clerk)',
      reason: 'Remplacement préventif pompe P-102',
      paperBookReference: 'Carnet N° 03, Page 74',
      paperSignatureCompleted: true,
      status: 'CONFIRMED',
      confirmedAt: d1,
      confirmedBy: 'USR-CLK-01',
      confirmedByName: 'Agent Magasin (Clerk)',
      items: b1Items.map(item => ({
        id: `VI-${item.id}`,
        stockId: item.id,
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        chineseName: item.chineseName,
        specification: item.specification,
        warehouseId: item.warehouseId,
        binLocation: item.binLocation,
        availableStock: item.quantity,
        requestedQuantity: 2,
        issuedQuantity: 2,
        uom: item.uom,
        unitPrice: item.unitPrice,
        totalValue: 2 * item.unitPrice,
        stockBefore: item.quantity + 2,
        stockAfter: item.quantity
      })),
      totalRequestedQty: b1Items.length * 2,
      totalIssuedQty: b1Items.length * 2,
      totalValuationUSD: b1Items.reduce((sum, item) => sum + (2 * item.unitPrice), 0),
      createdAt: d1,
      updatedAt: d1
    };

    const voucher2: StockIssueVoucher = {
      id: 'VOUCH-2026-000149',
      voucherNumber: 'OUT-2026-000149',
      warehouseId: 'B2',
      date: d2,
      buyerName: 'Michel Mwamba',
      department: 'Atelier Électrique',
      agentId: 'USR-CLK-01',
      agentName: 'Agent Magasin (Clerk)',
      reason: 'Maintenance armoire force broyeur',
      paperBookReference: 'Carnet N° 03, Page 75',
      paperSignatureCompleted: true,
      status: 'CONFIRMED',
      confirmedAt: d2,
      confirmedBy: 'USR-CLK-01',
      confirmedByName: 'Agent Magasin (Clerk)',
      items: (b2Items.length > 0 ? b2Items : b1Items).map(item => ({
        id: `VI-${item.id}-2`,
        stockId: item.id,
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        chineseName: item.chineseName,
        specification: item.specification,
        warehouseId: item.warehouseId,
        binLocation: item.binLocation,
        availableStock: item.quantity,
        requestedQuantity: 1,
        issuedQuantity: 1,
        uom: item.uom,
        unitPrice: item.unitPrice,
        totalValue: 1 * item.unitPrice,
        stockBefore: item.quantity + 1,
        stockAfter: item.quantity
      })),
      totalRequestedQty: (b2Items.length > 0 ? b2Items : b1Items).length * 1,
      totalIssuedQty: (b2Items.length > 0 ? b2Items : b1Items).length * 1,
      totalValuationUSD: (b2Items.length > 0 ? b2Items : b1Items).reduce((sum, item) => sum + (1 * item.unitPrice), 0),
      createdAt: d2,
      updatedAt: d2
    };

    const voucher3: StockIssueVoucher = {
      id: 'VOUCH-2026-000150',
      voucherNumber: 'OUT-2026-000150',
      warehouseId: 'B1',
      date: d3,
      buyerName: 'Alain Mukendi',
      department: 'Tuyauterie & Soudure',
      agentId: 'USR-CLK-01',
      agentName: 'Agent Magasin (Clerk)',
      reason: 'Intervention urgente fuite ligne vapeur Nord',
      paperBookReference: 'Carnet N° 03, Page 76',
      paperSignatureCompleted: false,
      status: 'READY',
      items: b1Items.slice(0, 1).map(item => ({
        id: `VI-${item.id}-3`,
        stockId: item.id,
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        chineseName: item.chineseName,
        specification: item.specification,
        warehouseId: item.warehouseId,
        binLocation: item.binLocation,
        availableStock: item.quantity,
        requestedQuantity: 3,
        issuedQuantity: 3,
        uom: item.uom,
        unitPrice: item.unitPrice,
        totalValue: 3 * item.unitPrice
      })),
      totalRequestedQty: 3,
      totalIssuedQty: 3,
      totalValuationUSD: b1Items.slice(0, 1).reduce((sum, item) => sum + (3 * item.unitPrice), 0),
      createdAt: d3,
      updatedAt: d3
    };

    this.issueVouchers.set(voucher1.id, voucher1);
    this.issueVouchers.set(voucher2.id, voucher2);
    this.issueVouchers.set(voucher3.id, voucher3);
    this.saveIssueVouchersToStorage();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.saveStockToStorage();
    this.saveMovementsToStorage();
    this.saveAuditToStorage();
    this.saveSharedLinksToStorage();
    this.saveIssueVouchersToStorage();
    this.listeners.forEach(cb => cb());
  }

  // Queries
  public getWarehouses(): Warehouse[] {
    const b1Stock = Array.from(this.stock.values()).filter(s => s.warehouseId === 'B1');
    const b2Stock = Array.from(this.stock.values()).filter(s => s.warehouseId === 'B2');

    return [
      {
        ...this.warehouses[0],
        totalItemsCount: b1Stock.length,
        totalQuantity: b1Stock.reduce((acc, s) => acc + s.quantity, 0),
        totalValuationUSD: Math.round(b1Stock.reduce((acc, s) => acc + s.totalValue, 0) * 100) / 100
      },
      {
        ...this.warehouses[1],
        totalItemsCount: b2Stock.length,
        totalQuantity: b2Stock.reduce((acc, s) => acc + s.quantity, 0),
        totalValuationUSD: Math.round(b2Stock.reduce((acc, s) => acc + s.totalValue, 0) * 100) / 100
      }
    ];
  }

  // Locations CRUD & Queries
  public getLocations(filter?: {
    type?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
  }): StorageLocation[] {
    let list = Array.from(this.locations.values());

    // Calculate dynamic inventory stats for each location
    const allStock = Array.from(this.stock.values());
    list = list.map(loc => {
      const locStock = allStock.filter(s => s.locationId === loc.id || s.warehouseId === loc.code);
      return {
        ...loc,
        totalItemsCount: locStock.length,
        totalQuantity: locStock.reduce((acc, s) => acc + s.quantity, 0),
        totalValuationUSD: Math.round(locStock.reduce((acc, s) => acc + s.totalValue, 0) * 100) / 100
      };
    });

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(l => l.status === filter.status);
    }

    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter(l => l.type === filter.type);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(l =>
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.physicalLocation && l.physicalLocation.toLowerCase().includes(q))
      );
    }

    const typePriority: Record<string, number> = {
      WAREHOUSE: 1,
      CONTAINER: 2,
      YARD: 3,
      WORKSHOP: 4,
      RACK: 5,
      SHELF: 6,
      TEMPORARY: 7,
      QUARANTINE: 8,
      OFFICE: 9,
      OTHER: 10
    };

    return list.sort((a, b) => {
      const prioA = typePriority[a.type] || 99;
      const prioB = typePriority[b.type] || 99;
      if (prioA !== prioB) return prioA - prioB;
      return a.code.localeCompare(b.code);
    });
  }

  public getLocationById(id: string): StorageLocation | undefined {
    return this.locations.get(id);
  }

  public getLocationByCode(code: string): StorageLocation | undefined {
    return Array.from(this.locations.values()).find(l => l.code === code);
  }

  public createLocation(params: Omit<StorageLocation, 'id' | 'createdAt'>, performedBy?: User): StorageLocation {
    const id = `LOC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newLoc: StorageLocation = {
      ...params,
      id,
      code: params.code.trim().toUpperCase(),
      name: params.name.trim(),
      status: params.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.locations.set(id, newLoc);
    this.saveLocationsToStorage();

    if (performedBy) {
      this.auditLogs.unshift({
        id: `AUD-LOC-NEW-${Date.now()}`,
        userId: performedBy.id,
        userName: performedBy.name,
        userRole: performedBy.role,
        action: 'LOCATION_CREATED',
        targetCollection: 'storage_locations',
        targetId: newLoc.code,
        description: `Création de l'emplacement [${newLoc.code}] ${newLoc.name} (${newLoc.type})`,
        newValue: newLoc as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      });
      this.saveAuditToStorage();
    }

    this.notify();
    firebaseSync.pushLocation(newLoc);
    return newLoc;
  }

  public updateLocation(id: string, updates: Partial<StorageLocation>, performedBy?: User): StorageLocation | null {
    const existing = this.locations.get(id);
    if (!existing) return null;

    const previousValue = { ...existing };
    const updated: StorageLocation = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.code) updated.code = updates.code.trim().toUpperCase();
    if (updates.name) updated.name = updates.name.trim();

    this.locations.set(id, updated);
    this.saveLocationsToStorage();

    if (performedBy) {
      this.auditLogs.unshift({
        id: `AUD-LOC-UPD-${Date.now()}`,
        userId: performedBy.id,
        userName: performedBy.name,
        userRole: performedBy.role,
        action: 'LOCATION_UPDATED',
        targetCollection: 'storage_locations',
        targetId: updated.code,
        description: `Modification de l'emplacement [${updated.code}] ${updated.name}`,
        previousValue: previousValue as unknown as Record<string, unknown>,
        newValue: updated as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      });
      this.saveAuditToStorage();
    }

    this.notify();
    firebaseSync.pushLocation(updated);
    return updated;
  }

  public deleteLocation(id: string, performedBy?: User): boolean {
    const loc = this.locations.get(id);
    if (!loc) return false;

    const hasItems = Array.from(this.stock.values()).some(s => s.locationId === id || s.warehouseId === loc.code);
    if (hasItems) {
      throw new Error(`Impossible de supprimer l'emplacement ${loc.name} (${loc.code}) car du matériel y est actuellement stocké.`);
    }

    this.locations.delete(id);
    this.saveLocationsToStorage();

    if (performedBy) {
      this.auditLogs.unshift({
        id: `AUD-LOC-DEL-${Date.now()}`,
        userId: performedBy.id,
        userName: performedBy.name,
        userRole: performedBy.role,
        action: 'LOCATION_DELETED',
        targetCollection: 'storage_locations',
        targetId: loc.code,
        description: `Suppression de l'emplacement [${loc.code}] ${loc.name}`,
        timestamp: new Date().toISOString()
      });
      this.saveAuditToStorage();
    }

    this.notify();
    firebaseSync.deleteLocation(id);
    return true;
  }

  public getLocationParts(item: Partial<StockItem>): { label: string; value: string }[] {
    return getLocationParts(item);
  }

  public formatLocationSummary(item: Partial<StockItem>): string {
    return formatLocationSummary(item);
  }

  public getMaterials(): Material[] {
    return Array.from(this.materials.values());
  }

  public getMaterial(id: string): Material | undefined {
    return this.materials.get(id);
  }

  public getBins(warehouseId?: string): BinLocation[] {
    const all = Array.from(this.bins.values());
    if (warehouseId && warehouseId !== 'ALL') {
      return all.filter(b => b.warehouseId === warehouseId);
    }
    return all;
  }

  public getStock(filter?: {
    warehouseId?: string;
    locationId?: string;
    locationType?: string;
    search?: string;
    binLocation?: string;
    uom?: string;
    zone?: string;
    rack?: string;
    shelf?: string;
    row?: string;
    position?: string;
    containerNumber?: string;
    onlyAvailable?: boolean;
    onlyLowStock?: boolean;
  }): StockItem[] {
    let items = Array.from(this.stock.values());

    if (filter?.warehouseId && filter.warehouseId !== 'ALL') {
      items = items.filter(s => s.warehouseId === filter.warehouseId || s.locationId === filter.warehouseId);
    }

    if (filter?.locationId && filter.locationId !== 'ALL') {
      items = items.filter(s => s.locationId === filter.locationId);
    }

    if (filter?.locationType && filter.locationType !== 'ALL') {
      items = items.filter(s => s.locationType === filter.locationType);
    }

    if (filter?.zone) {
      const z = filter.zone.toLowerCase().trim();
      items = items.filter(s => s.zone && s.zone.toLowerCase().includes(z));
    }

    if (filter?.rack) {
      const r = filter.rack.toLowerCase().trim();
      items = items.filter(s => s.rack && s.rack.toLowerCase().includes(r));
    }

    if (filter?.shelf) {
      const sh = filter.shelf.toLowerCase().trim();
      items = items.filter(s => s.shelf && s.shelf.toLowerCase().includes(sh));
    }

    if (filter?.row) {
      const rw = filter.row.toLowerCase().trim();
      items = items.filter(s => s.row && s.row.toLowerCase().includes(rw));
    }

    if (filter?.position) {
      const pos = filter.position.toLowerCase().trim();
      items = items.filter(s => s.position && s.position.toLowerCase().includes(pos));
    }

    if (filter?.containerNumber) {
      const cn = filter.containerNumber.toLowerCase().trim();
      items = items.filter(s => s.containerNumber && s.containerNumber.toLowerCase().includes(cn));
    }

    if (filter?.binLocation) {
      const binLower = filter.binLocation.toLowerCase().trim();
      items = items.filter(s => s.binLocation.toLowerCase().includes(binLower));
    }

    if (filter?.uom) {
      items = items.filter(s => s.uom.toUpperCase() === filter.uom!.toUpperCase());
    }

    if (filter?.onlyAvailable) {
      items = items.filter(s => s.availableQuantity > 0);
    }

    if (filter?.onlyLowStock) {
      items = items.filter(s => s.availableQuantity > 0 && s.availableQuantity <= 5);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      items = items.filter(s => 
        s.materialCode.toLowerCase().includes(q) ||
        s.materialName.toLowerCase().includes(q) ||
        (s.chineseName && s.chineseName.toLowerCase().includes(q)) ||
        s.binLocation.toLowerCase().includes(q) ||
        (s.specification && s.specification.toLowerCase().includes(q)) ||
        (s.zone && s.zone.toLowerCase().includes(q)) ||
        (s.rack && s.rack.toLowerCase().includes(q)) ||
        (s.shelf && s.shelf.toLowerCase().includes(q)) ||
        (s.containerNumber && s.containerNumber.toLowerCase().includes(q)) ||
        (s.locationNotes && s.locationNotes.toLowerCase().includes(q))
      );
    }

    return items.map(s => {
      if (!s.imageUrl) {
        const mat = this.materials.get(s.materialId);
        if (mat?.imageUrl) {
          return { ...s, imageUrl: mat.imageUrl };
        }
      }
      return s;
    });
  }

  public getStockByMaterial(materialId: string): StockItem[] {
    return Array.from(this.stock.values()).filter(s => s.materialId === materialId);
  }

  public getStockItem(id: string): StockItem | undefined {
    return this.stock.get(id);
  }

  public getStockMovements(filter?: {
    warehouseId?: string;
    materialId?: string;
    limit?: number;
  }): StockMovement[] {
    let list = [...this.movements];

    if (filter?.warehouseId && filter.warehouseId !== 'ALL') {
      list = list.filter(m => m.warehouseId === filter.warehouseId);
    }

    if (filter?.materialId) {
      list = list.filter(m => m.materialId === filter.materialId);
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.limit) {
      return list.slice(0, filter.limit);
    }

    return list;
  }

  public getAuditLogs(limitCount = 200): AuditLog[] {
    return [...this.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limitCount);
  }

  public getKpis() {
    const allStock = Array.from(this.stock.values());
    const locations = this.getLocations();
    const containers = locations.filter(l => l.type === 'CONTAINER');
    const lowStockCount = allStock.filter(s => s.availableQuantity > 0 && s.availableQuantity <= 5).length;
    const outOfStockCount = allStock.filter(s => s.availableQuantity <= 0).length;

    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const recentlyUpdatedCount = allStock.filter(s => new Date(s.lastUpdated).getTime() >= sevenDaysAgo).length;

    const totalUnits = allStock.reduce((acc, s) => acc + s.quantity, 0);
    const totalValuationUSD = Math.round(allStock.reduce((acc, s) => acc + s.totalValue, 0) * 100) / 100;

    // Today's movements
    const today = new Date().toISOString().split('T')[0];
    const todayMovements = this.movements.filter(m => m.createdAt.startsWith(today) && m.movementType !== 'INITIAL_IMPORT');

    const receiptsToday = todayMovements.filter(m => m.movementType === 'RECEIPT');
    const issuesToday = todayMovements.filter(m => m.movementType === 'ISSUE');
    const transfersToday = todayMovements.filter(m => m.movementType === 'TRANSFER_OUT');

    const b1Stock = allStock.filter(s => s.warehouseId === 'B1');
    const b2Stock = allStock.filter(s => s.warehouseId === 'B2');

    return {
      totalItems: allStock.length,
      totalMaterials: this.materials.size,
      totalUnits,
      totalValuationUSD,
      locationsCount: locations.length,
      containersCount: containers.length,
      lowStockCount,
      outOfStockCount,
      recentlyUpdatedCount: Math.max(recentlyUpdatedCount, todayMovements.length),
      receiptsTodayCount: receiptsToday.length,
      issuesTodayCount: issuesToday.length,
      transfersTodayCount: transfersToday.length,
      b1TotalValuationUSD: Math.round(b1Stock.reduce((acc, s) => acc + s.totalValue, 0) * 100) / 100,
      b1TotalQuantity: b1Stock.reduce((acc, s) => acc + s.quantity, 0),
      b1TotalItems: b1Stock.length,
      b2TotalValuationUSD: Math.round(b2Stock.reduce((acc, s) => acc + s.totalValue, 0) * 100) / 100,
      b2TotalQuantity: b2Stock.reduce((acc, s) => acc + s.quantity, 0),
      b2TotalItems: b2Stock.length,
      locations,
      recentMovements: this.getStockMovements({ limit: 10 })
    };
  }

  /**
   * Associer ou mettre à jour une photo de matériel
   */
  public updateMaterialImage(materialId: string, imageUrl: string) {
    const m = this.materials.get(materialId);
    if (m) {
      m.imageUrl = imageUrl;
      for (const s of this.stock.values()) {
        if (s.materialId === materialId) {
          s.imageUrl = imageUrl;
        }
      }
      try {
        const existing = JSON.parse(localStorage.getItem('wms_material_images_v1') || '{}');
        existing[materialId] = imageUrl;
        localStorage.setItem('wms_material_images_v1', JSON.stringify(existing));
      } catch (e) {
        console.warn('Storage image error:', e);
      }
      this.notify();
    }
  }

  // Stock Operations (Strict validation & Audit)

  /**
   * Entrée de stock (Receipt)
   */
  public performReceipt(params: {
    materialId: string;
    warehouseId: string;
    binLocation: string;
    quantity: number;
    unitPrice?: number;
    referenceNumber?: string;
    supplier?: string;
    comments?: string;
    user: User;
    locationId?: string;
    zone?: string;
    rack?: string;
    shelf?: string;
    row?: string;
    position?: string;
    containerNumber?: string;
    locationNotes?: string;
  }): { success: boolean; movement: StockMovement } {
    if (params.quantity <= 0) {
      throw new Error('La quantité reçue doit être strictement positive.');
    }

    const mat = this.materials.get(params.materialId);
    if (!mat) {
      throw new Error(`Matériel introuvable : ${params.materialId}`);
    }

    const price = params.unitPrice !== undefined ? params.unitPrice : (mat.standardPrice || 0);
    const stockId = `${params.warehouseId}_${params.materialId}_${params.binLocation}`;
    const timestamp = new Date().toISOString();

    let previousQty = 0;
    let newQty = params.quantity;

    if (this.stock.has(stockId)) {
      const existing = this.stock.get(stockId)!;
      previousQty = existing.quantity;
      newQty = previousQty + params.quantity;
      existing.quantity = newQty;
      existing.availableQuantity = newQty - existing.reservedQuantity;
      existing.unitPrice = price > 0 ? price : existing.unitPrice;
      existing.totalValue = Math.round(newQty * existing.unitPrice * 100) / 100;
      existing.lastUpdated = timestamp;
      if (params.locationId) existing.locationId = params.locationId;
      if (params.zone) existing.zone = params.zone;
      if (params.rack) existing.rack = params.rack;
      if (params.shelf) existing.shelf = params.shelf;
      if (params.row) existing.row = params.row;
      if (params.position) existing.position = params.position;
      if (params.containerNumber) existing.containerNumber = params.containerNumber;
      if (params.locationNotes) existing.locationNotes = params.locationNotes;
    } else {
      this.stock.set(stockId, {
        id: stockId,
        materialId: mat.id,
        materialCode: mat.materialCode,
        materialName: mat.name,
        chineseName: mat.chineseName,
        specification: mat.specification,
        warehouseId: params.warehouseId,
        locationId: params.locationId,
        zone: params.zone,
        rack: params.rack,
        shelf: params.shelf,
        row: params.row,
        position: params.position,
        containerNumber: params.containerNumber,
        locationNotes: params.locationNotes,
        binLocation: params.binLocation,
        uom: mat.uom,
        quantity: newQty,
        reservedQuantity: 0,
        availableQuantity: newQty,
        unitPrice: price,
        totalValue: Math.round(newQty * price * 100) / 100,
        remarks: params.comments,
        lastUpdated: timestamp
      });
    }

    // Create immutable movement record
    const movement: StockMovement = {
      id: `MOV-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      movementType: 'RECEIPT',
      materialId: mat.id,
      materialCode: mat.materialCode,
      materialName: mat.name,
      warehouseId: params.warehouseId,
      locationId: params.locationId,
      zone: params.zone,
      rack: params.rack,
      shelf: params.shelf,
      containerNumber: params.containerNumber,
      binLocation: params.binLocation,
      quantity: params.quantity,
      previousQuantity: previousQty,
      newQuantity: newQty,
      unitPrice: price,
      totalAmount: Math.round(params.quantity * price * 100) / 100,
      referenceNumber: params.referenceNumber || 'BON-REC-' + Date.now(),
      supplier: params.supplier,
      comments: params.comments,
      performedBy: params.user.id,
      performedByName: params.user.name,
      createdAt: timestamp
    };
    this.movements.unshift(movement);

    // Audit log
    this.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      action: 'STOCK_RECEIPT',
      targetCollection: 'stock',
      targetId: stockId,
      description: `Entrée de stock : +${params.quantity} ${mat.uom} de ${mat.materialCode} sur ${params.warehouseId} (${params.binLocation})`,
      newValue: { quantity: newQty, unitPrice: price },
      timestamp
    });

    this.notify();
    const updatedStock = this.stock.get(stockId);
    if (updatedStock) firebaseSync.pushStockItems([updatedStock]);
    firebaseSync.pushMovement(movement);
    return { success: true, movement };
  }

  /**
   * Sortie de stock (Issue) — Strict availability check
   */
  public performIssue(params: {
    materialId: string;
    warehouseId: string;
    binLocation: string;
    quantity: number;
    requester?: string;
    department?: string;
    referenceNumber?: string;
    reason?: string;
    comments?: string;
    user: User;
  }): { success: boolean; movement: StockMovement; voucher: StockIssueVoucher } {
    if (params.quantity <= 0) {
      throw new Error('La quantité sortie doit être strictement positive.');
    }

    const stockId = `${params.warehouseId}_${params.materialId}_${params.binLocation}`;
    const stockItem = this.stock.get(stockId);

    if (!stockItem) {
      throw new Error(`Aucun stock trouvé pour le matériel ${params.materialId} sur l'emplacement ${params.binLocation} de ${params.warehouseId}.`);
    }

    if (stockItem.availableQuantity < params.quantity) {
      throw new Error(
        `Quantité insuffisante ! Disponible : ${stockItem.availableQuantity} ${stockItem.uom}, Demandé : ${params.quantity} ${stockItem.uom}. La sortie ne peut pas être effectuée.`
      );
    }

    const timestamp = new Date().toISOString();
    const previousQty = stockItem.quantity;
    const newQty = previousQty - params.quantity;

    stockItem.quantity = newQty;
    stockItem.availableQuantity = newQty - stockItem.reservedQuantity;
    stockItem.totalValue = Math.round(newQty * stockItem.unitPrice * 100) / 100;
    stockItem.lastUpdated = timestamp;

    const voucherNumber = (params.referenceNumber && params.referenceNumber.startsWith('BS-')) 
      ? params.referenceNumber 
      : this.generateNextVoucherNumber();
    const voucherId = `VOUCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const lineValuation = Math.round(params.quantity * stockItem.unitPrice * 100) / 100;

    const voucher: StockIssueVoucher = {
      id: voucherId,
      voucherNumber,
      warehouseId: params.warehouseId,
      date: timestamp,
      buyerName: params.requester || 'Anonyme',
      department: params.department,
      agentId: params.user.id,
      agentName: params.user.name,
      reason: params.reason,
      observations: params.comments,
      paperBookReference: params.referenceNumber,
      paperSignatureCompleted: true,
      status: 'CONFIRMED',
      confirmedAt: timestamp,
      confirmedBy: params.user.id,
      confirmedByName: params.user.name,
      items: [{
        id: `VI-${Date.now()}-1`,
        stockId: stockItem.id,
        materialId: stockItem.materialId,
        materialCode: stockItem.materialCode,
        materialName: stockItem.materialName,
        specification: stockItem.specification,
        warehouseId: params.warehouseId,
        binLocation: params.binLocation,
        availableStock: previousQty,
        requestedQuantity: params.quantity,
        issuedQuantity: params.quantity,
        stockBefore: previousQty,
        stockAfter: newQty,
        uom: stockItem.uom,
        unitPrice: stockItem.unitPrice,
        totalValue: lineValuation
      }],
      totalRequestedQty: params.quantity,
      totalIssuedQty: params.quantity,
      totalValuationUSD: lineValuation,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.issueVouchers.set(voucherId, voucher);
    this.saveIssueVouchersToStorage();

    const movement: StockMovement = {
      id: `MOV-ISS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      movementType: 'ISSUE',
      materialId: stockItem.materialId,
      materialCode: stockItem.materialCode,
      materialName: stockItem.materialName,
      warehouseId: params.warehouseId,
      binLocation: params.binLocation,
      quantity: params.quantity,
      previousQuantity: previousQty,
      newQuantity: newQty,
      unitPrice: stockItem.unitPrice,
      totalAmount: lineValuation,
      referenceNumber: voucherNumber,
      issueVoucherId: voucherId,
      issueVoucherNumber: voucherNumber,
      requester: params.requester,
      department: params.department,
      reason: params.reason,
      comments: params.comments,
      performedBy: params.user.id,
      performedByName: params.user.name,
      createdAt: timestamp
    };
    this.movements.unshift(movement);

    this.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      action: 'STOCK_ISSUE',
      targetCollection: 'stock',
      targetId: stockId,
      description: `Sortie de stock (${voucherNumber}) : -${params.quantity} ${stockItem.uom} de ${stockItem.materialCode} sur ${params.warehouseId} (${params.binLocation}) pour ${params.requester || 'N/A'}`,
      previousValue: { quantity: previousQty },
      newValue: { quantity: newQty },
      timestamp
    });

    // Record autocomplete
    if (params.requester) this.recordCustomValue('requester', params.requester);
    if (params.department) this.recordCustomValue('department', params.department);
    if (params.reason) this.recordCustomValue('reason', params.reason);

    this.notify();
    firebaseSync.pushStockItems([stockItem]);
    firebaseSync.pushMovement(movement);
    firebaseSync.pushIssueVoucher(voucher);
    return { success: true, movement, voucher };
  }

  /**
   * Transfert B1 ↔ B2 ou Inter-BIN (Atomic dual movements with linked transferId)
   */
  public performTransfer(params: {
    materialId: string;
    sourceWarehouseId: string;
    sourceBinLocation: string;
    destinationWarehouseId: string;
    destinationBinLocation: string;
    quantity: number;
    reason?: string;
    comments?: string;
    user: User;
    destinationLocationId?: string;
    destinationZone?: string;
    destinationRack?: string;
    destinationShelf?: string;
    destinationRow?: string;
    destinationPosition?: string;
    destinationContainerNumber?: string;
    destinationLocationNotes?: string;
  }): { success: boolean; transferId: string; movements: StockMovement[] } {
    if (params.quantity <= 0) {
      throw new Error('La quantité à transférer doit être strictement positive.');
    }

    if (params.sourceWarehouseId === params.destinationWarehouseId && params.sourceBinLocation === params.destinationBinLocation) {
      throw new Error("L'emplacement de départ et l'emplacement d'arrivée ne peuvent pas être identiques.");
    }

    const sourceStockId = `${params.sourceWarehouseId}_${params.materialId}_${params.sourceBinLocation}`;
    const sourceStock = this.stock.get(sourceStockId);

    if (!sourceStock) {
      throw new Error(`Stock d'origine introuvable pour ${params.materialId} en ${params.sourceBinLocation}.`);
    }

    if (sourceStock.availableQuantity < params.quantity) {
      throw new Error(
        `Quantité insuffisante pour le transfert ! Disponible en ${params.sourceBinLocation} : ${sourceStock.availableQuantity}, Demandé : ${params.quantity}.`
      );
    }

    const transferId = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    // 1. Decrease source stock
    const srcPrevQty = sourceStock.quantity;
    const srcNewQty = srcPrevQty - params.quantity;
    sourceStock.quantity = srcNewQty;
    sourceStock.availableQuantity = srcNewQty - sourceStock.reservedQuantity;
    sourceStock.totalValue = Math.round(srcNewQty * sourceStock.unitPrice * 100) / 100;
    sourceStock.lastUpdated = timestamp;

    // 2. Increase or create destination stock
    const destStockId = `${params.destinationWarehouseId}_${params.materialId}_${params.destinationBinLocation}`;
    let destPrevQty = 0;
    let destNewQty = params.quantity;

    if (this.stock.has(destStockId)) {
      const destStock = this.stock.get(destStockId)!;
      destPrevQty = destStock.quantity;
      destNewQty = destPrevQty + params.quantity;
      destStock.quantity = destNewQty;
      destStock.availableQuantity = destNewQty - destStock.reservedQuantity;
      destStock.totalValue = Math.round(destNewQty * destStock.unitPrice * 100) / 100;
      destStock.lastUpdated = timestamp;
      if (params.destinationLocationId) destStock.locationId = params.destinationLocationId;
      if (params.destinationZone) destStock.zone = params.destinationZone;
      if (params.destinationRack) destStock.rack = params.destinationRack;
      if (params.destinationShelf) destStock.shelf = params.destinationShelf;
      if (params.destinationRow) destStock.row = params.destinationRow;
      if (params.destinationPosition) destStock.position = params.destinationPosition;
      if (params.destinationContainerNumber) destStock.containerNumber = params.destinationContainerNumber;
      if (params.destinationLocationNotes) destStock.locationNotes = params.destinationLocationNotes;
    } else {
      const destLocation = params.destinationLocationId
        ? this.getLocationById(params.destinationLocationId)
        : this.getLocationByCode(params.destinationWarehouseId);

      this.stock.set(destStockId, {
        id: destStockId,
        materialId: sourceStock.materialId,
        materialCode: sourceStock.materialCode,
        materialName: sourceStock.materialName,
        chineseName: sourceStock.chineseName,
        specification: sourceStock.specification,
        warehouseId: params.destinationWarehouseId,
        locationId: params.destinationLocationId || destLocation?.id,
        locationType: destLocation?.type,
        zone: params.destinationZone,
        rack: params.destinationRack,
        shelf: params.destinationShelf,
        row: params.destinationRow,
        position: params.destinationPosition,
        containerNumber: params.destinationContainerNumber,
        locationNotes: params.destinationLocationNotes,
        binLocation: params.destinationBinLocation,
        uom: sourceStock.uom,
        quantity: destNewQty,
        reservedQuantity: 0,
        availableQuantity: destNewQty,
        unitPrice: sourceStock.unitPrice,
        totalValue: Math.round(destNewQty * sourceStock.unitPrice * 100) / 100,
        remarks: `Transféré depuis ${params.sourceWarehouseId} (${params.sourceBinLocation})`,
        lastUpdated: timestamp
      });
    }

    // 3. Create TRANSFER_OUT movement
    const movementOut: StockMovement = {
      id: `MOV-TRF-OUT-${Date.now()}`,
      movementType: 'TRANSFER_OUT',
      materialId: sourceStock.materialId,
      materialCode: sourceStock.materialCode,
      materialName: sourceStock.materialName,
      warehouseId: params.sourceWarehouseId,
      locationId: sourceStock.locationId,
      zone: sourceStock.zone,
      rack: sourceStock.rack,
      shelf: sourceStock.shelf,
      containerNumber: sourceStock.containerNumber,
      binLocation: params.sourceBinLocation,
      quantity: params.quantity,
      previousQuantity: srcPrevQty,
      newQuantity: srcNewQty,
      unitPrice: sourceStock.unitPrice,
      totalAmount: Math.round(params.quantity * sourceStock.unitPrice * 100) / 100,
      transferId,
      destinationWarehouseId: params.destinationWarehouseId,
      destinationLocationId: params.destinationLocationId,
      destinationZone: params.destinationZone,
      destinationRack: params.destinationRack,
      destinationShelf: params.destinationShelf,
      destinationRow: params.destinationRow,
      destinationPosition: params.destinationPosition,
      destinationContainerNumber: params.destinationContainerNumber,
      destinationBinLocation: params.destinationBinLocation,
      referenceNumber: transferId,
      reason: params.reason || `Transfert vers ${params.destinationWarehouseId} (${params.destinationBinLocation})`,
      comments: params.comments,
      performedBy: params.user.id,
      performedByName: params.user.name,
      createdAt: timestamp
    };

    // 4. Create linked TRANSFER_IN movement with exact same transferId
    const movementIn: StockMovement = {
      id: `MOV-TRF-IN-${Date.now()}`,
      movementType: 'TRANSFER_IN',
      materialId: sourceStock.materialId,
      materialCode: sourceStock.materialCode,
      materialName: sourceStock.materialName,
      warehouseId: params.destinationWarehouseId,
      locationId: params.destinationLocationId,
      zone: params.destinationZone,
      rack: params.destinationRack,
      shelf: params.destinationShelf,
      containerNumber: params.destinationContainerNumber,
      binLocation: params.destinationBinLocation,
      quantity: params.quantity,
      previousQuantity: destPrevQty,
      newQuantity: destNewQty,
      unitPrice: sourceStock.unitPrice,
      totalAmount: Math.round(params.quantity * sourceStock.unitPrice * 100) / 100,
      transferId,
      destinationWarehouseId: params.destinationWarehouseId,
      destinationLocationId: params.destinationLocationId,
      destinationZone: params.destinationZone,
      destinationRack: params.destinationRack,
      destinationShelf: params.destinationShelf,
      destinationRow: params.destinationRow,
      destinationPosition: params.destinationPosition,
      destinationContainerNumber: params.destinationContainerNumber,
      destinationBinLocation: params.destinationBinLocation,
      referenceNumber: transferId,
      reason: params.reason || `Transfert depuis ${params.sourceWarehouseId} (${params.sourceBinLocation})`,
      comments: params.comments,
      performedBy: params.user.id,
      performedByName: params.user.name,
      createdAt: timestamp
    };

    this.movements.unshift(movementOut, movementIn);

    this.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      action: 'STOCK_TRANSFER',
      targetCollection: 'stock',
      targetId: transferId,
      description: `Transfert de ${params.quantity} ${sourceStock.uom} de ${sourceStock.materialCode} : ${params.sourceWarehouseId} (${params.sourceBinLocation}) → ${params.destinationWarehouseId} (${params.destinationBinLocation})`,
      metadata: { transferId, quantity: params.quantity },
      timestamp
    });

    this.notify();
    const destStock = this.stock.get(destStockId);
    const updatedStocks = [sourceStock];
    if (destStock) updatedStocks.push(destStock);
    firebaseSync.pushStockItems(updatedStocks);
    firebaseSync.pushMovement(movementOut);
    firebaseSync.pushMovement(movementIn);
    return { success: true, transferId, movements: [movementOut, movementIn] };
  }

  /**
   * Inventaire physique & Régularisation (Adjustment)
   */
  public performInventoryAdjustment(params: {
    stockId: string;
    physicalQuantity: number;
    reason: string;
    user: User;
  }): { success: boolean; movement: StockMovement } {
    const stockItem = this.stock.get(params.stockId);
    if (!stockItem) {
      throw new Error(`Article de stock introuvable : ${params.stockId}`);
    }

    if (params.physicalQuantity < 0) {
      throw new Error("La quantité physique ne peut pas être négative.");
    }

    const previousQty = stockItem.quantity;
    const diffQty = params.physicalQuantity - previousQty;

    if (diffQty === 0) {
      throw new Error("Aucun écart constaté : la quantité physique est identique au stock système.");
    }

    const timestamp = new Date().toISOString();
    stockItem.quantity = params.physicalQuantity;
    stockItem.availableQuantity = params.physicalQuantity - stockItem.reservedQuantity;
    stockItem.totalValue = Math.round(params.physicalQuantity * stockItem.unitPrice * 100) / 100;
    stockItem.lastUpdated = timestamp;

    const diffValue = Math.round(diffQty * stockItem.unitPrice * 100) / 100;

    const movement: StockMovement = {
      id: `MOV-ADJ-${Date.now()}`,
      movementType: 'ADJUSTMENT',
      materialId: stockItem.materialId,
      materialCode: stockItem.materialCode,
      materialName: stockItem.materialName,
      warehouseId: stockItem.warehouseId,
      binLocation: stockItem.binLocation,
      quantity: Math.abs(diffQty),
      previousQuantity: previousQty,
      newQuantity: params.physicalQuantity,
      unitPrice: stockItem.unitPrice,
      totalAmount: Math.abs(diffValue),
      referenceNumber: `INV-ADJ-${Date.now()}`,
      reason: `Régularisation inventaire: Écart de ${diffQty > 0 ? '+' : ''}${diffQty} ${stockItem.uom} (${diffValue > 0 ? '+' : ''}${diffValue} USD). Motif: ${params.reason}`,
      performedBy: params.user.id,
      performedByName: params.user.name,
      createdAt: timestamp
    };
    this.movements.unshift(movement);

    this.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      action: 'INVENTORY_ADJUSTMENT',
      targetCollection: 'stock',
      targetId: params.stockId,
      description: `Ajustement inventaire : ${stockItem.materialCode} en ${stockItem.warehouseId} (${stockItem.binLocation}) : ${previousQty} → ${params.physicalQuantity} (Écart: ${diffQty} ${stockItem.uom})`,
      previousValue: { quantity: previousQty },
      newValue: { quantity: params.physicalQuantity, diffQty, diffValue },
      timestamp
    });

    this.notify();
    firebaseSync.pushStockItems([stockItem]);
    firebaseSync.pushMovement(movement);
    return { success: true, movement };
  }

  // Exports
  public exportStockToExcel(warehouseId?: string) {
    const items = this.getStock({ warehouseId });
    const data = items.map((s, idx) => ({
      'No': idx + 1,
      'Warehouse': s.warehouseId,
      'BIN Location': s.binLocation,
      'Material Code': s.materialCode,
      'Material Name': s.materialName,
      'Chinese Name': s.chineseName || '',
      'Specification': s.specification || '',
      'Quantity': s.quantity,
      'Available': s.availableQuantity,
      'UoM': s.uom,
      'Unit Price (USD)': s.unitPrice,
      'Total Value (USD)': s.totalValue,
      'Last Updated': s.lastUpdated
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, warehouseId && warehouseId !== 'ALL' ? `Stock_${warehouseId}` : 'Global_Stock');
    XLSX.writeFile(wb, `WMS_Stock_${warehouseId || 'GLOBAL'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  public exportMovementsToExcel(warehouseId?: string) {
    const moves = this.getStockMovements({ warehouseId });
    const data = moves.map((m, idx) => ({
      'No': idx + 1,
      'Date': m.createdAt,
      'Movement Type': m.movementType,
      'Warehouse': m.warehouseId,
      'BIN Location': m.binLocation,
      'Material Code': m.materialCode,
      'Material Name': m.materialName,
      'Quantity': m.quantity,
      'Previous Qty': m.previousQuantity,
      'New Qty': m.newQuantity,
      'Unit Price (USD)': m.unitPrice,
      'Total Amount (USD)': m.totalAmount,
      'Reference / Doc#': m.referenceNumber || '',
      'Transfer ID': m.transferId || '',
      'Destination Warehouse': m.destinationWarehouseId || '',
      'Destination BIN': m.destinationBinLocation || '',
      'Reason': m.reason || '',
      'Requester': m.requester || '',
      'Department': m.department || '',
      'Performed By': m.performedByName
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movements_History');
    XLSX.writeFile(wb, `WMS_Movements_History_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  public getInitialAuditReport(): ExcelImportSummary[] {
    const raw = seedAuditReport as any;
    return [raw.b1Summary, raw.b2Summary];
  }

  // ==========================================
  // SHARED LINKS (PUBLIC SECURE ACCESS)
  // ==========================================

  public generateSecureToken(length = 11): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  public createSharedLink(params: {
    title?: string;
    filters: SharedLinkFilters;
    visibleColumns: SharedLinkColumn[];
    durationMinutes: number;
    createdBy: User;
  }): SharedLink {
    const id = 'SL-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    let token = this.generateSecureToken();
    while (Array.from(this.sharedLinks.values()).some(l => l.token === token)) {
      token = this.generateSecureToken();
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.durationMinutes * 60 * 1000).toISOString();

    const title = params.title?.trim() || 
      `Partage ${params.filters.warehouseId && params.filters.warehouseId !== 'ALL' ? params.filters.warehouseId : 'Global'}${params.filters.searchQuery ? ` • ${params.filters.searchQuery}` : ''}${params.filters.binLocation ? ` • ${params.filters.binLocation}` : ''}`;

    const link: SharedLink = {
      id,
      token,
      title,
      filters: { ...params.filters },
      visibleColumns: [...params.visibleColumns],
      createdBy: params.createdBy.id,
      createdByName: params.createdBy.name,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'ACTIVE',
      accessCount: 0,
      permission: 'READ_ONLY'
    };

    this.sharedLinks.set(link.id, link);
    this.saveSharedLinksToStorage();
    firebaseSync.pushSharedLink(link);

    // Log to Audit Trail
    this.auditLogs.unshift({
      id: 'LOG-SL-' + Date.now(),
      userId: params.createdBy.id,
      userName: params.createdBy.name,
      userRole: params.createdBy.role,
      action: 'SHARED_LINK_CREATED',
      targetCollection: 'shared_links',
      targetId: link.token,
      description: `Création du lien de partage [${link.title}] (Token: ${link.token}) - Expire le ${new Date(expiresAt).toLocaleString()}`,
      newValue: {
        token: link.token,
        filters: link.filters,
        visibleColumns: link.visibleColumns,
        expiresAt
      },
      timestamp: now.toISOString()
    });
    this.saveAuditToStorage();
    this.notify();

    return link;
  }

  public getSharedLinks(): SharedLink[] {
    const now = new Date().toISOString();
    let hasChanges = false;
    const list = Array.from(this.sharedLinks.values()).map(link => {
      if (link.status === 'ACTIVE' && link.expiresAt < now) {
        link.status = 'EXPIRED';
        hasChanges = true;
      }
      return link;
    });

    if (hasChanges) {
      this.saveSharedLinksToStorage();
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSharedLinkByToken(token: string, recordAccess = false): {
    link: SharedLink | null;
    isExpired: boolean;
    isRevoked: boolean;
    items: Partial<StockItem>[];
  } {
    const link = Array.from(this.sharedLinks.values()).find(l => l.token === token);
    if (!link) {
      return { link: null, isExpired: false, isRevoked: false, items: [] };
    }

    if (link.status === 'REVOKED') {
      return { link, isExpired: false, isRevoked: true, items: [] };
    }

    const now = new Date();
    if (new Date(link.expiresAt) <= now) {
      if (link.status !== 'EXPIRED') {
        link.status = 'EXPIRED';
        this.saveSharedLinksToStorage();
      }
      return { link, isExpired: true, isRevoked: false, items: [] };
    }

    if (recordAccess) {
      link.accessCount = (link.accessCount || 0) + 1;
      link.lastAccessedAt = now.toISOString();
      this.saveSharedLinksToStorage();

      this.auditLogs.unshift({
        id: 'LOG-SLA-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        userId: 'anonymous_visitor',
        userName: 'Visiteur Externe (Lien Partagé)',
        userRole: 'VIEWER',
        action: 'SHARED_LINK_ACCESSED',
        targetCollection: 'shared_links',
        targetId: link.token,
        description: `Consultation publique du lien [${link.title}] (Accès #${link.accessCount})`,
        metadata: {
          token: link.token,
          accessCount: link.accessCount
        },
        timestamp: now.toISOString()
      });
      this.saveAuditToStorage();
    }

    // Resolve filtered stock items
    let allItems = Array.from(this.stock.values());

    // Filter by warehouse
    if (link.filters.warehouseId && link.filters.warehouseId !== 'ALL') {
      allItems = allItems.filter(s => s.warehouseId === link.filters.warehouseId);
    }

    // Filter by text search
    if (link.filters.searchQuery) {
      const q = link.filters.searchQuery.toLowerCase().trim();
      allItems = allItems.filter(s => 
        s.materialCode.toLowerCase().includes(q) ||
        s.materialName.toLowerCase().includes(q) ||
        (s.chineseName && s.chineseName.toLowerCase().includes(q)) ||
        (s.specification && s.specification.toLowerCase().includes(q)) ||
        s.binLocation.toLowerCase().includes(q)
      );
    }

    // Filter by bin / rack
    if (link.filters.binLocation) {
      const binQ = link.filters.binLocation.toLowerCase().trim();
      allItems = allItems.filter(s => s.binLocation.toLowerCase().includes(binQ));
    }

    // Filter by status
    if (link.filters.status === 'IN_STOCK') {
      allItems = allItems.filter(s => s.availableQuantity > 0);
    } else if (link.filters.status === 'OUT_OF_STOCK') {
      allItems = allItems.filter(s => s.availableQuantity <= 0);
    } else if (link.filters.status === 'LOW_STOCK') {
      allItems = allItems.filter(s => s.availableQuantity > 0 && s.availableQuantity <= 5);
    }

    // Filter by category / plant
    if (link.filters.category) {
      const catQ = link.filters.category.toLowerCase().trim();
      allItems = allItems.filter(s => {
        const mat = this.materials.get(s.materialId);
        return (mat?.plant && mat.plant.toLowerCase().includes(catQ)) ||
               (s.specification && s.specification.toLowerCase().includes(catQ));
      });
    }

    // Projection: ONLY return fields explicitly allowed in visibleColumns
    const visibleCols = new Set(link.visibleColumns);
    const projectedItems: Partial<StockItem>[] = allItems.map(item => {
      const res: Partial<StockItem> = {
        id: item.id
      };
      if (visibleCols.has('materialCode')) res.materialCode = item.materialCode;
      if (visibleCols.has('materialName')) res.materialName = item.materialName;
      if (visibleCols.has('chineseName')) res.chineseName = item.chineseName;
      if (visibleCols.has('specification')) res.specification = item.specification;
      if (visibleCols.has('warehouseId')) res.warehouseId = item.warehouseId;
      if (visibleCols.has('binLocation')) res.binLocation = item.binLocation;
      if (visibleCols.has('quantity')) res.quantity = item.quantity;
      if (visibleCols.has('availableQuantity')) res.availableQuantity = item.availableQuantity;
      if (visibleCols.has('uom')) res.uom = item.uom;
      if (visibleCols.has('unitPrice')) res.unitPrice = item.unitPrice;
      if (visibleCols.has('totalValue')) res.totalValue = item.totalValue;
      if (visibleCols.has('remarks')) res.remarks = item.remarks;
      if (visibleCols.has('photo')) res.imageUrl = item.imageUrl;
      return res;
    });

    return {
      link,
      isExpired: false,
      isRevoked: false,
      items: projectedItems
    };
  }

  public async getSharedLinkByTokenAsync(token: string, recordAccess = false): Promise<{
    link: SharedLink | null;
    isExpired: boolean;
    isRevoked: boolean;
    items: Partial<StockItem>[];
  }> {
    // 1. Try local memory first
    let link = Array.from(this.sharedLinks.values()).find(l => l.token === token);

    // 2. If not found, fetch directly from Cloud Firestore
    if (!link) {
      try {
        const remote = await firebaseSync.fetchSharedLinkByToken(token);
        if (remote) {
          link = remote;
          this.sharedLinks.set(remote.id, remote);
          this.saveSharedLinksToStorage();
        }
      } catch (e) {
        console.warn('Async fetchSharedLinkByToken note:', e);
      }
    }

    if (!link) {
      return { link: null, isExpired: false, isRevoked: false, items: [] };
    }

    if (link.status === 'REVOKED') {
      return { link, isExpired: false, isRevoked: true, items: [] };
    }

    const now = new Date();
    if (new Date(link.expiresAt) <= now) {
      if (link.status !== 'EXPIRED') {
        link.status = 'EXPIRED';
        this.saveSharedLinksToStorage();
        firebaseSync.pushSharedLink(link);
      }
      return { link, isExpired: true, isRevoked: false, items: [] };
    }

    if (recordAccess) {
      link.accessCount = (link.accessCount || 0) + 1;
      link.lastAccessedAt = now.toISOString();
      this.saveSharedLinksToStorage();
      firebaseSync.pushSharedLink(link);

      this.auditLogs.unshift({
        id: 'LOG-SLA-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        userId: 'anonymous_visitor',
        userName: 'Visiteur Externe (Lien Partagé)',
        userRole: 'VIEWER',
        action: 'SHARED_LINK_ACCESSED',
        targetCollection: 'shared_links',
        targetId: link.token,
        description: `Consultation publique du lien [${link.title}] (Accès #${link.accessCount})`,
        metadata: {
          token: link.token,
          accessCount: link.accessCount
        },
        timestamp: now.toISOString()
      });
      this.saveAuditToStorage();
    }

    // Ensure stock dataset is loaded
    let allItems = Array.from(this.stock.values());
    if (allItems.length === 0) {
      this.loadSeedStock();
      allItems = Array.from(this.stock.values());
    }

    // Filter by warehouse
    if (link.filters.warehouseId && link.filters.warehouseId !== 'ALL') {
      allItems = allItems.filter(s => s.warehouseId === link.filters.warehouseId);
    }

    // Filter by text search
    if (link.filters.searchQuery) {
      const q = link.filters.searchQuery.toLowerCase().trim();
      allItems = allItems.filter(s => 
        s.materialCode.toLowerCase().includes(q) ||
        s.materialName.toLowerCase().includes(q) ||
        (s.chineseName && s.chineseName.toLowerCase().includes(q)) ||
        (s.specification && s.specification.toLowerCase().includes(q)) ||
        s.binLocation.toLowerCase().includes(q)
      );
    }

    // Filter by bin / rack
    if (link.filters.binLocation) {
      const binQ = link.filters.binLocation.toLowerCase().trim();
      allItems = allItems.filter(s => s.binLocation.toLowerCase().includes(binQ));
    }

    // Filter by status
    if (link.filters.status === 'IN_STOCK') {
      allItems = allItems.filter(s => s.availableQuantity > 0);
    } else if (link.filters.status === 'OUT_OF_STOCK') {
      allItems = allItems.filter(s => s.availableQuantity <= 0);
    } else if (link.filters.status === 'LOW_STOCK') {
      allItems = allItems.filter(s => s.availableQuantity > 0 && s.availableQuantity <= 5);
    }

    // Filter by category / plant
    if (link.filters.category) {
      const catQ = link.filters.category.toLowerCase().trim();
      allItems = allItems.filter(s => {
        const mat = this.materials.get(s.materialId);
        return (mat?.plant && mat.plant.toLowerCase().includes(catQ)) ||
               (s.specification && s.specification.toLowerCase().includes(catQ));
      });
    }

    // Projection: ONLY return fields explicitly allowed in visibleColumns
    const visibleCols = new Set(link.visibleColumns);
    const projectedItems: Partial<StockItem>[] = allItems.map(item => {
      const res: Partial<StockItem> = {
        id: item.id
      };
      if (visibleCols.has('materialCode')) res.materialCode = item.materialCode;
      if (visibleCols.has('materialName')) res.materialName = item.materialName;
      if (visibleCols.has('chineseName')) res.chineseName = item.chineseName;
      if (visibleCols.has('specification')) res.specification = item.specification;
      if (visibleCols.has('warehouseId')) res.warehouseId = item.warehouseId;
      if (visibleCols.has('binLocation')) res.binLocation = item.binLocation;
      if (visibleCols.has('quantity')) res.quantity = item.quantity;
      if (visibleCols.has('availableQuantity')) res.availableQuantity = item.availableQuantity;
      if (visibleCols.has('uom')) res.uom = item.uom;
      if (visibleCols.has('unitPrice')) res.unitPrice = item.unitPrice;
      if (visibleCols.has('totalValue')) res.totalValue = item.totalValue;
      if (visibleCols.has('remarks')) res.remarks = item.remarks;
      if (visibleCols.has('photo')) res.imageUrl = item.imageUrl;
      return res;
    });

    return {
      link,
      isExpired: false,
      isRevoked: false,
      items: projectedItems
    };
  }

  public revokeSharedLink(linkId: string, performedBy: User): boolean {
    const link = this.sharedLinks.get(linkId);
    if (!link) return false;

    link.status = 'REVOKED';
    this.saveSharedLinksToStorage();
    firebaseSync.pushSharedLink(link);

    this.auditLogs.unshift({
      id: 'LOG-SLR-' + Date.now(),
      userId: performedBy.id,
      userName: performedBy.name,
      userRole: performedBy.role,
      action: 'SHARED_LINK_REVOKED',
      targetCollection: 'shared_links',
      targetId: link.token,
      description: `Révocation manuelle du lien partagé [${link.title}] (Token: ${link.token})`,
      timestamp: new Date().toISOString()
    });
    this.saveAuditToStorage();
    this.notify();
    return true;
  }

  public deleteSharedLink(linkId: string, performedBy: User): boolean {
    const link = this.sharedLinks.get(linkId);
    if (!link) return false;

    this.sharedLinks.delete(linkId);
    this.saveSharedLinksToStorage();
    firebaseSync.deleteSharedLink(linkId);

    this.auditLogs.unshift({
      id: 'LOG-SLD-' + Date.now(),
      userId: performedBy.id,
      userName: performedBy.name,
      userRole: performedBy.role,
      action: 'SHARED_LINK_DELETED',
      targetCollection: 'shared_links',
      targetId: link.token,
      description: `Suppression du lien partagé [${link.title}] (Token: ${link.token})`,
      timestamp: new Date().toISOString()
    });
    this.saveAuditToStorage();
    this.notify();
    return true;
  }

  // ==========================================
  // ISSUE VOUCHERS MODULE (Sorties de matériels)
  // ==========================================

  public generateNextVoucherNumber(): string {
    const year = new Date().getFullYear();
    let maxSeq = 150;
    const prefix = `OUT-${year}-`;
    for (const v of this.issueVouchers.values()) {
      if (v.voucherNumber && v.voucherNumber.startsWith(prefix)) {
        const numPart = parseInt(v.voucherNumber.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxSeq) {
          maxSeq = numPart;
        }
      }
    }
    const nextSeq = maxSeq + 1;
    return `OUT-${year}-${String(nextSeq).padStart(6, '0')}`;
  }

  public getIssueVouchers(filters?: {
    status?: string;
    warehouseId?: string;
    searchQuery?: string;
    dateFrom?: string;
    dateTo?: string;
  }): StockIssueVoucher[] {
    let result = Array.from(this.issueVouchers.values());

    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter(v => v.status === filters.status);
      }
      if (filters.warehouseId && filters.warehouseId !== 'ALL') {
        result = result.filter(v => v.warehouseId === filters.warehouseId);
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        result = result.filter(v => 
          v.voucherNumber.toLowerCase().includes(q) ||
          v.buyerName.toLowerCase().includes(q) ||
          (v.department && v.department.toLowerCase().includes(q)) ||
          (v.agentName && v.agentName.toLowerCase().includes(q)) ||
          (v.reason && v.reason.toLowerCase().includes(q)) ||
          (v.paperBookReference && v.paperBookReference.toLowerCase().includes(q)) ||
          v.items.some(it => 
            it.materialCode.toLowerCase().includes(q) ||
            it.materialName.toLowerCase().includes(q) ||
            (it.specification && it.specification.toLowerCase().includes(q)) ||
            it.binLocation.toLowerCase().includes(q)
          )
        );
      }
      if (filters.dateFrom) {
        const fromTime = new Date(filters.dateFrom).getTime();
        result = result.filter(v => new Date(v.date).getTime() >= fromTime);
      }
      if (filters.dateTo) {
        const toTime = new Date(filters.dateTo).getTime();
        result = result.filter(v => new Date(v.date).getTime() <= toTime);
      }
    }

    // Sort descending by date
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }

  public getIssueVoucher(id: string): StockIssueVoucher | undefined {
    return this.issueVouchers.get(id);
  }

  public createIssueVoucher(
    data: {
      voucherNumber?: string;
      warehouseId: string;
      date?: string;
      buyerName: string;
      department?: string;
      agentId: string;
      agentName: string;
      reason?: string;
      observations?: string;
      paperBookReference?: string;
      paperSignatureCompleted?: boolean;
      status?: IssueVoucherStatus;
      items: IssueVoucherItem[];
    },
    performedBy: User
  ): StockIssueVoucher {
    const id = `VOUCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const voucherNumber = data.voucherNumber || this.generateNextVoucherNumber();
    const nowIso = new Date().toISOString();

    const totalRequestedQty = data.items.reduce((s, it) => s + (it.requestedQuantity || 0), 0);
    const totalIssuedQty = data.items.reduce((s, it) => s + (it.issuedQuantity || 0), 0);
    const totalValuationUSD = data.items.reduce((s, it) => s + (it.totalValue || (it.issuedQuantity * it.unitPrice) || 0), 0);

    const voucher: StockIssueVoucher = {
      id,
      voucherNumber,
      warehouseId: data.warehouseId,
      date: data.date || nowIso,
      buyerName: data.buyerName.trim(),
      department: data.department ? data.department.trim() : undefined,
      agentId: data.agentId || performedBy.id,
      agentName: data.agentName || performedBy.name,
      reason: data.reason ? data.reason.trim() : undefined,
      observations: data.observations ? data.observations.trim() : undefined,
      paperBookReference: data.paperBookReference ? data.paperBookReference.trim() : undefined,
      paperSignatureCompleted: !!data.paperSignatureCompleted,
      status: data.status || 'DRAFT',
      items: data.items,
      totalRequestedQty,
      totalIssuedQty,
      totalValuationUSD,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.issueVouchers.set(id, voucher);

    // Track autocomplete values
    if (voucher.buyerName) this.recordCustomValue('requester', voucher.buyerName);
    if (voucher.department) this.recordCustomValue('department', voucher.department);
    if (voucher.reason) this.recordCustomValue('reason', voucher.reason);

    this.auditLogs.unshift({
      id: `LOG-IVC-${Date.now()}`,
      userId: performedBy.id,
      userName: performedBy.name,
      userRole: performedBy.role,
      action: 'ISSUE_VOUCHER_CREATED',
      targetCollection: 'issue_vouchers',
      targetId: voucher.voucherNumber,
      description: `Création du bon de sortie ${voucher.voucherNumber} (Statut: ${voucher.status}) pour ${voucher.buyerName}`,
      newValue: {
        voucherNumber: voucher.voucherNumber,
        warehouseId: voucher.warehouseId,
        buyerName: voucher.buyerName,
        itemsCount: voucher.items.length,
        status: voucher.status
      },
      timestamp: nowIso
    });

    this.saveIssueVouchersToStorage();
    this.saveAuditToStorage();
    this.notify();
    firebaseSync.pushIssueVoucher(voucher);
    return voucher;
  }

  public updateIssueVoucher(
    voucherId: string,
    updates: Partial<StockIssueVoucher>,
    performedBy: User
  ): StockIssueVoucher {
    const voucher = this.issueVouchers.get(voucherId);
    if (!voucher) throw new Error('Voucher not found');
    if (voucher.status === 'CONFIRMED' || voucher.status === 'CANCELLED') {
      throw new Error('Confirmed or cancelled vouchers cannot be modified');
    }

    if (updates.buyerName !== undefined) voucher.buyerName = updates.buyerName.trim();
    if (updates.department !== undefined) voucher.department = updates.department.trim();
    if (updates.reason !== undefined) voucher.reason = updates.reason.trim();
    if (updates.observations !== undefined) voucher.observations = updates.observations.trim();
    if (updates.paperBookReference !== undefined) voucher.paperBookReference = updates.paperBookReference.trim();
    if (updates.paperSignatureCompleted !== undefined) voucher.paperSignatureCompleted = updates.paperSignatureCompleted;
    if (updates.status !== undefined) voucher.status = updates.status;
    if (updates.warehouseId !== undefined) voucher.warehouseId = updates.warehouseId;
    if (updates.date !== undefined) voucher.date = updates.date;

    if (updates.items !== undefined) {
      voucher.items = updates.items;
      voucher.totalRequestedQty = voucher.items.reduce((s, it) => s + (it.requestedQuantity || 0), 0);
      voucher.totalIssuedQty = voucher.items.reduce((s, it) => s + (it.issuedQuantity || 0), 0);
      voucher.totalValuationUSD = voucher.items.reduce((s, it) => s + ((it.issuedQuantity || 0) * it.unitPrice), 0);
    }

    voucher.updatedAt = new Date().toISOString();

    if (voucher.buyerName) this.recordCustomValue('requester', voucher.buyerName);
    if (voucher.department) this.recordCustomValue('department', voucher.department);
    if (voucher.reason) this.recordCustomValue('reason', voucher.reason);

    this.saveIssueVouchersToStorage();
    this.notify();
    firebaseSync.pushIssueVoucher(voucher);
    return voucher;
  }

  public confirmIssueVoucher(
    voucherId: string,
    performedBy: User,
    paperBookReference?: string
  ): { success: boolean; voucher?: StockIssueVoucher; error?: string } {
    const voucher = this.issueVouchers.get(voucherId);
    if (!voucher) return { success: false, error: 'Bon de sortie introuvable' };
    if (voucher.status === 'CONFIRMED') {
      return { success: false, error: 'Ce bon de sortie est déjà confirmé.' };
    }
    if (voucher.status === 'CANCELLED') {
      return { success: false, error: 'Ce bon de sortie est annulé et ne peut pas être confirmé.' };
    }
    if (voucher.items.length === 0) {
      return { success: false, error: 'Le bon de sortie ne contient aucun article.' };
    }

    // Verify physical stock availability for each item
    for (const item of voucher.items) {
      const stockItem = this.stock.get(item.stockId);
      if (!stockItem) {
        return { 
          success: false, 
          error: `Matériel ${item.materialCode} introuvable en stock sur ${item.binLocation}.` 
        };
      }
      if (item.issuedQuantity < 0) {
        return {
          success: false,
          error: `Quantité invalide (${item.issuedQuantity}) pour ${item.materialCode}.`
        };
      }
      if (stockItem.availableQuantity < item.issuedQuantity) {
        return {
          success: false,
          error: `Stock insuffisant pour ${item.materialCode} sur ${item.binLocation}: ${stockItem.availableQuantity} disponible(s), ${item.issuedQuantity} demandé(s).`
        };
      }
    }

    const nowIso = new Date().toISOString();

    // Deduct stock and generate movements
    for (const item of voucher.items) {
      const stockItem = this.stock.get(item.stockId)!;
      const stockBefore = stockItem.quantity;
      const stockAfter = stockBefore - item.issuedQuantity;

      stockItem.quantity = stockAfter;
      stockItem.availableQuantity = Math.max(0, stockItem.availableQuantity - item.issuedQuantity);
      stockItem.totalValue = stockItem.quantity * stockItem.unitPrice;
      stockItem.lastUpdated = nowIso;

      item.stockBefore = stockBefore;
      item.stockAfter = stockAfter;
      item.totalValue = item.issuedQuantity * item.unitPrice;

      // Create StockMovement
      const movement: StockMovement = {
        id: `MOV-OUT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        movementType: 'ISSUE',
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        warehouseId: voucher.warehouseId,
        binLocation: item.binLocation,
        quantity: item.issuedQuantity,
        previousQuantity: stockBefore,
        newQuantity: stockAfter,
        unitPrice: item.unitPrice,
        totalAmount: item.issuedQuantity * item.unitPrice,
        referenceNumber: voucher.voucherNumber,
        issueVoucherId: voucher.id,
        issueVoucherNumber: voucher.voucherNumber,
        requester: voucher.buyerName,
        department: voucher.department,
        reason: voucher.reason,
        performedBy: performedBy.id,
        performedByName: performedBy.name,
        createdAt: nowIso
      };
      this.movements.unshift(movement);
    }

    if (paperBookReference) {
      voucher.paperBookReference = paperBookReference.trim();
    }
    voucher.paperSignatureCompleted = true;
    voucher.status = 'CONFIRMED';
    voucher.confirmedAt = nowIso;
    voucher.confirmedBy = performedBy.id;
    voucher.confirmedByName = performedBy.name;
    voucher.updatedAt = nowIso;
    voucher.totalIssuedQty = voucher.items.reduce((s, it) => s + it.issuedQuantity, 0);
    voucher.totalValuationUSD = voucher.items.reduce((s, it) => s + (it.issuedQuantity * it.unitPrice), 0);

    // Record autocomplete terms
    if (voucher.buyerName) this.recordCustomValue('requester', voucher.buyerName);
    if (voucher.department) this.recordCustomValue('department', voucher.department);
    if (voucher.reason) this.recordCustomValue('reason', voucher.reason);

    // Audit log
    this.auditLogs.unshift({
      id: `LOG-IV-CONF-${Date.now()}`,
      userId: performedBy.id,
      userName: performedBy.name,
      userRole: performedBy.role,
      action: 'ISSUE_VOUCHER_CONFIRMED',
      targetCollection: 'issue_vouchers',
      targetId: voucher.voucherNumber,
      description: `Confirmation définitive du bon ${voucher.voucherNumber} pour ${voucher.buyerName}. Total: ${voucher.totalIssuedQty} unités. Carnet papier: ${voucher.paperBookReference || 'Attesté'}.`,
      newValue: {
        voucherNumber: voucher.voucherNumber,
        buyerName: voucher.buyerName,
        paperBookReference: voucher.paperBookReference,
        totalIssuedQty: voucher.totalIssuedQty,
        items: voucher.items.map(it => ({ code: it.materialCode, qty: it.issuedQuantity }))
      },
      timestamp: nowIso
    });

    this.saveStockToStorage();
    this.saveMovementsToStorage();
    this.saveIssueVouchersToStorage();
    this.saveAuditToStorage();
    this.notify();

    const updatedStockItems = voucher.items.map(it => this.stock.get(it.stockId)).filter(Boolean) as StockItem[];
    if (updatedStockItems.length > 0) firebaseSync.pushStockItems(updatedStockItems);
    firebaseSync.pushIssueVoucher(voucher);

    return { success: true, voucher };
  }

  public cancelIssueVoucher(
    voucherId: string,
    reason: string,
    performedBy: User
  ): { success: boolean; voucher?: StockIssueVoucher; error?: string } {
    const voucher = this.issueVouchers.get(voucherId);
    if (!voucher) return { success: false, error: 'Bon de sortie introuvable' };
    if (voucher.status === 'CONFIRMED') {
      return { 
        success: false, 
        error: 'Impossible d\'annuler un bon déjà confirmé dont le stock a été déduit. Veuillez créer un retour si nécessaire.' 
      };
    }
    if (voucher.status === 'CANCELLED') {
      return { success: false, error: 'Ce bon est déjà annulé.' };
    }

    const nowIso = new Date().toISOString();
    voucher.status = 'CANCELLED';
    voucher.cancelledAt = nowIso;
    voucher.cancelledBy = performedBy.id;
    voucher.cancellationReason = reason.trim() || 'Annulation manuelle';
    voucher.updatedAt = nowIso;

    this.auditLogs.unshift({
      id: `LOG-IV-CANC-${Date.now()}`,
      userId: performedBy.id,
      userName: performedBy.name,
      userRole: performedBy.role,
      action: 'ISSUE_VOUCHER_CANCELLED',
      targetCollection: 'issue_vouchers',
      targetId: voucher.voucherNumber,
      description: `Annulation du bon de sortie ${voucher.voucherNumber} (${voucher.cancellationReason})`,
      timestamp: nowIso
    });

    this.saveIssueVouchersToStorage();
    this.saveAuditToStorage();
    this.notify();
    return { success: true, voucher };
  }

  public getIssueVoucherKPIs(): {
    totalConfirmed: number;
    todayIssues: number;
    pendingIssues: number;
    totalUnitsIssued: number;
  } {
    const all = Array.from(this.issueVouchers.values());
    const todayStr = new Date().toISOString().substring(0, 10);

    let totalConfirmed = 0;
    let todayIssues = 0;
    let pendingIssues = 0;
    let totalUnitsIssued = 0;

    for (const v of all) {
      if (v.status === 'CONFIRMED') {
        totalConfirmed++;
        totalUnitsIssued += v.totalIssuedQty || 0;
      } else if (v.status === 'DRAFT' || v.status === 'PREPARING' || v.status === 'READY') {
        pendingIssues++;
      }

      const vDateStr = (v.date || v.createdAt).substring(0, 10);
      if (vDateStr === todayStr) {
        todayIssues++;
      }
    }

    return {
      totalConfirmed,
      todayIssues,
      pendingIssues,
      totalUnitsIssued
    };
  }

  public getAutocompleteSuggestions(field: AutocompleteFieldType, query: string, limit?: number): AutocompleteResult {
    return autocompleteService.query(field, query, limit);
  }

  public recordCustomValue(field: AutocompleteFieldType, value: string): void {
    autocompleteService.recordCustomValue(field, value);
  }
}

export const dataService = new DataService();
