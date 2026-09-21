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
  const [usersState, setUsersState] = useState<Record<UserRole, User>>(() => {
    // Restore saved language per user from localStorage if available
    const initial = { ...DEFAULT_USERS };
    try {
      (Object.keys(initial) as UserRole[]).forEach((role) => {
        const savedLang = localStorage.getItem(`wms_user_lang_${initial[role].id}`) as SupportedLanguage | null;
        if (savedLang && (savedLang === 'fr' || savedLang === 'en' || savedLang === 'zh')) {
          initial[role] = { ...initial[role], language: savedLang };
        }
      });
    } catch (e) {
      // localStorage unavailable or restricted
    }
    return initial;
  });

  const currentUser = usersState[currentRole];
  const currentLanguage: SupportedLanguage = currentUser.language || 'fr';
  const dictionary = getTranslation(currentLanguage);
  const t: TranslationFunction = Object.assign(
    (key: keyof TranslationDictionary) => dictionary[key] || (key as string),
    dictionary
  );

  const canAdmin = currentRole === 'ADMIN';
  const canSupervise = currentRole === 'ADMIN' || currentRole === 'SUPERVISOR';
  const canOperateStock = currentRole === 'ADMIN' || currentRole === 'SUPERVISOR' || currentRole === 'STOREKEEPER';

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setUsersState((prev) => {
      const updatedUser = {
        ...prev[currentRole],
        language: lang,
        updatedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(`wms_user_lang_${updatedUser.id}`, lang);
      } catch (e) {
        // ignore
      }
      return {
        ...prev,
        [currentRole]: updatedUser
      };
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
