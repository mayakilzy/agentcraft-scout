import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Search, FolderOpen, Building2, CalendarClock, BarChart2,
  Globe, AlertTriangle, Send, TrendingUp, Download, Key, Settings,
  Radar, ChevronLeft, ChevronRight, Sparkles, Menu,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type PageId =
  | 'dashboard' | 'new-scout' | 'campaigns' | 'companies-db' | 'scheduler' | 'analytics'
  | 'web-scout' | 'broken-sites' | 'outreach-queue' | 'deals-pipeline'
  | 'export-center' | 'api-keys' | 'settings';

interface NavItem {
  id: PageId;
  icon: React.ReactNode;
  labelKey: string;
  badge?: { value: string | number; color: 'gold' | 'danger' };
  dot?: 'live';
}

const INDUSTRIAL: NavItem[] = [
  { id: 'dashboard',    icon: <LayoutDashboard size={16} />, labelKey: 'nav.dashboard' },
  { id: 'new-scout',   icon: <Search size={16} />,          labelKey: 'nav.newScout',    dot: 'live' },
  { id: 'campaigns',   icon: <FolderOpen size={16} />,      labelKey: 'nav.campaigns',   badge: { value: 12,  color: 'gold' } },
  { id: 'companies-db',icon: <Building2 size={16} />,       labelKey: 'nav.companiesDb', badge: { value: 847, color: 'gold' } },
  { id: 'scheduler',   icon: <CalendarClock size={16} />,   labelKey: 'nav.scheduler' },
  { id: 'analytics',   icon: <BarChart2 size={16} />,       labelKey: 'nav.analytics' },
];

const WEB: NavItem[] = [
  { id: 'web-scout',      icon: <Globe size={16} />,         labelKey: 'nav.webScout' },
  { id: 'broken-sites',   icon: <AlertTriangle size={16} />, labelKey: 'nav.brokenSites',    badge: { value: 34, color: 'danger' } },
  { id: 'outreach-queue', icon: <Send size={16} />,          labelKey: 'nav.outreachQueue' },
  { id: 'deals-pipeline', icon: <TrendingUp size={16} />,    labelKey: 'nav.dealsPipeline' },
];

const TOOLS: NavItem[] = [
  { id: 'export-center', icon: <Download size={16} />, labelKey: 'nav.exportCenter' },
  { id: 'api-keys',      icon: <Key size={16} />,      labelKey: 'nav.apiKeys' },
  { id: 'settings',      icon: <Settings size={16} />, labelKey: 'nav.settings' },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenChangelog?: () => void;
  showWhatsNew?: boolean;
}

function NavItem({
  item, active, collapsed, onNavigate, onOpenChangelog, showWhatsNewDot,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: (id: PageId) => void;
  onOpenChangelog?: () => void;
  showWhatsNewDot?: boolean;
}) {
  const { t, isRTL } = useLanguage();
  const [tooltip, setTooltip] = useState(false);
  const label = t(item.labelKey as any);

  const isSettings = item.id === 'settings';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => onNavigate(item.id)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '10px 0' : '8px 16px',
          border: 'none',
          borderLeft: (!isRTL && active) ? '3px solid var(--ac-gold)' : (!isRTL ? '3px solid transparent' : 'none'),
          borderRight: (isRTL && active) ? '3px solid var(--ac-gold)' : (isRTL ? '3px solid transparent' : 'none'),
          background: active ? 'rgba(200,168,75,0.08)' : 'none',
          cursor: 'pointer',
          color: active ? 'var(--ac-gold)' : 'var(--ac-text-sec)',
          fontFamily: 'var(--ac-font-ui)',
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          textAlign: isRTL ? 'right' : 'left',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={e => {
          if (!active) e.currentTarget.style.background = 'var(--ac-bg-hover)';
          if (collapsed) setTooltip(true);
        }}
        onMouseLeave={e => {
          if (!active) e.currentTarget.style.background = 'none';
          setTooltip(false);
        }}
      >
        <span style={{ opacity: active ? 1 : 0.7, position: 'relative', flexShrink: 0 }}>
          {item.icon}
          {isSettings && showWhatsNewDot && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--ac-gold)',
            }} />
          )}
        </span>
        {!collapsed && (
          <>
            <span style={{ flex: 1 }}>{label}</span>
            {item.dot === 'live' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="ac-pulse-dot" />
                <span style={{ fontSize: 10, color: 'var(--ac-success)' }}>Live</span>
              </span>
            )}
            {item.badge && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                background: item.badge.color === 'danger' ? 'rgba(226,85,85,0.2)' : 'rgba(200,168,75,0.2)',
                color: item.badge.color === 'danger' ? 'var(--ac-danger)' : 'var(--ac-gold)',
                fontFamily: 'var(--ac-font-mono)',
              }}>
                {item.badge.value}
              </span>
            )}
          </>
        )}
      </button>

      {/* Tooltip for collapsed mode */}
      {collapsed && tooltip && (
        <div style={{
          position: 'absolute',
          top: '50%', transform: 'translateY(-50%)',
          left: isRTL ? 'auto' : '100%',
          right: isRTL ? '100%' : 'auto',
          marginLeft: isRTL ? 0 : 8,
          marginRight: isRTL ? 8 : 0,
          background: 'var(--ac-bg-card)',
          border: '1px solid var(--ac-border-med)',
          borderRadius: 6, padding: '5px 10px',
          fontSize: 12, color: 'var(--ac-text-primary)',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 200, pointerEvents: 'none',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

function NavGroup({ labelKey, items, activePage, onNavigate, collapsed, onOpenChangelog, showWhatsNewDot }: {
  labelKey: string;
  items: NavItem[];
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onOpenChangelog?: () => void;
  showWhatsNewDot?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div style={{ marginBottom: 8 }}>
      {!collapsed && (
        <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ac-text-muted)' }}>
          {t(labelKey as any)}
        </div>
      )}
      {collapsed && <div style={{ height: 8 }} />}
      {items.map(item => (
        <NavItem
          key={item.id}
          item={item}
          active={activePage === item.id}
          collapsed={collapsed}
          onNavigate={onNavigate}
          onOpenChangelog={onOpenChangelog}
          showWhatsNewDot={showWhatsNewDot && item.id === 'settings'}
        />
      ))}
    </div>
  );
}

export function Sidebar({ activePage, onNavigate, onOpenChangelog, showWhatsNew }: SidebarProps & { onOpenChangelog?: () => void; showWhatsNew?: boolean }) {
  const { isRTL, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isIconOnly = windowWidth >= 1024 && windowWidth < 1280 && !collapsed;
  const isMobile = windowWidth < 1024;
  const isCollapsed = collapsed || isIconOnly;
  const sidebarWidth = isCollapsed ? 64 : 240;

  // Mobile overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger — rendered outside sidebar, handled by AppShell/Topbar */}
        {mobileOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div style={{
          width: 240, flexShrink: 0, height: '100vh',
          background: 'var(--ac-bg-card)',
          borderRight: isRTL ? 'none' : '1px solid var(--ac-border)',
          borderLeft: isRTL ? '1px solid var(--ac-border)' : 'none',
          display: 'flex', flexDirection: 'column',
          position: 'fixed',
          left: isRTL ? 'auto' : (mobileOpen ? 0 : -240),
          right: isRTL ? (mobileOpen ? 0 : -240) : 'auto',
          top: 0, zIndex: 50,
          overflowY: 'auto',
          transition: 'left 250ms ease, right 250ms ease',
        }}>
          <SidebarContent
            activePage={activePage}
            onNavigate={p => { onNavigate(p); setMobileOpen(false); }}
            collapsed={false}
            onToggleCollapse={() => setMobileOpen(false)}
            onOpenChangelog={onOpenChangelog}
            showWhatsNew={showWhatsNew}
            mobileClose
          />
        </div>
        <MobileToggle open={mobileOpen} onToggle={() => setMobileOpen(o => !o)} />
      </>
    );
  }

  return (
    <div style={{
      width: sidebarWidth, flexShrink: 0, height: '100vh',
      background: 'var(--ac-bg-card)',
      borderRight: isRTL ? 'none' : '1px solid var(--ac-border)',
      borderLeft: isRTL ? '1px solid var(--ac-border)' : 'none',
      display: 'flex', flexDirection: 'column',
      position: 'fixed',
      left: isRTL ? 'auto' : 0,
      right: isRTL ? 0 : 'auto',
      top: 0, zIndex: 50,
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'width 200ms ease',
    }}>
      <SidebarContent
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={isCollapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        onOpenChangelog={onOpenChangelog}
        showWhatsNew={showWhatsNew}
      />
    </div>
  );
}

function MobileToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed', top: 14, left: 12, zIndex: 60,
        background: 'var(--ac-bg-card)',
        border: '1px solid var(--ac-border-med)',
        borderRadius: 8, padding: 8, cursor: 'pointer',
        color: 'var(--ac-text-sec)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <Menu size={18} />
    </button>
  );
}

function SidebarContent({ activePage, onNavigate, collapsed, onToggleCollapse, onOpenChangelog, showWhatsNew, mobileClose }: {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenChangelog?: () => void;
  showWhatsNew?: boolean;
  mobileClose?: boolean;
}) {
  const { isRTL } = useLanguage();

  return (
    <>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0 16px' : '20px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {collapsed ? (
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(200,168,75,0.15)',
            border: '1px solid var(--ac-border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Radar size={18} style={{ color: 'var(--ac-gold)' }} />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(200,168,75,0.15)',
                border: '1px solid var(--ac-border-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Radar size={18} style={{ color: 'var(--ac-gold)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--ac-font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ac-text-primary)', lineHeight: 1.2 }}>AgentCraft</div>
                <div style={{ fontFamily: 'var(--ac-font-display)', fontSize: 13, fontWeight: 600, color: 'var(--ac-gold)', lineHeight: 1.2 }}>Scout</div>
              </div>
            </div>
          </>
        )}
      </div>

      {!collapsed && <div style={{ height: 1, background: 'var(--ac-border)', margin: '0 16px 8px' }} />}
      {collapsed && <div style={{ height: 1, background: 'var(--ac-border)', margin: '0 8px 8px' }} />}

      {/* Nav Groups */}
      <div style={{ flex: 1 }}>
        <NavGroup labelKey="nav.industrialArm" items={INDUSTRIAL} activePage={activePage} onNavigate={onNavigate} collapsed={collapsed} onOpenChangelog={onOpenChangelog} showWhatsNewDot={showWhatsNew} />
        <div style={{ height: 1, background: 'var(--ac-border)', margin: collapsed ? '4px 8px' : '4px 16px' }} />
        <NavGroup labelKey="nav.webOpportunities" items={WEB} activePage={activePage} onNavigate={onNavigate} collapsed={collapsed} />
        <div style={{ height: 1, background: 'var(--ac-border)', margin: collapsed ? '4px 8px' : '4px 16px' }} />
        <NavGroup labelKey="nav.tools" items={TOOLS} activePage={activePage} onNavigate={onNavigate} collapsed={collapsed} showWhatsNewDot={showWhatsNew} />
      </div>

      {/* User profile */}
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--ac-border)', padding: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--ac-bg-input)', border: '1px solid var(--ac-border)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(200,168,75,0.2)',
              border: '2px solid var(--ac-border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--ac-font-display)', fontSize: 12, fontWeight: 700, color: 'var(--ac-gold)',
              flexShrink: 0,
            }}>AS</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ac-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ayman Al-Saeed</div>
              <div style={{ fontSize: 10, color: 'var(--ac-text-muted)' }}>AgentCraft · Turkey</div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
              background: 'rgba(200,168,75,0.2)', color: 'var(--ac-gold)',
              border: '1px solid var(--ac-border-gold)',
            }}>PRO</span>
          </div>
          {/* Powered by + What's New */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingLeft: 4, paddingRight: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--ac-text-muted)', letterSpacing: '0.04em' }}>Powered by AgentCraft</span>
            {showWhatsNew && (
              <button
                onClick={onOpenChangelog}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 10, color: 'var(--ac-gold)', padding: 0,
                }}
              >
                <Sparkles size={10} />
                What's New
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      {!mobileClose && (
        <div style={{ padding: collapsed ? '12px 0' : '8px 12px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', borderTop: collapsed ? '1px solid var(--ac-border)' : 'none' }}>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'none', border: '1px solid var(--ac-border)',
              borderRadius: 6, padding: 6, cursor: 'pointer',
              color: 'var(--ac-text-muted)',
              transition: 'color 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--ac-gold)'; e.currentTarget.style.borderColor = 'var(--ac-border-gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ac-text-muted)'; e.currentTarget.style.borderColor = 'var(--ac-border)'; }}
          >
            {isRTL
              ? (collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
              : (collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
            }
          </button>
        </div>
      )}
    </>
  );
}
