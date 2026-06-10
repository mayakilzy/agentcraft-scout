import { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from './components/AppShell';
import { PlaceholderPage } from './components/pages/PlaceholderPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { NewScoutPage } from './components/pages/NewScoutPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { WebScoutPage } from './components/pages/WebScoutPage';
import { BrokenSitesPage } from './components/pages/BrokenSitesPage';
import { OutreachQueuePage } from './components/pages/OutreachQueuePage';
import { DealsPipelinePage } from './components/pages/DealsPipelinePage';
import { CampaignsPage } from './components/pages/CampaignsPage';
import { CompaniesDBPage } from './components/pages/CompaniesDBPage';
import { SchedulerPage } from './components/pages/SchedulerPage';
import { ExportCenterPage } from './components/pages/ExportCenterPage';
import { ApiKeysPage } from './components/pages/ApiKeysPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ChangelogModal } from './components/ChangelogModal';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import type { PageId } from './components/Sidebar';

const PAGE_LABELS: Record<PageId, string> = {
  'dashboard':      'Dashboard',
  'new-scout':      'New Scout Mission',
  'campaigns':      'Campaigns',
  'companies-db':   'Companies Database',
  'scheduler':      'Scheduler',
  'analytics':      'Analytics & Intelligence',
  'web-scout':      'Web Scout',
  'broken-sites':   'Broken Sites',
  'outreach-queue': 'Outreach Queue',
  'deals-pipeline': 'Deals Pipeline',
  'export-center':  'Export Center',
  'api-keys':       'API Keys',
  'settings':       'Settings',
};

function AppInner() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    return 'dashboard';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('acs_theme') as 'dark' | 'light') || 'dark';
    } catch { return 'dark'; }
  });

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showShortcutsHint, setShowShortcutsHint] = useState(() => {
    try { return !localStorage.getItem('acs_hint_seen'); } catch { return true; }
  });
  const [showWhatsNew] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persist theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('light-theme', theme === 'light');
    try { localStorage.setItem('acs_theme', theme); } catch {}
  }, [theme]);

  // Update document title
  useEffect(() => {
    document.title = `${PAGE_LABELS[activePage]} — AgentCraft Scout`;
  }, [activePage]);

  const navigate = useCallback((page: PageId) => {
    setActivePage(page);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // ? key — show shortcuts
      if (!inInput && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(s => !s);
        return;
      }
      // Ctrl+/ — show shortcuts
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(s => !s);
        return;
      }
      // Escape — close modals
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowChangelog(false);
        return;
      }
      if (!e.ctrlKey) return;

      switch (e.key) {
        case '1': e.preventDefault(); navigate('dashboard'); break;
        case '2': e.preventDefault(); navigate('new-scout'); break;
        case '3': e.preventDefault(); navigate('campaigns'); break;
        case '4': e.preventDefault(); navigate('companies-db'); break;
        case 'k': case 'K':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'n': case 'N':
          e.preventDefault();
          navigate('new-scout');
          break;
        case 'e': case 'E':
          e.preventDefault();
          navigate('export-center');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const dismissHint = () => {
    setShowShortcutsHint(false);
    try { localStorage.setItem('acs_hint_seen', '1'); } catch {}
  };

  return (
    <AppShell
      activePage={activePage}
      onNavigate={navigate}
      theme={theme}
      onToggleTheme={toggleTheme}
      searchInputRef={searchInputRef}
      onOpenChangelog={() => setShowChangelog(true)}
      showWhatsNew={showWhatsNew}
    >
      <div className="ac-page-enter" key={activePage}>
        {activePage === 'dashboard' ? (
          <DashboardPage onNavigate={navigate} />
        ) : activePage === 'new-scout' ? (
          <NewScoutPage />
        ) : activePage === 'analytics' ? (
          <AnalyticsPage onNavigate={navigate} />
        ) : activePage === 'web-scout' ? (
          <WebScoutPage />
        ) : activePage === 'broken-sites' ? (
          <BrokenSitesPage onNavigate={navigate} />
        ) : activePage === 'outreach-queue' ? (
          <OutreachQueuePage />
        ) : activePage === 'deals-pipeline' ? (
          <DealsPipelinePage onNavigate={navigate} />
        ) : activePage === 'campaigns' ? (
          <CampaignsPage onNavigate={navigate} />
        ) : activePage === 'companies-db' ? (
          <CompaniesDBPage onNavigate={navigate} />
        ) : activePage === 'scheduler' ? (
          <SchedulerPage />
        ) : activePage === 'export-center' ? (
          <ExportCenterPage />
        ) : activePage === 'api-keys' ? (
          <ApiKeysPage />
        ) : activePage === 'settings' ? (
          <SettingsPage />
        ) : (
          <PlaceholderPage
            title={PAGE_LABELS[activePage]}
            description="Coming soon — this page will be implemented in its designated build phase."
          />
        )}
      </div>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* Changelog modal */}
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}

      {/* Shortcuts hint — bottom-left, first load only */}
      {showShortcutsHint && (
        <div
          onClick={() => { setShowShortcuts(true); dismissHint(); }}
          style={{
            position: 'fixed', bottom: 20, left: 20, zIndex: 90,
            background: 'var(--ac-bg-card)',
            border: '1px solid var(--ac-border-gold)',
            borderRadius: 8, padding: '7px 14px',
            fontSize: 12, color: 'var(--ac-text-sec)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            animation: 'ac-fadeIn 300ms ease',
          }}
        >
          <span style={{ fontFamily: 'var(--ac-font-mono)', fontSize: 11, color: 'var(--ac-gold)', background: 'rgba(200,168,75,0.15)', padding: '2px 6px', borderRadius: 4 }}>?</span>
          Press ? for shortcuts
          <button
            onClick={e => { e.stopPropagation(); dismissHint(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 0, marginLeft: 4, fontSize: 14, lineHeight: 1 }}
          >×</button>
        </div>
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppSettingsProvider>
        <AppInner />
      </AppSettingsProvider>
    </LanguageProvider>
  );
}
