import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StockTableView } from './components/StockTableView';
import { LocationsView } from './components/LocationsView';
import { LocationModal } from './components/LocationModal';
import { MovementsTableView } from './components/MovementsTableView';
import { InventoryView } from './components/InventoryView';
import { ExcelImportView } from './components/ExcelImportView';
import { ExportView } from './components/ExportView';
import { AuditLogView } from './components/AuditLogView';
import { MaterialDetailModal } from './components/MaterialDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { IssueModal } from './components/IssueModal';
import { TransferModal } from './components/TransferModal';
import { SharedLinksView } from './components/SharedLinksView';
import { SharedPublicView } from './components/SharedPublicView';
import { GenerateShareModal } from './components/GenerateShareModal';
import { BarcodeLabelModal } from './components/BarcodeLabelModal';
import { IssuesView } from './components/IssuesView';
import { MobileFloatingDock } from './components/MobileFloatingDock';
import { StockItem, SharedLinkFilters, StorageLocation } from '@shared/types/models';
import { 
  LayoutDashboard, 
  Boxes, 
  MapPin, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  ClipboardCheck,
  CheckCircle2
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, setSelectedWarehouse, t } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [stockInitialFilter, setStockInitialFilter] = useState<string | undefined>(undefined);

  // Modals state
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [activeStockItem, setActiveStockItem] = useState<StockItem | null>(null);

  // Location modal state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<StorageLocation | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleNavigateToStock = (filter?: string) => {
    if (filter === 'B1' || filter === 'B2') {
      setSelectedWarehouse(filter);
      setStockInitialFilter(undefined);
    } else if (filter === 'lowStock') {
      setStockInitialFilter('lowStock');
    } else if (filter) {
      setSelectedWarehouse(filter);
      setStockInitialFilter(undefined);
    } else {
      setStockInitialFilter(undefined);
    }
    setCurrentTab('stock');
  };

  const handleQuickReceipt = (item?: StockItem) => {
    setActiveStockItem(item || null);
    setIsReceiptOpen(true);
  };

  const handleQuickIssue = (item?: StockItem) => {
    setActiveStockItem(item || null);
    setIsIssueOpen(true);
  };

  const handleQuickTransfer = (item?: StockItem) => {
    setActiveStockItem(item || null);
    setIsTransferOpen(true);
  };

  const handleOpenCreateLocation = () => {
    setLocationToEdit(null);
    setIsLocationModalOpen(true);
  };

  // Tablet mode state
  const [isTabletMode, setIsTabletMode] = useState(() => {
    return localStorage.getItem('wms_tablet_mode') === 'true';
  });

  const handleToggleTabletMode = () => {
    setIsTabletMode(prev => {
      const next = !prev;
      localStorage.setItem('wms_tablet_mode', String(next));
      if (next && document.fullscreenEnabled && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!next && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
  };

  // Label modal state
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelModalItem, setLabelModalItem] = useState<StockItem | null>(null);

  const handleOpenLabelModal = (item: StockItem) => {
    setLabelModalItem(item);
    setIsLabelModalOpen(true);
  };

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareInitialFilters, setShareInitialFilters] = useState<SharedLinkFilters | undefined>(undefined);

  const handleOpenShareModal = (filters?: Partial<SharedLinkFilters>) => {
    setShareInitialFilters(filters as SharedLinkFilters);
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-zinc-900 flex selection:bg-lime selection:text-zinc-950">
      {/* Desktop Sidebar Navigation (Full Height) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setStockInitialFilter(undefined);
          setCurrentTab(tab);
        }}
      />

      {/* Main Canvas Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenReceipt={() => {
            setActiveStockItem(null);
            setIsReceiptOpen(true);
          }}
          onOpenIssue={() => {
            setActiveStockItem(null);
            setIsIssueOpen(true);
          }}
          onOpenTransfer={() => {
            setActiveStockItem(null);
            setIsTransferOpen(true);
          }}
          onSearchFocus={() => setCurrentTab('stock')}
          onOpenCreateLocation={handleOpenCreateLocation}
          isTabletMode={isTabletMode}
          onToggleTabletMode={handleToggleTabletMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToStock={handleNavigateToStock}
              onNavigateToMovements={() => setCurrentTab('receipts')}
              onOpenMaterialModal={(id) => setSelectedMaterialId(id)}
              onNavigateToLocations={() => setCurrentTab('locations')}
              onOpenCreateLocation={handleOpenCreateLocation}
              onQuickReceipt={handleQuickReceipt}
              onQuickIssue={handleQuickIssue}
              onOpenTransfer={() => {
                setActiveStockItem(null);
                setIsTransferOpen(true);
              }}
              onOpenShareModal={() => handleOpenShareModal()}
            />
          )}

          {currentTab === 'stock' && (
            <StockTableView
              onOpenMaterialModal={(id) => setSelectedMaterialId(id)}
              onQuickReceipt={handleQuickReceipt}
              onQuickIssue={handleQuickIssue}
              onQuickTransfer={handleQuickTransfer}
              initialFilter={stockInitialFilter}
              onOpenShareModal={handleOpenShareModal}
              isTabletMode={isTabletMode}
              onOpenLabelModal={handleOpenLabelModal}
            />
          )}

          {currentTab === 'locations' && (
            <LocationsView
              currentUser={currentUser}
              t={t}
              onSelectLocationForStock={(code) => {
                setSelectedWarehouse(code);
                setCurrentTab('stock');
              }}
              onOpenCreateModal={() => {
                setLocationToEdit(null);
                setIsLocationModalOpen(true);
              }}
              onOpenEditModal={(loc) => {
                setLocationToEdit(loc);
                setIsLocationModalOpen(true);
              }}
            />
          )}

          {currentTab === 'shared_links' && <SharedLinksView />}

          {currentTab === 'receipts' && (
            <MovementsTableView />
          )}

          {currentTab === 'issues' && (
            <IssuesView currentUser={currentUser} t={t} />
          )}

          {currentTab === 'transfers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{t.nav_transfers_title}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t.nav_transfers_subtitle}
                  </p>
                </div>
                <button
                  onClick={() => setIsTransferOpen(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{t.btn_new_transfer}</span>
                </button>
              </div>
              <MovementsTableView />
            </div>
          )}

          {currentTab === 'inventory' && <InventoryView />}

          {currentTab === 'import' && <ExcelImportView />}

          {currentTab === 'export' && <ExportView />}

          {currentTab === 'audit' && <AuditLogView />}
        </main>
      </div>

      {/* Mobile Floating Tactile Dock with Raised Center Home Button */}
      <MobileFloatingDock
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setStockInitialFilter(undefined);
          setCurrentTab(tab);
        }}
        t={t}
      />

      {/* Global Modals */}
      <MaterialDetailModal
        materialId={selectedMaterialId}
        onClose={() => setSelectedMaterialId(null)}
        onOpenLabelModal={handleOpenLabelModal}
        onQuickReceipt={(item) => {
          setSelectedMaterialId(null);
          handleQuickReceipt(item);
        }}
        onQuickIssue={(item) => {
          setSelectedMaterialId(null);
          handleQuickIssue(item);
        }}
        onQuickTransfer={(item) => {
          setSelectedMaterialId(null);
          handleQuickTransfer(item);
        }}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setLocationToEdit(null);
        }}
        onSaved={() => showToast(locationToEdit ? t.location_updated_success : t.location_created_success)}
        locationToEdit={locationToEdit}
        currentUser={currentUser}
        t={t}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveStockItem(null);
        }}
        preselectedItem={activeStockItem}
        onSuccess={showToast}
      />

      <IssueModal
        isOpen={isIssueOpen}
        onClose={() => {
          setIsIssueOpen(false);
          setActiveStockItem(null);
        }}
        preselectedItem={activeStockItem}
        onSuccess={showToast}
        onOpenMultiVoucher={() => setCurrentTab('issues')}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setActiveStockItem(null);
        }}
        preselectedItem={activeStockItem}
        onSuccess={showToast}
      />

      <GenerateShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialFilters={shareInitialFilters}
        onLinkCreated={() => showToast(t.share_link_created_success || 'Lien de partage généré avec succès')}
      />

      <BarcodeLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => {
          setIsLabelModalOpen(false);
          setLabelModalItem(null);
        }}
        item={labelModalItem}
      />

      {/* Live Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 p-4 bg-zinc-900 border border-zinc-700 text-white rounded shadow-xl flex items-center gap-3 animate-slideUp text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-400 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
};

const getShareTokenFromUrl = (): string | null => {
  const pathname = window.location.pathname;
  if (pathname.includes('/share/')) {
    const parts = pathname.split('/share/');
    if (parts[1]) {
      const token = parts[1].split('/')[0].split('?')[0].trim();
      if (token) return token;
    }
  }
  const searchParams = new URLSearchParams(window.location.search);
  const shareParam = searchParams.get('share');
  if (shareParam && shareParam.trim()) return shareParam.trim();

  if (window.location.hash) {
    const hash = window.location.hash;
    if (hash.includes('/share/')) {
      const parts = hash.split('/share/');
      if (parts[1]) {
        const token = parts[1].split('/')[0].split('?')[0].trim();
        if (token) return token;
      }
    }
    const hashParams = new URLSearchParams(hash.replace(/^#\??/, ''));
    const hashShare = hashParams.get('share');
    if (hashShare && hashShare.trim()) return hashShare.trim();
  }
  return null;
};

export const App: React.FC = () => {
  const [shareToken, setShareToken] = useState<string | null>(() => getShareTokenFromUrl());

  React.useEffect(() => {
    const handlePopState = () => {
      setShareToken(getShareTokenFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (shareToken) {
    return (
      <SharedPublicView
        token={shareToken}
        onClose={() => {
          window.history.pushState({}, '', '/');
          setShareToken(null);
        }}
      />
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
