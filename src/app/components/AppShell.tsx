import { useState, useEffect } from 'react';
import { Sidebar, type PageId } from './Sidebar';
import { Topbar } from './Topbar';
import { useLanguage } from '../contexts/LanguageContext';

interface AppShellProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  children: React.ReactNode;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  onOpenChangelog?: () => void;
  showWhatsNew?: boolean;
}

export function AppShell({ activePage, onNavigate, theme, onToggleTheme, children, searchInputRef, onOpenChangelog, showWhatsNew }: AppShellProps) {
  const { isRTL } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isMobile = windowWidth < 1024;
  const isIconOnly = windowWidth >= 1024 && windowWidth < 1280;
  const sidebarWidth = isMobile ? 0 : isIconOnly ? 64 : 240;
  const marginProp = isRTL ? 'marginRight' : 'marginLeft';

  return (
    <div className="ac-app" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        onOpenChangelog={onOpenChangelog}
        showWhatsNew={showWhatsNew}
      />
      <div style={{
        [marginProp]: sidebarWidth,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin 200ms ease',
        minWidth: 0,
      }}>
        <Topbar
          activePage={activePage}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onNavigate={onNavigate}
          searchInputRef={searchInputRef}
        />
        <main style={{ flex: 1, padding: 24, background: 'var(--ac-bg-main)' }} className="ac-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
