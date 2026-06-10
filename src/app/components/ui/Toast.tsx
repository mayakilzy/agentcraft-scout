import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  items: ToastItem[];
  onRemove: (id: string) => void;
}

function ToastEntry({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 4000);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  const icon = item.type === 'success' ? <CheckCircle size={16} /> : item.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />;
  const color = item.type === 'success' ? 'var(--ac-success)' : item.type === 'error' ? 'var(--ac-danger)' : 'var(--ac-info)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--ac-bg-card)',
      border: `1px solid var(--ac-border-med)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      padding: '12px 14px',
      minWidth: 280,
      maxWidth: 360,
      animation: 'ac-fadeIn 150ms ease',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--ac-text-primary)' }}>{item.message}</span>
      <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 2 }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ items, onRemove }: ToastProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {items.map(item => <ToastEntry key={item.id} item={item} onRemove={onRemove} />)}
    </div>
  );
}

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { id, message, type }]);
  };
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  return { items, show, remove };
}
