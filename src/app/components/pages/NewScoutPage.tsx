import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, Square, CheckCircle, Clock, Loader, Circle } from 'lucide-react';
import { SearchDropdown, type DropdownOption } from '../ui/SearchDropdown';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { ScoreBar } from '../ui/ScoreBar';
import { QualityBadge } from '../ui/QualityBadge';
import { useLanguage } from '../../contexts/LanguageContext';

const API = 'https://api.agentcraft.info';

const PROVINCE_OPTIONS: DropdownOption[] = [
  ...['Istanbul','Bursa','Kocaeli','Sakarya','Tekirdağ','Edirne','Kırklareli','Çanakkale','Balıkesir','Yalova','Bilecik','Düzce'].map(v=>({value:v,label:v,group:'Marmara (Industrial Core)'})),
  ...['İzmir','Manisa','Aydın','Denizli','Muğla','Afyonkarahisar','Kütahya','Uşak'].map(v=>({value:v,label:v,group:'Aegean'})),
  ...['Ankara','Konya','Eskişehir','Kayseri','Sivas','Yozgat','Kırıkkale','Aksaray','Niğde','Nevşehir','Kırşehir','Karaman'].map(v=>({value:v,label:v,group:'Central Anatolia'})),
  ...['Antalya','Mersin','Adana','Hatay','Kahramanmaraş','Osmaniye','Isparta','Burdur'].map(v=>({value:v,label:v,group:'Mediterranean'})),
  ...['Gaziantep','Şanlıurfa','Diyarbakır','Adıyaman','Mardin','Kilis','Siirt','Batman','Şırnak'].map(v=>({value:v,label:v,group:'Southeast & East'})),
  ...['Trabzon','Samsun','Zonguldak','Karabük','Kastamonu','Bartın','Bolu','Sinop','Ordu','Giresun','Rize','Artvin','Amasya','Tokat','Çorum'].map(v=>({value:v,label:v,group:'Black Sea'})),
  ...['Erzurum','Malatya','Elazığ','Van','Ağrı','Kars','Iğdır','Ardahan','Erzincan','Bingöl','Muş','Bitlis','Tunceli','Hakkari','Bayburt','Gümüşhane'].map(v=>({value:v,label:v,group:'Eastern Anatolia'})),
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  ...['Food Processing Machinery','Dairy Processing Lines','Water Bottling Lines','Vegetable Processing','Beverage Production','Bakery Equipment','Meat Processing','Packaging Machinery'].map(v=>({value:v,label:v,group:'Food & Beverage'})),
  ...['Textile Machinery','Knitting Machines','Weaving Equipment','Dyeing & Finishing','Garment Manufacturing'].map(v=>({value:v,label:v,group:'Textile & Apparel'})),
  ...['Metal Fabrication','CNC Machinery','Welding Equipment','Sheet Metal','Casting & Forging','Industrial Automation'].map(v=>({value:v,label:v,group:'Metal & Engineering'})),
  ...['Plastic Injection Molding','Extrusion Lines','Blow Molding','Chemical Manufacturing','Paint Production'].map(v=>({value:v,label:v,group:'Plastics & Chemicals'})),
  ...['Ceramic & Tile','Marble & Stone','Cement & Concrete','Insulation Materials','PVC Profiles'].map(v=>({value:v,label:v,group:'Construction Materials'})),
  ...['Electrical Panel Manufacturer','Motor & Generator','Lighting Manufacturer','Cable & Wire'].map(v=>({value:v,label:v,group:'Electronics & Electrical'})),
  ...['Agricultural Machinery','Greenhouse Equipment','Irrigation Systems','Feed Production'].map(v=>({value:v,label:v,group:'Agriculture'})),
  ...['Industrial Manufacturer','Factory / Fabrika','OSB Company','Exporter','Wholesaler'].map(v=>({value:v,label:v,group:'General'})),
];

const LANGUAGES = [
  {code:'TR',flag:'🇹🇷',label:'TR'},
  {code:'EN',flag:'🇬🇧',label:'EN'},
  {code:'AR',flag:'🇸🇦',label:'AR'},
  {code:'FA',flag:'🇮🇷',label:'FA'},
];

const RESULT_LIMITS = [20,60,100,200,'MAX'] as const;
const SEARCH_DEPTHS = ['Standard','Deep','Full City'] as const;

type StepStatus = 'done'|'active'|'pending';
interface Step { label:string; status:StepStatus; count?:number; }

function SliderInput({label,min,max,value,onChange,step=1}:{label:string;min:number;max:number;value:number;onChange:(v:number)=>void;step?:number}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:'var(--ac-text-sec)'}}>{label}</span>
        <span style={{fontFamily:'var(--ac-font-mono)',fontSize:12,color:'var(--ac-gold)',minWidth:28,textAlign:'right'}}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{width:'100%',height:4,appearance:'none',background:`linear-gradient(to right,var(--ac-gold) 0%,var(--ac-gold) ${((value-min)/(max-min))*100}%,rgba(255,255,255,0.1) ${((value-min)/(max-min))*100}%,rgba(255,255,255,0.1) 100%)`,borderRadius:2,outline:'none',cursor:'pointer'}}/>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--ac-text-muted)'}}><span>{min}</span><span>{max}</span></div>
    </div>
  );
}

function SegmentButtons<T extends string|number>({options,value,onChange}:{options:readonly T[];value:T;onChange:(v:T)=>void}) {
  return (
    <div style={{display:'flex',gap:4}}>
      {options.map(opt=>{const active=opt===value;return(
        <button key={String(opt)} onClick={()=>onChange(opt)} style={{padding:'5px 12px',borderRadius:5,border:'1px solid',borderColor:active?'var(--ac-gold)':'var(--ac-border-med)',background:active?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:active?'var(--ac-gold)':'var(--ac-text-sec)',fontFamily:'var(--ac-font-ui)',fontSize:12,cursor:'pointer',fontWeight:active?600:400,transition:'all 150ms'}}>{String(opt)}</button>
      );})}
    </div>
  );
}

function StepIndicator({steps}:{steps:Step[]}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:0,flexWrap:'wrap',rowGap:8}}>
      {steps.map((step,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            {step.status==='done'&&<CheckCircle size={14} style={{color:'var(--ac-success)',flexShrink:0}}/>}
            {step.status==='active'&&<div style={{width:14,height:14,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}><Loader size={14} style={{color:'var(--ac-gold)',animation:'spin 1s linear infinite'}}/></div>}
            {step.status==='pending'&&<Circle size={14} style={{color:'var(--ac-text-muted)',flexShrink:0}}/>}
            <span style={{fontSize:12,color:step.status==='done'?'var(--ac-success)':step.status==='active'?'var(--ac-gold)':'var(--ac-text-muted)',whiteSpace:'nowrap'}}>
              {step.label}{step.count!==undefined?`: ${step.count}`:''}
            </span>
          </div>
          {i<steps.length-1&&<span style={{margin:'0 8px',color:'var(--ac-text-muted)',fontSize:12}}>→</span>}
        </div>
      ))}
    </div>
  );
}

export function NewScoutPage() {
  const {t} = useLanguage();

  const [province,setProvince] = useState('');
  const [category,setCategory] = useState('');

  // Read prefill from Analytics white spots
  useEffect(()=>{
    const raw=sessionStorage.getItem('scout_prefill');
    if(raw){try{const d=JSON.parse(raw);if(d.province)setProvince(d.province);if(d.category)setCategory(d.category);}catch{}sessionStorage.removeItem('scout_prefill');}
  },[]);
  const [keywords,setKeywords] = useState('');
  const [langs,setLangs] = useState<string[]>(['TR']);
  const [limit,setLimit] = useState<typeof RESULT_LIMITS[number]>(60);
  const [depth,setDepth] = useState<typeof SEARCH_DEPTHS[number]>('Standard');
  const [advOpen,setAdvOpen] = useState(false);
  const [minRating,setMinRating] = useState(0);
  const [minScore,setMinScore] = useState(0);
  const [requireWebsite,setRequireWebsite] = useState(false);
  const [requirePhone,setRequirePhone] = useState(false);
  const [campaignName,setCampaignName] = useState('');
  const [autoExport,setAutoExport] = useState(false);

  const [running,setRunning] = useState(false);
  const [progress,setProgress] = useState(0);
  const [elapsed,setElapsed] = useState(0);
  const [liveResults,setLiveResults] = useState<any[]>([]);
  const [steps,setSteps] = useState<Step[]>([]);
  const [done,setDone] = useState(false);
  const [error,setError] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const abortRef = useRef<AbortController|null>(null);

  const toggleLang = (code:string) => setLangs(prev=>prev.includes(code)?prev.filter(l=>l!==code):[...prev,code]);
  const formatElapsed = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const buildSteps = (pct:number,found:number): Step[] => [
    {label:'Connecting', status:pct>=5?'done':pct>0?'active':'pending'},
    {label:'Batch 1',    status:pct>=30?'done':pct>=5?'active':'pending', count:pct>=30?Math.floor(found*0.33):undefined},
    {label:'Batch 2',    status:pct>=60?'done':pct>=30?'active':'pending', count:pct>=60?Math.floor(found*0.66):undefined},
    {label:'Batch 3',    status:pct>=85?'done':pct>=60?'active':'pending', count:pct>=85?found:undefined},
    {label:'Processing', status:pct>=100?'done':pct>=85?'active':'pending'},
  ];

  const startScout = async () => {
    if (!province||!category) return;
    setRunning(true);
    setDone(false);
    setProgress(5);
    setElapsed(0);
    setLiveResults([]);
    setError('');
    setSteps(buildSteps(5,0));
    if (!campaignName) setCampaignName(`${province} — ${category}`);

    timerRef.current = setInterval(()=>setElapsed(s=>s+1),1000);
    abortRef.current = new AbortController();

    try {
      const limitNum = limit==='MAX'?500:limit;
      const res = await window.fetch(`${API}/scout/search`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          province,
          category,
          keywords:keywords||undefined,
          language:langs.join(','),
          limit:limitNum,
          depth:depth.toLowerCase().replace(' ','_'),
          campaign_name:campaignName||`${province} — ${category}`,
          arm:'industrial',
        }),
        signal:abortRef.current.signal,
      });

      if (!res.ok||!res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let found = 0;

      while (true) {
        const {done:streamDone,value} = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value,{stream:true});
        const lines = buffer.split('\n');
        buffer = lines.pop()||'';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type==='start') {
              setProgress(10);
              setSteps(buildSteps(10,0));
            } else if (evt.type==='company'&&evt.data) {
              found++;
              setLiveResults(prev=>[...prev,evt.data]);
              const pct = Math.min(10+Math.floor((found/limitNum)*75),85);
              setProgress(pct);
              setSteps(buildSteps(pct,found));
            } else if (evt.type==='done') {
              setProgress(100);
              setSteps(buildSteps(100,found));
              setDone(true);
            } else if (evt.type==='error') {
              throw new Error(evt.message||'Stream error');
            }
          } catch {}
        }
      }
    } catch(e:any) {
      if (e.name!=='AbortError') setError(String(e));
    } finally {
      clearInterval(timerRef.current!);
      setRunning(false);
    }
  };

  const stopScout = () => {
    abortRef.current?.abort();
    clearInterval(timerRef.current!);
    setRunning(false);
  };

  useEffect(()=>()=>{
    clearInterval(timerRef.current!);
    abortRef.current?.abort();
  },[]);

  const withWebsite = liveResults.filter(c=>c.has_website||c.website).length;
  const highQuality = liveResults.filter(c=>(c.quality_score||c.score||0)>=8).length;
  const canStart = !!(province&&category&&!running);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20,maxWidth:900}}>

      {/* Config Card */}
      <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid var(--ac-border)',background:'rgba(200,168,75,0.04)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:6,background:'rgba(200,168,75,0.15)',border:'1px solid var(--ac-border-gold)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Search size={16} style={{color:'var(--ac-gold)'}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:'var(--ac-text-primary)'}}>New Scout Mission</div>
              <div style={{fontSize:12,color:'var(--ac-text-muted)',marginTop:1}}>Search industrial companies across Turkey</div>
            </div>
          </div>
        </div>

        <div style={{padding:24,display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Province / City</label>
              <SearchDropdown options={PROVINCE_OPTIONS} value={province} onChange={setProvince} placeholder={t('newScout.province')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Category / Industry</label>
              <SearchDropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder={t('newScout.category')}/>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Search Keywords</label>
              <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder='e.g. "gıda makinaları"'
                style={{width:'100%',background:'var(--ac-bg-input)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'8px 12px',color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',fontSize:13,outline:'none',boxSizing:'border-box'}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--ac-border-gold)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--ac-border-med)')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Search Language</label>
              <div style={{display:'flex',gap:6}}>
                {LANGUAGES.map(lang=>{const active=langs.includes(lang.code);return(
                  <button key={lang.code} onClick={()=>toggleLang(lang.code)}
                    style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:6,border:'1px solid',borderColor:active?'var(--ac-gold)':'var(--ac-border-med)',background:active?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:active?'var(--ac-gold)':'var(--ac-text-sec)',cursor:'pointer',fontSize:12,fontWeight:active?600:400,transition:'all 150ms'}}>
                    <span>{lang.flag}</span><span>{lang.label}</span>
                  </button>
                );})}
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Results Limit</label>
              <SegmentButtons options={RESULT_LIMITS} value={limit} onChange={setLimit}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Search Depth</label>
              <SegmentButtons options={SEARCH_DEPTHS} value={depth} onChange={setDepth}/>
            </div>
          </div>

          <div style={{border:'1px solid var(--ac-border)',borderRadius:6,overflow:'hidden'}}>
            <button onClick={()=>setAdvOpen(o=>!o)}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:advOpen?'rgba(200,168,75,0.05)':'var(--ac-bg-input)',border:'none',cursor:'pointer',color:'var(--ac-text-sec)',fontFamily:'var(--ac-font-ui)',fontSize:12,fontWeight:500,transition:'background 150ms'}}>
              <span>Advanced Options</span>
              {advOpen?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
            </button>
            {advOpen&&(
              <div style={{padding:16,display:'flex',flexDirection:'column',gap:16,borderTop:'1px solid var(--ac-border)'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  <SliderInput label={t('newScout.minRating')} min={0} max={5} value={minRating} onChange={setMinRating} step={0.5}/>
                  <SliderInput label={t('newScout.minScore')} min={0} max={10} value={minScore} onChange={setMinScore}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                  <ToggleSwitch checked={requireWebsite} onChange={setRequireWebsite} label={t('newScout.requireWebsite')}/>
                  <ToggleSwitch checked={requirePhone} onChange={setRequirePhone} label={t('newScout.requirePhone')}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div>
                    <label style={{display:'block',fontSize:12,color:'var(--ac-text-sec)',marginBottom:6,fontWeight:500}}>Campaign Name</label>
                    <input value={campaignName} onChange={e=>setCampaignName(e.target.value)} placeholder={t('newScout.campaignPlaceholder')}
                      style={{width:'100%',background:'var(--ac-bg-input)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'7px 12px',color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',fontSize:13,outline:'none',boxSizing:'border-box'}}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--ac-border-gold)')}
                      onBlur={e=>(e.currentTarget.style.borderColor='var(--ac-border-med)')}/>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',paddingBottom:4}}>
                    <ToggleSwitch checked={autoExport} onChange={setAutoExport} label={t('newScout.autoExport')}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(!province||!category)&&(
            <div style={{fontSize:12,color:'var(--ac-text-muted)',display:'flex',alignItems:'center',gap:6}}>
              <span style={{color:'var(--ac-gold)'}}>↑</span>
              Select a province and category to start the mission
            </div>
          )}

          {error&&(
            <div style={{background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:6,padding:'10px 14px',fontSize:12,color:'var(--ac-danger)'}}>
              ⚠ {error}
            </div>
          )}

          <button className="ac-btn-gold" disabled={!canStart} onClick={startScout}
            style={{width:'100%',padding:'13px',fontSize:14,fontWeight:700,borderRadius:6,letterSpacing:'0.04em',opacity:canStart?1:0.45,cursor:canStart?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Search size={16}/>
            START SCOUT MISSION
          </button>
        </div>
      </div>

      {/* Progress Section */}
      {(running||done)&&(
        <div style={{background:'var(--ac-bg-card)',border:`1px solid ${done?'rgba(45,212,160,0.3)':'var(--ac-border-gold)'}`,borderRadius:8,overflow:'hidden',animation:'ac-fadeIn 200ms ease'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--ac-border)',background:done?'rgba(45,212,160,0.04)':'rgba(200,168,75,0.04)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {done?<CheckCircle size={18} style={{color:'var(--ac-success)'}}/>:<Loader size={18} style={{color:'var(--ac-gold)',animation:'spin 1s linear infinite'}}/>}
              <div>
                <div style={{fontSize:14,fontWeight:600,color:done?'var(--ac-success)':'var(--ac-gold)'}}>
                  {done?`✓ Scout Complete — ${liveResults.length} companies found`:`Searching ${province} — ${category}`}
                </div>
                {!done&&<div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:1}}>Processing results in real-time...</div>}
              </div>
            </div>
            {running&&(
              <button onClick={stopScout}
                style={{display:'flex',alignItems:'center',gap:6,background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:5,padding:'6px 12px',cursor:'pointer',color:'var(--ac-danger)',fontFamily:'var(--ac-font-ui)',fontSize:12,fontWeight:500}}>
                <Square size={12} fill="currentColor"/>STOP
              </button>
            )}
          </div>

          <div style={{padding:24,display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{flex:1,height:8,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:4,transition:'width 300ms ease',width:`${progress}%`,background:done?'linear-gradient(90deg,var(--ac-success) 0%,#5bf0c0 100%)':'linear-gradient(90deg,var(--ac-gold) 0%,var(--ac-gold-bright) 100%)'}}/>
              </div>
              <span style={{fontFamily:'var(--ac-font-mono)',fontSize:13,color:done?'var(--ac-success)':'var(--ac-gold)',minWidth:40}}>{Math.round(progress)}%</span>
              <div style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac-text-muted)',fontSize:12}}>
                <Clock size={12}/>{formatElapsed(elapsed)}
              </div>
            </div>

            <StepIndicator steps={steps}/>

            {liveResults.length>0&&(
              <div style={{border:'1px solid var(--ac-border)',borderRadius:6,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,fontWeight:500,color:'var(--ac-text-sec)'}}>
                    Live Results {running&&<span className="ac-pulse-dot" style={{marginLeft:8}}/>}
                  </span>
                  <span style={{fontSize:11,fontFamily:'var(--ac-font-mono)',color:'var(--ac-text-muted)'}}>{liveResults.length} found</span>
                </div>
                <div style={{overflowX:'auto',maxHeight:300,overflowY:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--ac-font-ui)'}}>
                    <thead style={{position:'sticky',top:0,zIndex:1}}>
                      <tr style={{background:'var(--ac-bg-card)',borderBottom:'1px solid var(--ac-border)'}}>
                        {['#','Company Name','City','Phone','Web','⭐ Rating','Score'].map(h=>(
                          <th key={h} style={{padding:'8px 12px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {liveResults.map((c:any,i:number)=>(
                        <tr key={c.id||i} style={{borderBottom:'1px solid var(--ac-border)',animation:'ac-fadeIn 200ms ease'}}
                          onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                          onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                          <td style={{padding:'8px 12px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-text-muted)',fontSize:11}}>{i+1}</td>
                          <td style={{padding:'8px 12px',color:'var(--ac-text-primary)',fontWeight:500}}>{c.name}</td>
                          <td style={{padding:'8px 12px',color:'var(--ac-text-sec)'}}>{c.city||c.province}</td>
                          <td style={{padding:'8px 12px',textAlign:'center'}}><span style={{color:(c.has_phone||c.phone)?'var(--ac-success)':'var(--ac-text-muted)'}}>{(c.has_phone||c.phone)?'✓':'✗'}</span></td>
                          <td style={{padding:'8px 12px',textAlign:'center'}}><span style={{color:(c.has_website||c.website)?'var(--ac-info)':'var(--ac-text-muted)'}}>{(c.has_website||c.website)?'✓':'✗'}</span></td>
                          <td style={{padding:'8px 12px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)',fontSize:11}}>{(c.rating||0).toFixed(1)}</td>
                          <td style={{padding:'8px 12px',minWidth:120}}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <ScoreBar score={c.quality_score||c.score||0}/>
                              <QualityBadge score={c.quality_score||c.score||0}/>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {running&&(
                        <tr><td colSpan={7} style={{padding:'8px 12px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--ac-text-muted)',fontSize:11}}>
                            <Loader size={11} style={{animation:'spin 1s linear infinite'}}/>Streaming results...
                          </div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {liveResults.length>0&&(
              <div style={{display:'flex',gap:24,padding:'12px 0',borderTop:'1px solid var(--ac-border)'}}>
                {[{label:'Found',value:liveResults.length,color:'var(--ac-text-primary)'},{label:'With Website',value:withWebsite,color:'var(--ac-info)'},{label:'High Quality (8+)',value:highQuality,color:'var(--ac-success)'}].map(s=>(
                  <div key={s.label} style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontFamily:'var(--ac-font-mono)',fontSize:20,fontWeight:700,color:s.color}}>{s.value}</span>
                    <span style={{fontSize:12,color:'var(--ac-text-muted)'}}>{s.label}</span>
                  </div>
                ))}
                {done&&(
                  <div style={{marginLeft:'auto'}}>
                    <button className="ac-btn-gold" onClick={()=>{
                      if(liveResults.length===0)return;
                      const headers=['Name','City','Province','Category','Phone','Website','Email','Rating','Quality Score','Has Phone','Has Website'];
                      const rows=liveResults.map((c:any)=>[
                        `"${(c.name||'').replace(/"/g,'""')}"`,
                        `"${c.city||''}"`,
                        `"${c.province||''}"`,
                        `"${c.category||''}"`,
                        `"${c.phone||''}"`,
                        `"${c.website||''}"`,
                        `"${c.email||''}"`,
                        c.rating||0,
                        c.quality_score||c.score||0,
                        (c.has_phone||c.phone)?'Yes':'No',
                        (c.has_website||c.website)?'Yes':'No',
                      ]);
                      const csv=[headers.join(','),...rows.map((r:any[])=>r.join(','))].join('\n');
                      const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
                      const url=URL.createObjectURL(blob);
                      const a=document.createElement('a');
                      const name=(campaignName||`${province}_${category}`).replace(/[^a-zA-Z0-9_-]/g,'_');
                      a.href=url;a.download=`${name}_results.csv`;
                      document.body.appendChild(a);a.click();document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }} style={{padding:'7px 16px',fontSize:12,borderRadius:5}}>📤 Export Results</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
