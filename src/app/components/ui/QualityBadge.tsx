interface QualityBadgeProps {
  score: number;
}

export function QualityBadge({ score }: QualityBadgeProps) {
  let label: string;
  let style: React.CSSProperties;

  if (score >= 8) {
    label = 'Excellent';
    style = { background: 'rgba(45,212,160,0.15)', color: '#2dd4a0', border: '1px solid rgba(45,212,160,0.3)' };
  } else if (score >= 5) {
    label = 'Good';
    style = { background: 'rgba(200,168,75,0.15)', color: '#c8a84b', border: '1px solid rgba(200,168,75,0.3)' };
  } else {
    label = 'Low';
    style = { background: 'rgba(226,85,85,0.15)', color: '#e25555', border: '1px solid rgba(226,85,85,0.3)' };
  }

  return (
    <span style={{ ...style, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}
