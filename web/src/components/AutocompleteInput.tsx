import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { AutocompleteFieldType, AutocompleteSuggestion, AutocompleteResult } from '@shared/types/models';
import { AlertTriangle, Plus, CornerDownLeft } from 'lucide-react';

export interface AutocompleteInputProps {
  field: AutocompleteFieldType;
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: AutocompleteSuggestion) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  uppercase?: boolean;
  fontMono?: boolean;
  limit?: number;
  showDuplicateWarning?: boolean;
  allowCreateNew?: boolean;
  icon?: React.ReactNode;
  autoFocus?: boolean;
  name?: string;
  id?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  field,
  value,
  onChange,
  onSelectSuggestion,
  placeholder,
  className = '',
  inputClassName = '',
  required = false,
  disabled = false,
  uppercase = false,
  fontMono = false,
  limit = 8,
  showDuplicateWarning = true,
  allowCreateNew = true,
  icon,
  autoFocus = false,
  name,
  id
}) => {
  const { t } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [result, setResult] = useState<AutocompleteResult>({
    suggestions: [],
    isExactMatch: false,
    totalMatches: 0
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update autocomplete query whenever field or value changes
  useEffect(() => {
    const res = dataService.getAutocompleteSuggestions(field, value, limit);
    setResult(res);
    setHighlightedIndex(-1);
  }, [field, value, limit]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (uppercase) newVal = newVal.toUpperCase();
    onChange(newVal);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (s: AutocompleteSuggestion) => {
    onChange(s.value);
    if (onSelectSuggestion) {
      onSelectSuggestion(s);
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleCreateNew = (valToCreate: string) => {
    const trimmed = valToCreate.trim();
    if (!trimmed) return;
    dataService.recordCustomValue(field, trimmed);
    onChange(trimmed);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
      return;
    }

    const totalItems = result.suggestions.length + (allowCreateNew && !result.isExactMatch && value.trim() ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 >= totalItems ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 < 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < result.suggestions.length) {
        e.preventDefault();
        handleSelect(result.suggestions[highlightedIndex]);
      } else if (highlightedIndex === result.suggestions.length && allowCreateNew && !result.isExactMatch && value.trim()) {
        e.preventDefault();
        handleCreateNew(value);
      } else if (result.suggestions.length === 1 && !result.isExactMatch) {
        // Optional: auto-pick if only 1 match
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showSimilarWarning = 
    showDuplicateWarning && 
    result.similarExistingValue && 
    result.similarExistingValue.toLowerCase() !== value.trim().toLowerCase();

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          className={`w-full bg-white border border-zinc-300 text-zinc-900 rounded focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors text-xs py-2 ${
            icon ? 'pl-8' : 'px-3'
          } ${fontMono ? 'font-mono' : ''} ${uppercase ? 'uppercase' : ''} ${inputClassName}`}
        />
      </div>

      {/* Near-duplicate warning badge (inline below input or in dropdown) */}
      {showSimilarWarning && (
        <div className="mt-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between gap-2 text-[11px] text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              {t.autocomplete_similar_warning}
              <strong className="font-mono font-bold text-zinc-900 ml-1">{result.similarExistingValue}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (result.similarExistingValue) {
                onChange(result.similarExistingValue);
                // Also trigger selection if suggestion exists
                const matched = result.suggestions.find(s => s.value === result.similarExistingValue);
                if (matched && onSelectSuggestion) onSelectSuggestion(matched);
                setIsOpen(false);
              }
            }}
            className="shrink-0 text-[10px] font-semibold bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded transition-colors"
          >
            {t.autocomplete_use_similar}
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (result.suggestions.length > 0 || (allowCreateNew && value.trim() && !result.isExactMatch)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-300 rounded shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-zinc-100 animate-fadeIn">
          {result.suggestions.map((s, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                type="button"
                key={`${s.value}-${idx}`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                  isHighlighted ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`truncate font-semibold ${fontMono ? 'font-mono' : ''}`}>
                      {s.label}
                    </span>
                    {s.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 font-mono shrink-0">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  {s.subLabel && (
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                      {s.subLabel}
                    </div>
                  )}
                </div>

                {isHighlighted && (
                  <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
              </button>
            );
          })}

          {/* Option to create a new value if not an exact match */}
          {allowCreateNew && !result.isExactMatch && value.trim() && (
            <button
              type="button"
              onMouseEnter={() => setHighlightedIndex(result.suggestions.length)}
              onClick={() => handleCreateNew(value)}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 border-t border-zinc-200 transition-colors ${
                highlightedIndex === result.suggestions.length
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {t.autocomplete_create_new} <strong className="font-mono">« {value.trim()} »</strong>
                </span>
              </div>
              <span className="text-[10px] opacity-70 shrink-0 font-mono">
                {t.autocomplete_press_enter}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
