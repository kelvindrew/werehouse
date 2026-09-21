import { 
  AutocompleteFieldType, 
  AutocompleteSuggestion, 
  AutocompleteResult,
  Material,
  StockItem,
  StorageLocation,
  StockMovement,
  BinLocation
} from '@shared/types/models';

const STORAGE_KEY_CUSTOM_VALUES = 'wms_custom_autocomplete_values_v1';

// Seed default standard values to enrich UX when DB records are sparse
const SEED_DEPARTMENTS = [
  'Maintenance Mécanique',
  'Maintenance Électrique',
  'Instrumentation & Régulation',
  'Production / Exploitation',
  'Logistique & Magasin',
  'Sécurité, Hygiène & Environnement (HSE)',
  'Direction Technique',
  'Atelier Central',
  'Chantier Extérieur',
  'Services Généraux'
];

const SEED_REASONS = [
  // Receipts
  'Achat régulier sur commande',
  'Commande urgente / Dépannage',
  'Réception fournisseur',
  'Retour de chantier / Excédent',
  'Dotation initiale projet',
  'Stock de sécurité',
  // Issues
  'Maintenance corrective (Dépannage panne)',
  'Maintenance préventive systématique',
  'Consommation courante atelier',
  'Arrêt d\'urgence unité',
  'Projet neuf d\'extension',
  'Remplacement pièce usée',
  // Transfers
  'Rééquilibrage de stock B1 / B2',
  'Mise en container sécurisé',
  'Rangement & optimisation magasin',
  'Zone tampon avant montage',
  'Préparation pour expédition',
  // Adjustments
  'Inventaire physique annuel',
  'Inventaire tournant périodique',
  'Perte ou avarie constatée',
  'Erreur de saisie précédente',
  'Régularisation système'
];

const SEED_CATEGORIES = [
  'Roulements & Paliers',
  'Robinetterie & Vannes',
  'Tuyauterie & Raccords',
  'Électricité & Câblage',
  'Instrumentation & Capteurs',
  'Visserie & Fixations',
  'Joints & Étanchéité',
  'Filtres & Cartouches',
  'Outillage & Consommables',
  'Lubrifiants & Produits chimiques',
  'Transmissions & Courroies',
  'Pompes & Moteurs',
  'Équipements de protection (EPI)'
];

const SEED_UOMS = [
  'PCS',
  'SET',
  'M',
  'KG',
  'L',
  'BOX',
  'ROLL',
  'BAG',
  'PAIR',
  'CAN',
  'MTR'
];

const SEED_LOC_TYPES = [
  'WAREHOUSE',
  'CONTAINER',
  'YARD',
  'WORKSHOP',
  'TEMPORARY',
  'QUARANTINE',
  'DAMAGED'
];

/**
 * Normalizes text for case-insensitive and accent-insensitive comparison.
 * e.g., "Étagère-01" -> "etagere-01"
 */
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Normalizes string for canonical duplicate detection (stripping separators and common cognates).
 * e.g. "Conteneur 01" -> "container 01", "CONT-01" -> "container 01"
 */
export function normalizeCanonical(str: string): string {
  if (!str) return '';
  let norm = normalizeText(str);
  // Replace punctuation and separators with space
  norm = norm.replace(/[-_./\\(),:;#]/g, ' ');
  // Cognate mapping
  norm = norm
    .replace(/\bconteneur\b/g, 'container')
    .replace(/\bcont\b/g, 'container')
    .replace(/\bmagasin\b/g, 'warehouse')
    .replace(/\bmag\b/g, 'warehouse')
    .replace(/\bdepot\b/g, 'warehouse')
    .replace(/\betagere\b/g, 'shelf')
    .replace(/\ballee\b/g, 'row')
    .replace(/\bzone\b/g, 'zone');
  // Collapse whitespace
  return norm.replace(/\s+/g, ' ').trim();
}

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

export interface DataProvider {
  getMaterials: () => Material[];
  getStock: (filters?: any) => StockItem[];
  getLocations: () => StorageLocation[];
  getBins: () => BinLocation[];
  getStockMovements: () => StockMovement[];
  subscribe: (listener: () => void) => () => void;
}

export class AutocompleteService {
  private dataProvider: DataProvider | null = null;
  private customValues: Map<AutocompleteFieldType, Set<string>> = new Map();
  private cache: Map<AutocompleteFieldType, AutocompleteSuggestion[]> | null = null;
  private unsubscribeProvider: (() => void) | null = null;

  constructor() {
    this.loadCustomValues();
  }

  public setDataProvider(provider: DataProvider) {
    if (this.unsubscribeProvider) {
      this.unsubscribeProvider();
    }
    this.dataProvider = provider;
    this.invalidateCache();
    this.unsubscribeProvider = provider.subscribe(() => {
      this.invalidateCache();
    });
  }

  private loadCustomValues() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_VALUES);
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key])) {
              this.customValues.set(key as AutocompleteFieldType, new Set(parsed[key]));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load custom autocomplete values:', e);
    }
  }

  private saveCustomValues() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, string[]> = {};
        for (const [key, valSet] of this.customValues.entries()) {
          obj[key] = Array.from(valSet);
        }
        localStorage.setItem(STORAGE_KEY_CUSTOM_VALUES, JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('Could not save custom autocomplete values:', e);
    }
  }

  /**
   * Records a user-created or newly entered custom value.
   * Immediately re-indexes so it appears in next queries!
   */
  public recordCustomValue(field: AutocompleteFieldType, value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    let set = this.customValues.get(field);
    if (!set) {
      set = new Set<string>();
      this.customValues.set(field, set);
    }

    if (!set.has(trimmed)) {
      set.add(trimmed);
      this.saveCustomValues();
      this.invalidateCache();
    }
  }

  public invalidateCache() {
    this.cache = null;
  }

  /**
   * Builds the indexed suggestions for all fields from dataProvider + custom values + seeds.
   */
  private buildIndex(): Map<AutocompleteFieldType, AutocompleteSuggestion[]> {
    const index = new Map<AutocompleteFieldType, AutocompleteSuggestion[]>();

    const materials = this.dataProvider ? this.dataProvider.getMaterials() : [];
    const stockItems = this.dataProvider ? this.dataProvider.getStock() : [];
    const locations = this.dataProvider ? this.dataProvider.getLocations() : [];
    const bins = this.dataProvider ? this.dataProvider.getBins() : [];
    const movements = this.dataProvider ? this.dataProvider.getStockMovements() : [];

    // 1. materialCode
    const codeMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.materialCode && !codeMap.has(m.materialCode)) {
        codeMap.set(m.materialCode, {
          value: m.materialCode,
          label: `${m.materialCode} — ${m.name}`,
          subLabel: m.specification || m.chineseName,
          badge: m.uom,
          payload: m
        });
      }
    });
    stockItems.forEach(s => {
      if (s.materialCode && !codeMap.has(s.materialCode)) {
        codeMap.set(s.materialCode, {
          value: s.materialCode,
          label: `${s.materialCode} — ${s.materialName}`,
          subLabel: s.specification || s.chineseName,
          badge: s.uom,
          payload: s
        });
      }
    });
    index.set('materialCode', Array.from(codeMap.values()));

    // 2. materialName
    const nameMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.name && !nameMap.has(m.name)) {
        nameMap.set(m.name, {
          value: m.name,
          label: m.name,
          subLabel: `${m.materialCode}${m.chineseName ? ` • ${m.chineseName}` : ''}`,
          badge: m.uom,
          payload: m
        });
      }
    });
    stockItems.forEach(s => {
      if (s.materialName && !nameMap.has(s.materialName)) {
        nameMap.set(s.materialName, {
          value: s.materialName,
          label: s.materialName,
          subLabel: `${s.materialCode}${s.chineseName ? ` • ${s.chineseName}` : ''}`,
          badge: s.uom,
          payload: s
        });
      }
    });
    index.set('materialName', Array.from(nameMap.values()));

    // 3. chineseName
    const zhMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.chineseName && !zhMap.has(m.chineseName)) {
        zhMap.set(m.chineseName, {
          value: m.chineseName,
          label: m.chineseName,
          subLabel: `${m.materialCode} — ${m.name}`,
          payload: m
        });
      }
    });
    index.set('chineseName', Array.from(zhMap.values()));

    // 4. specification
    const specMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.specification && !specMap.has(m.specification)) {
        specMap.set(m.specification, {
          value: m.specification,
          label: m.specification,
          subLabel: `${m.materialCode} — ${m.name}`
        });
      }
    });
    index.set('specification', Array.from(specMap.values()));

    // 5. category
    const catMap = new Map<string, AutocompleteSuggestion>();
    SEED_CATEGORIES.forEach(c => catMap.set(c, { value: c, label: c }));
    materials.forEach(m => {
      if (m.category && !catMap.has(m.category)) {
        catMap.set(m.category, { value: m.category, label: m.category });
      }
    });
    index.set('category', Array.from(catMap.values()));

    // 6. subcategory
    const subCatMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.subcategory && !subCatMap.has(m.subcategory)) {
        subCatMap.set(m.subcategory, { value: m.subcategory, label: m.subcategory });
      }
    });
    index.set('subcategory', Array.from(subCatMap.values()));

    // 7. supplier
    const supMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.supplier && !supMap.has(m.supplier)) {
        supMap.set(m.supplier, { value: m.supplier, label: m.supplier });
      }
    });
    index.set('supplier', Array.from(supMap.values()));

    // 8. manufacturer
    const manMap = new Map<string, AutocompleteSuggestion>();
    materials.forEach(m => {
      if (m.manufacturer && !manMap.has(m.manufacturer)) {
        manMap.set(m.manufacturer, { value: m.manufacturer, label: m.manufacturer });
      }
    });
    index.set('manufacturer', Array.from(manMap.values()));

    // 9. warehouseId
    const whMap = new Map<string, AutocompleteSuggestion>();
    whMap.set('B1', { value: 'B1', label: 'B1 — Magasin Principal (MD01)', badge: 'Principal' });
    whMap.set('B2', { value: 'B2', label: 'B2 — Magasin Secondaire (Allées A-E)', badge: 'Secondaire' });
    locations.forEach(loc => {
      if (!whMap.has(loc.code)) {
        whMap.set(loc.code, {
          value: loc.code,
          label: `${loc.code} — ${loc.name}`,
          subLabel: loc.physicalLocation,
          badge: loc.type
        });
      }
    });
    index.set('warehouseId', Array.from(whMap.values()));

    // 10. binLocation
    const binMap = new Map<string, AutocompleteSuggestion>();
    bins.forEach(b => {
      if (b.code && !binMap.has(b.code)) {
        binMap.set(b.code, {
          value: b.code,
          label: b.code,
          subLabel: `${b.warehouseId} • ${b.status}`,
          badge: b.warehouseId
        });
      }
    });
    stockItems.forEach(s => {
      if (s.binLocation && !binMap.has(s.binLocation)) {
        binMap.set(s.binLocation, {
          value: s.binLocation,
          label: s.binLocation,
          subLabel: `${s.warehouseId} • ${s.materialCode}`,
          badge: s.warehouseId
        });
      }
    });
    index.set('binLocation', Array.from(binMap.values()));

    // 11. locationType
    const locTypeMap = new Map<string, AutocompleteSuggestion>();
    SEED_LOC_TYPES.forEach(lt => locTypeMap.set(lt, { value: lt, label: lt }));
    locations.forEach(l => {
      if (l.type && !locTypeMap.has(l.type)) {
        locTypeMap.set(l.type, { value: l.type, label: l.type });
      }
    });
    index.set('locationType', Array.from(locTypeMap.values()));

    // 12. containerNumber
    const contMap = new Map<string, AutocompleteSuggestion>();
    locations.forEach(l => {
      if (l.type === 'CONTAINER' && !contMap.has(l.code)) {
        contMap.set(l.code, {
          value: l.code,
          label: `${l.code} — ${l.name}`,
          subLabel: l.physicalLocation
        });
      }
    });
    stockItems.forEach(s => {
      if (s.containerNumber && !contMap.has(s.containerNumber)) {
        contMap.set(s.containerNumber, {
          value: s.containerNumber,
          label: s.containerNumber
        });
      }
    });
    index.set('containerNumber', Array.from(contMap.values()));

    // 13. zone, rack, shelf, row, position
    const zoneMap = new Map<string, AutocompleteSuggestion>();
    const rackMap = new Map<string, AutocompleteSuggestion>();
    const shelfMap = new Map<string, AutocompleteSuggestion>();
    const rowMap = new Map<string, AutocompleteSuggestion>();
    const posMap = new Map<string, AutocompleteSuggestion>();

    stockItems.forEach(s => {
      if (s.zone && !zoneMap.has(s.zone)) zoneMap.set(s.zone, { value: s.zone, label: s.zone });
      if (s.rack && !rackMap.has(s.rack)) rackMap.set(s.rack, { value: s.rack, label: s.rack });
      if (s.shelf && !shelfMap.has(s.shelf)) shelfMap.set(s.shelf, { value: s.shelf, label: s.shelf });
      if (s.row && !rowMap.has(s.row)) rowMap.set(s.row, { value: s.row, label: s.row });
      if (s.position && !posMap.has(s.position)) posMap.set(s.position, { value: s.position, label: s.position });
    });

    index.set('zone', Array.from(zoneMap.values()));
    index.set('rack', Array.from(rackMap.values()));
    index.set('shelf', Array.from(shelfMap.values()));
    index.set('row', Array.from(rowMap.values()));
    index.set('position', Array.from(posMap.values()));

    // 14. uom
    const uomMap = new Map<string, AutocompleteSuggestion>();
    SEED_UOMS.forEach(u => uomMap.set(u, { value: u, label: u }));
    materials.forEach(m => {
      if (m.uom && !uomMap.has(m.uom)) {
        uomMap.set(m.uom, { value: m.uom, label: m.uom });
      }
    });
    index.set('uom', Array.from(uomMap.values()));

    // 15. status
    const statusMap = new Map<string, AutocompleteSuggestion>();
    const statuses = ['IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK', 'RESERVED', 'DAMAGED'];
    statuses.forEach(st => statusMap.set(st, { value: st, label: st }));
    index.set('status', Array.from(statusMap.values()));

    // 16. requester
    const reqMap = new Map<string, AutocompleteSuggestion>();
    movements.forEach(mv => {
      if (mv.requester && !reqMap.has(mv.requester)) {
        reqMap.set(mv.requester, {
          value: mv.requester,
          label: mv.requester,
          subLabel: mv.department
        });
      }
    });
    index.set('requester', Array.from(reqMap.values()));

    // 17. department
    const deptMap = new Map<string, AutocompleteSuggestion>();
    SEED_DEPARTMENTS.forEach(d => deptMap.set(d, { value: d, label: d }));
    movements.forEach(mv => {
      if (mv.department && !deptMap.has(mv.department)) {
        deptMap.set(mv.department, { value: mv.department, label: mv.department });
      }
    });
    index.set('department', Array.from(deptMap.values()));

    // 18. reason
    const reasonMap = new Map<string, AutocompleteSuggestion>();
    SEED_REASONS.forEach(r => reasonMap.set(r, { value: r, label: r }));
    movements.forEach(mv => {
      if (mv.reason && !reasonMap.has(mv.reason)) {
        reasonMap.set(mv.reason, { value: mv.reason, label: mv.reason });
      }
    });
    index.set('reason', Array.from(reasonMap.values()));

    // 19. physicalLocation
    const physMap = new Map<string, AutocompleteSuggestion>();
    locations.forEach(loc => {
      if (loc.physicalLocation && !physMap.has(loc.physicalLocation)) {
        physMap.set(loc.physicalLocation, {
          value: loc.physicalLocation,
          label: loc.physicalLocation,
          subLabel: `${loc.code} — ${loc.name}`
        });
      }
    });
    index.set('physicalLocation', Array.from(physMap.values()));

    // Merge in custom values for each field
    for (const [fieldType, customValSet] of this.customValues.entries()) {
      let existingList = index.get(fieldType) || [];
      const existingValSet = new Set(existingList.map(s => s.value.toLowerCase()));

      for (const customVal of customValSet) {
        if (!existingValSet.has(customVal.toLowerCase())) {
          existingList.unshift({
            value: customVal,
            label: customVal,
            badge: 'Perso'
          });
        }
      }
      index.set(fieldType, existingList);
    }

    return index;
  }

  private getIndex(): Map<AutocompleteFieldType, AutocompleteSuggestion[]> {
    if (!this.cache) {
      this.cache = this.buildIndex();
    }
    return this.cache;
  }

  /**
   * Intelligent query matching across a field with score ranking and near-duplicate warning.
   */
  public query(field: AutocompleteFieldType, queryText: string, limit: number = 8): AutocompleteResult {
    const rawIndex = this.getIndex();
    const items = rawIndex.get(field) || [];

    const trimmed = (queryText || '').trim();
    if (!trimmed) {
      return {
        suggestions: items.slice(0, limit),
        isExactMatch: false,
        totalMatches: items.length
      };
    }

    const normQuery = normalizeText(trimmed);
    const normCanonQuery = normalizeCanonical(trimmed);

    let isExactMatch = false;
    let similarExistingValue: string | undefined = undefined;

    interface ScoredItem {
      suggestion: AutocompleteSuggestion;
      score: number;
    }

    const scored: ScoredItem[] = [];

    for (const item of items) {
      const normVal = normalizeText(item.value);
      const normLabel = normalizeText(item.label);
      const normSub = item.subLabel ? normalizeText(item.subLabel) : '';
      const normCanonVal = normalizeCanonical(item.value);

      // 1. Exact match check
      if (normVal === normQuery || item.value.toLowerCase() === trimmed.toLowerCase()) {
        isExactMatch = true;
      }

      // 2. Near-duplicate detection
      // Check if user's input is a variant (e.g. "container 01" vs "CONT-01", "cont 01")
      if (!similarExistingValue && normVal !== normQuery) {
        if (normCanonVal && normCanonQuery && normCanonVal === normCanonQuery) {
          similarExistingValue = item.value;
        } else if (normQuery.length >= 4 && normVal.length >= 4) {
          const dist = levenshteinDistance(normQuery, normVal);
          if (dist <= 2 && dist > 0) {
            similarExistingValue = item.value;
          }
        }
      }

      // 3. Scoring
      let score = 0;

      // Exact match on value or code
      if (normVal === normQuery) {
        score += 1000;
      }
      // Value starts with query
      else if (normVal.startsWith(normQuery)) {
        score += 500;
      }
      // Label starts with query
      else if (normLabel.startsWith(normQuery)) {
        score += 400;
      }
      // Word boundary match in value (e.g. typing "6205" matches "Bearing 6205-2RS")
      else if (new RegExp(`\\b${normQuery}`, 'i').test(normVal) || new RegExp(`\\b${normQuery}`, 'i').test(normLabel)) {
        score += 300;
      }
      // Substring anywhere in value
      else if (normVal.includes(normQuery)) {
        score += 200;
      }
      // Substring in label
      else if (normLabel.includes(normQuery)) {
        score += 150;
      }
      // Substring in subLabel
      else if (normSub && normSub.includes(normQuery)) {
        score += 100;
      }
      // Fuzzy match for typo tolerance if query is long enough
      else if (normQuery.length >= 3) {
        const dist = levenshteinDistance(normQuery, normVal.slice(0, normQuery.length + 2));
        if (dist <= 1) {
          score += 60;
        } else if (dist <= 2 && normQuery.length >= 5) {
          score += 40;
        }
      }

      if (score > 0) {
        scored.push({
          suggestion: { ...item, score },
          score
        });
      }
    }

    // Sort descending by score, then ascending by length of value
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.suggestion.value.length - b.suggestion.value.length;
    });

    const suggestions = scored.slice(0, limit).map(s => s.suggestion);

    return {
      suggestions,
      similarExistingValue,
      isExactMatch,
      totalMatches: scored.length
    };
  }
}

export const autocompleteService = new AutocompleteService();
