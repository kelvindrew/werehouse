import { SupportedLanguage } from '@shared/types/models';

export interface TranslationDictionary {
  // Navigation & General Layout
  app_name: string;
  app_subtitle: string;
  warehouse_view: string;
  all_warehouses: string;
  b1_warehouse: string;
  b2_warehouse: string;
  quick_search: string;
  role: string;
  language: string;
  user_profile: string;

  // Tabs
  tab_dashboard: string;
  tab_stock: string;
  tab_spatial: string;
  tab_receipts: string;
  tab_issues: string;
  tab_transfers: string;
  tab_inventory: string;
  tab_import: string;
  tab_export: string;
  tab_audit: string;

  // Spatial Warehouse Visualization
  spatial_view_title: string;
  spatial_view_subtitle: string;
  spatial_site_b1: string;
  spatial_site_b2: string;
  spatial_site_containers: string;
  spatial_site_yard: string;
  spatial_zoom_in: string;
  spatial_zoom_out: string;
  spatial_reset_view: string;
  spatial_all_locations: string;
  spatial_occupied: string;
  spatial_available: string;
  spatial_selected_location: string;
  spatial_no_location_selected: string;
  spatial_occupancy_rate: string;
  spatial_rack_level: string;
  spatial_shelf_level: string;
  spatial_view_full_stock: string;
  spatial_receipt_here: string;
  spatial_issue_from_here: string;

  // Header Actions
  action_receipt: string;
  action_issue: string;
  action_transfer: string;
  action_search_placeholder: string;

  // Dashboard
  dashboard_title: string;
  dashboard_subtitle: string;
  data_synced: string;
  active_locations: string;
  kpi_total_items: string;
  kpi_total_stock: string;
  kpi_total_valuation: string;
  kpi_active_warehouses: string;
  kpi_units: string;
  stock_distribution: string;
  b1_overview_title: string;
  b2_overview_title: string;
  b1_overview_desc: string;
  b2_overview_desc: string;
  recent_movements: string;
  view_all_movements: string;
  low_stock_alerts: string;
  no_recent_movements: string;
  view_stock_table: string;

  // Stock Table
  stock_table_title: string;
  stock_table_subtitle: string;
  search_placeholder: string;
  filter_all: string;
  filter_b1: string;
  filter_b2: string;
  col_photo: string;
  col_code: string;
  col_name: string;
  col_chinese_name: string;
  col_warehouse: string;
  col_bin: string;
  col_uom: string;
  col_qty: string;
  col_reserved: string;
  col_available: string;
  col_unit_price: string;
  col_total_value: string;
  col_actions: string;
  no_matching_stock: string;
  showing_items: string;
  of_total: string;
  page: string;
  prev_page: string;
  next_page: string;

  // Modals & Operations
  btn_cards: string;
  btn_table: string;
  btn_cancel: string;
  btn_confirm: string;
  btn_save: string;
  btn_close: string;
  btn_details: string;
  btn_receipt: string;
  btn_issue: string;
  btn_transfer: string;
  btn_upload_photo: string;
  btn_change_photo: string;
  btn_remove_photo: string;

  // Receipt Modal
  receipt_title: string;
  receipt_desc: string;
  select_material: string;
  select_warehouse: string;
  target_bin: string;
  receipt_qty: string;
  supplier: string;
  po_number: string;
  remarks: string;
  receipt_success: string;

  // Issue Modal
  issue_title: string;
  issue_desc: string;
  issue_qty: string;
  available_qty: string;
  destination_dept: string;
  recipient_name: string;
  issue_reason: string;
  insufficient_stock_error: string;
  issue_success: string;

  // Transfer Modal
  transfer_title: string;
  transfer_desc: string;
  source_warehouse: string;
  source_warehouse_filter: string;
  all_sources: string;
  source_bin: string;
  dest_warehouse: string;
  dest_bin: string;
  dest_bin_required_error: string;
  field_required_badge: string;
  transfer_qty: string;
  transfer_reason: string;
  transfer_success: string;

  // Material Detail Modal
  material_detail_title: string;
  tab_overview: string;
  tab_locations: string;
  tab_history: string;
  tab_photo: string;
  mat_code: string;
  mat_chinese_name: string;
  mat_specs: string;
  mat_uom: string;
  mat_price: string;
  mat_total_stock: string;
  mat_total_value: string;
  mat_plant: string;
  photo_manager_title: string;
  photo_manager_desc: string;
  photo_upload_prompt: string;
  photo_size_hint: string;
  requires_code_review: string;

  // Inventory View
  inventory_title: string;
  inventory_desc: string;
  physical_count: string;
  system_count: string;
  variance: string;
  btn_validate_inventory: string;
  inventory_updated: string;
  no_discrepancy: string;

  // Excel Import & Export
  import_title: string;
  import_desc: string;
  export_title: string;
  export_desc: string;
  btn_download_template: string;
  btn_export_csv: string;
  btn_export_excel: string;
  import_success: string;
  imported_rows: string;

  // Audit Log
  audit_title: string;
  audit_desc: string;
  col_user: string;
  col_action_type: string;
  col_entity: string;
  col_timestamp: string;
  col_details: string;

  // Movement Types
  mov_receipt: string;
  mov_issue: string;
  mov_transfer_in: string;
  mov_transfer_out: string;
  mov_adjustment: string;

  // Movements Table
  movements_title: string;
  movements_subtitle: string;
  btn_export_movements: string;
  filter_all_movements: string;
  col_date: string;
  col_type: string;
  col_material: string;
  col_stock_before_after: string;
  col_total_amount: string;
  col_ref_reason: string;
  col_operator: string;
  no_matching_movements: string;

  // Import Details
  import_card_title: string;
  import_card_subtitle: string;
  source_file_verified: string;
  import_commit_success_title: string;
  import_commit_success_desc: string;
  import_upload_box_title: string;
  import_upload_box_desc: string;
  btn_select_xlsx: string;
  sheet_b1_tab: string;
  sheet_b2_tab: string;
  metric_analyzed_rows: string;
  metric_valid_rows: string;
  metric_reconciled_qty: string;
  metric_conform_original: string;
  metric_consolidated_dups: string;
  metric_cumulated_bins: string;
  metric_missing_codes: string;
  metric_temp_codes: string;
  audit_report_title: string;
  col_excel_row: string;
  col_anomaly_type: string;
  col_field: string;
  col_original_value: string;
  col_system_action: string;
  no_anomaly_detected: string;

  // Export Details
  export_view_title: string;
  export_view_subtitle: string;
  export_global_title: string;
  export_global_desc: string;
  export_b1_title: string;
  export_b1_desc: string;
  export_b2_title: string;
  export_b2_desc: string;
  export_movements_title: string;
  export_movements_desc: string;
  export_global_meta: string;
  export_b1_meta: string;
  export_b2_meta: string;
  export_movements_meta: string;
  btn_download_stock_global: string;
  btn_download_stock_b1: string;
  btn_download_stock_b2: string;
  btn_download_movements: string;

  // Audit View Details
  audit_view_title: string;
  audit_view_subtitle: string;
  audit_events_count: string;
  search_audit_placeholder: string;
  all_actions: string;
  col_target: string;
  col_desc_changes: string;
  no_matching_audit: string;

  // Navigation Extras
  nav_transfers_title: string;
  nav_transfers_subtitle: string;
  btn_new_transfer: string;

  // Shared Links (Partage Temporaire)
  tab_shared_links: string;
  btn_generate_share_link: string;
  btn_share_this_view: string;
  share_modal_title: string;
  share_modal_subtitle: string;
  share_link_title_label: string;
  share_link_title_placeholder: string;
  share_filter_warehouse: string;
  share_filter_search: string;
  share_filter_search_placeholder: string;
  share_filter_bin: string;
  share_filter_bin_placeholder: string;
  share_filter_status: string;
  share_filter_status_all: string;
  share_filter_status_in_stock: string;
  share_filter_status_out_of_stock: string;
  share_filter_status_low_stock: string;
  share_expiration_label: string;
  share_exp_15m: string;
  share_exp_1h: string;
  share_exp_6h: string;
  share_exp_24h: string;
  share_exp_3d: string;
  share_exp_7d: string;
  share_exp_custom: string;
  share_exp_custom_hours: string;
  share_visible_columns_title: string;
  share_visible_columns_desc: string;
  share_matching_items_preview: string;
  btn_create_link: string;
  share_link_created_success: string;
  share_link_url_label: string;
  btn_copy_link: string;
  link_copied_to_clipboard: string;
  shared_links_management_title: string;
  shared_links_management_subtitle: string;
  col_link_title: string;
  col_link_token: string;
  col_link_filters: string;
  col_link_created_at: string;
  col_link_expires_at: string;
  col_link_access_count: string;
  col_link_status: string;
  status_active: string;
  status_expiring_soon: string;
  status_expired: string;
  status_revoked: string;
  btn_view_public: string;
  btn_revoke_link: string;
  btn_delete_link: string;
  confirm_revoke_link: string;
  confirm_delete_link: string;
  link_revoked_success: string;
  link_deleted_success: string;
  no_shared_links: string;
  shared_public_header_title: string;
  shared_public_header_subtitle: string;
  shared_public_badge_readonly: string;
  shared_public_active_filters: string;
  shared_public_expires_in: string;
  shared_public_expired_title: string;
  shared_public_expired_message: string;
  shared_public_revoked_title: string;
  shared_public_revoked_message: string;
  shared_public_not_found_title: string;
  shared_public_not_found_message: string;
  shared_public_items_count: string;
  shared_public_search_within: string;
  shared_public_back_to_app: string;

  // Flexible Locations & Directory
  nav_locations_title: string;
  nav_locations_subtitle: string;
  btn_add_location: string;
  btn_edit_location: string;
  btn_delete_location: string;
  confirm_delete_location: string;
  location_created_success: string;
  location_updated_success: string;
  location_deleted_success: string;
  kpi_locations: string;
  kpi_containers: string;
  kpi_recently_updated: string;
  type_warehouse: string;
  type_container: string;
  type_yard: string;
  type_workshop: string;
  type_rack: string;
  type_shelf: string;
  type_temporary: string;
  type_quarantine: string;
  type_office: string;
  type_other: string;
  field_location_type: string;
  field_location_code: string;
  field_location_name: string;
  field_physical_address: string;
  field_description: string;
  field_zone: string;
  field_rack: string;
  field_shelf: string;
  field_row: string;
  field_position: string;
  field_container_number: string;
  field_location_notes: string;
  all_locations: string;
  filter_by_type: string;
  filter_by_site: string;

  // Shared & Common Labels
  all: string;
  active_status: string;
  inactive_status: string;
  all_types: string;
  all_statuses: string;
  actions_col: string;
  reset_filters: string;
  search_hint: string;
  available_gt_zero: string;
  low_stock_badge: string;
  out_of_stock_badge: string;
  stock_lines_col: string;
  physical_units_col: string;
  total_value_col: string;
  estimated_value: string;
  physical_landmark_col: string;
  location_desc_col: string;
  view_stock_action: string;
  no_locations_matching: string;
  cannot_delete_core_warehouses: string;

  // Dashboard specifics
  kpi_usd_global: string;
  kpi_unique_references: string;
  kpi_accounted_units: string;
  kpi_containers_count_desc: string;
  kpi_units_available_limit: string;
  kpi_recent_movements_desc: string;
  daily_operations_title: string;
  stock_distribution_sites_title: string;
  stock_distribution_sites_desc: string;
  site_location_name_col: string;
  site_location_code_col: string;
  site_location_type_col: string;
  catalog_items_listed: string;
  total_stock_value_label: string;

  // Navigation & Location Groups
  main_warehouses_group: string;
  containers_and_sites_group: string;
  all_sites_and_warehouses: string;
  all_site_types: string;
  other_sites_select: string;
  verified_database_badge: string;
  sites_nav: string;

  // Inventory & Modals
  inventory_target_site: string;
  qty_cannot_be_negative: string;
  sub_location_toggle: string;
  sub_location_dest_toggle: string;
  available_short_label: string;
  stock_item_select_label: string;
  requester_name_placeholder: string;
  dest_bin_placeholder: string;
  photo_attached_badge: string;
  referenced_stock_locations_title: string;
  count_locations_suffix: string;
  recent_movements_for_reference: string;

  // Location Modal specifics
  system_unique_id: string;
  specify_custom_type: string;
  specify_custom_type_placeholder: string;
  operational_status_label: string;
  active_usable_for_stock: string;
  inactive_blocked: string;
  location_modal_create_desc: string;

  // Share Modal specifics
  applied_filters_title: string;
  select_all_columns: string;
  hide_prices_costs: string;
  hours_unit: string;
  days_unit: string;
  consultations_label: string;
  visits_count: string;
  copy_public_link_title: string;
  search_links_placeholder: string;
  pagination_of: string;
  search_by_bin_placeholder: string;
  no_stock_recorded_item: string;
  adjustment_reason_placeholder: string;
  audit_action_location_created: string;
  audit_action_location_updated: string;
  audit_action_location_deleted: string;
  visible_columns_suffix: string;
  last_visit_label: string;
  share_link_success_desc: string;
  security_token_label: string;
  expiration_label: string;
  shared_items_count_label: string;
  items_suffix: string;
  visible_columns_label: string;
  sensitive_cost_badge: string;
  direct_readonly_access_desc: string;
  dept_placeholder: string;
  reason_placeholder: string;
  source_article_available_location: string;
  shared_public_loading: string;
  shared_public_footer_notice: string;
  unit_days_short: string;
  unit_hours_short: string;
  unit_minutes_short: string;
  field_optional: string;
  error_reading_excel: string;
  error_saving_location: string;
  location_code_required: string;
  location_name_required: string;
  placeholder_location_code: string;
  placeholder_location_name: string;
  placeholder_physical_address: string;
  placeholder_location_desc: string;
  excel_row_num: string;
  autocomplete_no_results: string;
  autocomplete_create_new: string;
  autocomplete_similar_warning: string;
  autocomplete_use_similar: string;
  autocomplete_suggestions_count: string;
  autocomplete_press_enter: string;

  // Issue Vouchers Module
  issues_title: string;
  issues_desc: string;
  btn_new_issue_voucher: string;
  issue_voucher_number: string;
  issue_voucher_status: string;
  status_draft: string;
  status_preparing: string;
  status_ready: string;
  status_confirmed: string;
  status_cancelled: string;
  issue_buyer_name: string;
  issue_agent_name: string;
  issue_paper_book_signature: string;
  issue_paper_book_ref: string;
  issue_paper_book_ref_placeholder: string;
  issue_items_count: string;
  issue_total_requested: string;
  issue_total_issued: string;
  issue_physical_verify_step: string;
  issue_physical_verify_desc: string;
  issue_qty_requested: string;
  issue_qty_actual: string;
  issue_summary_title: string;
  issue_summary_desc: string;
  issue_confirm_dialog_title: string;
  issue_confirm_dialog_msg: string;
  issue_confirm_btn: string;
  issue_cancel_btn: string;
  issue_stock_before: string;
  issue_stock_after: string;
  issue_paper_not_signed_warn: string;
  issue_no_items_error: string;
  issue_item_already_added: string;
  issue_step_header: string;
  issue_step_materials: string;
  issue_step_verification: string;
  issue_step_summary: string;
  kpi_confirmed_issues: string;
  kpi_today_issues: string;
  kpi_pending_issues: string;
  kpi_total_units_issued: string;
  btn_print_voucher: string;
  btn_view_voucher: string;
  btn_continue_preparation: string;
  voucher_confirmed_readonly_notice: string;
  voucher_cancelled_notice: string;
  btn_add_material_to_issue: string;
  issue_diff_warning: string;

  // Tablet Mode & QR Labels & Hover Preview
  btn_tablet_mode: string;
  btn_standard_mode: string;
  tablet_mode_active: string;
  tablet_scan_hint: string;
  barcode_scanner_detected: string;
  btn_print_label: string;
  label_modal_title: string;
  label_modal_desc: string;
  label_type_material: string;
  label_type_location: string;
  label_preview_desc: string;
  scan_on_android: string;
  stock_in_other_locations: string;
  quick_actions_title: string;

  // Warehouse Visual Tour
  visual_tour_title: string;
  visual_tour_subtitle: string;
  btn_visual_tour: string;
  tour_view_stock: string;
  tour_angle_photo: string;
  tour_site_counter: string;

  // Material Visual Tour
  material_tour_title: string;
  material_tour_subtitle: string;
  btn_material_tour: string;
  btn_tour_item: string;
  tour_material_counter: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  fr: {
    app_name: 'WMS B1 & B2',
    app_subtitle: 'GESTION DE WAREHOUSE',
    warehouse_view: 'Vue Entrepôt',
    all_warehouses: 'Tous (B1 & B2)',
    b1_warehouse: 'B1 (MD01)',
    b2_warehouse: 'B2 (Zones A-E)',
    quick_search: 'Recherche rapide...',
    role: 'Rôle',
    language: 'Langue',
    user_profile: 'Profil utilisateur',

    tab_dashboard: 'Tableau de bord',
    tab_stock: 'Tableau de Stock',
    tab_spatial: 'Plan Entrepôt (2D)',
    tab_receipts: 'Entrées (Réceptions)',
    tab_issues: 'Sorties (Bons de sortie)',
    tab_transfers: 'Transferts',
    tab_inventory: 'Inventaire Physique',
    tab_import: 'Import Excel',
    tab_export: 'Export & Rapports',
    tab_audit: "Journal d'Audit",

    // Spatial Warehouse Visualization
    spatial_view_title: 'Cartographie & Visualisation Spatiale',
    spatial_view_subtitle: 'Vue technique 2D des allées, racks, containers et taux de remplissage',
    spatial_site_b1: 'Magasin B1 (Lourd & Robinetterie)',
    spatial_site_b2: 'Magasin B2 (Consommables & Électricité)',
    spatial_site_containers: 'Parc Containers Maritimes',
    spatial_site_yard: 'Cour Extérieure (Yard)',
    spatial_zoom_in: 'Zoom avant',
    spatial_zoom_out: 'Zoom arrière',
    spatial_reset_view: 'Réinitialiser vue',
    spatial_all_locations: 'Tous les racks',
    spatial_occupied: 'Occupés',
    spatial_available: 'Disponibles',
    spatial_selected_location: 'Emplacement sélectionné',
    spatial_no_location_selected: 'Sélectionnez un rack ou container sur la carte pour inspecter son contenu',
    spatial_occupancy_rate: "Taux d'occupation",
    spatial_rack_level: 'Niveau / Étagère',
    spatial_shelf_level: 'Travée',
    spatial_view_full_stock: 'Voir dans le stock',
    spatial_receipt_here: 'Réceptionner ici',
    spatial_issue_from_here: 'Sortir depuis ce rack',

    action_receipt: 'Entrée',
    action_issue: 'Sortie',
    action_transfer: 'Transfert',
    action_search_placeholder: 'Rechercher code SAP, description, chinois, BIN...',

    dashboard_title: 'Supervision des Entrepôts',
    dashboard_subtitle: 'État des stocks en temps réel pour B1 et B2',
    data_synced: 'Données synchronisées',
    active_locations: 'emplacements actifs',
    kpi_total_items: 'Articles Référencés',
    kpi_total_stock: 'Quantité Totale en Stock',
    kpi_total_valuation: 'Valorisation Totale (USD)',
    kpi_active_warehouses: 'Entrepôts Actifs',
    kpi_units: 'unités',
    stock_distribution: 'Répartition du Stock B1 vs B2',
    b1_overview_title: 'Entrepôt B1 — MD01',
    b2_overview_title: 'Entrepôt B2 — Zones A-E',
    b1_overview_desc: 'Zone de stockage MD01 dédiée',
    b2_overview_desc: 'Zones de stockage A, B, C, D, E',
    recent_movements: 'Mouvements Récents',
    view_all_movements: 'Voir tous les mouvements',
    low_stock_alerts: 'Articles à Stock Faible',
    no_recent_movements: 'Aucun mouvement enregistré',
    view_stock_table: 'Consulter le stock complet',

    stock_table_title: 'Inventaire Global & Emplacements',
    stock_table_subtitle: 'Consultez, filtrez et gérez les articles dans B1 et B2',
    search_placeholder: 'Rechercher un code, description, nom chinois ou BIN...',
    filter_all: 'Tous les stocks',
    filter_b1: 'Stock B1 (MD01)',
    filter_b2: 'Stock B2 (Zones A-E)',
    col_photo: 'Photo',
    col_code: 'Code Article',
    col_name: 'Désignation (Anglais)',
    col_chinese_name: 'Nom Chinois',
    col_warehouse: 'Entrepôt',
    col_bin: 'BIN (Emplacement)',
    col_uom: 'Unité',
    col_qty: 'Qté Totale',
    col_reserved: 'Réservé',
    col_available: 'Disponible',
    col_unit_price: 'Prix Unit.',
    col_total_value: 'Valeur (USD)',
    col_actions: 'Actions',
    no_matching_stock: 'Aucun article ne correspond à votre recherche',
    showing_items: 'Affichage de',
    of_total: 'sur',
    page: 'Page',
    prev_page: 'Précédent',
    next_page: 'Suivant',

    btn_cards: 'Cartes',
    btn_table: 'Tableau',
    btn_cancel: 'Annuler',
    btn_confirm: 'Confirmer',
    btn_save: 'Enregistrer',
    btn_close: 'Fermer',
    btn_details: 'Fiche Article',
    btn_receipt: 'Entrée',
    btn_issue: 'Sortie',
    btn_transfer: 'Transfert',
    btn_upload_photo: 'Téléverser photo',
    btn_change_photo: 'Modifier la photo',
    btn_remove_photo: 'Supprimer la photo',

    receipt_title: 'Nouvelle Entrée en Stock',
    receipt_desc: 'Enregistrer une réception fournisseur ou retour atelier',
    select_material: 'Sélectionner un article',
    select_warehouse: 'Entrepôt cible',
    target_bin: 'Emplacement (BIN)',
    receipt_qty: 'Quantité reçue',
    supplier: 'Fournisseur / Expéditeur',
    po_number: 'N° Commande / BL',
    remarks: 'Remarques / Observations',
    receipt_success: 'Entrée enregistrée avec succès !',

    issue_title: 'Nouvelle Sortie de Stock',
    issue_desc: 'Sortie de matériel pour opération, maintenance ou projet',
    issue_qty: 'Quantité à sortir',
    available_qty: 'Quantité disponible',
    destination_dept: 'Département / Destination',
    recipient_name: 'Destinataire / Demandeur',
    issue_reason: 'Motif de sortie / OT',
    insufficient_stock_error: 'Stock disponible insuffisant !',
    issue_success: 'Sortie validée avec succès !',

    transfer_title: 'Nouveau Transfert de Stock',
    transfer_desc: 'Transfert entre magasins, conteneurs ou réaffectation d\'emplacement',
    source_warehouse: 'Entrepôt / Site Source',
    source_warehouse_filter: 'Site / Magasin Source',
    all_sources: 'Tous les sites et conteneurs',
    source_bin: 'Emplacement Source',
    dest_warehouse: 'Entrepôt / Site Destination',
    dest_bin: 'Emplacement Physique Destination',
    dest_bin_required_error: "L'emplacement physique de destination est obligatoire (ex: Rayon, Travée, Casier ou Conteneur).",
    field_required_badge: 'Obligatoire',
    transfer_qty: 'Quantité à transférer',
    transfer_reason: 'Motif du transfert',
    transfer_success: 'Transfert exécuté avec succès !',

    material_detail_title: 'Fiche Technique 360°',
    tab_overview: 'Vue Générale',
    tab_locations: 'Emplacements & Stocks',
    tab_history: 'Historique Mouvements',
    tab_photo: 'Photo & Médias',
    mat_code: 'Code Article (SAP)',
    mat_chinese_name: 'Nom Chinois',
    mat_specs: 'Spécification / Modèle',
    mat_uom: 'Unité de Mesure',
    mat_price: 'Prix Unitaire Standard',
    mat_total_stock: 'Stock Global (B1 + B2)',
    mat_total_value: 'Valeur Globale Estimée',
    mat_plant: 'Division / Usine (Plant)',
    photo_manager_title: 'Gestion de la Photo du Matériel',
    photo_manager_desc: 'Associez une photo haute résolution visible sur Web et Android',
    photo_upload_prompt: 'Cliquez ou glissez une image ici (PNG, JPG, WebP)',
    photo_size_hint: 'Taille recommandée : format carré ou 4:3, max 5 Mo',
    requires_code_review: 'Code temporaire — Révision requise',

    inventory_title: 'Inventaire Physique & Réconciliation',
    inventory_desc: 'Saisie des comptages physiques et ajustements automatiques',
    physical_count: 'Comptage Physique',
    system_count: 'Stock Théorique',
    variance: 'Écart',
    btn_validate_inventory: 'Valider et Ajuster le Stock',
    inventory_updated: 'Inventaire réconcilié avec succès !',
    no_discrepancy: 'Aucun écart détecté sur cette sélection',

    import_title: 'Import & Synchronisation Excel',
    import_desc: 'Mise à jour des stocks depuis le classeur Excel (drew.xlsx)',
    export_title: 'Exportation des Données & Rapports',
    export_desc: 'Générez des extractions CSV et classeurs Excel complets',
    btn_download_template: 'Télécharger Modèle Excel',
    btn_export_csv: 'Exporter en CSV',
    btn_export_excel: 'Exporter en Excel (.xlsx)',
    import_success: 'Données importées avec succès !',
    imported_rows: 'lignes traitées',

    audit_title: "Journal d'Audit & Traçabilité",
    audit_desc: 'Historique immuable de toutes les actions système',
    col_user: 'Utilisateur',
    col_action_type: 'Action',
    col_entity: 'Entité',
    col_timestamp: 'Date & Heure',
    col_details: 'Détails',

    mov_receipt: 'Entrée (Réception)',
    mov_issue: 'Sortie',
    mov_transfer_in: 'Transfert Entrant',
    mov_transfer_out: 'Transfert Sortant',
    mov_adjustment: 'Ajustement Inventaire',

    movements_title: 'Historique Complet des Mouvements de Stock',
    movements_subtitle: 'mouvement(s) auditable(s) enregistré(s) — Aucune suppression autorisée.',
    btn_export_movements: 'Exporter Historique Excel',
    filter_all_movements: 'Tous les types de mouvements',
    col_date: 'Date & Heure',
    col_type: 'Type',
    col_material: 'Matériel',
    col_stock_before_after: 'Stock Avant → Après',
    col_total_amount: 'Montant Total',
    col_ref_reason: 'Référence / Motif',
    col_operator: 'Opérateur',
    no_matching_movements: 'Aucun mouvement trouvé pour ces critères.',

    import_card_title: "Module d'Import & Audit Excel",
    import_card_subtitle: "Validation structurée, détection d'anomalies, réconciliation exacte des totaux et traçabilité complète.",
    source_file_verified: 'Fichier source vérifié & importé',
    import_commit_success_title: 'Import et Réconciliation Validés !',
    import_commit_success_desc: "Tous les stocks de B1 et B2 sont synchronisés dans la base sans aucune perte d'unité.",
    import_upload_box_title: 'Importer un classeur Excel de mise à jour',
    import_upload_box_desc: 'Prend en charge les feuilles B1 warehouse stock, B2 warehouse stock et Sheet1.',
    btn_select_xlsx: 'Sélectionner un fichier .xlsx',
    sheet_b1_tab: 'Feuille B1 warehouse stock',
    sheet_b2_tab: 'Feuille B2 warehouse stock',
    metric_analyzed_rows: 'Lignes Analysées',
    metric_valid_rows: 'lignes valides retenues',
    metric_reconciled_qty: 'Quantité Réconciliée',
    metric_conform_original: "✓ 100% conforme à l'original",
    metric_consolidated_dups: 'Doublons Consolidés',
    metric_cumulated_bins: 'Cumulés par BIN sans perte',
    metric_missing_codes: 'Lignes sans Code Matériel',
    metric_temp_codes: 'Codes provisoires attribués',
    audit_report_title: 'Rapport de Nettoyage et Validation des Données',
    col_excel_row: 'Ligne Excel',
    col_anomaly_type: "Type d'Anomalie",
    col_field: 'Champ',
    col_original_value: 'Valeur Originale',
    col_system_action: 'Action Appliquée par le Système',
    no_anomaly_detected: 'Aucune anomalie détectée sur cette feuille.',

    export_view_title: 'Export Excel & Génération de Rapports',
    export_view_subtitle: 'Téléchargement instantané de feuilles de calcul .XLSX propres, normalisées et directement exploitables dans Excel.',
    export_global_title: 'Stock Global Consolidé (B1 + B2)',
    export_global_desc: "Export complet de l'ensemble des articles stockés sur tous les entrepôts, avec détail par emplacement, prix unitaire et calculs de valorisation.",
    export_b1_title: 'Stock Spécifique — Warehouse B1',
    export_b1_desc: 'Fichier Excel dédié exclusivement aux stocks de pièces de rechange et vannes de l\'entrepôt B1.',
    export_b2_title: 'Stock Spécifique — Warehouse B2',
    export_b2_desc: 'Fichier Excel dédié aux consommables, peintures, outils et quincaillerie de l\'entrepôt B2.',
    export_movements_title: 'Historique des Mouvements (Audit Trail)',
    export_movements_desc: "Export pour audit légal et contrôle de gestion contenant l'historique complet, les références de bon, demandeurs et horodatages.",
    export_global_meta: '1 524 enregistrements avec BIN, valorisation et disponibilités',
    export_b1_meta: "Zone MD01 (751 lignes d'emplacements)",
    export_b2_meta: 'Zones B2-01 à B2-04, A, C, E (773 lignes)',
    export_movements_meta: 'Toutes entrées, sorties, transferts et ajustements',
    btn_download_stock_global: 'Télécharger Stock Global (.xlsx)',
    btn_download_stock_b1: 'Télécharger Stock B1 (.xlsx)',
    btn_download_stock_b2: 'Télécharger Stock B2 (.xlsx)',
    btn_download_movements: 'Télécharger Historique Mouvements (.xlsx)',

    audit_view_title: "Journal d'Audit & Traçabilité Complète",
    audit_view_subtitle: 'Historique immuable de toutes les actions : réceptions, sorties, transferts, régularisations et imports.',
    audit_events_count: 'événements audités',
    search_audit_placeholder: 'Rechercher par description, utilisateur, référence...',
    all_actions: 'Toutes les actions',
    col_target: 'Cible',
    col_desc_changes: 'Description & Modifications',
    no_matching_audit: "Aucun événement d'audit ne correspond aux filtres.",

    nav_transfers_title: 'Transferts de Stock',
    nav_transfers_subtitle: "Déplacez du matériel d'un warehouse à un autre avec création atomique de deux mouvements liés.",
    btn_new_transfer: 'Nouveau Transfert',

    tab_shared_links: 'Liens Partagés',
    btn_generate_share_link: 'Générer un lien de partage',
    btn_share_this_view: 'Partager cette vue',
    share_modal_title: 'Génération de Lien de Partage Sécurisé',
    share_modal_subtitle: 'Créez un lien temporaire en lecture seule avec filtres et colonnes personnalisés.',
    share_link_title_label: 'Libellé / Titre du partage',
    share_link_title_placeholder: 'Ex: Roulements pour maintenance atelier Sud',
    share_filter_warehouse: 'Magasin / Entrepôt',
    share_filter_search: 'Recherche Matériel / Désignation',
    share_filter_search_placeholder: 'Ex: Bearing, Valve, Joint...',
    share_filter_bin: 'Rangée / Emplacement (BIN)',
    share_filter_bin_placeholder: 'Ex: MD01, B2-01, R12...',
    share_filter_status: 'Statut du stock',
    share_filter_status_all: 'Tous les statuts',
    share_filter_status_in_stock: 'Uniquement disponibles (Stock > 0)',
    share_filter_status_out_of_stock: 'Uniquement épuisés (Stock = 0)',
    share_filter_status_low_stock: 'Stock critique / faible (≤ 5)',
    share_expiration_label: 'Durée de validité du lien',
    share_exp_15m: '15 minutes',
    share_exp_1h: '1 heure',
    share_exp_6h: '6 heures',
    share_exp_24h: '24 heures (1 jour)',
    share_exp_3d: '3 jours',
    share_exp_7d: '7 jours',
    share_exp_custom: 'Personnalisée (heures)',
    share_exp_custom_hours: 'Nombre d\'heures',
    share_visible_columns_title: 'Informations visibles par le visiteur',
    share_visible_columns_desc: 'Cochez les colonnes autorisées. Les informations sensibles comme les prix peuvent être masquées.',
    share_matching_items_preview: 'Articles correspondants au filtre',
    btn_create_link: 'Générer le lien sécurisé',
    share_link_created_success: 'Lien de partage généré avec succès !',
    share_link_url_label: 'Lien public sécurisé (sans authentification requise) :',
    btn_copy_link: 'Copier le lien',
    link_copied_to_clipboard: 'Lien copié dans le presse-papier !',
    shared_links_management_title: 'Gestion des Liens de Partage Temporaires',
    shared_links_management_subtitle: 'Suivez les accès, contrôlez la validité et révoquez les accès publics en lecture seule.',
    col_link_title: 'Titre & Référence',
    col_link_token: 'Jeton (Token)',
    col_link_filters: 'Filtres appliqués',
    col_link_created_at: 'Création & Auteur',
    col_link_expires_at: 'Expiration',
    col_link_access_count: 'Visites',
    col_link_status: 'Statut',
    status_active: 'Actif',
    status_expiring_soon: 'Expire bientôt',
    status_expired: 'Expiré',
    status_revoked: 'Révoqué',
    btn_view_public: 'Consulter',
    btn_revoke_link: 'Révoquer',
    btn_delete_link: 'Supprimer',
    confirm_revoke_link: 'Voulez-vous vraiment révoquer immédiatement ce lien de partage ? Le visiteur ne pourra plus accéder aux données.',
    confirm_delete_link: 'Voulez-vous supprimer définitivement ce lien de partage de la liste ?',
    link_revoked_success: 'Lien de partage révoqué avec succès !',
    link_deleted_success: 'Lien de partage supprimé !',
    no_shared_links: 'Aucun lien de partage actif ou archivé.',
    shared_public_header_title: 'Warehouse — Vue Partagée Sécurisée',
    shared_public_header_subtitle: 'Consultation en lecture seule autorisée par le gestionnaire d\'entrepôt',
    shared_public_badge_readonly: 'Lecture Seule',
    shared_public_active_filters: 'Filtres actifs',
    shared_public_expires_in: 'Expire dans',
    shared_public_expired_title: 'Ce lien de partage a expiré.',
    shared_public_expired_message: 'La durée de validité accordée par l\'administrateur est écoulée. Veuillez demander un nouveau lien.',
    shared_public_revoked_title: 'Ce lien de partage a été révoqué.',
    shared_public_revoked_message: 'L\'accès public à ces données a été clôturé par un administrateur du warehouse.',
    shared_public_not_found_title: 'Lien de partage introuvable ou invalide.',
    shared_public_not_found_message: 'Le jeton de sécurité est incorrect ou le lien a été supprimé.',
    shared_public_items_count: 'articles partagés',
    shared_public_search_within: 'Filtrer dans ces résultats...',
    shared_public_back_to_app: 'Retour à l\'application principale',

    // Flexible Locations & Directory
    nav_locations_title: 'Emplacements & Sites de Stockage',
    nav_locations_subtitle: 'Répertoire complet des magasins B1, B2, containers, zones extérieures, ateliers et aires temporaires.',
    btn_add_location: 'Ajouter un emplacement',
    btn_edit_location: 'Modifier',
    btn_delete_location: 'Supprimer',
    confirm_delete_location: 'Voulez-vous vraiment supprimer cet emplacement de stockage ?',
    location_created_success: 'Nouvel emplacement créé avec succès !',
    location_updated_success: 'Emplacement mis à jour avec succès !',
    location_deleted_success: 'Emplacement supprimé !',
    kpi_locations: 'Emplacements & Sites',
    kpi_containers: 'Containers Actifs',
    kpi_recently_updated: 'Modifiés (7 jours)',
    type_warehouse: 'Magasin / Entrepôt',
    type_container: 'Container',
    type_yard: 'Cour / Extérieur (Yard)',
    type_workshop: 'Atelier',
    type_rack: 'Rack / Allée',
    type_shelf: 'Étagère / Niveau',
    type_temporary: 'Zone Temporaire',
    type_quarantine: 'Zone Quarantaine',
    type_office: 'Bureau / Réserve',
    type_other: 'Autre Emplacement',
    field_location_type: 'Type d\'emplacement',
    field_location_code: 'Code identifiant',
    field_location_name: 'Nom usuel',
    field_physical_address: 'Emplacement physique / Repère',
    field_description: 'Description & Utilité',
    field_zone: 'Zone / Aire',
    field_rack: 'Rack',
    field_shelf: 'Étagère / Niveau',
    field_row: 'Rangée',
    field_position: 'Position',
    field_container_number: 'N° Container',
    field_location_notes: 'Remarques d\'accès',
    all_locations: 'Tous les emplacements',
    filter_by_type: 'Filtrer par type',
    filter_by_site: 'Filtrer par site / magasin',

    // Shared & Common Labels
    all: 'Tous',
    active_status: 'Actif',
    inactive_status: 'Inactif',
    all_types: 'Tous les types',
    all_statuses: 'Tous les statuts',
    actions_col: 'Actions',
    reset_filters: 'Réinitialiser les filtres',
    search_hint: 'Rechercher par code (B1, CONT-01...), nom, repère, usage...',
    available_gt_zero: 'Disponible > 0',
    low_stock_badge: 'Stock faible',
    out_of_stock_badge: 'Épuisé',
    stock_lines_col: 'Lignes de Stock',
    physical_units_col: 'Unités Physiques',
    total_value_col: 'Valeur Totale',
    estimated_value: 'Valeur Estimée',
    physical_landmark_col: 'Repère Physique',
    location_desc_col: 'Emplacement & Description',
    view_stock_action: 'Voir stock',
    no_locations_matching: 'Aucun emplacement correspondant aux critères.',
    cannot_delete_core_warehouses: 'Les magasins principaux B1 et B2 ne peuvent pas être supprimés.',

    // Dashboard specifics
    kpi_usd_global: 'USD Global',
    kpi_unique_references: 'références uniques',
    kpi_accounted_units: 'Unités comptabilisées',
    kpi_containers_count_desc: 'dont {n} containers',
    kpi_units_available_limit: '≤ 5 unités disponibles',
    kpi_recent_movements_desc: 'Mouvements récents',
    daily_operations_title: 'Activité Opérationnelle du Jour',
    stock_distribution_sites_title: 'Répartition des Stocks par Site & Emplacement',
    stock_distribution_sites_desc: 'Magasins B1 / B2, containers de stockage, zones extérieures et ateliers',
    site_location_name_col: 'Nom de l\'Emplacement',
    site_location_code_col: 'Code',
    site_location_type_col: 'Type',
    catalog_items_listed: 'articles répertoriés',
    total_stock_value_label: 'Valeur totale',

    // Navigation & Location Groups
    main_warehouses_group: 'Magasins Principaux',
    containers_and_sites_group: 'Containers & Autres Sites',
    all_sites_and_warehouses: 'Tous les sites & magasins',
    all_site_types: 'Tous types de site',
    other_sites_select: 'Autres sites...',
    verified_database_badge: 'Base active & vérifiée',
    sites_nav: 'Sites',

    // Inventory & Modals
    inventory_target_site: 'Site à inventorier :',
    qty_cannot_be_negative: 'La quantité ne peut pas être négative',
    sub_location_toggle: 'Préciser sous-emplacement optionnel (Zone, Container, Rack, Position...)',
    sub_location_dest_toggle: 'Préciser sous-emplacement destination optionnel',
    available_short_label: 'Dispo',
    stock_item_select_label: 'Article en stock',
    requester_name_placeholder: 'Nom du demandeur...',
    dest_bin_placeholder: 'BIN d\'arrivée...',
    photo_attached_badge: 'Photo attachée',
    referenced_stock_locations_title: 'Emplacements de Stock Référencés',
    count_locations_suffix: 'emplacement(s)',
    recent_movements_for_reference: 'Mouvements Récents de cette Référence',

    // Location Modal specifics
    system_unique_id: 'Identifiant unique système',
    specify_custom_type: 'Préciser le type d\'emplacement',
    specify_custom_type_placeholder: 'ex: Alvéole sécurisée, SAS d\'entrée...',
    operational_status_label: 'Statut opérationnel',
    active_usable_for_stock: 'Actif (Utilisable pour le stock)',
    inactive_blocked: 'Inactif / Bloqué',
    location_modal_create_desc: 'Définir un site, container, atelier ou aire de stockage',

    // Share Modal specifics
    applied_filters_title: 'Filtres de Données Appliqués',
    select_all_columns: 'Tout cocher',
    hide_prices_costs: 'Masquer prix/coûts',
    hours_unit: 'heures',
    days_unit: 'jours',
    consultations_label: 'Consultations :',
    visits_count: 'visites',
    copy_public_link_title: 'Copier le lien public',
    search_links_placeholder: 'Rechercher par titre, token, auteur, mot-clé...',
    pagination_of: 'sur',
    search_by_bin_placeholder: 'Emplacement / BIN...',
    no_stock_recorded_item: 'Aucun stock enregistré pour cet article.',
    adjustment_reason_placeholder: 'Motif d\'ajustement...',
    audit_action_location_created: 'Création Emplacement',
    audit_action_location_updated: 'Modification Emplacement',
    audit_action_location_deleted: 'Suppression Emplacement',
    visible_columns_suffix: 'colonnes visibles',
    last_visit_label: 'Dernier',
    share_link_success_desc: 'Ce lien donne un accès direct en lecture seule aux données sélectionnées sans obliger le visiteur à se connecter.',
    security_token_label: 'Jeton de sécurité',
    expiration_label: 'Expiration',
    shared_items_count_label: 'Articles partagés',
    items_suffix: 'articles',
    visible_columns_label: 'Colonnes visibles',
    sensitive_cost_badge: 'Coût sensible',
    direct_readonly_access_desc: 'Accès direct en lecture seule sans connexion',
    dept_placeholder: 'ex: Maintenance, Production...',
    reason_placeholder: 'ex: Réparation d\'urgence...',
    source_article_available_location: 'Article source & emplacement disponible',
    shared_public_loading: 'Chargement des données du lien sécurisé...',
    shared_public_footer_notice: 'WMS B1 & B2 • Vue publique temporaire sécurisée et auditable',
    unit_days_short: 'j',
    unit_hours_short: 'h',
    unit_minutes_short: 'min',
    field_optional: '(Optionnel)',
    error_reading_excel: 'Erreur lors de la lecture du fichier Excel.',
    error_saving_location: "Erreur lors de l'enregistrement",
    location_code_required: "Le code d'emplacement est obligatoire.",
    location_name_required: "Le nom de l'emplacement est obligatoire.",
    placeholder_location_code: 'ex : CONT-04, YARD-B, ATELIER-2',
    placeholder_location_name: 'ex : Container 04 (Pièces lourdes), Cour extérieure Nord...',
    placeholder_physical_address: 'ex : Zone Sud - Plateforme C, En face porte 2...',
    placeholder_location_desc: 'ex : Stockage des matériels en attente de montage ou pièces de rechange.',
    excel_row_num: 'Ligne {row}',
    autocomplete_no_results: 'Aucune correspondance dans la base',
    autocomplete_create_new: 'Créer nouvelle valeur « {value} »',
    autocomplete_similar_warning: 'Valeur très proche existante :',
    autocomplete_use_similar: 'Utiliser la valeur normalisée',
    autocomplete_suggestions_count: '{count} suggestions trouvées',
    autocomplete_press_enter: 'Entrée pour valider',

    // Issue Vouchers Module
    issues_title: 'Sorties de matériels',
    issues_desc: 'Registre numérique et traçabilité des sorties avec attestation carnet papier',
    btn_new_issue_voucher: '+ Nouvelle sortie',
    issue_voucher_number: 'N° de sortie',
    issue_voucher_status: 'Statut',
    status_draft: 'Brouillon',
    status_preparing: 'En préparation',
    status_ready: 'En attente confirmation',
    status_confirmed: 'Confirmée',
    status_cancelled: 'Annulée',
    issue_buyer_name: "Nom de l'acheteur",
    issue_agent_name: 'Agent Warehouse',
    issue_paper_book_signature: 'Signature carnet effectuée',
    issue_paper_book_ref: 'Référence / Page carnet papier',
    issue_paper_book_ref_placeholder: 'ex: Carnet N° 4, Page 18',
    issue_items_count: 'Articles',
    issue_total_requested: 'Total demandé',
    issue_total_issued: 'Total sorti',
    issue_physical_verify_step: 'Vérification physique',
    issue_physical_verify_desc: 'Vérifiez physiquement les pièces et saisissez les quantités réellement remises',
    issue_qty_requested: 'Quantité demandée',
    issue_qty_actual: 'Quantité réellement sortie',
    issue_summary_title: 'Récapitulatif de la sortie',
    issue_summary_desc: "Vérifiez les pièces avec l'acheteur avant signature dans le carnet papier",
    issue_confirm_dialog_title: 'Confirmation définitive de la sortie',
    issue_confirm_dialog_msg: "Les quantités ont été vérifiées physiquement et l'acheteur a signé dans le carnet. Voulez-vous confirmer définitivement cette sortie ? Le stock sera automatiquement mis à jour.",
    issue_confirm_btn: 'Confirmer la sortie',
    issue_cancel_btn: 'Annuler la sortie',
    issue_stock_before: 'Stock avant',
    issue_stock_after: 'Stock après',
    issue_paper_not_signed_warn: 'Veuillez attester la signature dans le carnet papier avant de confirmer.',
    issue_no_items_error: 'Veuillez ajouter au moins un matériel à la sortie.',
    issue_item_already_added: 'Cet article sur cet emplacement est déjà présent dans le bon de sortie.',
    issue_step_header: '1. Informations générales',
    issue_step_materials: '2. Sélection des matériels',
    issue_step_verification: '3. Vérification physique',
    issue_step_summary: '4. Récapitulatif & Signature',
    kpi_confirmed_issues: 'Sorties confirmées',
    kpi_today_issues: "Sorties d'aujourd'hui",
    kpi_pending_issues: 'En cours / En attente',
    kpi_total_units_issued: 'Unités sorties',
    btn_print_voucher: 'Imprimer le bon',
    btn_view_voucher: 'Consulter le bon',
    btn_continue_preparation: 'Continuer la sortie',
    voucher_confirmed_readonly_notice: 'Ce bon est définitivement confirmé et archivé. Le stock correspondant a été déduit.',
    voucher_cancelled_notice: "Ce bon de sortie a été annulé. Aucun mouvement de stock n'a été effectué.",
    btn_add_material_to_issue: 'Ajouter au bon',
    issue_diff_warning: 'Écart constaté : quantité sortie différente de la quantité demandée',

    // Tablet Mode & QR Labels & Hover Preview
    btn_tablet_mode: 'Mode Atelier (Tactile)',
    btn_standard_mode: 'Mode Standard',
    tablet_mode_active: 'Mode Atelier Tactile Actif',
    tablet_scan_hint: 'Scannez avec la douchette ou tapez un code SAP / BIN...',
    barcode_scanner_detected: 'Code scanné par douchette :',
    btn_print_label: 'Étiquette & QR Code',
    label_modal_title: "Générateur d'Étiquette Industrielle",
    label_modal_desc: "Imprimez des étiquettes code-barres & QR Codes scannables par l'application Android",
    label_type_material: 'Étiquette Matériel (SAP)',
    label_type_location: 'Étiquette Emplacement / Rack (BIN)',
    label_preview_desc: 'Format standard optimisé imprimante thermique & laser',
    scan_on_android: 'Scannez avec l’App Android WMS',
    stock_in_other_locations: 'Stocks sur les autres sites & emplacements :',
    quick_actions_title: 'Actions rapides',

    // Warehouse Visual Tour
    visual_tour_title: 'Visite Virtuelle des Magasins & Entrepôts',
    visual_tour_subtitle: 'Explorez visuellement les espaces de stockage, racks, containers et zones logistiques',
    btn_visual_tour: 'Visite des Magasins',
    tour_view_stock: 'Consulter les stocks de ce magasin',
    tour_angle_photo: 'Angle',
    tour_site_counter: 'Site {current} sur {total}',

    // Material Visual Tour
    material_tour_title: 'Visite Visuelle du Matériel & Équipements',
    material_tour_subtitle: 'Parcourez visuellement les pièces, outillages et composants en stock',
    btn_material_tour: 'Visite Visuelle du Matériel',
    btn_tour_item: 'Visite Visuelle',
    tour_material_counter: 'Article {current} sur {total}'
  },

  en: {
    app_name: 'WMS B1 & B2',
    app_subtitle: 'WAREHOUSE MANAGEMENT',
    warehouse_view: 'Warehouse View',
    all_warehouses: 'All (B1 & B2)',
    b1_warehouse: 'B1 (MD01)',
    b2_warehouse: 'B2 (Zones A-E)',
    quick_search: 'Quick search...',
    role: 'Role',
    language: 'Language',
    user_profile: 'User Profile',

    tab_dashboard: 'Dashboard',
    tab_stock: 'Stock Table',
    tab_spatial: 'Warehouse Map (2D)',
    tab_receipts: 'Receipts',
    tab_issues: 'Issues (Disbursements)',
    tab_transfers: 'Transfers',
    tab_inventory: 'Physical Inventory',
    tab_import: 'Excel Import',
    tab_export: 'Export & Reports',
    tab_audit: 'Audit Trail',

    // Spatial Warehouse Visualization
    spatial_view_title: 'Spatial Mapping & Layout',
    spatial_view_subtitle: 'Technical 2D view of aisles, racks, containers and capacity fill rate',
    spatial_site_b1: 'Warehouse B1 (Heavy Spares & Valves)',
    spatial_site_b2: 'Warehouse B2 (Consumables & Electrical)',
    spatial_site_containers: 'Maritime Container Yard',
    spatial_site_yard: 'Outdoor Storage Yard',
    spatial_zoom_in: 'Zoom In',
    spatial_zoom_out: 'Zoom Out',
    spatial_reset_view: 'Reset View',
    spatial_all_locations: 'All Racks',
    spatial_occupied: 'Occupied',
    spatial_available: 'Available',
    spatial_selected_location: 'Selected Location',
    spatial_no_location_selected: 'Click a rack or container bay to inspect its contents and capacity',
    spatial_occupancy_rate: 'Occupancy Rate',
    spatial_rack_level: 'Rack / Shelf Level',
    spatial_shelf_level: 'Bay',
    spatial_view_full_stock: 'View in Stock Table',
    spatial_receipt_here: 'Receive Stock Here',
    spatial_issue_from_here: 'Issue from this Bay',

    action_receipt: 'Receipt',
    action_issue: 'Issue',
    action_transfer: 'Transfer',
    action_search_placeholder: 'Search SAP code, description, Chinese, BIN...',

    dashboard_title: 'Warehouse Operations Overview',
    dashboard_subtitle: 'Real-time inventory levels for warehouses B1 and B2',
    data_synced: 'Data synchronized',
    active_locations: 'active bin locations',
    kpi_total_items: 'Total Catalog Items',
    kpi_total_stock: 'Total Quantity in Stock',
    kpi_total_valuation: 'Total Valuation (USD)',
    kpi_active_warehouses: 'Active Warehouses',
    kpi_units: 'units',
    stock_distribution: 'Stock Distribution B1 vs B2',
    b1_overview_title: 'Warehouse B1 — MD01',
    b2_overview_title: 'Warehouse B2 — Zones A-E',
    b1_overview_desc: 'Dedicated MD01 storage zone',
    b2_overview_desc: 'Storage zones A, B, C, D, E',
    recent_movements: 'Recent Movements',
    view_all_movements: 'View all movements',
    low_stock_alerts: 'Low Stock Alerts',
    no_recent_movements: 'No movements recorded yet',
    view_stock_table: 'Browse full stock',

    stock_table_title: 'Global Inventory & Bin Locations',
    stock_table_subtitle: 'Browse, filter and manage materials in B1 and B2',
    search_placeholder: 'Search by material code, description, Chinese name or BIN...',
    filter_all: 'All Stocks',
    filter_b1: 'B1 Stock (MD01)',
    filter_b2: 'B2 Stock (Zones A-E)',
    col_photo: 'Photo',
    col_code: 'Material Code',
    col_name: 'Description (English)',
    col_chinese_name: 'Chinese Name',
    col_warehouse: 'Warehouse',
    col_bin: 'BIN Location',
    col_uom: 'UOM',
    col_qty: 'Total Qty',
    col_reserved: 'Reserved',
    col_available: 'Available',
    col_unit_price: 'Unit Price',
    col_total_value: 'Value (USD)',
    col_actions: 'Actions',
    no_matching_stock: 'No items match your search criteria',
    showing_items: 'Showing',
    of_total: 'of',
    page: 'Page',
    prev_page: 'Previous',
    next_page: 'Next',

    btn_cards: 'Cards',
    btn_table: 'Table',
    btn_cancel: 'Cancel',
    btn_confirm: 'Confirm',
    btn_save: 'Save',
    btn_close: 'Close',
    btn_details: 'Material Details',
    btn_receipt: 'Receipt',
    btn_issue: 'Issue',
    btn_transfer: 'Transfer',
    btn_upload_photo: 'Upload Photo',
    btn_change_photo: 'Change Photo',
    btn_remove_photo: 'Remove Photo',

    receipt_title: 'New Stock Receipt',
    receipt_desc: 'Record incoming shipment from supplier or workshop return',
    select_material: 'Select Material',
    select_warehouse: 'Target Warehouse',
    target_bin: 'BIN Location',
    receipt_qty: 'Quantity Received',
    supplier: 'Supplier / Origin',
    po_number: 'PO / Delivery Note #',
    remarks: 'Remarks / Notes',
    receipt_success: 'Receipt recorded successfully!',

    issue_title: 'New Stock Issue',
    issue_desc: 'Issue material for operations, maintenance or projects',
    issue_qty: 'Quantity to Issue',
    available_qty: 'Available Quantity',
    destination_dept: 'Department / Destination',
    recipient_name: 'Recipient / Requester',
    issue_reason: 'Issue Reason / WO #',
    insufficient_stock_error: 'Insufficient available quantity!',
    issue_success: 'Issue approved successfully!',

    transfer_title: 'New Stock Transfer',
    transfer_desc: 'Transfer stock between warehouses, containers or relocate BIN',
    source_warehouse: 'Source Warehouse',
    source_warehouse_filter: 'Source Warehouse / Site',
    all_sources: 'All sites and containers',
    source_bin: 'Source BIN',
    dest_warehouse: 'Destination Warehouse',
    dest_bin: 'Destination Physical Location (BIN)',
    dest_bin_required_error: 'Destination physical location (BIN) is mandatory (e.g. Rack, Shelf, Bin).',
    field_required_badge: 'Mandatory',
    transfer_qty: 'Quantity to Transfer',
    transfer_reason: 'Transfer Reason',
    transfer_success: 'Transfer executed successfully!',

    material_detail_title: '360° Material Specification',
    tab_overview: 'Overview',
    tab_locations: 'Locations & Stock',
    tab_history: 'Movement History',
    tab_photo: 'Photo & Media',
    mat_code: 'SAP Material Code',
    mat_chinese_name: 'Chinese Name',
    mat_specs: 'Specification / Model',
    mat_uom: 'Unit of Measure',
    mat_price: 'Standard Unit Price',
    mat_total_stock: 'Global Stock (B1 + B2)',
    mat_total_value: 'Total Estimated Value',
    mat_plant: 'Plant / Facility',
    photo_manager_title: 'Material Photo Management',
    photo_manager_desc: 'Attach a high-resolution photo accessible across Web and Android',
    photo_upload_prompt: 'Click or drag an image here (PNG, JPG, WebP)',
    photo_size_hint: 'Recommended size: square or 4:3 ratio, max 5MB',
    requires_code_review: 'Temporary Code — Review Required',

    inventory_title: 'Physical Inventory & Reconciliation',
    inventory_desc: 'Record physical counts and generate automatic adjustments',
    physical_count: 'Physical Count',
    system_count: 'System Qty',
    variance: 'Variance',
    btn_validate_inventory: 'Validate & Adjust Stock',
    inventory_updated: 'Inventory reconciled successfully!',
    no_discrepancy: 'No discrepancies detected in current selection',

    import_title: 'Excel Import & Sync',
    import_desc: 'Update warehouse stock from Excel master workbook (drew.xlsx)',
    export_title: 'Data Export & Reports',
    export_desc: 'Download CSV and Excel workbook snapshots',
    btn_download_template: 'Download Excel Template',
    btn_export_csv: 'Export to CSV',
    btn_export_excel: 'Export to Excel (.xlsx)',
    import_success: 'Data imported successfully!',
    imported_rows: 'rows processed',

    audit_title: 'Audit Trail & Compliance',
    audit_desc: 'Immutable log of all user operations and transactions',
    col_user: 'User',
    col_action_type: 'Action',
    col_entity: 'Entity',
    col_timestamp: 'Timestamp',
    col_details: 'Details',

    mov_receipt: 'Receipt',
    mov_issue: 'Issue',
    mov_transfer_in: 'Transfer In',
    mov_transfer_out: 'Transfer Out',
    mov_adjustment: 'Inventory Adjustment',

    movements_title: 'Complete Stock Movement History',
    movements_subtitle: 'auditable movement(s) recorded — Deletions strictly forbidden.',
    btn_export_movements: 'Export Movements Excel',
    filter_all_movements: 'All movement types',
    col_date: 'Date & Time',
    col_type: 'Type',
    col_material: 'Material',
    col_stock_before_after: 'Stock Before → After',
    col_total_amount: 'Total Amount',
    col_ref_reason: 'Reference / Reason',
    col_operator: 'Operator',
    no_matching_movements: 'No movements found matching criteria.',

    import_card_title: 'Excel Import & Audit Module',
    import_card_subtitle: 'Structured validation, anomaly detection, exact total reconciliation, and full traceability.',
    source_file_verified: 'Source file verified & imported',
    import_commit_success_title: 'Import and Reconciliation Confirmed!',
    import_commit_success_desc: 'All B1 and B2 stocks are synchronized in the database without any unit loss.',
    import_upload_box_title: 'Import an update Excel workbook',
    import_upload_box_desc: 'Supports B1 warehouse stock, B2 warehouse stock, and Sheet1 sheets.',
    btn_select_xlsx: 'Select a .xlsx file',
    sheet_b1_tab: 'Sheet B1 warehouse stock',
    sheet_b2_tab: 'Sheet B2 warehouse stock',
    metric_analyzed_rows: 'Analyzed Rows',
    metric_valid_rows: 'valid rows retained',
    metric_reconciled_qty: 'Reconciled Quantity',
    metric_conform_original: '✓ 100% matches original',
    metric_consolidated_dups: 'Consolidated Duplicates',
    metric_cumulated_bins: 'Cumulated by BIN without loss',
    metric_missing_codes: 'Rows without Material Code',
    metric_temp_codes: 'Temporary codes assigned',
    audit_report_title: 'Data Cleaning & Validation Report',
    col_excel_row: 'Excel Row',
    col_anomaly_type: 'Anomaly Type',
    col_field: 'Field',
    col_original_value: 'Original Value',
    col_system_action: 'Action Applied by System',
    no_anomaly_detected: 'No anomalies detected on this sheet.',

    export_view_title: 'Excel Export & Report Generation',
    export_view_subtitle: 'Instant download of clean, normalized .XLSX spreadsheets ready for Excel analysis.',
    export_global_title: 'Consolidated Global Stock (B1 + B2)',
    export_global_desc: 'Complete export of all materials across all warehouses, with bin locations, unit prices and valuation.',
    export_b1_title: 'Specific Stock — Warehouse B1',
    export_b1_desc: 'Excel file dedicated exclusively to spare parts and valves in Warehouse B1.',
    export_b2_title: 'Specific Stock — Warehouse B2',
    export_b2_desc: 'Excel file dedicated to consumables, paints, tools and hardware in Warehouse B2.',
    export_movements_title: 'Movement History (Audit Trail)',
    export_movements_desc: 'Audit export containing full history, delivery references, requesters, and timestamps.',
    export_global_meta: '1,524 records with BIN, valuation and availability',
    export_b1_meta: 'Zone MD01 (751 location rows)',
    export_b2_meta: 'Zones B2-01 to B2-04, A, C, E (773 rows)',
    export_movements_meta: 'All receipts, disbursements, transfers and adjustments',
    btn_download_stock_global: 'Download Global Stock (.xlsx)',
    btn_download_stock_b1: 'Download Stock B1 (.xlsx)',
    btn_download_stock_b2: 'Download Stock B2 (.xlsx)',
    btn_download_movements: 'Download Movements History (.xlsx)',

    audit_view_title: 'Audit Trail & Full Traceability',
    audit_view_subtitle: 'Immutable log of all actions: receipts, issues, transfers, adjustments, and imports.',
    audit_events_count: 'audited events',
    search_audit_placeholder: 'Search by description, user, reference...',
    all_actions: 'All actions',
    col_target: 'Target',
    col_desc_changes: 'Description & Modifications',
    no_matching_audit: 'No audit events match the filters.',

    nav_transfers_title: 'Stock Transfers',
    nav_transfers_subtitle: 'Transfer materials between warehouses with atomic creation of paired movements.',
    btn_new_transfer: 'New Transfer',

    tab_shared_links: 'Shared Links',
    btn_generate_share_link: 'Generate Share Link',
    btn_share_this_view: 'Share This View',
    share_modal_title: 'Generate Secure Shared Link',
    share_modal_subtitle: 'Create a temporary read-only link with customized filters and column visibility.',
    share_link_title_label: 'Share Label / Title',
    share_link_title_placeholder: 'E.g., Bearings for South workshop maintenance',
    share_filter_warehouse: 'Warehouse',
    share_filter_search: 'Material / Description Search',
    share_filter_search_placeholder: 'E.g., Bearing, Valve, Gasket...',
    share_filter_bin: 'Row / BIN Location',
    share_filter_bin_placeholder: 'E.g., MD01, B2-01, R12...',
    share_filter_status: 'Stock Availability Status',
    share_filter_status_all: 'All Statuses',
    share_filter_status_in_stock: 'In Stock Only (Qty > 0)',
    share_filter_status_out_of_stock: 'Out of Stock Only (Qty = 0)',
    share_filter_status_low_stock: 'Low Stock Only (≤ 5)',
    share_expiration_label: 'Link Expiration Time',
    share_exp_15m: '15 minutes',
    share_exp_1h: '1 hour',
    share_exp_6h: '6 hours',
    share_exp_24h: '24 hours (1 day)',
    share_exp_3d: '3 days',
    share_exp_7d: '7 days',
    share_exp_custom: 'Custom (hours)',
    share_exp_custom_hours: 'Number of hours',
    share_visible_columns_title: 'Information Visible to Visitor',
    share_visible_columns_desc: 'Check permitted columns. Sensitive details like unit prices and valuation can be hidden.',
    share_matching_items_preview: 'Matching Items Preview',
    btn_create_link: 'Generate Secure Link',
    share_link_created_success: 'Share link generated successfully!',
    share_link_url_label: 'Public Secure Link (no login required):',
    btn_copy_link: 'Copy Link',
    link_copied_to_clipboard: 'Link copied to clipboard!',
    shared_links_management_title: 'Temporary Shared Links Management',
    shared_links_management_subtitle: 'Track visits, control validity, and revoke public read-only access.',
    col_link_title: 'Title & Reference',
    col_link_token: 'Token',
    col_link_filters: 'Applied Filters',
    col_link_created_at: 'Created By & Date',
    col_link_expires_at: 'Expiration',
    col_link_access_count: 'Visits',
    col_link_status: 'Status',
    status_active: 'Active',
    status_expiring_soon: 'Expiring Soon',
    status_expired: 'Expired',
    status_revoked: 'Revoked',
    btn_view_public: 'View Public',
    btn_revoke_link: 'Revoke',
    btn_delete_link: 'Delete',
    confirm_revoke_link: 'Are you sure you want to revoke this share link immediately? The visitor will no longer be able to access data.',
    confirm_delete_link: 'Are you sure you want to permanently delete this share link from history?',
    link_revoked_success: 'Share link revoked successfully!',
    link_deleted_success: 'Share link deleted!',
    no_shared_links: 'No active or archived shared links.',
    shared_public_header_title: 'Warehouse — Secure Shared View',
    shared_public_header_subtitle: 'Read-only access granted by warehouse administrator',
    shared_public_badge_readonly: 'Read Only',
    shared_public_active_filters: 'Active Filters',
    shared_public_expires_in: 'Expires in',
    shared_public_expired_title: 'This share link has expired.',
    shared_public_expired_message: 'The validity period granted by the administrator has ended. Please request a new link.',
    shared_public_revoked_title: 'This share link has been revoked.',
    shared_public_revoked_message: 'Public access to this dataset has been closed by a warehouse administrator.',
    shared_public_not_found_title: 'Share link not found or invalid.',
    shared_public_not_found_message: 'The security token is incorrect or the link has been removed.',
    shared_public_items_count: 'shared items',
    shared_public_search_within: 'Search within these results...',
    shared_public_back_to_app: 'Return to Main Application',

    // Flexible Locations & Directory
    nav_locations_title: 'Storage Locations & Sites',
    nav_locations_subtitle: 'Comprehensive directory of B1, B2, containers, yards, workshops, and temporary zones.',
    btn_add_location: 'Add Storage Location',
    btn_edit_location: 'Edit',
    btn_delete_location: 'Delete',
    confirm_delete_location: 'Are you sure you want to delete this storage location?',
    location_created_success: 'New storage location created successfully!',
    location_updated_success: 'Storage location updated successfully!',
    location_deleted_success: 'Storage location deleted!',
    kpi_locations: 'Storage Sites',
    kpi_containers: 'Active Containers',
    kpi_recently_updated: 'Updated (7 days)',
    type_warehouse: 'Warehouse / Store',
    type_container: 'Container',
    type_yard: 'Yard / Open Area',
    type_workshop: 'Workshop',
    type_rack: 'Rack / Bay',
    type_shelf: 'Shelf / Level',
    type_temporary: 'Temporary Area',
    type_quarantine: 'Quarantine Area',
    type_office: 'Office / Supply Room',
    type_other: 'Other Location',
    field_location_type: 'Location Type',
    field_location_code: 'Identifier Code',
    field_location_name: 'Common Name',
    field_physical_address: 'Physical Location / Landmark',
    field_description: 'Description & Purpose',
    field_zone: 'Zone / Area',
    field_rack: 'Rack',
    field_shelf: 'Shelf / Level',
    field_row: 'Row',
    field_position: 'Position',
    field_container_number: 'Container No.',
    field_location_notes: 'Access Notes',
    all_locations: 'All Locations',
    filter_by_type: 'Filter by type',
    filter_by_site: 'Filter by site / store',

    // Shared & Common Labels
    all: 'All',
    active_status: 'Active',
    inactive_status: 'Inactive',
    all_types: 'All Types',
    all_statuses: 'All Statuses',
    actions_col: 'Actions',
    reset_filters: 'Reset filters',
    search_hint: 'Search by code (B1, CONT-01...), name, landmark, use...',
    available_gt_zero: 'Available > 0',
    low_stock_badge: 'Low stock',
    out_of_stock_badge: 'Out of stock',
    stock_lines_col: 'Stock Lines',
    physical_units_col: 'Physical Units',
    total_value_col: 'Total Value',
    estimated_value: 'Estimated Value',
    physical_landmark_col: 'Physical Landmark',
    location_desc_col: 'Location & Description',
    view_stock_action: 'View stock',
    no_locations_matching: 'No storage locations match your criteria.',
    cannot_delete_core_warehouses: 'Primary warehouses B1 and B2 cannot be deleted.',

    // Dashboard specifics
    kpi_usd_global: 'Global USD',
    kpi_unique_references: 'unique items',
    kpi_accounted_units: 'Counted units',
    kpi_containers_count_desc: 'including {n} containers',
    kpi_units_available_limit: '≤ 5 available units',
    kpi_recent_movements_desc: 'Recent movements',
    daily_operations_title: 'Today\'s Operational Activity',
    stock_distribution_sites_title: 'Stock Breakdown by Site & Location',
    stock_distribution_sites_desc: 'B1 & B2 warehouses, storage containers, outdoor yards, and workshops',
    site_location_name_col: 'Location Name',
    site_location_code_col: 'Code',
    site_location_type_col: 'Type',
    catalog_items_listed: 'items listed',
    total_stock_value_label: 'Total value',

    // Navigation & Location Groups
    main_warehouses_group: 'Primary Warehouses',
    containers_and_sites_group: 'Containers & Specific Sites',
    all_sites_and_warehouses: 'All Sites & Warehouses',
    all_site_types: 'All Site Types',
    other_sites_select: 'Other sites...',
    verified_database_badge: 'Active & Verified Database',
    sites_nav: 'Sites',

    // Inventory & Modals
    inventory_target_site: 'Target Site for Inventory:',
    qty_cannot_be_negative: 'Quantity cannot be negative',
    sub_location_toggle: 'Specify optional sub-location (Zone, Container, Rack, Position...)',
    sub_location_dest_toggle: 'Specify optional destination sub-location',
    available_short_label: 'Avail',
    stock_item_select_label: 'Stock Item',
    requester_name_placeholder: 'Requester name...',
    dest_bin_placeholder: 'Destination BIN...',
    photo_attached_badge: 'Photo attached',
    referenced_stock_locations_title: 'Referenced Stock Locations',
    count_locations_suffix: 'location(s)',
    recent_movements_for_reference: 'Recent Movements for this Item',

    // Location Modal specifics
    system_unique_id: 'System unique identifier',
    specify_custom_type: 'Specify location type',
    specify_custom_type_placeholder: 'e.g. Secure bay, Airlock...',
    operational_status_label: 'Operational status',
    active_usable_for_stock: 'Active (Usable for stock)',
    inactive_blocked: 'Inactive / Blocked',
    location_modal_create_desc: 'Define a warehouse, container, workshop, or open yard',

    // Share Modal specifics
    applied_filters_title: 'Applied Data Filters',
    select_all_columns: 'Select all',
    hide_prices_costs: 'Hide prices/costs',
    hours_unit: 'hours',
    days_unit: 'days',
    consultations_label: 'Visits:',
    visits_count: 'visits',
    copy_public_link_title: 'Copy public link',
    search_links_placeholder: 'Search by title, token, author, keyword...',
    pagination_of: 'of',
    search_by_bin_placeholder: 'Location / BIN...',
    no_stock_recorded_item: 'No stock recorded for this item.',
    adjustment_reason_placeholder: 'Adjustment reason...',
    audit_action_location_created: 'Location Created',
    audit_action_location_updated: 'Location Updated',
    audit_action_location_deleted: 'Location Deleted',
    visible_columns_suffix: 'visible columns',
    last_visit_label: 'Last',
    share_link_success_desc: 'This link grants direct read-only access to selected data without requiring visitors to sign in.',
    security_token_label: 'Security token',
    expiration_label: 'Expiration',
    shared_items_count_label: 'Shared items',
    items_suffix: 'items',
    visible_columns_label: 'Visible columns',
    sensitive_cost_badge: 'Sensitive cost',
    direct_readonly_access_desc: 'Direct read-only access without login',
    dept_placeholder: 'e.g.: Maintenance, Production...',
    reason_placeholder: 'e.g.: Emergency repair...',
    source_article_available_location: 'Source item & available location',
    shared_public_loading: 'Loading secure shared data...',
    shared_public_footer_notice: 'WMS B1 & B2 • Secure and auditable temporary public view',
    unit_days_short: 'd',
    unit_hours_short: 'h',
    unit_minutes_short: 'm',
    field_optional: '(Optional)',
    error_reading_excel: 'Error reading Excel file.',
    error_saving_location: 'Error saving location',
    location_code_required: 'Location code is required.',
    location_name_required: 'Location name is required.',
    placeholder_location_code: 'e.g.: CONT-04, YARD-B, WORKSHOP-2',
    placeholder_location_name: 'e.g.: Container 04 (Heavy parts), North Yard...',
    placeholder_physical_address: 'e.g.: South Zone - Platform C, Opposite Gate 2...',
    placeholder_location_desc: 'e.g.: Storage for parts awaiting assembly or spare parts.',
    excel_row_num: 'Row {row}',
    autocomplete_no_results: 'No matches found in database',
    autocomplete_create_new: 'Create new value « {value} »',
    autocomplete_similar_warning: 'Very similar existing value:',
    autocomplete_use_similar: 'Use standardized value',
    autocomplete_suggestions_count: '{count} suggestions found',
    autocomplete_press_enter: 'Press Enter to select',

    // Issue Vouchers Module
    issues_title: 'Material Issues',
    issues_desc: 'Digital registry and traceability of material issues with paper logbook certification',
    btn_new_issue_voucher: '+ New Material Issue',
    issue_voucher_number: 'Issue Voucher #',
    issue_voucher_status: 'Status',
    status_draft: 'Draft',
    status_preparing: 'In Preparation',
    status_ready: 'Awaiting Confirmation',
    status_confirmed: 'Confirmed',
    status_cancelled: 'Cancelled',
    issue_buyer_name: 'Buyer / Requester Name',
    issue_agent_name: 'Warehouse Clerk',
    issue_paper_book_signature: 'Paper logbook signed',
    issue_paper_book_ref: 'Paper logbook page / ref',
    issue_paper_book_ref_placeholder: 'e.g. Book #4, Page 18',
    issue_items_count: 'Items',
    issue_total_requested: 'Total Requested',
    issue_total_issued: 'Total Issued',
    issue_physical_verify_step: 'Physical Verification',
    issue_physical_verify_desc: 'Physically check parts and enter actual handed-over quantities',
    issue_qty_requested: 'Requested Qty',
    issue_qty_actual: 'Actual Issued Qty',
    issue_summary_title: 'Issue Voucher Summary',
    issue_summary_desc: 'Review items with buyer before signing the paper logbook',
    issue_confirm_dialog_title: 'Final Issue Confirmation',
    issue_confirm_dialog_msg: 'Quantities have been physically verified and buyer has signed in the paper book. Do you want to permanently confirm this issue? Stock will be automatically updated.',
    issue_confirm_btn: 'Confirm Issue',
    issue_cancel_btn: 'Cancel Issue',
    issue_stock_before: 'Stock Before',
    issue_stock_after: 'Stock After',
    issue_paper_not_signed_warn: 'Please certify that paper logbook has been signed before confirming.',
    issue_no_items_error: 'Please add at least one material to the issue voucher.',
    issue_item_already_added: 'This item in this bin is already present in the voucher.',
    issue_step_header: '1. General Info',
    issue_step_materials: '2. Material Selection',
    issue_step_verification: '3. Physical Verification',
    issue_step_summary: '4. Summary & Paper Signature',
    kpi_confirmed_issues: 'Confirmed Issues',
    kpi_today_issues: 'Issues Today',
    kpi_pending_issues: 'In Progress / Pending',
    kpi_total_units_issued: 'Total Units Issued',
    btn_print_voucher: 'Print Voucher',
    btn_view_voucher: 'View Voucher',
    btn_continue_preparation: 'Continue Issue',
    voucher_confirmed_readonly_notice: 'This voucher is permanently confirmed and archived. Stock has been deducted.',
    voucher_cancelled_notice: 'This issue voucher was cancelled. No stock movement was performed.',
    btn_add_material_to_issue: 'Add to Voucher',
    issue_diff_warning: 'Discrepancy: actual issued quantity differs from requested quantity',

    // Tablet Mode & QR Labels & Hover Preview
    btn_tablet_mode: 'Tablet Mode (Touch)',
    btn_standard_mode: 'Standard Mode',
    tablet_mode_active: 'Shop Floor Touch Mode Active',
    tablet_scan_hint: 'Scan with barcode gun or type SAP / BIN code...',
    barcode_scanner_detected: 'Barcode gun scanned:',
    btn_print_label: 'Label & QR Code',
    label_modal_title: 'Industrial Label Generator',
    label_modal_desc: 'Print precision barcode & QR labels scannable by the Android App',
    label_type_material: 'Material Label (SAP)',
    label_type_location: 'Location / Rack Label (BIN)',
    label_preview_desc: 'Standard thermal & laser label format',
    scan_on_android: 'Scan with Android WMS App',
    stock_in_other_locations: 'Stock in other sites & locations:',
    quick_actions_title: 'Quick Actions',

    // Warehouse Visual Tour
    visual_tour_title: 'Warehouse & Site Visual Tour',
    visual_tour_subtitle: 'Visually explore storage areas, high racks, shipping containers, and logistics yards',
    btn_visual_tour: 'Warehouse Tour',
    tour_view_stock: 'View stock in this warehouse',
    tour_angle_photo: 'Angle',
    tour_site_counter: 'Site {current} of {total}',

    // Material Visual Tour
    material_tour_title: 'Material & Equipment Visual Tour',
    material_tour_subtitle: 'Visually browse industrial parts, equipment, and components in inventory',
    btn_material_tour: 'Material Visual Tour',
    btn_tour_item: 'Visual Tour',
    tour_material_counter: 'Item {current} of {total}'
  },

  zh: {
    app_name: 'WMS 仓库管理系统',
    app_subtitle: 'B1 & B2 仓库综合管理',
    warehouse_view: '仓库视图',
    all_warehouses: '全部 (B1 & B2)',
    b1_warehouse: 'B1 仓库 (MD01)',
    b2_warehouse: 'B2 仓库 (A-E区)',
    quick_search: '快捷搜索...',
    role: '用户角色',
    language: '语言设置',
    user_profile: '用户个人资料',

    tab_dashboard: '管理大盘',
    tab_stock: '库存总表',
    tab_spatial: '空间布局 (2D)',
    tab_receipts: '入库管理',
    tab_issues: '出库领料',
    tab_transfers: '库间调拨',
    tab_inventory: '物理盘点',
    tab_import: 'Excel 数据导入',
    tab_export: '数据导出与报表',
    tab_audit: '操作审计日志',

    // Spatial Warehouse Visualization
    spatial_view_title: '仓库空间可视化地图',
    spatial_view_subtitle: '2D 巷道、货架、集装箱及库位容量负载率视图',
    spatial_site_b1: 'B1 仓库 (重型备件与阀门)',
    spatial_site_b2: 'B2 仓库 (消耗品与电气)',
    spatial_site_containers: '海运集装箱堆场',
    spatial_site_yard: '露天堆存区 (Yard)',
    spatial_zoom_in: '放大视图',
    spatial_zoom_out: '缩小视图',
    spatial_reset_view: '重置视角',
    spatial_all_locations: '所有货位',
    spatial_occupied: '已占用',
    spatial_available: '空闲可用',
    spatial_selected_location: '选中库位详情',
    spatial_no_location_selected: '点击地图上的货架或集装箱格位查看物料明细',
    spatial_occupancy_rate: '空间占用率',
    spatial_rack_level: '层高 / 货位层',
    spatial_shelf_level: '排 / 柱',
    spatial_view_full_stock: '在库存表中查看',
    spatial_receipt_here: '在此库位入库',
    spatial_issue_from_here: '从此货位出库',

    action_receipt: '入库',
    action_issue: '出库',
    action_transfer: '调拨',
    action_search_placeholder: '搜索物料编码、中文名称、英文描述、库位...',

    dashboard_title: '仓库实时监控中心',
    dashboard_subtitle: 'B1 与 B2 仓库实时物料与库存分布状态',
    data_synced: '数据已实时同步',
    active_locations: '个活跃库位',
    kpi_total_items: '物料分类总数',
    kpi_total_stock: '库存总量',
    kpi_total_valuation: '库存总货值 (USD)',
    kpi_active_warehouses: '运行仓库数',
    kpi_units: '件/套',
    stock_distribution: 'B1 与 B2 库存分布比例',
    b1_overview_title: 'B1 仓库 — MD01 专用区',
    b2_overview_title: 'B2 仓库 — A至E 存储区',
    b1_overview_desc: 'MD01 专属物料存储区',
    b2_overview_desc: 'A, B, C, D, E 分区密集存储',
    recent_movements: '最新出入库记录',
    view_all_movements: '查看所有出入库动态',
    low_stock_alerts: '低库存预警物料',
    no_recent_movements: '暂无最近出入库记录',
    view_stock_table: '查看完整库存表',

    stock_table_title: '全库物料库存与库位清单',
    stock_table_subtitle: '多维度检索、筛选及管理 B1 和 B2 仓库物料',
    search_placeholder: '输入物料编码、中文名、英文描述或库位...',
    filter_all: '全部物料',
    filter_b1: 'B1 仓库 (MD01)',
    filter_b2: 'B2 仓库 (A-E区)',
    col_photo: '物料实图',
    col_code: '物料编码 (SAP)',
    col_name: '英文描述',
    col_chinese_name: '中文名称',
    col_warehouse: '所属仓库',
    col_bin: '库位 (BIN)',
    col_uom: '单位',
    col_qty: '总库存',
    col_reserved: '预留量',
    col_available: '可用库存',
    col_unit_price: '单价 (USD)',
    col_total_value: '总金额 (USD)',
    col_actions: '操作',
    no_matching_stock: '未查询到匹配的物料记录',
    showing_items: '显示第',
    of_total: '条，共',
    page: '页码',
    prev_page: '上一页',
    next_page: '下一页',

    btn_cards: '卡片',
    btn_table: '表格',
    btn_cancel: '取消',
    btn_confirm: '确认',
    btn_save: '保存',
    btn_close: '关闭',
    btn_details: '物料详情',
    btn_receipt: '入库',
    btn_issue: '出库',
    btn_transfer: '调拨',
    btn_upload_photo: '上传图片',
    btn_change_photo: '更换图片',
    btn_remove_photo: '删除图片',

    receipt_title: '物料入库登记',
    receipt_desc: '记录供应商来料交货或车间退料入库',
    select_material: '选择入库物料',
    select_warehouse: '目的仓库',
    target_bin: '目的库位 (BIN)',
    receipt_qty: '入库数量',
    supplier: '供应商 / 来料单位',
    po_number: '采购订单 / 送货单号',
    remarks: '备注说明',
    receipt_success: '入库登记成功！',

    issue_title: '物料出库领料',
    issue_desc: '生产运维、维修工单及领料申请出库',
    issue_qty: '出库数量',
    available_qty: '当前可用库存',
    destination_dept: '使用部门 / 领料工位',
    recipient_name: '领料人 / 负责人',
    issue_reason: '领料原因 / 工单号',
    insufficient_stock_error: '可用库存不足，无法出库！',
    issue_success: '出库办理成功！',

    transfer_title: '仓库间移库调拨',
    transfer_desc: '执行仓库、集装箱之间调拨或库位重排',
    source_warehouse: '源仓库',
    source_warehouse_filter: '来源仓库 / 地点',
    all_sources: '所有地点和集装箱',
    source_bin: '源库位',
    dest_warehouse: '目标仓库',
    dest_bin: '目标物理存放库位 (BIN)',
    dest_bin_required_error: '必须提供目标存放物理库位（例如：货架号、层、箱号）',
    field_required_badge: '必填',
    transfer_qty: '调拨数量',
    transfer_reason: '调拨原因',
    transfer_success: '调拨作业完成！',

    material_detail_title: '物料 360° 全景信息',
    tab_overview: '基本信息',
    tab_locations: '分布与库位',
    tab_history: '出入库历史',
    tab_photo: '照片与图纸',
    mat_code: 'SAP 物料编码',
    mat_chinese_name: '中文名称',
    mat_specs: '型号规格 / Technical Spec',
    mat_uom: '计量单位',
    mat_price: '标准单价',
    mat_total_stock: '全库总库存 (B1 + B2)',
    mat_total_value: '库存估值总额',
    mat_plant: '工厂代码 (Plant)',
    photo_manager_title: '物料实物照片管理',
    photo_manager_desc: '关联高清实物图，Web 端与 Android 手机端同步展示',
    photo_upload_prompt: '点击或拖拽图片至此 (支持 PNG, JPG, WebP)',
    photo_size_hint: '建议尺寸：正方形或 4:3 比例，最大 5MB',
    requires_code_review: '临时自建物料编码 — 待审核',

    inventory_title: '物料实物盘点与调账',
    inventory_desc: '录入盘点实盘数，系统自动计算盘盈盘亏并生成调账凭证',
    physical_count: '实盘数量',
    system_count: '账面库存',
    variance: '盘点差异',
    btn_validate_inventory: '确认盘点并调账',
    inventory_updated: '库存盘点调账完成！',
    no_discrepancy: '当前所选物料无账实差异',

    import_title: 'Excel 台账导入与同步',
    import_desc: '从现有 Excel 台账 (drew.xlsx) 快速更新与同步库存',
    export_title: '数据报表与清单导出',
    export_desc: '生成并下载标准 CSV 与 Excel 格式库存报表',
    btn_download_template: '下载 Excel 模板',
    btn_export_csv: '导出为 CSV',
    btn_export_excel: '导出为 Excel (.xlsx)',
    import_success: 'Excel 数据同步导入成功！',
    imported_rows: '行数据已更新',

    audit_title: '系统操作审计与追踪',
    audit_desc: '全流程不可篡改的操作记录与溯源日志',
    col_user: '操作人员',
    col_action_type: '操作类型',
    col_entity: '业务对象',
    col_timestamp: '操作时间',
    col_details: '详细说明',

    mov_receipt: '采购入库',
    mov_issue: '领料出库',
    mov_transfer_in: '调拨转入',
    mov_transfer_out: '调拨转出',
    mov_adjustment: '盘点调账',

    movements_title: '出入库与调拨明细总表',
    movements_subtitle: '条可追溯出入库日志 — 系统严禁任意篡改或删除。',
    btn_export_movements: '导出明细流水 (Excel)',
    filter_all_movements: '所有出入库类型',
    col_date: '操作时间',
    col_type: '业务类型',
    col_material: '物料信息',
    col_stock_before_after: '变动前 → 变动后',
    col_total_amount: '金额合计',
    col_ref_reason: '单号 / 领料事由',
    col_operator: '经办人',
    no_matching_movements: '未查询到符合条件的出入库记录。',

    import_card_title: 'Excel 台账导入与智能核对',
    import_card_subtitle: '结构化校验、异常清洗检测、原表总账核对及全流程可追溯。',
    source_file_verified: '源数据文件校验无误并导入',
    import_commit_success_title: '数据导入与库存核对完成！',
    import_commit_success_desc: 'B1 与 B2 仓库所有物料及数量均已同步入库，零差额、无损耗。',
    import_upload_box_title: '上传 Excel 更新台账',
    import_upload_box_desc: '支持 B1 warehouse stock, B2 warehouse stock 与 Sheet1 工作表。',
    btn_select_xlsx: '选择 .xlsx 文件',
    sheet_b1_tab: 'B1 warehouse stock 工作表',
    sheet_b2_tab: 'B2 warehouse stock 工作表',
    metric_analyzed_rows: '已解析行数',
    metric_valid_rows: '条有效行已采纳',
    metric_reconciled_qty: '已核对库存总量',
    metric_conform_original: '✓ 100% 与原表完全一致',
    metric_consolidated_dups: '合并同库位记录',
    metric_cumulated_bins: '按库位精准合并，零差错',
    metric_missing_codes: '无物料编码行',
    metric_temp_codes: '已自动分配临时物料编码',
    audit_report_title: '数据清洗与校验审计报告',
    col_excel_row: 'Excel 行号',
    col_anomaly_type: '异常类型',
    col_field: '异常字段',
    col_original_value: '原始数值',
    col_system_action: '系统处理规则',
    no_anomaly_detected: '此工作表未检测到任何异常数据。',

    export_view_title: 'Excel 数据导出与报表生成',
    export_view_subtitle: '一键生成并下载标准化、规范结构的 .xlsx 报表，可直接用于 Excel 统计。',
    export_global_title: '全库合并总库存 (B1 + B2)',
    export_global_desc: '导出全部仓库的所有物料，包含详细库位、单价、库存总量及货值估算。',
    export_b1_title: 'B1 仓库专属库存',
    export_b1_desc: '专用于 B1 仓库备件及阀门类物料的专属 Excel 报表。',
    export_b2_title: 'B2 仓库专属库存',
    export_b2_desc: '专用于 B2 仓库耗材、油漆、劳保与五金配件的专属 Excel 报表。',
    export_movements_title: '出入库流水全记录 (审计台账)',
    export_movements_desc: '包含完整出入库、领料人、审核人、单据号与精确时间戳的审计对账表。',
    export_global_meta: '1,524 条库存记录（含仓位、估值与可用数量）',
    export_b1_meta: 'MD01 库区（751 条仓位条目）',
    export_b2_meta: 'B2-01 至 B2-04 及 A、C、E 库区（773 条）',
    export_movements_meta: '含全部入库、出库、调拨与盘点调整',
    btn_download_stock_global: '下载全库总库存 (.xlsx)',
    btn_download_stock_b1: '下载 B1 仓库库存 (.xlsx)',
    btn_download_stock_b2: '下载 B2 仓库库存 (.xlsx)',
    btn_download_movements: '下载出入库明细流水 (.xlsx)',

    audit_view_title: '系统全量操作审计与追溯',
    audit_view_subtitle: '不可篡改的系统日志：入库、出库、调拨、盘点调账及台账导入。',
    audit_events_count: '条审计记录',
    search_audit_placeholder: '按描述、操作人、单据号搜索...',
    all_actions: '所有操作类型',
    col_target: '业务对象',
    col_desc_changes: '详细描述与变更',
    no_matching_audit: '未找到符合筛选条件的审计记录。',

    nav_transfers_title: '物料调拨',
    nav_transfers_subtitle: '在仓库或库位间调拨物料，系统原子化自动生成出库与入库关联凭证。',
    btn_new_transfer: '新建调拨',

    tab_shared_links: '共享链接',
    btn_generate_share_link: '生成共享链接',
    btn_share_this_view: '共享当前视图',
    share_modal_title: '生成安全数据共享链接',
    share_modal_subtitle: '创建具有自定义过滤条件和指定列权限的临时只读访问链接。',
    share_link_title_label: '共享链接名称 / 备注',
    share_link_title_placeholder: '例如：车间设备检修专用轴承清单',
    share_filter_warehouse: '目标仓库',
    share_filter_search: '物料编码 / 描述检索',
    share_filter_search_placeholder: '例如：Bearing, Valve, 密封圈...',
    share_filter_bin: '库位 / 排架 (BIN)',
    share_filter_bin_placeholder: '例如：MD01, B2-01, R12...',
    share_filter_status: '库存可用状态',
    share_filter_status_all: '全部状态',
    share_filter_status_in_stock: '仅看有货 (可用量 > 0)',
    share_filter_status_out_of_stock: '仅看缺货 (可用量 = 0)',
    share_filter_status_low_stock: '低库存预警 (≤ 5)',
    share_expiration_label: '有效时长',
    share_exp_15m: '15 分钟',
    share_exp_1h: '1 小时',
    share_exp_6h: '6 小时',
    share_exp_24h: '24 小时 (1天)',
    share_exp_3d: '3 天',
    share_exp_7d: '7 天',
    share_exp_custom: '自定义时长 (小时)',
    share_exp_custom_hours: '小时数',
    share_visible_columns_title: '访客可见字段设置',
    share_visible_columns_desc: '勾选允许访客查看的字段。单价及金额等敏感数据可按需隐藏。',
    share_matching_items_preview: '匹配物料预览',
    btn_create_link: '立即生成安全链接',
    share_link_created_success: '共享链接已成功生成！',
    share_link_url_label: '访客访问链接 (无需登录/免注册) :',
    btn_copy_link: '复制链接',
    link_copied_to_clipboard: '链接已成功复制到剪贴板！',
    shared_links_management_title: '临时数据共享链接管理',
    shared_links_management_subtitle: '监控访问记录、管理时效并在需要时立即撤回只读访问权限。',
    col_link_title: '共享标题 / 用途',
    col_link_token: '安全访问令牌 (Token)',
    col_link_filters: '配置过滤条件',
    col_link_created_at: '创建时间与创建人',
    col_link_expires_at: '过期时间',
    col_link_access_count: '访问量',
    col_link_status: '状态',
    status_active: '正常',
    status_expiring_soon: '即将到期',
    status_expired: '已到期',
    status_revoked: '已撤回',
    btn_view_public: '打开预览',
    btn_revoke_link: '撤回',
    btn_delete_link: '删除',
    confirm_revoke_link: '确定要立即撤回此共享链接吗？访客将立即无法查看任何数据。',
    confirm_delete_link: '确定要永久删除此共享记录吗？',
    link_revoked_success: '共享链接已撤销失效！',
    link_deleted_success: '共享链接记录已删除！',
    no_shared_links: '暂无共享链接记录。',
    shared_public_header_title: 'Warehouse 仓库 — 安全共享视图',
    shared_public_header_subtitle: '经仓库管理员授权开放的临时只读数据清单',
    shared_public_badge_readonly: '只读权限',
    shared_public_active_filters: '生效过滤条件',
    shared_public_expires_in: '剩余有效时间',
    shared_public_expired_title: '此共享链接已过期。',
    shared_public_expired_message: '管理员设定的有效期限已截止，请联系仓库管理人员重新获取链接。',
    shared_public_revoked_title: '此共享链接已被撤销。',
    shared_public_revoked_message: '仓库管理员已提前关闭该数据集的公开访问权限。',
    shared_public_not_found_title: '共享链接不存在或无效。',
    shared_public_not_found_message: '提供的安全令牌错误或该记录已被删除。',
    shared_public_items_count: '条授权物料',
    shared_public_search_within: '在当前授权物料中快速检索...',
    shared_public_back_to_app: '返回主系统',

    // Flexible Locations & Directory
    nav_locations_title: '库位与存储站点管理',
    nav_locations_subtitle: 'B1、B2仓库、集装箱、露天堆场、车间及临时周转区全貌目录。',
    btn_add_location: '新建库位/站点',
    btn_edit_location: '编辑',
    btn_delete_location: '删除',
    confirm_delete_location: '确定要删除该存储站点/库位吗？',
    location_created_success: '新存储站点创建成功！',
    location_updated_success: '存储站点已更新！',
    location_deleted_success: '存储站点已删除！',
    kpi_locations: '库位与站点总数',
    kpi_containers: '在用集装箱',
    kpi_recently_updated: '近期变动物料 (7天)',
    type_warehouse: '主仓库 / 库房',
    type_container: '集装箱柜',
    type_yard: '露天堆场 / 货场',
    type_workshop: '车间 / 工段',
    type_rack: '货架 / 排',
    type_shelf: '层板 / 层级',
    type_temporary: '临时暂存区',
    type_quarantine: '待检隔离区',
    type_office: '办公室 / 备品室',
    type_other: '其他自定义库位',
    field_location_type: '库位类型',
    field_location_code: '识别编码',
    field_location_name: '常用名称',
    field_physical_address: '实际物理位置 / 地标',
    field_description: '描述与用途说明',
    field_zone: '区域 / 分区',
    field_rack: '架位 (Rack)',
    field_shelf: '层级 (Shelf)',
    field_row: '行号 (Row)',
    field_position: '具体位置 (Position)',
    field_container_number: '集装箱号',
    field_location_notes: '存取备注',
    all_locations: '所有库位与站点',
    filter_by_type: '按类型筛选',
    filter_by_site: '按站点筛选',

    // Shared & Common Labels
    all: '全部',
    active_status: '启用',
    inactive_status: '停用',
    all_types: '所有类型',
    all_statuses: '所有状态',
    actions_col: '操作',
    reset_filters: '重置筛选',
    search_hint: '按编码 (B1, CONT-01...)、名称、地标、用途检索...',
    available_gt_zero: '仅看有货 (> 0)',
    low_stock_badge: '低库存',
    out_of_stock_badge: '已售罄/缺货',
    stock_lines_col: '库存项数',
    physical_units_col: '实物件数',
    total_value_col: '总货值金额',
    estimated_value: '预估总值',
    physical_landmark_col: '物理地标位置',
    location_desc_col: '库位名称与说明',
    view_stock_action: '查看库存',
    no_locations_matching: '未找到符合条件的库位或站点。',
    cannot_delete_core_warehouses: '核心主仓库 B1 与 B2 为系统基础数据，不可删除。',

    // Dashboard specifics
    kpi_usd_global: '全库总值 (USD)',
    kpi_unique_references: '种独立物料编码',
    kpi_accounted_units: '已入账总件数',
    kpi_containers_count_desc: '包含 {n} 个集装箱',
    kpi_units_available_limit: '≤ 5 件预警阈值',
    kpi_recent_movements_desc: '近期出入库流转',
    daily_operations_title: '今日出入库作业动态',
    stock_distribution_sites_title: '各站点与库位库存分布',
    stock_distribution_sites_desc: 'B1/B2 主库、存储集装箱、露天堆场与机修工段',
    site_location_name_col: '库位名称',
    site_location_code_col: '编码',
    site_location_type_col: '类型',
    catalog_items_listed: '项已列物料',
    total_stock_value_label: '库存总金额',

    // Navigation & Location Groups
    main_warehouses_group: '主仓库',
    containers_and_sites_group: '集装箱与专用堆场',
    all_sites_and_warehouses: '全部站点与仓库',
    all_site_types: '所有站点类型',
    other_sites_select: '更多站点...',
    verified_database_badge: '主数据库运行正常',
    sites_nav: '站点库位',

    // Inventory & Modals
    inventory_target_site: '待盘点站点库位 :',
    qty_cannot_be_negative: '盘点实物数量不能为负数',
    sub_location_toggle: '展开填写详细细分位置 (区域、集装箱、架位、层级...)',
    sub_location_dest_toggle: '展开填写目标细分库位 (区域、集装箱、架位...)',
    available_short_label: '可用',
    stock_item_select_label: '在库物料',
    requester_name_placeholder: '领料人姓名...',
    dest_bin_placeholder: '目的库位 (BIN)...',
    photo_attached_badge: '已上传实物照片',
    referenced_stock_locations_title: '在库分布库位',
    count_locations_suffix: '个库位',
    recent_movements_for_reference: '该物料近期出入库记录',

    // Location Modal specifics
    system_unique_id: '系统唯一识别码',
    specify_custom_type: '明确自定义库位类型',
    specify_custom_type_placeholder: '例: 防潮柜、安全防爆间...',
    operational_status_label: '运行状态',
    active_usable_for_stock: '正常启用 (可用于存放物料)',
    inactive_blocked: '停用 / 冻结',
    location_modal_create_desc: '登记新的仓库、集装箱、车间或堆场',

    // Share Modal specifics
    applied_filters_title: '已配置的物料过滤条件',
    select_all_columns: '全选字段',
    hide_prices_costs: '隐藏敏感单价/金额',
    hours_unit: '小时',
    days_unit: '天',
    consultations_label: '访问统计 :',
    visits_count: '次浏览',
    copy_public_link_title: '复制公开访问链接',
    search_links_placeholder: '按标题、令牌、创建人、关键词检索...',
    pagination_of: '共',
    search_by_bin_placeholder: '库位 / 货位...',
    no_stock_recorded_item: '该物料暂无库存记录。',
    adjustment_reason_placeholder: '调整原因说明...',
    audit_action_location_created: '新建仓位',
    audit_action_location_updated: '修改仓位',
    audit_action_location_deleted: '删除仓位',
    visible_columns_suffix: '个可见列',
    last_visit_label: '最近访问',
    share_link_success_desc: '此链接允许外部访客在免登录状态下以只读方式直接浏览已授权的数据。',
    security_token_label: '安全令牌',
    expiration_label: '有效期限',
    shared_items_count_label: '共享物料条目',
    items_suffix: '件物料',
    visible_columns_label: '可见字段',
    sensitive_cost_badge: '敏感成本',
    direct_readonly_access_desc: '免登录直接以只读方式查看',
    dept_placeholder: '例如：机修车间、动力科...',
    reason_placeholder: '例如：紧急抢修、设备维保...',
    source_article_available_location: '调出物料与可用仓位',
    shared_public_loading: '正在加载安全共享数据...',
    shared_public_footer_notice: 'WMS B1 & B2 • 安全且可追溯的临时公开只读视图',
    unit_days_short: '天',
    unit_hours_short: '小时',
    unit_minutes_short: '分',
    field_optional: '(可选)',
    error_reading_excel: '读取 Excel 文件时出错。',
    error_saving_location: '保存仓位信息时出错',
    location_code_required: '仓位/站点代码为必填项。',
    location_name_required: '仓位/站点名称为必填项。',
    placeholder_location_code: '例如: CONT-04, YARD-B, ATELIER-2',
    placeholder_location_name: '例如: 04号集装箱（重型配件），北区露天货场...',
    placeholder_physical_address: '例如: 南区 C 站台，2号门对面...',
    placeholder_location_desc: '例如: 存放待组装物料或备用配件。',
    excel_row_num: '第 {row} 行',
    autocomplete_no_results: '数据库中未找到匹配项',
    autocomplete_create_new: '新建并采用 « {value} »',
    autocomplete_similar_warning: '存在高度相似的已有值：',
    autocomplete_use_similar: '直接采用已有规范值',
    autocomplete_suggestions_count: '找到 {count} 条相关建议',
    autocomplete_press_enter: '按回车直接选择',

    // Issue Vouchers Module
    issues_title: '出库单管理',
    issues_desc: '物资出库数字化登记与纸质领料台账核销追踪',
    btn_new_issue_voucher: '+ 新建出库单',
    issue_voucher_number: '出库单号',
    issue_voucher_status: '状态',
    status_draft: '草稿',
    status_preparing: '配货中',
    status_ready: '待确认出库',
    status_confirmed: '已确认出库',
    status_cancelled: '已作废',
    issue_buyer_name: '领料人/采购员',
    issue_agent_name: '仓库管理员',
    issue_paper_book_signature: '纸质台账已签字',
    issue_paper_book_ref: '纸质台账编号/页码',
    issue_paper_book_ref_placeholder: '例如：4号台账 第18页',
    issue_items_count: '物资项数',
    issue_total_requested: '申请总数',
    issue_total_issued: '实发总数',
    issue_physical_verify_step: '实物核对',
    issue_physical_verify_desc: '现场核对实物型号与数量，并录入实际发料数',
    issue_qty_requested: '申请数量',
    issue_qty_actual: '实发数量',
    issue_summary_title: '出库核对清单',
    issue_summary_desc: '在纸质台账签字前，与领料人共同核对出库物资与数量',
    issue_confirm_dialog_title: '确认出库终审',
    issue_confirm_dialog_msg: '实物已核对无误且领料人已在纸质台账签字。是否确认完成出库？确认后系统库存将自动扣减。',
    issue_confirm_btn: '确认出库',
    issue_cancel_btn: '作废出库单',
    issue_stock_before: '出库前库存',
    issue_stock_after: '出库后库存',
    issue_paper_not_signed_warn: '确认出库前，请先勾选已在纸质台账签字确认。',
    issue_no_items_error: '请至少添加一种出库物资。',
    issue_item_already_added: '该物资与对应货位已添加到出库单中。',
    issue_step_header: '1. 基本信息',
    issue_step_materials: '2. 挑选物资',
    issue_step_verification: '3. 实物核验',
    issue_step_summary: '4. 清单与台账签字',
    kpi_confirmed_issues: '已确认出库',
    kpi_today_issues: '今日出库单',
    kpi_pending_issues: '进行中/待确认',
    kpi_total_units_issued: '累计出库件数',
    btn_print_voucher: '打印出库单',
    btn_view_voucher: '查看详情',
    btn_continue_preparation: '继续处理',
    voucher_confirmed_readonly_notice: '该出库单已确认归档，对应库存已扣减，内容为只读。',
    voucher_cancelled_notice: '该出库单已作废，未发生实际库存变动。',
    btn_add_material_to_issue: '添加到出库单',
    issue_diff_warning: '数量差异：实发数量与申请数量不一致',

    // Tablet Mode & QR Labels & Hover Preview
    btn_tablet_mode: '车间触控模式',
    btn_standard_mode: '标准桌面模式',
    tablet_mode_active: '现场触控模式已开启',
    tablet_scan_hint: '使用扫码枪扫描，或输入物料编码/库位...',
    barcode_scanner_detected: '扫码枪已识别代码：',
    btn_print_label: '标签与二维码',
    label_modal_title: '工业标签打印生成器',
    label_modal_desc: '打印适用于 Android 手机扫码的高精度条形码与二维码标签',
    label_type_material: '物料标签 (SAP编码)',
    label_type_location: '货架库位标签 (BIN)',
    label_preview_desc: '标准热敏标签 (50x30mm) 及 A4 格式支持',
    scan_on_android: '使用 WMS Android 客户端扫码',
    stock_in_other_locations: '其他库区与货位库存：',
    quick_actions_title: '快捷操作',

    // Warehouse Visual Tour
    visual_tour_title: '仓库实景漫游与现场巡检',
    visual_tour_subtitle: '沉浸式巡览各库区、货架、集装箱及户外堆场实景',
    btn_visual_tour: '实景巡览',
    tour_view_stock: '查看该库区在库物料',
    tour_angle_photo: '视角',
    tour_site_counter: '库区 {current} / {total}',

    // Material Visual Tour
    material_tour_title: '物料实物图谱与现场画廊',
    material_tour_subtitle: '以高清全景实物图浏览在库备件、五金工具与机械组件',
    btn_material_tour: '物料图谱漫游',
    btn_tour_item: '图谱漫游',
    tour_material_counter: '物资 {current} / {total}'
  }
};

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; flag: string; nativeName: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'zh', label: 'Mandarin', flag: '🇨🇳', nativeName: '中文' }
];

export const getTranslation = (lang: SupportedLanguage = 'fr'): TranslationDictionary => {
  return translations[lang] || translations.fr;
};
