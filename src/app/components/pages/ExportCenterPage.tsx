import { useState } from 'react';
import { Download, FileText, Table, Code, Clock, Building2, Globe, X, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { ProgressBar } from '../ui/ProgressBar';
import { SearchDropdown, type DropdownOption } from '../ui/SearchDropdown';

const CAMPAIGN_OPTIONS: DropdownOption[] = [
  { value: 'ist-food',   label: 'İstanbul Food Manufacturers',  group: 'Industrial' },
  { value: 'bursa-web',  label: 'Bursa Web Opportunities',       group: 'Web' },
  { value: 'koc-plas',   label: 'Kocaeli Plastics OSB',          group: 'Industrial' },
  { value: 'konya-agr',  label: 'Konya Agricultural Machinery',  group: 'Industrial' },
  { value: 'samsun-web', label: 'Samsun Web Opportunities',       group: 'Web' },
];

const EXPORT_FIELDS = [
  { id: 'name',     label: 'Company Name' },
  { id: 'province', label: 'Province' },
  { id: 'category', label: 'Category' },
  { id: 'phone',    label: 'Phone' },
  { id: 'website',  label: 'Website' },
  { id: 'email',    label: 'Email' },
  { id: 'rating',   label: 'Rating' },
  { id: 'score',    label: 'Quality Score' },
  { id: 'status',   label: 'Status' },
  { id: 'campaign', label: 'Campaign' },
];

const HISTORY = [
  { id: 1, name: 'istanbul_food_jun1.csv',    arm: 'industrial', records: 127, size: '45 KB',  format: 'CSV',   date: 'Jun 1, 2026',  status: 'ready' },
  { id: 2, name: 'bursa_web_jun3.xlsx',        arm: 'web',        records: 89,  size: '32 KB',  format: 'Excel', date: 'Jun 3, 2026',  status: 'ready' },
  { id: 3, name: 'kocaeli_plastics_may30.csv', arm: 'industrial', records: 54,  size: '19 KB',  format: 'CSV',   date: 'May 30, 2026', status: 'ready' },
  { id: 4, name: 'konya_agricultural_may25.json', arm: 'industrial', records: 67, size: '28 KB', format: 'JSON', date: 'May 25, 2026', status: 'ready' },
  { id: 5, name: 'samsun_web_may20.csv',       arm: 'web',        records: 112, size: '40 KB',  format: 'CSV',   date: 'May 20, 2026', status: 'ready' },
  { id: 6, name: 'tekirdağ_textile_may18.xlsx',arm: 'industrial', records: 93,  size: '35 KB',  format: 'Excel', date: 'May 18, 2026', status: 'ready' },
];

type Format = 'CSV' | 'Excel' | 'JSON';

function FormatBtn({ value, active, onClick }: { value: Format; active: boolean; onClick: () => void }) {
  const icons: Record<Format, React.ReactNode> = {
    CSV:   <FileText size={13} />,
    Excel: <Table size={13} />,
    JSON:  <Code size={13} />,
  };
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 5,
      border: '1px solid', cursor: 'pointer', fontFamily: 'var(--ac-font-ui)', fontSize: 12,
      transition: 'all 150ms',
      borderColor: active ? 'var(--ac-gold)' : 'var(--ac-border-med)',
      background: active ? 'rgba(200,168,75,0.15)' : 'var(--ac-bg-input)',
      color: active ? 'var(--ac-gold)' : 'var(--ac-text-sec)',
      fontWeight: active ? 600 : 400,
    }}>
      {icons[value]} {value}
    </button>
  );
}

function ExportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--ac-border)', fontSize: 12, fontWeight: 600, color: 'var(--ac-text-primary)' }}>
        {title}
      </div>
      <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

const PREVIEW_ROWS = [
  { name: 'Gıda Makina A.Ş.', province: 'Istanbul', category: 'Food Processing', phone: '+90 212 555 01 01', website: 'gidamakina.com.tr', score: 9 },
  { name: 'Bursa Teknoloji Ltd.', province: 'Bursa', category: 'Metal Fabrication', phone: '+90 224 555 02 02', website: 'bursateknoloji.com', score: 9 },
  { name: 'İkitelli OSB Sanayi', province: 'Istanbul', category: 'Industrial', phone: '+90 212 555 03 03', website: 'ikiitelliobsanayi.com', score: 8 },
  { name: 'Marmara Tekstil San.', province: 'Istanbul', category: 'Textile Machinery', phone: '+90 212 555 04 04', website: '—', score: 8 },
  { name: 'Konya Tarım Makinaları', province: 'Konya', category: 'Agricultural', phone: '+90 332 555 05 05', website: 'konyatarim.com', score: 7 },
];

interface ExportPreviewModalProps {
  format: Format;
  fields: Set<string>;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}

function ExportPreviewModal({ format, fields, count, onConfirm, onClose }: ExportPreviewModalProps) {
  const { t } = useLanguage();
  const selectedFieldsList = EXPORT_FIELDS.filter(f => fields.has(f.id));
  const estimatedSize = `${Math.round(count * selectedFieldsList.length * 0.04)} KB`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border-med)', borderRadius: 12, padding: 28, width: 680, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye size={18} style={{ color: 'var(--ac-gold)' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ac-text-primary)' }}>{t('export.preview')}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 4 }}><X size={18} /></button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: t('export.fileSize'), value: estimatedSize },
            { label: t('export.selectedFields'), value: `${selectedFieldsList.length} fields` },
            { label: 'Records', value: count.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--ac-bg-input)', border: '1px solid var(--ac-border)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--ac-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ac-text-primary)', fontFamily: 'var(--ac-font-mono)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Field list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ac-text-muted)', marginBottom: 8 }}>{t('export.selectedFields')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedFieldsList.map(f => (
              <span key={f.id} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 10, background: 'rgba(200,168,75,0.12)', color: 'var(--ac-gold)', border: '1px solid var(--ac-border-gold)' }}>{f.label}</span>
            ))}
          </div>
        </div>

        {/* Preview table */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ac-text-muted)', marginBottom: 8 }}>{t('export.first5Rows')}</div>
          <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--ac-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--ac-bg-input)' }}>
                  {selectedFieldsList.slice(0, 5).map(f => (
                    <th key={f.id} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--ac-text-muted)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--ac-border)' }}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREVIEW_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--ac-border)' }}>
                    {selectedFieldsList.slice(0, 5).map(f => (
                      <td key={f.id} style={{ padding: '7px 12px', color: 'var(--ac-text-sec)', whiteSpace: 'nowrap' }}>
                        {f.id === 'name' ? row.name : f.id === 'province' ? row.province : f.id === 'category' ? row.category : f.id === 'phone' ? row.phone : f.id === 'website' ? row.website : f.id === 'score' ? row.score : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 6, border: '1px solid var(--ac-border-med)', background: 'none', color: 'var(--ac-text-sec)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--ac-font-ui)' }}>
            {t('common.cancel')}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="ac-btn-gold" style={{ padding: '9px 24px', fontSize: 13, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Download size={14} /> {t('export.confirmDownload')} ({format})
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExportCenterPage() {
  const [quickFormat, setQuickFormat]         = useState<Format>('CSV');
  const [selectedFields, setSelectedFields]   = useState<Set<string>>(new Set(EXPORT_FIELDS.map(f => f.id)));
  const [campaignExport, setCampaignExport]   = useState('');
  const [campFormat, setCampFormat]           = useState<Format>('CSV');
  const [filterProvince, setFilterProvince]   = useState('');
  const [filterMinScore, setFilterMinScore]   = useState(0);
  const [filtFormat, setFiltFormat]           = useState<Format>('CSV');
  const [autoEnabled, setAutoEnabled]         = useState(false);
  const [autoFormat, setAutoFormat]           = useState<Format>('CSV');
  const [exporting, setExporting]             = useState<string | null>(null);
  const [showPreview, setShowPreview]         = useState(false);
  const { t } = useLanguage();

  const PROVINCE_OPTIONS: DropdownOption[] = [
    ...['Istanbul','Bursa','Ankara','İzmir','Kocaeli','Konya','Kayseri','Gaziantep'].map(v => ({ value: v, label: v, group: 'Popular' })),
    ...['Antalya','Mersin','Adana','Tekirdağ','Samsun','Trabzon'].map(v => ({ value: v, label: v, group: 'Other' })),
  ];

  const toggleField = (id: string) => setSelectedFields(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filteredCount = Math.max(0, 847 - filterMinScore * 60);

  const doExport = (key: string) => {
    setExporting(key);
    setTimeout(() => setExporting(null), 1800);
  };

  const formatColor = (fmt: string) =>
    fmt === 'CSV' ? 'var(--ac-success)' : fmt === 'Excel' ? 'var(--ac-info)' : 'var(--ac-gold)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 4 Export Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>

        {/* Quick Export */}
        <ExportCard title="Quick Export">
          <div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Format</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(['CSV','Excel','JSON'] as Format[]).map(f => (
                <FormatBtn key={f} value={f} active={quickFormat === f} onClick={() => setQuickFormat(f)} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Fields</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
              {EXPORT_FIELDS.map(f => (
                <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                  <div
                    onClick={() => toggleField(f.id)}
                    style={{
                      width: 13, height: 13, borderRadius: 3, flexShrink: 0, cursor: 'pointer',
                      border: `1.5px solid ${selectedFields.has(f.id) ? 'var(--ac-gold)' : 'var(--ac-border-med)'}`,
                      background: selectedFields.has(f.id) ? 'var(--ac-gold)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {selectedFields.has(f.id) && <span style={{ fontSize: 8, color: '#0a0d12', fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ac-text-sec)' }}>{f.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 11, color: 'var(--ac-text-muted)', marginBottom: 8 }}>
              847 companies · {selectedFields.size} fields
            </div>
            <button
              className="ac-btn-gold"
              onClick={() => setShowPreview(true)}
              style={{ width: '100%', padding: '9px', fontSize: 12, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {exporting === 'quick' ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span> Exporting…</> : <><Download size={13} /> Export All</>}
            </button>
          </div>
        </ExportCard>

        {/* Campaign Export */}
        <ExportCard title="Campaign Export">
          <div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Select Campaign</div>
            <SearchDropdown options={CAMPAIGN_OPTIONS} value={campaignExport} onChange={setCampaignExport} placeholder="Choose campaign..." />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Format</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(['CSV','Excel','JSON'] as Format[]).map(f => (
                <FormatBtn key={f} value={f} active={campFormat === f} onClick={() => setCampFormat(f)} />
              ))}
            </div>
          </div>
          {campaignExport && (
            <div style={{ padding: '8px 12px', background: 'rgba(200,168,75,0.06)', border: '1px solid var(--ac-border-gold)', borderRadius: 5, fontSize: 11, color: 'var(--ac-text-sec)' }}>
              {CAMPAIGN_OPTIONS.find(c => c.value === campaignExport)?.label} selected
            </div>
          )}
          <div style={{ marginTop: 'auto' }}>
            <button
              className="ac-btn-gold"
              disabled={!campaignExport}
              onClick={() => doExport('campaign')}
              style={{ width: '100%', padding: '9px', fontSize: 12, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: campaignExport ? 1 : 0.4, cursor: campaignExport ? 'pointer' : 'not-allowed' }}
            >
              {exporting === 'campaign' ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span> Exporting…</> : <><Download size={13} /> Export Campaign</>}
            </button>
          </div>
        </ExportCard>

        {/* Filtered Export */}
        <ExportCard title="Filtered Export">
          <div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Province</div>
            <SearchDropdown options={PROVINCE_OPTIONS} value={filterProvince} onChange={setFilterProvince} placeholder="All provinces" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--ac-text-sec)' }}>Min Quality Score</span>
              <span style={{ fontFamily: 'var(--ac-font-mono)', fontSize: 11, color: 'var(--ac-gold)' }}>{filterMinScore}</span>
            </div>
            <input type="range" min={0} max={10} value={filterMinScore} onChange={e => setFilterMinScore(Number(e.target.value))}
              style={{ width: '100%', appearance: 'none', height: 4, background: `linear-gradient(to right, var(--ac-gold) ${filterMinScore * 10}%, rgba(255,255,255,0.1) ${filterMinScore * 10}%)`, borderRadius: 2, outline: 'none', cursor: 'pointer' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Format</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(['CSV','Excel','JSON'] as Format[]).map(f => (
                <FormatBtn key={f} value={f} active={filtFormat === f} onClick={() => setFiltFormat(f)} />
              ))}
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ padding: '6px 10px', background: 'rgba(91,156,246,0.08)', border: '1px solid rgba(91,156,246,0.2)', borderRadius: 5, fontSize: 11, color: 'var(--ac-info)', marginBottom: 8, textAlign: 'center' }}>
              Preview: <strong style={{ fontFamily: 'var(--ac-font-mono)' }}>{filteredCount}</strong> companies
            </div>
            <button
              className="ac-btn-gold"
              onClick={() => doExport('filtered')}
              style={{ width: '100%', padding: '9px', fontSize: 12, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {exporting === 'filtered' ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span> Exporting…</> : <><Download size={13} /> Export Filtered</>}
            </button>
          </div>
        </ExportCard>

        {/* Scheduled Export */}
        <ExportCard title="Scheduled Export">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px', background: autoEnabled ? 'rgba(200,168,75,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${autoEnabled ? 'var(--ac-border-gold)' : 'var(--ac-border)'}`, borderRadius: 6, transition: 'all 200ms' }}>
              <ToggleSwitch checked={autoEnabled} onChange={setAutoEnabled} label="Auto-export after each scout" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ac-text-muted)', lineHeight: 1.6 }}>
              When enabled, results are automatically exported to your chosen format after every completed scout mission.
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6 }}>Default Format</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {(['CSV','Excel','JSON'] as Format[]).map(f => (
                  <FormatBtn key={f} value={f} active={autoFormat === f} onClick={() => setAutoFormat(f)} />
                ))}
              </div>
            </div>
            {autoEnabled && (
              <div style={{ padding: '10px 12px', background: 'rgba(45,212,160,0.08)', border: '1px solid rgba(45,212,160,0.25)', borderRadius: 5, fontSize: 11, color: 'var(--ac-success)', animation: 'ac-fadeIn 200ms ease' }}>
                ✓ Auto-export active — {autoFormat} format
              </div>
            )}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <button
              className="ac-btn-gold"
              onClick={() => setAutoEnabled(true)}
              style={{ width: '100%', padding: '9px', fontSize: 12, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Clock size={13} /> {autoEnabled ? 'Settings Saved' : 'Enable Auto-Export'}
            </button>
          </div>
        </ExportCard>

      </div>

      {/* Export History */}
      <div style={{ background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--ac-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ac-text-primary)' }}>Export History</span>
          <span style={{ fontSize: 11, color: 'var(--ac-text-muted)' }}>{HISTORY.length} exports</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--ac-font-ui)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ac-border)' }}>
                {['File Name','Arm','Records','Size','Format','Date','Action'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', color: 'var(--ac-text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', background: 'var(--ac-bg-card)', position: 'sticky', top: 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map(h => (
                <tr key={h.id}
                  style={{ borderBottom: '1px solid var(--ac-border)', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac-bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--ac-font-mono)', fontSize: 11, color: 'var(--ac-text-primary)' }}>{h.name}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 11 }}>{h.arm === 'industrial' ? '🏭' : '🌐'}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--ac-font-mono)', color: 'var(--ac-gold)', fontWeight: 600 }}>{h.records}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--ac-font-mono)', color: 'var(--ac-text-muted)', fontSize: 11 }}>{h.size}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600, color: formatColor(h.format), background: `${formatColor(h.format)}18`, border: `1px solid ${formatColor(h.format)}44` }}>
                      {h.format}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', color: 'var(--ac-text-muted)', fontSize: 12 }}>{h.date}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 5, border: '1px solid var(--ac-border-gold)', background: 'rgba(200,168,75,0.08)', color: 'var(--ac-gold)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--ac-font-ui)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,168,75,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,168,75,0.08)')}>
                      <Download size={12} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {showPreview && (
        <ExportPreviewModal
          format={quickFormat}
          fields={selectedFields}
          count={847}
          onConfirm={() => doExport('quick')}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
