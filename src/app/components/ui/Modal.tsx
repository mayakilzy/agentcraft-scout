import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'ac-fadeIn 150ms ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--ac-bg-card)',
          border: '1px solid var(--ac-border-med)',
          borderRadius: 12,
          width: 640,
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflow: 'auto',
          padding: 24,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, color: 'var(--ac-text-primary)', fontFamily: 'var(--ac-font-ui)' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 4, borderRadius: 4 }}>
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
