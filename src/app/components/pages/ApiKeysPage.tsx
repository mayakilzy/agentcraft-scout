import { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, Star, Trash2, Eye, EyeOff, Plus, Loader, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const API = 'https://api.agentcraft.info/scout';

const PROVIDER_META: Record<string, { icon: string; color: string; description: string; docsUrl: string }> = {
  anthropic:   { icon: '🤖', color: '#c8a84b', description: 'Claude Haiku / Sonnet / Opus', docsUrl: 'https://console.anthropic.com/keys' },
  openai:      { icon: '⚡', color: '#10a37f', description: 'GPT-4o Mini / GPT-4o', docsUrl: 'https://platform.openai.com/api-keys' },
  openrouter:  { icon: '🔀', color: '#5b9cf6', description: 'All models — one API key', docsUrl: 'https://openrouter.ai/keys' },
  deepseek:    { icon: '🔍', color: '#9b59b6', description: 'DeepSeek Chat / Reasoner', docsUrl: 'https://platform.deepseek.com/' },
  gemini:      { icon: '💎', color: '#ea4335', description: 'Gemini 2.0 Flash / 2.5 Pro', docsUrl: 'https://makersuite.google.com/app/apikey' },
  glm:         { icon: '🇨🇳', color: '#2dd4a0', description: 'GLM-4 Flash / GLM-4 Plus', docsUrl: 'https://open.bigmodel.cn/usercenter/apikeys' },
};

const TIER_LABELS: Record<string,string> = { fast: '⚡ Fast', smart: '🧠 Smart', premium: '💎 Premium' };

type Provider = {
  id: string; name: string; has_key: boolean; is_default: boolean;
  enabled: boolean; key_preview: string | null; custom_model: string | null;
  models: Record<string,string>;
};

export function ApiKeysPage() {
  const {t}=useLanguage();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState<any>(null);
  
  // Form state
  const [selectedId, setSelectedId] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success:boolean;message:string}|null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const [provRes, activeRes] = await Promise.all([
        window.fetch(`${API}/ai-providers`).then(r=>r.json()),
        window.fetch(`${API}/ai-providers/active`).then(r=>r.json()),
      ]);
      setProviders(provRes.providers || []);
      setActiveProvider(activeRes);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleTest = async () => {
    if (!selectedId || !inputKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await window.fetch(`${API}/ai-providers/test`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ provider_id: selectedId, api_key: inputKey }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.success ? `✅ Connected — ${data.model}` : `❌ ${data.error}` });
    } catch (e) {
      setTestResult({ success: false, message: '❌ Connection failed' });
    }
    setTesting(false);
  };

  const handleSave = async () => {
    if (!selectedId || !inputKey) return;
    setSaving(true);
    try {
      await window.fetch(`${API}/ai-providers/save`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ provider_id: selectedId, api_key: inputKey, is_default: isDefault }),
      });
      setInputKey(''); setTestResult(null); setSelectedId('');
      await fetchProviders();
    } catch {}
    setSaving(false);
  };

  const handleSetDefault = async (pid: string) => {
    await window.fetch(`${API}/ai-providers/set-default`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ provider_id: pid }),
    });
    await fetchProviders();
  };

  const handleDelete = async (pid: string) => {
    await window.fetch(`${API}/ai-providers/${pid}`, { method: 'DELETE' });
    await fetchProviders();
  };

  const selectedMeta = PROVIDER_META[selectedId] || {};
  const selectedProvider = providers.find(p => p.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Active Provider Banner */}
      {activeProvider?.has_key && (
        <div style={{ background: 'rgba(45,212,160,0.08)', border: '1px solid rgba(45,212,160,0.3)', borderRadius: 8, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ac-success)', flexShrink: 0, boxShadow: '0 0 6px var(--ac-success)' }} />
          <span style={{ fontSize: 13, color: 'var(--ac-text-primary)', fontWeight: 500 }}>
            Active AI Provider: <span style={{ color: 'var(--ac-success)', fontWeight: 700 }}>{activeProvider.provider_name}</span>
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {Object.entries(activeProvider.models || {}).map(([tier, model]) => (
              <span key={tier} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(45,212,160,0.1)', color: 'var(--ac-success)', border: '1px solid rgba(45,212,160,0.2)', fontFamily: 'var(--ac-font-mono)' }}>
                {TIER_LABELS[tier]}: {String(model).split('/').pop()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security Note */}
      <div style={{ background: 'rgba(91,156,246,0.06)', border: '1px solid rgba(91,156,246,0.2)', borderRadius: 8, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Shield size={14} style={{ color: 'var(--ac-info)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--ac-text-sec)' }}>API keys are stored securely on the server — never exposed to the browser. Add a key once and all features use it automatically.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'flex-start' }}>

        {/* Providers List */}
        <div style={{ background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ac-border)', fontWeight: 500, fontSize: 13, color: 'var(--ac-text-primary)' }}>
            Connected Providers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading ? Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--ac-border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--ac-bg-hover)' }} />
                <div style={{ flex: 1 }}><div style={{ height: 13, background: 'var(--ac-bg-hover)', borderRadius: 3, width: 140, marginBottom: 6 }} /><div style={{ height: 11, background: 'var(--ac-bg-hover)', borderRadius: 3, width: 80 }} /></div>
              </div>
            )) : providers.map(p => {
              const meta = PROVIDER_META[p.id] || {};
              return (
                <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--ac-border)', display: 'flex', alignItems: 'center', gap: 14, transition: 'background 150ms' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${meta.color}18`, border: `1px solid ${meta.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {meta.icon || '🔑'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ac-text-primary)' }}>{p.name}</span>
                      {p.is_default && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 10, background: 'rgba(200,168,75,0.15)', color: 'var(--ac-gold)', border: '1px solid rgba(200,168,75,0.3)', fontWeight: 700 }}>DEFAULT</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ac-text-muted)' }}>
                      {p.has_key ? <span style={{ color: 'var(--ac-success)' }}>✓ {p.key_preview}</span> : <span style={{ color: 'var(--ac-text-muted)' }}>No key configured</span>}
                    </div>
                  </div>
                  {p.has_key && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!p.is_default && (
                        <button onClick={() => handleSetDefault(p.id)} title="Set as default"
                          style={{ padding: '5px 10px', borderRadius: 5, border: '1px solid var(--ac-border-gold)', background: 'rgba(200,168,75,0.08)', color: 'var(--ac-gold)', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={11} /> Set Default
                        </button>
                      )}
                      <button onClick={() => handleDelete(p.id)} title="Remove key"
                        style={{ padding: '5px 8px', borderRadius: 5, border: '1px solid var(--ac-border)', background: 'none', color: 'var(--ac-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(226,85,85,0.4)';e.currentTarget.style.color='var(--ac-danger)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.color='var(--ac-text-muted)';}}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  {!p.has_key && (
                    <button onClick={() => { setSelectedId(p.id); setInputKey(''); setTestResult(null); }}
                      style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--ac-border-med)', background: 'none', color: 'var(--ac-text-sec)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus size={11} /> Add Key
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add / Edit Key Panel */}
        <div style={{ background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border-gold)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ac-border)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Key size={14} style={{ color: 'var(--ac-gold)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ac-text-primary)' }}>Add / Update API Key</span>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Provider selector */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 8, fontWeight: 500 }}>Select Provider</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(PROVIDER_META).map(([id, meta]) => (
                  <button key={id} onClick={() => { setSelectedId(id); setInputKey(''); setTestResult(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, border: `1px solid ${selectedId === id ? meta.color+'66' : 'var(--ac-border)'}`, background: selectedId === id ? `${meta.color}10` : 'var(--ac-bg-input)', cursor: 'pointer', transition: 'all 150ms', textAlign: 'left' }}>
                    <span style={{ fontSize: 16 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: selectedId === id ? meta.color : 'var(--ac-text-primary)' }}>
                        {providers.find(p=>p.id===id)?.name || id}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ac-text-muted)' }}>{meta.description}</div>
                    </div>
                    {providers.find(p=>p.id===id)?.has_key && <CheckCircle size={13} style={{ color: 'var(--ac-success)', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            {selectedId && (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--ac-text-sec)', fontWeight: 500 }}>API Key</span>
                    <a href={selectedMeta.docsUrl} target="_blank" rel="noopener" style={{ fontSize: 10, color: 'var(--ac-info)', textDecoration: 'none' }}>Get key →</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={inputKey}
                      onChange={e => { setInputKey(e.target.value); setTestResult(null); }}
                      placeholder={`Enter your ${selectedId} API key...`}
                      style={{ width: '100%', background: 'var(--ac-bg-input)', border: `1px solid ${testResult ? (testResult.success ? 'rgba(45,212,160,0.5)' : 'rgba(226,85,85,0.5)') : 'var(--ac-border-med)'}`, borderRadius: 6, padding: '8px 36px 8px 12px', color: 'var(--ac-text-primary)', fontFamily: 'var(--ac-font-mono)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button onClick={() => setShowKey(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 0 }}>
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  {testResult && (
                    <div style={{ marginTop: 6, fontSize: 11, color: testResult.success ? 'var(--ac-success)' : 'var(--ac-danger)' }}>
                      {testResult.message}
                    </div>
                  )}
                </div>

                {/* Set as default */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div onClick={() => setIsDefault(d => !d)} style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${isDefault ? 'var(--ac-gold)' : 'var(--ac-border-med)'}`, background: isDefault ? 'rgba(200,168,75,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    {isDefault && <span style={{ fontSize: 10, color: 'var(--ac-gold)', fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ac-text-sec)' }}>Set as default AI provider</span>
                </label>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={handleTest} disabled={!inputKey || testing}
                    style={{ flex: 1, padding: '8px', borderRadius: 5, border: '1px solid var(--ac-border-med)', background: 'var(--ac-bg-input)', color: 'var(--ac-text-sec)', cursor: inputKey ? 'pointer' : 'not-allowed', fontSize: 12, fontFamily: 'var(--ac-font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: inputKey ? 1 : 0.5 }}>
                    {testing ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {testing ? 'Testing...' : 'Test Key'}
                  </button>
                  <button onClick={handleSave} disabled={!inputKey || saving}
                    className="ac-btn-gold"
                    style={{ flex: 2, padding: '8px', borderRadius: 5, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: inputKey ? 1 : 0.5, cursor: inputKey ? 'pointer' : 'not-allowed' }}>
                    {saving ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                    {saving ? 'Saving...' : 'Save Key'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Model Tiers Guide */}
      <div style={{ background: 'var(--ac-bg-card)', border: '1px solid var(--ac-border)', borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ac-text-primary)', marginBottom: 14 }}>Model Tier Strategy</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { tier: '⚡ Fast', color: '#2dd4a0', uses: 'Outreach messages, simple summaries', examples: 'Claude Haiku · GPT-4o Mini · Gemini Flash · GLM-4 Flash', cost: 'Very cheap' },
            { tier: '🧠 Smart', color: '#5b9cf6', uses: 'Analytics, priority scoring, data enrichment', examples: 'Claude Sonnet · GPT-4o · DeepSeek Chat', cost: 'Moderate' },
            { tier: '💎 Premium', color: '#c8a84b', uses: 'Complex reports, strategy suggestions', examples: 'Claude Opus · Gemini 2.5 Pro · GPT-4o', cost: 'Use sparingly' },
          ].map(t => (
            <div key={t.tier} style={{ background: 'var(--ac-bg-input)', border: `1px solid ${t.color}33`, borderRadius: 6, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.color, marginBottom: 6 }}>{t.tier}</div>
              <div style={{ fontSize: 11, color: 'var(--ac-text-sec)', marginBottom: 6, lineHeight: 1.5 }}>{t.uses}</div>
              <div style={{ fontSize: 10, color: 'var(--ac-text-muted)', fontFamily: 'var(--ac-font-mono)', marginBottom: 4 }}>{t.examples}</div>
              <div style={{ fontSize: 10, color: t.color, fontWeight: 600 }}>{t.cost}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
