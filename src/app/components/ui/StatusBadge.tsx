type StatusType = 'New' | 'Contacted' | 'Replied' | 'Closed' | string;

interface StatusBadgeProps {
  status: StatusType;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  New:       { bg: 'rgba(91,156,246,0.15)',  color: '#5b9cf6', border: 'rgba(91,156,246,0.3)' },
  Contacted: { bg: 'rgba(200,168,75,0.15)', color: '#c8a84b', border: 'rgba(200,168,75,0.3)' },
  Replied:   { bg: 'rgba(45,212,160,0.15)', color: '#2dd4a0', border: 'rgba(45,212,160,0.3)' },
  Closed:    { bg: 'rgba(226,85,85,0.15)',  color: '#e25555', border: 'rgba(226,85,85,0.3)' },
  Running:   { bg: 'rgba(91,156,246,0.15)',  color: '#5b9cf6', border: 'rgba(91,156,246,0.3)' },
  Completed: { bg: 'rgba(45,212,160,0.15)', color: '#2dd4a0', border: 'rgba(45,212,160,0.3)' },
  Scheduled: { bg: 'rgba(200,168,75,0.15)', color: '#c8a84b', border: 'rgba(200,168,75,0.3)' },
  Paused:    { bg: 'rgba(138,138,138,0.15)', color: '#8a8a8a', border: 'rgba(138,138,138,0.3)' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.New;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}
