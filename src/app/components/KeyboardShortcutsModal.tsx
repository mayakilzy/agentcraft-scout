import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['Ctrl', '1'], descKey: 'shortcuts.dashboard' as const },
  { keys: ['Ctrl', '2'], descKey: 'shortcuts.newScout' as const },
  { keys: ['Ctrl', '3'], descKey: 'shortcuts.campaigns' as const },
  { keys: ['Ctrl', '4'], descKey: 'shortcuts.companiesDb' as const },
  { keys: ['Ctrl', 'K'], descKey: 'shortcuts.globalSearch' as const },
  { keys: ['Ctrl', 'N'], descKey: 'shortcuts.newScout' as const },
  { keys: ['Ctrl', 'E'], descKey: 'shortcuts.exportCenter' as const },
  { keys: ['Esc'], descKey: 'common.close' as const },
  { keys: ['?'], descKey: 'shortcuts.title' as const },
];

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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
        width: 480,
        maxWidth: '90vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Keyboard size={18} style={{ color: 'var(--ac-gold)' }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ac-text-primary)' }}>
              {t('shortcuts.title')}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SHORTCUTS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: 'var(--ac-bg-input)',
              border: '1px solid var(--ac-border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--ac-text-sec)' }}>{t(s.descKey)}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {s.keys.map((k, ki) => (
                  <span key={ki} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 28, height: 22, padding: '0 6px',
                    background: 'var(--ac-bg-hover)',
                    border: '1px solid var(--ac-border-med)',
                    borderRadius: 4,
                    fontFamily: 'var(--ac-font-mono)', fontSize: 11, fontWeight: 600,
                    color: 'var(--ac-gold)',
                  }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
