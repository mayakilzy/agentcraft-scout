import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, gap: 16, color: 'var(--ac-text-muted)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'rgba(200,168,75,0.08)', border: '1px solid var(--ac-border-gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Construction size={28} style={{ color: 'var(--ac-gold)', opacity: 0.6 }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ac-text-sec)', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--ac-text-muted)' }}>
          {description ?? 'This page will be built in a future phase.'}
        </div>
      </div>
    </div>
  );
}
