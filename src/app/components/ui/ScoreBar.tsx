interface ScoreBarProps {
  score: number;
  max?: number;
}

export function ScoreBar({ score, max = 10 }: ScoreBarProps) {
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 8 ? '#2dd4a0' : score >= 5 ? '#c8a84b' : '#e25555';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1,
        height: 4,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 2,
        overflow: 'hidden',
        minWidth: 60,
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 300ms ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--ac-font-mono)', fontSize: 11, color: color, minWidth: 20 }}>{score}</span>
    </div>
  );
}
