import React, { useState, useEffect } from 'react';
import { StorageLocation, LocationType, User } from '@shared/types/models';
import { dataService } from '../lib/dataService';
import { TranslationDictionary } from '../lib/i18n';
import { X, MapPin } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  locationToEdit?: StorageLocation | null;
  currentUser: User;
  t: TranslationDictionary;
}

const LOCATION_TYPES: { type: LocationType; labelKey: keyof TranslationDictionary }[] = [
  { type: 'WAREHOUSE', labelKey: 'type_warehouse' },
  { type: 'CONTAINER', labelKey: 'type_container' },
  { type: 'YARD', labelKey: 'type_yard' },
  { type: 'WORKSHOP', labelKey: 'type_workshop' },
  { type: 'RACK', labelKey: 'type_rack' },
  { type: 'SHELF', labelKey: 'type_shelf' },
  { type: 'TEMPORARY', labelKey: 'type_temporary' },
  { type: 'QUARANTINE', labelKey: 'type_quarantine' },
  { type: 'OFFICE', labelKey: 'type_office' },
  { type: 'OTHER', labelKey: 'type_other' },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  locationToEdit,
  currentUser,
  t
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('WAREHOUSE');
  const [customTypeName, setCustomTypeName] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (locationToEdit) {
      setCode(locationToEdit.code);
      setName(locationToEdit.name);
      setType(locationToEdit.type);
      setCustomTypeName(locationToEdit.customTypeName || '');
      setPhysicalLocation(locationToEdit.physicalLocation || '');
      setDescription(locationToEdit.description || '');
      setImageUrl(locationToEdit.imageUrl || '');
      setStatus(locationToEdit.status);
    } else {
      setCode('');
      setName('');
      setType('WAREHOUSE');
      setCustomTypeName('');
      setPhysicalLocation('');
      setDescription('');
      setImageUrl('');
      setStatus('ACTIVE');
    }
    setError(null);
  }, [locationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setError(t.location_code_required);
      return;
    }
    if (!trimmedName) {
      setError(t.location_name_required);
      return;
    }

    try {
      setSubmitting(true);
      if (locationToEdit) {
        dataService.updateLocation(locationToEdit.id, {
          name: trimmedName,
          type,
          customTypeName: type === 'OTHER' ? customTypeName.trim() : undefined,
          physicalLocation: physicalLocation.trim() || undefined,
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          status
        }, currentUser);
      } else {
        dataService.createLocation({
          code: trimmedCode,
          name: trimmedName,
          type,
          customTypeName: type === 'OTHER' ? customTypeName.trim() : undefined,
          physicalLocation: physicalLocation.trim() || undefined,
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          status
        }, currentUser);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || t.error_saving_location);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-zinc-300 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-zinc-900 text-white rounded">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                {locationToEdit ? t.btn_edit_location : t.btn_add_location}
              </h3>
              <p className="text-xs text-zinc-500">
                {locationToEdit ? locationToEdit.code : t.location_modal_create_desc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                {t.field_location_code} *
              </label>
              <AutocompleteInput
                field="warehouseId"
                value={code}
                onChange={setCode}
                disabled={!!locationToEdit}
                placeholder={t.placeholder_location_code}
                uppercase
                fontMono
                required
                inputClassName="text-sm py-2 disabled:bg-zinc-100 disabled:text-zinc-500"
              />
              <span className="text-[11px] text-zinc-400">{t.system_unique_id}</span>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                {t.field_location_type} *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LocationType)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              >
                {LOCATION_TYPES.map(lt => (
                  <option key={lt.type} value={lt.type}>
                    {t[lt.labelKey] as string}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Type Name (if OTHER) */}
          {type === 'OTHER' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                {t.specify_custom_type}
              </label>
              <input
                type="text"
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder={t.specify_custom_type_placeholder}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          )}

          {/* Common Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              {t.field_location_name} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.placeholder_location_name}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              required
            />
          </div>

          {/* Physical Location */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              {t.field_physical_address}
            </label>
            <AutocompleteInput
              field="physicalLocation"
              value={physicalLocation}
              onChange={setPhysicalLocation}
              placeholder={t.placeholder_physical_address}
              inputClassName="text-sm py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              {t.field_description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t.placeholder_location_desc}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none resize-none"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Photo du magasin / site (URL) <span className="text-zinc-400 font-normal">({t.field_optional})</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... ou URL directe"
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              {t.operational_status_label}
            </label>
            <div className="flex items-center space-x-4 pt-1">
              <label className="flex items-center space-x-2 text-sm text-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={status === 'ACTIVE'}
                  onChange={() => setStatus('ACTIVE')}
                  className="text-zinc-900 focus:ring-zinc-900"
                />
                <span>{t.active_usable_for_stock}</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="INACTIVE"
                  checked={status === 'INACTIVE'}
                  onChange={() => setStatus('INACTIVE')}
                  className="text-zinc-900 focus:ring-zinc-900"
                />
                <span>{t.inactive_blocked}</span>
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors"
            >
              {t.btn_cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {locationToEdit ? t.btn_save : t.btn_confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
