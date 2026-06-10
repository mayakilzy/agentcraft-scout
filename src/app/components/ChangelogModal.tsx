import { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChangelogModalProps {
  onClose: () => void;
}

const CHANGELOG = [
  {
    version: '2.4.0',
    date: 'June 2026',
    items: [
      'Internationalization support: 8 languages including Arabic (RTL)',
      'Dark / Light theme with warm off-white light mode',
      'Responsive sidebar with icon-only collapse mode',
      'Keyboard shortcuts (press ? to view)',
      'Notification center with smart categorization',
      'Global search with recent history and quick navigation',
      'Export preview modal with row preview and size estimate',
      'Data density toggle (Comfortable / Compact tables)',
      'Currency, number, and date format preferences',
      'KPI count-up animations and micro-interactions',
    ],
  },
  {
    version: '2.3.0',
    date: 'May 2026',
    items: [
      'Deals Pipeline with Kanban board view',
      'Analytics & Intelligence page with seasonal context',
      'Priority Engine with AI-driven lead scoring',
      'Competitor Radar visualization',
    ],
  },
];

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--ac-bg-card)',
        border: '1px solid var(--ac-border-med)',
        borderRadius: 12,
        padding: 28,
        width: 520,
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} style={{ color: 'var(--ac-gold)' }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ac-text-primary)' }}>
              {t('changelog.whatsNew')}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {CHANGELOG.map(release => (
          <div key={release.version} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--ac-gold)',
                fontFamily: 'var(--ac-font-mono)',
              }}>v{release.version}</span>
              <span style={{ fontSize: 12, color: 'var(--ac-text-muted)' }}>{release.date}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {release.items.map((item, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8,
                  fontSize: 13, color: 'var(--ac-text-sec)', lineHeight: 1.5,
                }}>
                  <span style={{ color: 'var(--ac-gold)', flexShrink: 0, marginTop: 2 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
