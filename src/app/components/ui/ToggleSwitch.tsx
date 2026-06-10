interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? 'var(--ac-gold)' : 'rgba(255,255,255,0.12)',
          position: 'relative',
          transition: 'background 200ms ease',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: checked ? '#0a0d12' : 'rgba(255,255,255,0.6)',
          transition: 'left 200ms ease',
        }} />
      </div>
      {label && <span style={{ fontSize: 13, color: 'var(--ac-text-sec)' }}>{label}</span>}
    </label>
  );
}
