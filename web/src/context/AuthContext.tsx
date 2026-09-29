import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SupportedLanguage } from '@shared/types/models';
import { getTranslation, TranslationDictionary, LANGUAGE_OPTIONS } from '../lib/i18n';

export type TranslationFunction = ((key: keyof TranslationDictionary) => string) & TranslationDictionary;

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  selectedWarehouse: string; // 'ALL' | 'B1' | 'B2'
  setSelectedWarehouse: (wh: string) => void;
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationFunction;
  canOperateStock: boolean;
  canSupervise: boolean;
  canAdmin: boolean;
}

const DEFAULT_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'USR-ADMIN-01',
    employeeId: 'EMP-001',
    name: 'Landry (Admin)',
    email: 'admin@warehouse.internal',
    role: 'ADMIN',
    language: 'fr',
    warehouseAccess: ['B1', 'B2'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  SUPERVISOR: {
    id: 'USR-SUP-02',
    employeeId: 'EMP-002',
    name: 'Chef d\'Équipe (Supervisor)',
    email: 'supervisor@warehouse.internal',
    role: 'SUPERVISOR',
    language: 'fr',
    warehouseAccess: ['B1', 'B2'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  STOREKEEPER: {
    id: 'USR-STORE-03',
    employeeId: 'EMP-003',
    name: 'Magasinier B1 & B2',
    email: 'storekeeper@warehouse.internal',
    role: 'STOREKEEPER',
    language: 'fr',
    warehouseAccess: ['B1', 'B2'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  VIEWER: {
    id: 'USR-VIEW-04',
    employeeId: 'EMP-004',
    name: 'Observateur / Audit',
    email: 'viewer@warehouse.internal',
    role: 'VIEWER',
    language: 'en',
    warehouseAccess: ['B1', 'B2'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');

  // App-level global language: persistent across roles and page reloads
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const savedAppLang = localStorage.getItem('wms_app_language') as SupportedLanguage | null;
      if (savedAppLang === 'fr' || savedAppLang === 'en' || savedAppLang === 'zh') {
        return savedAppLang;
      }
      const legacyLang = localStorage.getItem('wms_language') as SupportedLanguage | null;
      if (legacyLang === 'fr' || legacyLang === 'en' || legacyLang === 'zh') {
        return legacyLang;
      }
      const savedUserLang = localStorage.getItem('wms_user_lang_USR-ADMIN-01') as SupportedLanguage | null;
      if (savedUserLang === 'fr' || savedUserLang === 'en' || savedUserLang === 'zh') {
        return savedUserLang;
      }
    } catch (e) {}
    return 'fr';
  });

  const [usersState, setUsersState] = useState<Record<UserRole, User>>(() => {
    const initial = { ...DEFAULT_USERS };
    try {
      (Object.keys(initial) as UserRole[]).forEach((role) => {
        initial[role] = { ...initial[role], language: currentLanguage };
      });
    } catch (e) {}
    return initial;
  });

  // Ensure HTML element lang attribute matches currentLanguage
  useEffect(() => {
    try {
      document.documentElement.lang = currentLanguage;
    } catch (e) {}
  }, [currentLanguage]);

  const currentUser = {
    ...usersState[currentRole],
    language: currentLanguage
  };

  const dictionary = getTranslation(currentLanguage);
  const t: TranslationFunction = React.useMemo(() => {
    return Object.assign(
      (key: keyof TranslationDictionary) => dictionary[key] || (key as string),
      dictionary
    );
  }, [currentLanguage]);

  const canAdmin = currentRole === 'ADMIN';
  const canSupervise = currentRole === 'ADMIN' || currentRole === 'SUPERVISOR';
  const canOperateStock = currentRole === 'ADMIN' || currentRole === 'SUPERVISOR' || currentRole === 'STOREKEEPER';

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('wms_app_language', lang);
      localStorage.setItem('wms_language', lang);
      document.documentElement.lang = lang;
    } catch (e) {}

    // Synchronize all user roles so role changes never revert the chosen language
    setUsersState((prev) => {
      const updated: Record<UserRole, User> = { ...prev };
      (Object.keys(updated) as UserRole[]).forEach((role) => {
        updated[role] = {
          ...updated[role],
          language: lang,
          updatedAt: new Date().toISOString()
        };
        try {
          localStorage.setItem(`wms_user_lang_${updated[role].id}`, lang);
        } catch (e) {}
      });
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        selectedWarehouse,
        setSelectedWarehouse,
        currentLanguage,
        setLanguage,
        t,
        canOperateStock,
        canSupervise,
        canAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
