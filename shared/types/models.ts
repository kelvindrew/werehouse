/**
 * Warehouse Management System (WMS) — Shared Domain Models
 * B1 & B2 Warehouses
 */

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'STOREKEEPER' | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type SupportedLanguage = 'fr' | 'en' | 'zh';

export interface User {
  id: string; // Firebase Auth UID
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  language: SupportedLanguage; // 'fr' | 'en' | 'zh'
  warehouseAccess: string[]; // ['B1', 'B2'] or ['*']
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type WarehouseCode = 'B1' | 'B2' | string;

export interface Warehouse {
  id: string; // e.g. 'B1', 'B2'
  code: string; // 'B1', 'B2'
  name: string;
  description: string;
  location?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  totalItemsCount?: number;
  totalQuantity?: number;
  totalValuationUSD?: number;
}

export interface Material {
  id: string; // Unique ID (e.g. materialCode or slugified code)
  materialCode: string; // Business identifier (e.g., '40722580', 'MMS1-253')
  name: string; // English / primary name (e.g. 'VALVE, RELIEF, BOILER')
  chineseName?: string; // Chinese name (e.g. '安全阀')
  description?: string;
  specification?: string; // e.g. 'A48Y-64C DN50'
  category?: string; // e.g. 'VALVE', 'BEARING', 'PUMP'
  subcategory?: string;
  manufacturer?: string; // e.g. 'SKF', 'FAG', 'SIEMENS'
  supplier?: string;
  uom: string; // Unit of Measure: EA, SET, M, KG, BOX, etc.
  plant?: string; // e.g. '3458'
  valuationType?: string;
  standardPrice?: number; // USD
  currency: string; // Default: 'USD'
  priceUnit?: number; // Default: 1
  requiresMaterialCodeReview?: boolean; // Flagged if temporarily generated
  imageUrl?: string; // Main photo URL or base64
  images?: string[]; // Multiple photos (technical drawings, packaging, etc.)
  barcode?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type LocationType =
  | 'WAREHOUSE'     // Magasin
  | 'CONTAINER'     // Container
  | 'YARD'          // Zone extérieure / Yard
  | 'WORKSHOP'      // Atelier
  | 'RACK'          // Rack / Rayonnage
  | 'SHELF'         // Étagère
  | 'TEMPORARY'     // Stockage temporaire
  | 'QUARANTINE'    // Zone de quarantaine
  | 'OFFICE'        // Bureau
  | 'OTHER'         // Autre / Personnalisé
  | string;

export interface StorageLocation {
  id: string; // e.g. 'LOC-B1', 'LOC-CONT-01', 'LOC-YARD'
  code: string; // e.g. 'B1', 'B2', 'CONT-01', 'YARD', 'WORKSHOP'
  name: string; // e.g. 'Magasin B1', 'Container 01', 'Yard Principal'
  type: LocationType;
  customTypeName?: string; // If type is OTHER
  description?: string;
  physicalLocation?: string; // e.g. 'Zone Sud - Quai B', 'Plateforme 3'
  parentId?: string; // Optional parent location
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
  totalItemsCount?: number;
  totalQuantity?: number;
  totalValuationUSD?: number;
  imageUrl?: string;
  images?: string[];
}

export interface BinLocation {
  id: string; // e.g. 'B1_MD01-01-01-01-02'
  warehouseId: string; // 'B1' | 'B2' | string
  code: string; // 'MD01-01-01-01-02'
  zone?: string; // 'MD01', 'B2-01'
  description?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export interface StockItem {
  id: string; // deterministic: `${warehouseId}_${materialId}_${binLocation}`
  materialId: string;
  materialCode: string;
  materialName: string;
  chineseName?: string;
  specification?: string;
  imageUrl?: string;
  warehouseId: string; // Primary storage location code: 'B1', 'B2', 'CONT-01', 'YARD', etc.
  locationId?: string; // Reference to StorageLocation.id
  locationType?: LocationType; // 'WAREHOUSE' | 'CONTAINER' | 'YARD' | etc.
  // Granular optional sub-location fields - rendered only if populated!
  zone?: string; // e.g. 'Zone A', 'Côté gauche', 'MD01'
  rack?: string; // e.g. 'R12'
  shelf?: string; // e.g. 'S03'
  row?: string; // e.g. 'Rangée 4'
  position?: string; // e.g. 'C-04', '01-02'
  containerNumber?: string; // e.g. 'Container 03'
  locationNotes?: string; // e.g. 'Au sol près de la porte 2'
  binLocation: string; // Formatted / composite string for backward-compatibility & search
  uom: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number; // quantity - reservedQuantity
  unitPrice: number; // USD
  totalValue: number; // quantity * unitPrice
  remarks?: string;
  lastUpdated: string;
}

export type MovementType =
  | 'RECEIPT'
  | 'ISSUE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'INVENTORY_CORRECTION'
  | 'INITIAL_IMPORT';

export interface StockMovement {
  id: string; // UUID or auto-id
  movementType: MovementType;
  materialId: string;
  materialCode: string;
  materialName: string;
  warehouseId: string; // Primary storage location code: 'B1' | 'B2' | 'CONT-01' | 'YARD' etc.
  locationId?: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  containerNumber?: string;
  binLocation: string;
  quantity: number; // Absolute quantity moved
  previousQuantity: number;
  newQuantity: number;
  unitPrice: number;
  totalAmount: number; // quantity * unitPrice
  referenceNumber?: string; // Purchase order, Delivery note, Exit ticket
  transferId?: string; // Link between TRANSFER_OUT and TRANSFER_IN
  destinationWarehouseId?: string; // If transfer
  destinationLocationId?: string;
  destinationZone?: string;
  destinationRack?: string;
  destinationShelf?: string;
  destinationRow?: string;
  destinationPosition?: string;
  destinationContainerNumber?: string;
  destinationBinLocation?: string; // If transfer
  reason?: string; // Cause for issue/adjustment
  department?: string; // Requesting department
  requester?: string; // Person who requested the items
  supplier?: string; // Supplier name for receipts
  comments?: string;
  issueVoucherId?: string; // Link to StockIssueVoucher.id
  issueVoucherNumber?: string; // e.g. 'OUT-2026-000154'
  performedBy: string; // User ID
  performedByName: string; // User Name
  createdAt: string; // ISO Timestamp
  idempotencyKey?: string; // Prevents duplicate submissions offline
}

export interface PhysicalInventoryCount {
  id: string;
  warehouseId: string;
  binLocation: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  systemQuantity: number;
  physicalQuantity: number;
  differenceQuantity: number; // physical - system
  unitPrice: number;
  differenceValue: number; // differenceQuantity * unitPrice
  countedBy: string;
  countedByName: string;
  countedAt: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  validatedBy?: string;
  validatedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'STOCK_RECEIPT'
    | 'STOCK_ISSUE'
    | 'STOCK_TRANSFER'
    | 'INVENTORY_ADJUSTMENT'
    | 'EXCEL_IMPORT'
    | 'EXCEL_EXPORT'
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'PERMISSION_CHANGE'
    | 'SHARED_LINK_CREATED'
    | 'SHARED_LINK_ACCESSED'
    | 'SHARED_LINK_REVOKED'
    | 'SHARED_LINK_DELETED'
    | 'LOCATION_CREATED'
    | 'LOCATION_UPDATED'
    | 'LOCATION_DELETED'
    | 'ISSUE_VOUCHER_CREATED'
    | 'ISSUE_VOUCHER_CONFIRMED'
    | 'ISSUE_VOUCHER_CANCELLED';
  targetCollection: string;
  targetId: string;
  description: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  device?: string; // 'WEB' | 'ANDROID'
  timestamp: string;
}

export type SharedLinkStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type SharedLinkColumn =
  | 'photo'
  | 'materialCode'
  | 'materialName'
  | 'chineseName'
  | 'specification'
  | 'warehouseId'
  | 'binLocation'
  | 'quantity'
  | 'availableQuantity'
  | 'uom'
  | 'unitPrice'
  | 'totalValue'
  | 'remarks'
  | 'plant';

export interface SharedLinkFilters {
  warehouseId?: 'ALL' | 'B1' | 'B2';
  searchQuery?: string;
  binLocation?: string;
  category?: string;
  status?: 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';
}

export interface SharedLink {
  id: string; // UUID
  token: string; // High-entropy alphanumeric token, e.g. 8fK92xLmQp7
  title: string; // User-friendly label, e.g. "Pièces Bearing - Magasin B1"
  filters: SharedLinkFilters;
  visibleColumns: SharedLinkColumn[];
  createdBy: string; // User ID
  createdByName: string; // User Name
  createdAt: string; // ISO Timestamp
  expiresAt: string; // ISO Timestamp
  status: SharedLinkStatus;
  accessCount: number;
  lastAccessedAt?: string;
  permission: 'READ_ONLY';
}

export interface ExcelImportValidationIssue {
  rowNumber: number;
  sheetName: string;
  type: 'CRITICAL_ERROR' | 'WARNING' | 'TYPO_CORRECTED' | 'DUPLICATE_CONSOLIDATED';
  field: string;
  value: string | number | null | undefined;
  message: string;
  actionTaken: string;
}

export interface ExcelImportSummary {
  sheetName: string;
  totalRowsRead: number;
  validRows: number;
  phantomRowsSkipped: number;
  missingMaterialCodes: number;
  missingBins: number;
  missingPrices: number;
  duplicatesConsolidated: number;
  binTyposFixed: number;
  formulaErrorsResolved: number;
  originalSumQuantity: number;
  importedSumQuantity: number;
  originalSumTotalValue: number;
  importedSumTotalValue: number;
  isBalanced: boolean;
  issues: ExcelImportValidationIssue[];
}

export type AutocompleteFieldType = 
  | 'materialCode'
  | 'materialName'
  | 'chineseName'
  | 'specification'
  | 'category'
  | 'subcategory'
  | 'supplier'
  | 'manufacturer'
  | 'warehouseId'
  | 'binLocation'
  | 'locationType'
  | 'containerNumber'
  | 'zone'
  | 'rack'
  | 'shelf'
  | 'row'
  | 'position'
  | 'uom'
  | 'status'
  | 'requester'
  | 'department'
  | 'reason'
  | 'physicalLocation';

export interface AutocompleteSuggestion {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  category?: string;
  payload?: any;
  score?: number;
}

export interface AutocompleteResult {
  suggestions: AutocompleteSuggestion[];
  similarExistingValue?: string;
  isExactMatch: boolean;
  totalMatches: number;
}

export type IssueVoucherStatus = 
  | 'DRAFT'        // Brouillon
  | 'PREPARING'    // En préparation physique
  | 'READY'        // En attente de signature carnet & confirmation
  | 'CONFIRMED'    // Confirmée (stock déduit, mouvement créé, immuable)
  | 'CANCELLED';   // Annulée

export interface IssueVoucherItem {
  id: string; // item id within voucher
  stockId: string; // reference to stock item `${warehouseId}_${materialId}_${binLocation}`
  materialId: string;
  materialCode: string;
  materialName: string;
  chineseName?: string;
  specification?: string;
  warehouseId: string;
  binLocation: string;
  availableStock: number; // Snapshot of stock at preparation time
  requestedQuantity: number;
  issuedQuantity: number; // Actual verified quantity given to buyer
  uom: string;
  unitPrice: number;
  totalValue: number; // issuedQuantity * unitPrice
  stockBefore?: number; // Snapshot before deduction
  stockAfter?: number; // Snapshot after deduction
  notes?: string;
}

export interface StockIssueVoucher {
  id: string; // UUID e.g. 'VOUCH-...'
  voucherNumber: string; // Business identifier e.g. 'OUT-2026-000154'
  warehouseId: string; // 'B1', 'B2', etc.
  date: string; // ISO string
  buyerName: string; // Requester / buyer
  department?: string;
  agentId: string;
  agentName: string;
  reason?: string;
  observations?: string;
  paperBookReference?: string; // e.g. 'Page 42, Carnet N° 3'
  paperSignatureCompleted: boolean; // Signature carnet effectuée ☑
  status: IssueVoucherStatus;
  items: IssueVoucherItem[];
  totalRequestedQty: number;
  totalIssuedQty: number;
  totalValuationUSD: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
  confirmedByName?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

