import { StorageLocation, StockItem } from '@shared/types/models';

export const DEFAULT_LOCATIONS: StorageLocation[] = [
  {
    id: 'LOC-B1',
    code: 'B1',
    name: 'Magasin B1',
    type: 'WAREHOUSE',
    description: 'Magasin principal pièces détachées, robinetterie & outillage lourd (MD01)',
    physicalLocation: 'Bâtiment B1 — Zone Centrale MD01',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-B2',
    code: 'B2',
    name: 'Magasin B2',
    type: 'WAREHOUSE',
    description: 'Magasin secondaire consommables, électricité & maintenance (Allées A à E)',
    physicalLocation: 'Bâtiment B2 — Allées A à E',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-CONT-01',
    code: 'CONT-01',
    name: 'Container 01',
    type: 'CONTAINER',
    description: 'Container maritime 40ft sécurisé — Tuyauterie, vannes & brides lourdes',
    physicalLocation: 'Plateforme extérieure Nord',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-CONT-02',
    code: 'CONT-02',
    name: 'Container 02',
    type: 'CONTAINER',
    description: 'Container 20ft — Outillage spécialisé, moteurs & pompes de rechange',
    physicalLocation: 'Plateforme extérieure Nord',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-CONT-03',
    code: 'CONT-03',
    name: 'Container 03',
    type: 'CONTAINER',
    description: 'Container 20ft ventilé — Câblage électrique, instrumentation & capteurs',
    physicalLocation: 'Plateforme extérieure Sud',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-YARD',
    code: 'YARD',
    name: 'Yard / Zone extérieure',
    type: 'YARD',
    description: 'Parc à matériel extérieur — Structures métalliques, poutrelles & fûts',
    physicalLocation: 'Cour logistique Est',
    status: 'ACTIVE',
    createdAt: '2026-02-10T10:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1501526029524-a8ea952b15be?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1501526029524-a8ea952b15be?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-WORKSHOP',
    code: 'WORKSHOP',
    name: 'Atelier de maintenance',
    type: 'WORKSHOP',
    description: 'Atelier mécanique et zone de préparation des interventions',
    physicalLocation: 'Hangar central — Porte 4',
    status: 'ACTIVE',
    createdAt: '2026-02-15T09:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-TEMP',
    code: 'TEMP',
    name: 'Zone temporaire / Transit',
    type: 'TEMPORARY',
    description: 'Zone tampon de réception, dépotage et contrôle avant affectation',
    physicalLocation: 'Quai de déchargement B1',
    status: 'ACTIVE',
    createdAt: '2026-03-01T07:30:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'LOC-QUARANTINE',
    code: 'QUARANTINE',
    name: 'Zone de quarantaine',
    type: 'QUARANTINE',
    description: 'Matériel en attente de conformité technique, test ou retour fournisseur',
    physicalLocation: 'Enclos sécurisé B1',
    status: 'ACTIVE',
    createdAt: '2026-03-01T07:30:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

export function getLocationParts(item: Partial<StockItem>): { label: string; value: string }[] {
  const tags: { label: string; value: string }[] = [];
  if (item.warehouseId) tags.push({ label: 'Site', value: item.warehouseId });
  if (item.containerNumber) tags.push({ label: 'Container', value: item.containerNumber });
  if (item.zone) tags.push({ label: 'Zone', value: item.zone });
  if (item.rack) tags.push({ label: 'Rack', value: item.rack });
  if (item.shelf) tags.push({ label: 'Étagère', value: item.shelf });
  if (item.row) tags.push({ label: 'Rangée', value: item.row });
  if (item.position) tags.push({ label: 'Position', value: item.position });
  if (item.locationNotes) tags.push({ label: 'Note', value: item.locationNotes });

  if (tags.length === 1 && item.binLocation && item.binLocation !== item.warehouseId) {
    tags.push({ label: 'Emplacement', value: item.binLocation });
  }
  return tags;
}

export function formatLocationSummary(item: Partial<StockItem>): string {
  const parts: string[] = [];
  if (item.containerNumber) parts.push(item.containerNumber);
  if (item.zone) parts.push(item.zone);
  if (item.rack) parts.push(`Rack ${item.rack}`);
  if (item.shelf) parts.push(`Étagère ${item.shelf}`);
  if (item.row) parts.push(`Rangée ${item.row}`);
  if (item.position) parts.push(`Pos. ${item.position}`);

  if (parts.length > 0) {
    const site = item.warehouseId ? item.warehouseId : '';
    return site ? `${site} — ${parts.join(' / ')}` : parts.join(' / ');
  }

  if (item.binLocation) {
    return item.warehouseId ? `${item.warehouseId} — ${item.binLocation}` : item.binLocation;
  }

  return item.warehouseId || 'Non assigné';
}
