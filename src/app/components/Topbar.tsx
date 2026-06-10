import { useRef, useState, useEffect, useCallback } from 'react';
import { Search, Bell, Sun, Moon, Circle, ChevronDown, X } from 'lucide-react';
import type { PageId } from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import { NotificationPanel } from './NotificationPanel';

const PAGE_TITLES: Record<PageId, { title: string; breadcrumb: string }> = {
  'dashboard':      { title: 'Dashboard',       breadcrumb: 'Industrial Scout / Overview' },
  'new-scout':      { title: 'New Scout',        breadcrumb: 'Industrial Scout / Mission' },
  'campaigns':      { title: 'Campaigns',        breadcrumb: 'Industrial Scout / Campaigns' },
  'companies-db':   { title: 'Companies DB',     breadcrumb: 'Industrial Scout / Database' },
  'scheduler':      { title: 'Scheduler',        breadcrumb: 'Industrial Scout / Automation' },
  'analytics':      { title: 'Analytics',        breadcrumb: 'Industrial Scout / Intelligence' },
  'web-scout':      { title: 'Web Scout',        breadcrumb: 'Web Opportunities / Mission' },
  'broken-sites':   { title: 'Broken Sites',     breadcrumb: 'Web Opportunities / Monitoring' },
  'outreach-queue': { title: 'Outreach Queue',   breadcrumb: 'Web Opportunities / Outreach' },
  'deals-pipeline': { title: 'Deals Pipeline',   breadcrumb: 'Web Opportunities / Pipeline' },
  'export-center':  { title: 'Export Center',    breadcrumb: 'Tools / Export' },
  'api-keys':       { title: 'API Keys',         breadcrumb: 'Tools / Configuration' },
  'settings':       { title: 'Settings',         breadcrumb: 'Tools / Settings' },
};

const NAV_PAGES: Array<{ id: PageId; label: string; keywords: string[] }> = [
  { id: 'dashboard',      label: 'Dashboard',         keywords: ['dash', 'home', 'overview'] },
  { id: 'new-scout',      label: 'New Scout',          keywords: ['scout', 'new', 'mission', 'search'] },
  { id: 'campaigns',      label: 'Campaigns',          keywords: ['camp', 'campaign'] },
  { id: 'companies-db',   label: 'Companies DB',       keywords: ['companies', 'db', 'database', 'company'] },
  { id: 'scheduler',      label: 'Scheduler',          keywords: ['sched', 'schedule', 'auto', 'job'] },
  { id: 'analytics',      label: 'Analytics',          keywords: ['ana', 'analytic', 'insight', 'intel'] },
  { id: 'web-scout',      label: 'Web Scout',          keywords: ['web', 'website'] },
  { id: 'broken-sites',   label: 'Broken Sites',       keywords: ['broken', 'site'] },
  { id: 'outreach-queue', label: 'Outreach Queue',     keywords: ['outreach', 'queue', 'contact'] },
  { id: 'deals-pipeline', label: 'Deals Pipeline',     keywords: ['deal', 'pipeline', 'kanban'] },
  { id: 'export-center',  label: 'Export Center',      keywords: ['export', 'download', 'csv'] },
  { id: 'api-keys',       label: 'API Keys',           keywords: ['api', 'key', 'token'] },
  { id: 'settings',       label: 'Settings',           keywords: ['setting', 'config', 'prefs'] },
];

interface TopbarProps {
  activePage: PageId;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigate: (page: PageId) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  unreadCount?: number;
}

export function Topbar({ activePage, theme, onToggleTheme, onNavigate, searchInputRef, unreadCount = 3 }: TopbarProps) {
  const { title, breadcrumb } = PAGE_TITLES[activePage];
  const { t, lang, setLang, langMeta } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('acs_recent_searches') || '[]'); } catch { return []; }
  });

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const activeSearchRef = (searchInputRef as React.RefObject<HTMLInputElement>) ?? internalSearchRef;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    const next = [q, ...recentSearches.filter(r => r !== q)].slice(0, 5);
    setRecentSearches(next);
    try { localStorage.setItem('acs_recent_searches', JSON.stringify(next)); } catch {}
  }, [recentSearches]);

  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem('acs_recent_searches'); } catch {}
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      saveSearch(searchValue.trim());
      // Navigate to matching page
      const match = NAV_PAGES.find(p =>
        p.keywords.some(k => searchValue.toLowerCase().includes(k)) ||
        p.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      if (match) { onNavigate(match.id); setSearchValue(''); setSearchFocused(false); }
    }
    if (e.key === 'Escape') { setSearchFocused(false); setSearchValue(''); }
  };

  const navSuggestions = searchValue
    ? NAV_PAGES.filter(p =>
        p.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.keywords.some(k => searchValue.toLowerCase().includes(k) || k.includes(searchValue.toLowerCase()))
      )
    : [];

  const showDropdown = searchFocused && (recentSearches.length > 0 || navSuggestions.length > 0);

  return (
    <div style={{
      height: 60,
      background: 'var(--ac-bg-main)',
      borderBottom: '1px solid var(--ac-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Left: Title + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '0 0 auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ac-text-primary)', whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ color: 'var(--ac-text-muted)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 12, color: 'var(--ac-text-muted)', whiteSpace: 'nowrap' }}>{breadcrumb}</span>
      </div>

      {/* Center: Search */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div ref={searchRef} style={{ position: 'relative', width: 320 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--ac-bg-input)',
            border: `1px solid ${searchFocused ? 'var(--ac-border-gold)' : 'var(--ac-border-med)'}`,
            borderRadius: 6,
            padding: '6px 12px',
          }}>
            <Search size={14} style={{ color: 'var(--ac-text-muted)', flexShrink: 0 }} />
            <input
              ref={activeSearchRef}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKey}
              placeholder={t('common.searchCompanies')}
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontFamily: 'var(--ac-font-ui)', fontSize: 13,
                color: 'var(--ac-text-primary)', width: '100%',
              }}
            />
            {searchValue && (
              <button
                onClick={() => { setSearchValue(''); activeSearchRef.current?.focus(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 0, flexShrink: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: 'var(--ac-bg-card)',
              border: '1px solid var(--ac-border-med)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {recentSearches.length > 0 && !searchValue && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ac-text-muted)' }}>
                    <span>{t('search.recent')}</span>
                    <button onClick={clearRecent} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--ac-gold)' }}>
                      {t('search.clearRecent')}
                    </button>
                  </div>
                  {recentSearches.map(r => (
                    <div key={r}
                      onClick={() => { setSearchValue(r); activeSearchRef.current?.focus(); }}
                      style={{ padding: '7px 12px', fontSize: 13, color: 'var(--ac-text-sec)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <Search size={12} style={{ color: 'var(--ac-text-muted)' }} />
                      {r}
                    </div>
                  ))}
                </div>
              )}
              {navSuggestions.length > 0 && (
                <div>
                  <div style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ac-text-muted)' }}>
                    {t('search.quickNav')}
                  </div>
                  {navSuggestions.slice(0, 5).map(p => (
                    <div key={p.id}
                      onClick={() => { saveSearch(searchValue); onNavigate(p.id); setSearchValue(''); setSearchFocused(false); }}
                      style={{ padding: '7px 12px', fontSize: 13, color: 'var(--ac-text-sec)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ color: 'var(--ac-gold)', fontSize: 12 }}>→</span>
                      {p.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Status + Notifications + Lang + Theme + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* API Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ac-success)', whiteSpace: 'nowrap' }}>
          <Circle size={8} fill="currentColor" />
          <span>{t('topbar.apiConnected')}</span>
        </div>

        {/* Language switcher */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: '1px solid var(--ac-border)',
              borderRadius: 6, cursor: 'pointer',
              color: 'var(--ac-text-sec)', padding: '4px 8px',
              fontSize: 12, fontFamily: 'var(--ac-font-ui)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>{langMeta.flag}</span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--ac-font-mono)' }}>{langMeta.code.toUpperCase()}</span>
            <ChevronDown size={10} />
          </button>

          {langOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: 'var(--ac-bg-card)',
              border: '1px solid var(--ac-border-med)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 200,
              minWidth: 160,
              overflow: 'hidden',
            }}>
              {LANGUAGES.map(l => (
                <div
                  key={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 14px', cursor: 'pointer',
                    fontSize: 13, color: lang === l.code ? 'var(--ac-gold)' : 'var(--ac-text-sec)',
                    background: lang === l.code ? 'rgba(200,168,75,0.08)' : 'none',
                    fontWeight: lang === l.code ? 500 : 400,
                  }}
                  onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'var(--ac-bg-hover)'; }}
                  onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'none'; }}
                >
                  <span>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.name}</span>
                  {lang === l.code && <span style={{ fontSize: 10, color: 'var(--ac-gold)' }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ac-text-sec)', padding: 6, borderRadius: 6,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--ac-danger)', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unreadCount}</span>
            )}
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ac-text-sec)', padding: 6, borderRadius: 6,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(200,168,75,0.2)',
          border: '2px solid var(--ac-border-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--ac-font-display)', fontSize: 11, fontWeight: 700,
          color: 'var(--ac-gold)', cursor: 'pointer',
        }}>
          AS
        </div>
      </div>
    </div>
  );
}
