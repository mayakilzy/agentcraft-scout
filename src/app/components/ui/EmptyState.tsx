interface EmptyStateProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
  variant?: 'radar' | 'database' | 'chart' | 'web' | 'deals' | 'campaigns';
}

const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  radar: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="var(--ac-border-gold)" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="40" cy="40" r="24" stroke="var(--ac-border-gold)" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="40" cy="40" r="12" stroke="var(--ac-gold)" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="3" fill="var(--ac-gold)" />
      <line x1="40" y1="40" x2="64" y2="16" stroke="var(--ac-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="64" cy="16" r="3" fill="var(--ac-gold-bright)" opacity="0.7" />
    </svg>
  ),
  database: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="26" rx="26" ry="10" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <path d="M14 26v12c0 5.52 11.64 10 26 10s26-4.48 26-10V26" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <path d="M14 38v12c0 5.52 11.64 10 26 10s26-4.48 26-10V38" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <ellipse cx="40" cy="26" rx="26" ry="10" fill="rgba(200,168,75,0.06)" />
    </svg>
  ),
  chart: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="12" y="48" width="12" height="20" rx="2" fill="rgba(200,168,75,0.2)" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <rect x="30" y="32" width="12" height="36" rx="2" fill="rgba(200,168,75,0.3)" stroke="var(--ac-gold)" strokeWidth="1.5" />
      <rect x="48" y="20" width="12" height="48" rx="2" fill="rgba(200,168,75,0.4)" stroke="var(--ac-gold)" strokeWidth="2" />
      <line x1="8" y1="68" x2="72" y2="68" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
    </svg>
  ),
  web: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <ellipse cx="40" cy="40" rx="14" ry="30" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <line x1="10" y1="40" x2="70" y2="40" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <line x1="14" y1="24" x2="66" y2="24" stroke="var(--ac-border-gold)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="14" y1="56" x2="66" y2="56" stroke="var(--ac-border-gold)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="40" cy="40" r="4" fill="var(--ac-gold)" />
    </svg>
  ),
  deals: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="10" y="20" width="18" height="44" rx="3" fill="rgba(200,168,75,0.1)" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <rect x="31" y="28" width="18" height="36" rx="3" fill="rgba(200,168,75,0.15)" stroke="var(--ac-border-gold)" strokeWidth="1.5" />
      <rect x="52" y="36" width="18" height="28" rx="3" fill="rgba(200,168,75,0.2)" stroke="var(--ac-gold)" strokeWidth="1.5" />
      <path d="M19 30 L40 34 L61 46" stroke="var(--ac-gold)" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  ),
  campaigns: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M16 32 L52 16 L48 52 L34 42 L22 56 L18 42 Z" fill="rgba(200,168,75,0.08)" stroke="var(--ac-border-gold)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M34 42 L52 16" stroke="var(--ac-gold)" strokeWidth="1.5" />
      <circle cx="52" cy="16" r="4" fill="var(--ac-gold)" />
      <circle cx="22" cy="56" r="3" fill="rgba(200,168,75,0.5)" />
    </svg>
  ),
};

export function EmptyState({ title, subtitle, ctaLabel, onCta, variant = 'radar' }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
      gap: 16,
    }}>
      <div style={{ opacity: 0.85, marginBottom: 4 }}>
        {ILLUSTRATIONS[variant]}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ac-text-primary)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--ac-text-sec)', maxWidth: 360, lineHeight: 1.6 }}>{subtitle}</div>
      <button
        onClick={onCta}
        className="ac-btn-gold ac-btn-press"
        style={{ marginTop: 8, padding: '10px 24px', fontSize: 13 }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
