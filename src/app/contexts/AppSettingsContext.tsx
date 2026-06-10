import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type TableDensity = 'comfortable' | 'compact';
export type CurrencyCode = 'USD' | 'EUR' | 'TRY' | 'GBP';
export type DateFormatCode = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type NumberFormatCode = 'en' | 'eu';

export interface AppSettings {
  density: TableDensity;
  currency: CurrencyCode;
  dateFormat: DateFormatCode;
  numberFormat: NumberFormatCode;
}

interface AppSettingsContextValue extends AppSettings {
  setDensity: (d: TableDensity) => void;
  setCurrency: (c: CurrencyCode) => void;
  setDateFormat: (f: DateFormatCode) => void;
  setNumberFormat: (f: NumberFormatCode) => void;
  formatNumber: (n: number, decimals?: number) => string;
  formatCurrency: (n: number) => string;
  formatDate: (d: Date | string) => string;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', TRY: '₺', GBP: '£' };

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('acs_settings');
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

const defaultSettings: AppSettings = {
  density: 'comfortable',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'en',
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const save = (next: AppSettings) => {
    setSettings(next);
    try { localStorage.setItem('acs_settings', JSON.stringify(next)); } catch {}
  };

  useEffect(() => {
    document.body.classList.toggle('density-compact', settings.density === 'compact');
    document.body.classList.toggle('density-comfortable', settings.density === 'comfortable');
  }, [settings.density]);

  const setDensity = (d: TableDensity) => save({ ...settings, density: d });
  const setCurrency = (c: CurrencyCode) => save({ ...settings, currency: c });
  const setDateFormat = (f: DateFormatCode) => save({ ...settings, dateFormat: f });
  const setNumberFormat = (f: NumberFormatCode) => save({ ...settings, numberFormat: f });

  const formatNumber = (n: number, decimals = 0): string => {
    if (settings.numberFormat === 'eu') {
      return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCurrency = (n: number): string => {
    const sym = CURRENCY_SYMBOLS[settings.currency];
    return `${sym}${formatNumber(n)}`;
  };

  const formatDate = (d: Date | string): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    if (settings.dateFormat === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
    if (settings.dateFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <AppSettingsContext.Provider value={{ ...settings, setDensity, setCurrency, setDateFormat, setNumberFormat, formatNumber, formatCurrency, formatDate }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}
