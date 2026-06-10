interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({ value, max = 100, showLabel = false, height = 6 }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        height,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--ac-gold) 0%, var(--ac-gold-bright) 100%)',
          borderRadius: height,
          transition: 'width 400ms ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontFamily: 'var(--ac-font-mono)', fontSize: 12, color: 'var(--ac-gold)', minWidth: 32 }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
