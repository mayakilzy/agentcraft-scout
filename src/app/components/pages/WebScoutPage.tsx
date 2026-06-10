import { useState, useRef } from 'react';
import { Globe, Search, Square, CheckCircle, Loader, Clock, ExternalLink } from 'lucide-react';
import { SearchDropdown, type DropdownOption } from '../ui/SearchDropdown';
import { ScoreBar } from '../ui/ScoreBar';
import { QualityBadge } from '../ui/QualityBadge';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PageId } from '../Sidebar';

const API = 'https://api.agentcraft.info';

const COUNTRY_OPTIONS: DropdownOption[] = [
  ...['Germany','France','Netherlands','Italy','Spain','UK','Poland','Austria','Belgium','Switzerland','Sweden','Denmark','Norway','Finland','Portugal','Greece','Romania','Czech Republic','Hungary'].map(v => ({ value: v, label: v, group: 'Europe' })),
  ...['Turkey','UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','Jordan','Egypt','Morocco','Tunisia','Algeria'].map(v => ({ value: v, label: v, group: 'Middle East' })),
  ...['USA','Canada','Mexico','Brazil','Argentina','Colombia','Chile'].map(v => ({ value: v, label: v, group: 'Americas' })),
  ...['Japan','South Korea','Singapore','Malaysia','Indonesia','Thailand','Australia','New Zealand'].map(v => ({ value: v, label: v, group: 'Asia-Pacific' })),
  ...['South Africa','Nigeria','Kenya','Ethiopia','Ghana'].map(v => ({ value: v, label: v, group: 'Africa' })),
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  ...['Food Processing Machinery','Dairy Processing Lines','Water Bottling Lines','Vegetable Processing','Beverage Production','Bakery Equipment','Meat Processing','Packaging Machinery'].map(v => ({ value: v, label: v, group: 'Food & Beverage' })),
  ...['Textile Machinery','Knitting Machines','Weaving Equipment','Dyeing & Finishing','Garment Manufacturing'].map(v => ({ value: v, label: v, group: 'Textile & Apparel' })),
  ...['Metal Fabrication','CNC Machinery','Welding Equipment','Sheet Metal','Casting & Forging','Industrial Automation'].map(v => ({ value: v, label: v, group: 'Metal & Engineering' })),
  ...['Plastic Injection Molding','Extrusion Lines','Blow Molding','Chemical Manufacturing','Paint Production'].map(v => ({ value: v, label: v, group: 'Plastics & Chemicals' })),
  ...['Industrial Manufacturer','Factory / Fabrika','OSB Company','Exporter','Wholesaler'].map(v => ({ value: v, label: v, group: 'General' })),
];

const RESULT_LIMITS = [20, 60, 100, 'Max'] as const;
type TargetType = 'no-website' | 'broken' | 'both';

export function WebScoutPage({onNavigate}:{onNavigate?:(p:PageId)=>void}={}) {
  const [country,  setCountry]  = useState('');
  const [category, setCategory] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('no-website');
  const [limit, setLimit] = useState<typeof RESULT_LIMITS[number]>(60);

  const [running,     setRunning]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [elapsed,     setElapsed]     = useState(0);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [error,       setError]       = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const abortRef = useRef<AbortController|null>(null);

  const canStart = !!(country && category);
  const fmt = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const noWebsite = liveResults.filter(c => !c.has_website).length;
  const withWebsite = liveResults.filter(c => c.has_website).length;

  const stopScout = () => {
    abortRef.current?.abort();
    if(timerRef.current) clearInterval(timerRef.current);
    setRunning(false);setDone(true);setProgress(100);
  };

  const startScout = async () => {
    if(!canStart) return;
    setRunning(true);setDone(false);setProgress(5);setElapsed(0);setLiveResults([]);setError('');
    timerRef.current = setInterval(()=>setElapsed(s=>s+1),1000);
    abortRef.current = new AbortController();
    try {
      const limitNum = limit==='Max' ? 200 : limit;
      const res = await window.fetch(`${API}/scout/search`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          province: country,
          category,
          limit: limitNum,
          arm: 'web',
          campaign_name: `${country} — ${category} (Web)`,
          language: 'EN',
        }),
        signal: abortRef.current.signal,
      });
      if(!res.ok||!res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let found = 0;
      while(true){
        const {done:sd,value} = await reader.read();
        if(sd) break;
        buffer += decoder.decode(value,{stream:true});
        const lines = buffer.split('\n');
        buffer = lines.pop()||'';
        for(const line of lines){
          if(!line.startsWith('data: ')) continue;
          try{
            const evt = JSON.parse(line.slice(6));
            if(evt.type==='start'){setProgress(10);}
            else if(evt.type==='company'){
              found++;
              setLiveResults(prev=>[...prev,evt.data]);
              setProgress(Math.min(90,10+found*2));
            }
            else if(evt.type==='done'){
              setProgress(100);setDone(true);setRunning(false);
              if(timerRef.current) clearInterval(timerRef.current);
            }
            else if(evt.type==='error'){
              setError(evt.message||'Unknown error');setRunning(false);
              if(timerRef.current) clearInterval(timerRef.current);
            }
          }catch{}
        }
      }
    }catch(e:any){
      if(e?.name!=='AbortError') setError(String(e));
      setRunning(false);
      if(timerRef.current) clearInterval(timerRef.current);
    }
    setDone(true);setRunning(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20,maxWidth:900}}>

      {/* Config Card */}
      <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid var(--ac-border)',background:'rgba(91,156,246,0.04)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:6,background:'rgba(91,156,246,0.12)',border:'1px solid rgba(91,156,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Globe size={16} style={{color:'var(--ac-info)'}}/>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'var(--ac-text-primary)'}}>Web Scout Mission</div>
            <div style={{fontSize:12,color:'var(--ac-text-muted)',marginTop:1}}>Find companies that need a website — your next clients</div>
          </div>
        </div>
        <div style={{padding:24,display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Country / Region</label>
              <SearchDropdown options={COUNTRY_OPTIONS} value={country} onChange={setCountry} placeholder="Select country..."/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Business Category</label>
              <SearchDropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder="Select category..."/>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:8,fontWeight:500}}>Target Type</label>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {([
                  {value:'no-website',label:'No Website at all',    note:'Easiest to convince'},
                  {value:'broken',    label:'Broken / Expired Site', note:'Most urgent'},
                  {value:'both',      label:'Both',                  note:'Maximum reach'},
                ] as const).map(opt=>(
                  <label key={opt.value} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                    <div onClick={()=>setTargetType(opt.value)} style={{width:16,height:16,borderRadius:'50%',flexShrink:0,border:`2px solid ${targetType===opt.value?'var(--ac-gold)':'var(--ac-border-med)'}`,background:targetType===opt.value?'var(--ac-gold)':'none',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 150ms'}}>
                      {targetType===opt.value&&<div style={{width:5,height:5,borderRadius:'50%',background:'#0a0d12'}}/>}
                    </div>
                    <span style={{fontSize:13,color:'var(--ac-text-primary)'}}>{opt.label}</span>
                    <span style={{fontSize:11,color:'var(--ac-text-muted)'}}>— {opt.note}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:8,fontWeight:500}}>Results Limit</label>
              <div style={{display:'flex',gap:6}}>
                {RESULT_LIMITS.map(opt=>{const active=opt===limit;return(
                  <button key={String(opt)} onClick={()=>setLimit(opt)} style={{padding:'6px 14px',borderRadius:5,border:'1px solid',borderColor:active?'var(--ac-gold)':'var(--ac-border-med)',background:active?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:active?'var(--ac-gold)':'var(--ac-text-sec)',fontSize:12,cursor:'pointer',fontWeight:active?600:400,transition:'all 150ms'}}>{String(opt)}</button>
                );})}
              </div>
            </div>
          </div>
          {!canStart&&<div style={{fontSize:12,color:'var(--ac-text-muted)'}}><span style={{color:'var(--ac-gold)'}}>↑</span> Select a country and category to begin</div>}
          <button className="ac-btn-gold" disabled={!canStart||running} onClick={startScout}
            style={{width:'100%',padding:13,fontSize:14,fontWeight:700,borderRadius:6,letterSpacing:'0.04em',opacity:canStart&&!running?1:0.45,cursor:canStart&&!running?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {running?<Loader size={16} style={{animation:'spin 1s linear infinite'}}/>:<Globe size={16}/>}
            {running?'SEARCHING...':'START WEB SCOUT'}
          </button>
        </div>
      </div>

      {/* Progress + Results */}
      {(running||done)&&(
        <div style={{background:'var(--ac-bg-card)',border:`1px solid ${done?'rgba(45,212,160,0.3)':'rgba(91,156,246,0.3)'}`,borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {done?<CheckCircle size={18} style={{color:'var(--ac-success)'}}/>:<Loader size={18} style={{color:'var(--ac-info)',animation:'spin 1s linear infinite'}}/>}
              <div>
                <div style={{fontSize:14,fontWeight:600,color:done?'var(--ac-success)':'var(--ac-info)'}}>
                  {done?`✓ Web Scout Complete — ${liveResults.length} companies found`:`Scanning ${country} — ${category}`}
                </div>
                {!done&&<div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:1}}>Fetching real data from Scrapling...</div>}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac-text-muted)',fontSize:12}}><Clock size={12}/>{fmt(elapsed)}</div>
              {running&&<button onClick={stopScout} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:5,padding:'6px 12px',cursor:'pointer',color:'var(--ac-danger)',fontSize:12}}><Square size={12} fill="currentColor"/>STOP</button>}
            </div>
          </div>
          <div style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
            {/* Progress bar */}
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{flex:1,height:6,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:3,transition:'width 300ms ease',width:`${progress}%`,background:done?'linear-gradient(90deg,var(--ac-success),#5bf0c0)':'linear-gradient(90deg,var(--ac-info),#7bb8ff)'}}/>
              </div>
              <span style={{fontFamily:'var(--ac-font-mono)',fontSize:13,color:done?'var(--ac-success)':'var(--ac-info)',minWidth:40}}>{Math.round(progress)}%</span>
            </div>

            {error&&<div style={{background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:6,padding:'10px 14px',fontSize:12,color:'var(--ac-danger)'}}>⚠ {error}</div>}

            {/* Summary cards */}
            {done&&liveResults.length>0&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                {[
                  {icon:'🔴',label:'No Website',    count:noWebsite,   color:'var(--ac-danger)',  border:'rgba(226,85,85,0.3)',   note:'Easiest to convince',    filter:{hasWebsite:false}, page:'companies' as PageId},
                  {icon:'🟡',label:'Has Website',   count:withWebsite, color:'var(--ac-gold)',    border:'var(--ac-border-gold)', note:'May need upgrade',        filter:{hasWebsite:true},  page:'companies' as PageId},
                  {icon:'🟢',label:'Total Found',   count:liveResults.length, color:'var(--ac-success)',border:'rgba(45,212,160,0.3)',note:'Saved to Companies DB', filter:{arm:'web'},        page:'companies' as PageId},
                ].map((c,i)=>(
                  <div key={i} style={{background:'var(--ac-bg-input)',border:`1px solid ${c.border}`,borderRadius:8,padding:16}}>
                    <div style={{fontSize:20,marginBottom:6}}>{c.icon}</div>
                    <div style={{fontFamily:'var(--ac-font-mono)',fontSize:28,fontWeight:700,color:c.color,lineHeight:1}}>{c.count}</div>
                    <div style={{fontSize:12,color:'var(--ac-text-primary)',marginTop:4,fontWeight:500}}>{c.label}</div>
                    <div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:2,marginBottom:10}}>{c.note}</div>
                    <button onClick={()=>{sessionStorage.setItem('companies_filter',JSON.stringify(c.filter));onNavigate?.(c.page);}} style={{width:'100%',padding:'6px',borderRadius:5,border:`1px solid ${c.border}`,background:'none',color:c.color,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                      View All →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Live results table */}
            {liveResults.length>0&&(
              <div style={{border:'1px solid var(--ac-border)',borderRadius:6,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:'1px solid var(--ac-border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:500,color:'var(--ac-text-sec)'}}>Live Results {running&&<span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'var(--ac-info)',marginLeft:6,animation:'pulse 1s infinite'}}/>}</span>
                  <span style={{fontSize:11,fontFamily:'var(--ac-font-mono)',color:'var(--ac-text-muted)'}}>{liveResults.length} found</span>
                </div>
                <div style={{overflowX:'auto',maxHeight:320,overflowY:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead style={{position:'sticky',top:0,background:'var(--ac-bg-card)',zIndex:1}}>
                      <tr style={{borderBottom:'1px solid var(--ac-border)'}}>
                        {['#','Company','City','Phone','Website','Rating','Score'].map(h=>(
                          <th key={h} style={{padding:'8px 12px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {liveResults.map((c:any,i:number)=>(
                        <tr key={c.id||i} style={{borderBottom:'1px solid var(--ac-border)',animation:'ac-fadeIn 200ms ease'}}
                          onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                          onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                          <td style={{padding:'8px 12px',color:'var(--ac-text-muted)',fontSize:11,fontFamily:'var(--ac-font-mono)'}}>{i+1}</td>
                          <td style={{padding:'8px 12px',color:'var(--ac-text-primary)',fontWeight:500}}>{c.name}</td>
                          <td style={{padding:'8px 12px',color:'var(--ac-text-sec)'}}>{c.city||c.province}</td>
                          <td style={{padding:'8px 12px',textAlign:'center',color:c.has_phone?'var(--ac-success)':'var(--ac-text-muted)'}}>{c.has_phone?'✓':'✗'}</td>
                          <td style={{padding:'8px 12px',textAlign:'center'}}>
                            {c.has_website&&c.website
                              ?<a href={c.website} target="_blank" rel="noreferrer" style={{color:'var(--ac-info)',display:'flex',alignItems:'center',gap:3,justifyContent:'center',fontSize:11}}><ExternalLink size={10}/>Visit</a>
                              :<span style={{color:'var(--ac-text-muted)'}}>✗</span>}
                          </td>
                          <td style={{padding:'8px 12px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)',fontSize:11}}>★ {(c.rating||0).toFixed(1)}</td>
                          <td style={{padding:'8px 12px',minWidth:120}}><div style={{display:'flex',alignItems:'center',gap:6}}><ScoreBar score={c.quality_score||0}/><QualityBadge score={c.quality_score||0}/></div></td>
                        </tr>
                      ))}
                      {running&&<tr><td colSpan={7} style={{padding:'8px 12px'}}><div style={{display:'flex',alignItems:'center',gap:6,color:'var(--ac-text-muted)',fontSize:11}}><Loader size={11} style={{animation:'spin 1s linear infinite'}}/>Streaming results...</div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Done message */}
            {done&&liveResults.length>0&&(
              <div style={{background:'rgba(45,212,160,0.06)',border:'1px solid rgba(45,212,160,0.2)',borderRadius:6,padding:'12px 16px',display:'flex',alignItems:'center',gap:8}}>
                <Search size={14} style={{color:'var(--ac-success)'}}/>
                <span style={{fontSize:13,color:'var(--ac-text-sec)'}}>
                  Scout complete — <span style={{color:'var(--ac-gold)',fontFamily:'var(--ac-font-mono)',fontWeight:700}}>{liveResults.length}</span> companies found in <strong style={{color:'var(--ac-text-primary)'}}>{country} / {category}</strong>. Results saved to Companies DB.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
