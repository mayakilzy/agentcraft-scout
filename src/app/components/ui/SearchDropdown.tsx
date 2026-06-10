import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function SearchDropdown({ options, value, onChange, placeholder = 'Select...', searchPlaceholder = 'Search...' }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const groups = Array.from(new Set(filtered.map(o => o.group ?? ''))).filter(Boolean);
  const ungrouped = filtered.filter(o => !o.group);
  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--ac-bg-input)', border: '1px solid var(--ac-border-med)',
          borderRadius: 6, padding: '8px 12px', cursor: 'pointer',
          color: selected ? 'var(--ac-text-primary)' : 'var(--ac-text-muted)',
          fontFamily: 'var(--ac-font-ui)', fontSize: 13,
        }}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown size={14} style={{ color: 'var(--ac-text-sec)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border-med)',
          borderRadius: 6, marginTop: 4, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          maxHeight: 280,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--ac-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ac-bg-input)', borderRadius: 4, padding: '5px 8px' }}>
              <Search size={12} style={{ color: 'var(--ac-text-muted)' }} />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--ac-text-primary)', fontFamily: 'var(--ac-font-ui)', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ overflow: 'auto' }}>
            {groups.map(group => (
              <div key={group}>
                <div style={{ padding: '6px 12px 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ac-text-muted)' }}>
                  {group}
                </div>
                {filtered.filter(o => o.group === group).map(o => (
                  <button
                    key={o.value}
                    onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px', background: o.value === value ? 'rgba(200,168,75,0.08)' : 'none',
                      border: 'none', cursor: 'pointer', color: o.value === value ? 'var(--ac-gold)' : 'var(--ac-text-primary)',
                      fontFamily: 'var(--ac-font-ui)', fontSize: 13, textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = o.value === value ? 'rgba(200,168,75,0.08)' : 'none')}
                  >
                    {o.label}
                    {o.value === value && <Check size={12} style={{ color: 'var(--ac-gold)' }} />}
                  </button>
                ))}
              </div>
            ))}
            {ungrouped.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 12px', background: o.value === value ? 'rgba(200,168,75,0.08)' : 'none',
                  border: 'none', cursor: 'pointer', color: o.value === value ? 'var(--ac-gold)' : 'var(--ac-text-primary)',
                  fontFamily: 'var(--ac-font-ui)', fontSize: 13, textAlign: 'left',
                }}
              >
                {o.label}
                {o.value === value && <Check size={12} style={{ color: 'var(--ac-gold)' }} />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '16px 12px', color: 'var(--ac-text-muted)', fontSize: 13, textAlign: 'center' }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
