import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SkeletonRow } from './SkeletonRow';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyField: keyof T;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T>({ columns, data, loading, keyField, emptyMessage = 'No data found', pageSize = 20 }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        const r = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? r : -r;
      })
    : data;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--ac-font-ui)', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ac-border-med)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  color: 'var(--ac-text-sec)',
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  cursor: col.sortable ? 'pointer' : 'default',
                  width: col.width,
                  position: 'sticky',
                  top: 0,
                  background: 'var(--ac-bg-card)',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {col.header}
                  {col.sortable && (
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <ChevronUp size={10} style={{ opacity: sortKey === col.key && sortDir === 'asc' ? 1 : 0.3 }} />
                      <ChevronDown size={10} style={{ opacity: sortKey === col.key && sortDir === 'desc' ? 1 : 0.3 }} />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRow cols={columns.length} rows={5} />
          ) : pageData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--ac-text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            pageData.map(row => (
              <tr
                key={String(row[keyField])}
                style={{ borderBottom: '1px solid var(--ac-border)', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '10px 16px', color: 'var(--ac-text-primary)', verticalAlign: 'middle' }}>
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--ac-border)' }}>
          <span style={{ fontSize: 12, color: 'var(--ac-text-muted)' }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 28, height: 28, borderRadius: 4, border: '1px solid',
                  borderColor: p === page ? 'var(--ac-gold)' : 'var(--ac-border)',
                  background: p === page ? 'rgba(200,168,75,0.15)' : 'none',
                  color: p === page ? 'var(--ac-gold)' : 'var(--ac-text-sec)',
                  cursor: 'pointer', fontSize: 12,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
