import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Upload, Mail, Trash2, X, Check, Phone, ExternalLink, MapPin, Star, Tag, Building2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import type { PageId } from '../Sidebar';
import { StatusBadge } from '../ui/StatusBadge';
import { QualityBadge } from '../ui/QualityBadge';
import { ScoreBar } from '../ui/ScoreBar';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Company Profile Modal ────────────────────────────────────────────────────
function CompanyModal({company,onClose}:{company:any;onClose:()=>void}) {
  const InfoRow=({icon,label,value,link}:{icon:React.ReactNode;label:string;value:string;link?:string})=>(
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:'1px solid var(--ac-border)'}}>
      <div style={{color:'var(--ac-gold)',marginTop:1,flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:'var(--ac-text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{label}</div>
        {link
          ?<a href={link} target="_blank" rel="noreferrer" style={{color:'var(--ac-info)',fontSize:13,wordBreak:'break-all'}}>{value}</a>
          :<div style={{color:'var(--ac-text-primary)',fontSize:13}}>{value||'—'}</div>}
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:10,width:'100%',maxWidth:540,maxHeight:'88vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'20px 20px 14px',borderBottom:'1px solid var(--ac-border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{flex:1,paddingRight:12}}>
            <div style={{fontWeight:700,fontSize:16,color:'var(--ac-text-primary)',lineHeight:1.3}}>{company.name}</div>
            <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
              <span style={{background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',borderRadius:4,padding:'2px 8px',fontSize:11,color:'var(--ac-gold)'}}>{company.category||'—'}</span>
              <span style={{background:'var(--ac-bg-hover)',borderRadius:4,padding:'2px 8px',fontSize:11,color:'var(--ac-text-sec)'}}>{company.province||'—'}</span>
              {company.city&&company.city!==company.province&&<span style={{background:'var(--ac-bg-hover)',borderRadius:4,padding:'2px 8px',fontSize:11,color:'var(--ac-text-sec)'}}>{company.city}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:6,padding:6,cursor:'pointer',color:'var(--ac-text-sec)',display:'flex',flexShrink:0}}><X size={16}/></button>
        </div>
        {/* Score strip */}
        <div style={{padding:'12px 20px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',gap:16,background:'var(--ac-bg-input)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <Star size={14} style={{color:'var(--ac-gold)'}}/>
            <span style={{fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)',fontWeight:600}}>{company.rating?.toFixed(1)??'—'}</span>
            <span style={{color:'var(--ac-text-muted)',fontSize:12}}>rating</span>
          </div>
          <div style={{width:1,height:20,background:'var(--ac-border)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:8}}><ScoreBar score={company.quality_score}/><QualityBadge score={company.quality_score}/></div>
          {company.reviews_count&&<><div style={{width:1,height:20,background:'var(--ac-border)'}}/><span style={{fontSize:12,color:'var(--ac-text-sec)'}}>{company.reviews_count} reviews</span></>}
        </div>
        {/* Details */}
        <div style={{overflowY:'auto',flex:1,padding:'0 20px'}}>
          {company.phone&&<InfoRow icon={<Phone size={14}/>} label="Phone" value={company.phone}/>}
          {company.website&&<InfoRow icon={<ExternalLink size={14}/>} label="Website" value={company.website} link={company.website}/>}
          {company.email&&<InfoRow icon={<Mail size={14}/>} label="Email" value={company.email} link={`mailto:${company.email}`}/>}
          <InfoRow icon={<MapPin size={14}/>} label="Location" value={[company.city,company.province,'Turkey'].filter(Boolean).join(', ')}/>
          {company.address&&<InfoRow icon={<MapPin size={14}/>} label="Address" value={company.address}/>}
          <InfoRow icon={<Tag size={14}/>} label="Category" value={company.category||'—'}/>
          {company.business_status&&<InfoRow icon={<Building2 size={14}/>} label="Business Status" value={company.business_status}/>}
          {company.contact_status&&<InfoRow icon={<Tag size={14}/>} label="Contact Status" value={company.contact_status}/>}
          {company.notes&&<InfoRow icon={<Tag size={14}/>} label="Notes" value={company.notes}/>}
        </div>
        {/* Footer */}
        <div style={{padding:'14px 20px',borderTop:'1px solid var(--ac-border)',display:'flex',gap:8}}>
          {company.website&&<a href={company.website} target="_blank" rel="noreferrer" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(91,156,246,0.1)',border:'1px solid rgba(91,156,246,0.3)',borderRadius:6,padding:'8px',color:'var(--ac-info)',fontSize:12,textDecoration:'none'}}><ExternalLink size={13}/>Visit Website</a>}
          {company.phone&&<a href={`tel:${company.phone}`} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(45,212,160,0.1)',border:'1px solid rgba(45,212,160,0.3)',borderRadius:6,padding:'8px',color:'var(--ac-success)',fontSize:12,textDecoration:'none'}}><Phone size={13}/>Call</a>}
          {company.email&&<a href={`mailto:${company.email}`} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',borderRadius:6,padding:'8px',color:'var(--ac-gold)',fontSize:12,textDecoration:'none'}}><Mail size={13}/>Email</a>}
        </div>
      </div>
    </div>
  );
}

export function CompaniesDBPage({onNavigate,isEmpty}:{onNavigate?:(p:PageId)=>void;isEmpty?:boolean}={}) {
  const {t}=useLanguage();
  const [companies,setCompanies]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [selected,setSelected]=useState<Set<number>>(new Set());
  const [search,setSearch]=useState('');
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [armFilter,setArmFilter]=useState<string[]>([]);
  const [hasWebsite,setHasWebsite]=useState(false);
  const [noWebsiteOnly,setNoWebsiteOnly]=useState(false);
  const [hasPhone,setHasPhone]=useState(false);
  const [hasEmail,setHasEmail]=useState(false);
  const [minScore,setMinScore]=useState(0);
  const [sortKey,setSortKey]=useState<string|null>(null);
  const [sortDir,setSortDir]=useState<'asc'|'desc'>('desc');
  const [companyModal,setCompanyModal]=useState<any|null>(null);

  useEffect(()=>{
    const raw=sessionStorage.getItem('companies_filter');
    if(raw){
      try{
        const f=JSON.parse(raw);
        if(f.hasWebsite===true)  setHasWebsite(true);
        if(f.hasWebsite===false) setNoWebsiteOnly(true);
        if(f.arm) setArmFilter([f.arm]);
      }catch{}
      sessionStorage.removeItem('companies_filter');
    }
  },[]);

  useEffect(()=>{
    setLoading(true);
    window.fetch('https://api.agentcraft.info/scout/companies?limit=500&sort_by=quality_score')
      .then(r=>r.json()).then(data=>setCompanies(data.companies||[]))
      .catch(e=>setError(String(e))).finally(()=>setLoading(false));
  },[]);

  const filtered=companies.filter(c=>{
    if(search&&!c.name?.toLowerCase().includes(search.toLowerCase())&&!c.province?.toLowerCase().includes(search.toLowerCase()))return false;
    if(armFilter.length&&!armFilter.includes(c.arm||'industrial'))return false;
    if(hasWebsite&&!c.has_website)return false;
    if(noWebsiteOnly&&c.has_website)return false;
    if(hasPhone&&!c.has_phone)return false;
    if(hasEmail&&!c.has_email)return false;
    if((c.quality_score||0)<minScore)return false;
    return true;
  });

  const sorted=sortKey?[...filtered].sort((a,b)=>{
    const av=a[sortKey],bv=b[sortKey];
    const r=av<bv?-1:av>bv?1:0;
    return sortDir==='asc'?r:-r;
  }):filtered;

  const toggleSort=(key:string)=>{if(sortKey===key)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortKey(key);setSortDir('desc');}};
  const toggleSelect=(id:number)=>setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>setSelected(selected.size===sorted.length?new Set():new Set(sorted.map(c=>c.id)));
  const clearFilters=()=>{setArmFilter([]);setHasWebsite(false);setNoWebsiteOnly(false);setHasPhone(false);setHasEmail(false);setMinScore(0);};

  const withWebsite=companies.filter(c=>c.has_website).length;
  const withPhone=companies.filter(c=>c.has_phone).length;
  const highQuality=companies.filter(c=>(c.quality_score||0)>=8).length;
  const total=companies.length;

  const exportSelected=()=>{
    const toExport=selected.size>0?companies.filter(c=>selected.has(c.id)):sorted;
    if(toExport.length===0){alert('No companies to export.');return;}
    const headers=['Name','Province','City','Category','Phone','Website','Email','Rating','Quality Score','Has Phone','Has Website','Has Email'];
    const rows=toExport.map((c:any)=>[
      `"${(c.name||'').replace(/"/g,'""')}"`,`"${c.province||''}"`,`"${c.city||''}"`,`"${c.category||''}"`,
      `"${c.phone||''}"`,`"${c.website||''}"`,`"${c.email||''}"`,
      c.rating||'',c.quality_score||'',c.has_phone?'Yes':'No',c.has_website?'Yes':'No',c.has_email?'Yes':'No',
    ]);
    const csv=[headers.join(','),...rows.map((r:any[])=>r.join(','))].join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`companies_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const SortIcon=({col}:{col:string})=>(
    <span style={{fontSize:9,color:sortKey===col?'var(--ac-gold)':'var(--ac-text-muted)',marginLeft:3}}>
      {sortKey===col?(sortDir==='asc'?'↑':'↓'):'↕'}
    </span>
  );

  if(!loading&&!error&&companies.length===0&&isEmpty)return <EmptyState variant="database" title={t('companies.noData')} subtitle={t('companies.noDataSub')} ctaLabel={t('companies.runScout')} onCta={()=>onNavigate?.('new-scout')}/>;

  // Table columns — compact set
  const cols=[
    {label:'#',        key:'id',           sort:false, w:40},
    {label:'Company',  key:'name',          sort:true,  w:220},
    {label:'Province', key:'province',      sort:true,  w:100},
    {label:'Category', key:'category',      sort:false, w:160},
    {label:'Phone',    key:'has_phone',     sort:false, w:60},
    {label:'Web',      key:'has_website',   sort:false, w:60},
    {label:'⭐ Rating',key:'rating',        sort:true,  w:80},
    {label:'Score',    key:'quality_score', sort:true,  w:140},
    {label:'Actions',  key:'_actions',      sort:false, w:70},
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {companyModal&&<CompanyModal company={companyModal} onClose={()=>setCompanyModal(null)}/>}

      {/* Stats */}
      <div style={{display:'flex',gap:12}}>
        {[
          {label:t('companiesPage.totalCompanies'),value:loading?'…':total,             color:'var(--ac-gold)'},
          {label:t('companiesPage.hasWebsite'),    value:loading?'…':`${withWebsite} (${total?Math.round(withWebsite/total*100):0}%)`, color:'var(--ac-info)'},
          {label:t('companiesPage.hasPhone'),      value:loading?'…':`${withPhone} (${total?Math.round(withPhone/total*100):0}%)`,    color:'var(--ac-success)'},
          {label:'Score 8+',                       value:loading?'…':`${highQuality} (${total?Math.round(highQuality/total*100):0}%)`,color:'var(--ac-gold)'},
        ].map(s=>(
          <div key={s.label} style={{flex:1,background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:'14px 18px'}}>
            <div style={{fontFamily:'var(--ac-font-mono)',fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:'var(--ac-text-sec)',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {error&&<div style={{background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:6,padding:'10px 14px',fontSize:12,color:'var(--ac-danger)'}}>⚠ {error}</div>}

      {/* Toolbar */}
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <button onClick={()=>setSidebarOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:6,border:`1px solid ${sidebarOpen?'var(--ac-border-gold)':'var(--ac-border-med)'}`,background:sidebarOpen?'rgba(200,168,75,0.1)':'var(--ac-bg-input)',color:sidebarOpen?'var(--ac-gold)':'var(--ac-text-sec)',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',fontWeight:500}}>
          <SlidersHorizontal size={13}/>{t('companiesPage.filters')}
        </button>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:7,background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'7px 12px'}}>
          <Search size={13} style={{color:'var(--ac-text-muted)',flexShrink:0}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('companiesPage.searchPlaceholder')} style={{background:'none',border:'none',outline:'none',fontSize:12,color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',width:'100%'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ac-text-muted)',padding:0}}><X size={13}/></button>}
        </div>
        <button onClick={exportSelected} title="Export CSV" style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:6,border:'1px solid rgba(45,212,160,0.3)',background:'rgba(45,212,160,0.08)',color:'var(--ac-success)',fontSize:12,cursor:'pointer'}}>
          <Upload size={13}/>{selected.size>0?`Export (${selected.size})`:'Export All'}
        </button>
        <span style={{fontSize:12,color:'var(--ac-text-muted)',whiteSpace:'nowrap'}}>{sorted.length} / {total}</span>
      </div>

      <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
        {/* Filters sidebar */}
        {sidebarOpen&&(
          <div style={{width:200,flexShrink:0,background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:16,display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)'}}>{t('companiesPage.filters')}</span>
              <button onClick={clearFilters} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ac-gold)',fontSize:11,fontFamily:'var(--ac-font-ui)'}}>{t('companiesPage.clearFilters')}</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)',marginBottom:2}}>{t('companiesPage.arm')}</div>
              <div style={{display:'flex',gap:4}}>
                {['industrial','web'].map(arm=>{const active=armFilter.includes(arm);return(
                  <button key={arm} onClick={()=>setArmFilter(prev=>prev.includes(arm)?prev.filter(a=>a!==arm):[...prev,arm])}
                    style={{flex:1,padding:'5px 4px',borderRadius:5,border:'1px solid',fontSize:11,cursor:'pointer',fontFamily:'var(--ac-font-ui)',transition:'all 150ms',borderColor:active?'var(--ac-gold)':'var(--ac-border-med)',background:active?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:active?'var(--ac-gold)':'var(--ac-text-sec)'}}>
                    {arm==='web'?'🌐 Web':'🏭 Ind.'}
                  </button>
                );})}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)',marginBottom:2}}>{t('companiesPage.dataPresent')}</div>
              <ToggleSwitch checked={hasWebsite} onChange={v=>{setHasWebsite(v);if(v)setNoWebsiteOnly(false);}} label={t('companiesPage.hasWebsite')}/>
              <ToggleSwitch checked={noWebsiteOnly} onChange={v=>{setNoWebsiteOnly(v);if(v)setHasWebsite(false);}} label="No Website"/>
              <ToggleSwitch checked={hasPhone} onChange={setHasPhone} label={t('companiesPage.hasPhone')}/>
              <ToggleSwitch checked={hasEmail} onChange={setHasEmail} label={t('companiesPage.hasEmail')}/>
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)'}}>{t('companiesPage.minScore')}</span>
                <span style={{fontFamily:'var(--ac-font-mono)',fontSize:11,color:'var(--ac-gold)'}}>{minScore}</span>
              </div>
              <input type="range" min={0} max={10} value={minScore} onChange={e=>setMinScore(Number(e.target.value))}
                style={{width:'100%',appearance:'none',height:4,background:`linear-gradient(to right,var(--ac-gold) 0%,var(--ac-gold) ${minScore*10}%,rgba(255,255,255,0.1) ${minScore*10}%,rgba(255,255,255,0.1) 100%)`,borderRadius:2,outline:'none',cursor:'pointer'}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--ac-text-muted)',marginTop:3}}><span>0</span><span>10</span></div>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{flex:1,minWidth:0}}>
          {selected.size>0&&(
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',background:'rgba(200,168,75,0.08)',border:'1px solid var(--ac-border-gold)',borderRadius:6,marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--ac-gold)'}}>
                <X size={13} style={{cursor:'pointer',verticalAlign:'middle',marginRight:5}} onClick={()=>setSelected(new Set())}/>
                {selected.size} {t('companiesPage.selected')}
              </span>
              <div style={{display:'flex',gap:6,marginLeft:'auto'}}>
                <button onClick={exportSelected} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:5,border:'1px solid rgba(91,156,246,0.44)',background:'rgba(91,156,246,0.15)',color:'var(--ac-info)',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                  <Upload size={12}/>Export
                </button>
                <button onClick={()=>setSelected(new Set())} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:5,border:'1px solid rgba(226,85,85,0.44)',background:'rgba(226,85,85,0.15)',color:'var(--ac-danger)',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                  <Trash2 size={12}/>Delete
                </button>
              </div>
            </div>
          )}

          <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--ac-font-ui)',tableLayout:'auto'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--ac-border-med)'}}>
                    <th style={{padding:'10px 14px',background:'var(--ac-bg-card)',width:40}}>
                      <div onClick={toggleAll} style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${selected.size===sorted.length&&sorted.length>0?'var(--ac-gold)':'var(--ac-border-med)'}`,background:selected.size===sorted.length&&sorted.length>0?'var(--ac-gold)':'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {selected.size===sorted.length&&sorted.length>0&&<Check size={9} style={{color:'#0a0d12'}}/>}
                      </div>
                    </th>
                    {cols.map(col=>(
                      <th key={col.key} onClick={()=>col.sort&&toggleSort(col.key)}
                        style={{padding:'10px 12px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap',background:'var(--ac-bg-card)',cursor:col.sort?'pointer':'default',userSelect:'none',width:col.w}}>
                        {col.label}{col.sort&&<SortIcon col={col.key}/>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading?Array.from({length:8}).map((_,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                      {Array.from({length:cols.length+1}).map((_,j)=><td key={j} style={{padding:'9px 12px'}}><div style={{height:11,borderRadius:3,background:'var(--ac-bg-hover)',width:j===2?140:j===4?80:60}}/></td>)}
                    </tr>
                  )):sorted.map((c:any,i:number)=>{
                    const isSel=selected.has(c.id);
                    return(
                      <tr key={c.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms',background:isSel?'rgba(200,168,75,0.05)':'none'}}
                        onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background='var(--ac-bg-hover)';}}
                        onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='none';}}>
                        <td style={{padding:'9px 14px'}}>
                          <div onClick={()=>toggleSelect(c.id)} style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${isSel?'var(--ac-gold)':'var(--ac-border-med)'}`,background:isSel?'var(--ac-gold)':'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            {isSel&&<Check size={9} style={{color:'#0a0d12'}}/>}
                          </div>
                        </td>
                        <td style={{padding:'9px 12px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-text-muted)',fontSize:10}}>{i+1}</td>
                        <td style={{padding:'9px 12px',fontWeight:500,color:'var(--ac-text-primary)',maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</td>
                        <td style={{padding:'9px 12px',color:'var(--ac-text-sec)',whiteSpace:'nowrap'}}>{c.province}</td>
                        <td style={{padding:'9px 12px',color:'var(--ac-text-sec)',fontSize:11,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.category}</td>
                        <td style={{padding:'9px 12px',textAlign:'center',color:c.has_phone?'var(--ac-success)':'var(--ac-text-muted)'}}>{c.has_phone?'✓':'✗'}</td>
                        <td style={{padding:'9px 12px',textAlign:'center',color:c.has_website?'var(--ac-info)':'var(--ac-text-muted)'}}>{c.has_website?'✓':'✗'}</td>
                        <td style={{padding:'9px 12px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)',fontSize:11,whiteSpace:'nowrap'}}>★ {(c.rating||0).toFixed(1)}</td>
                        <td style={{padding:'9px 12px',minWidth:140}}>
                          <div style={{display:'flex',alignItems:'center',gap:5}}><ScoreBar score={c.quality_score||0}/><QualityBadge score={c.quality_score||0}/></div>
                        </td>
                        <td style={{padding:'9px 12px'}}>
                          <button onClick={()=>setCompanyModal(c)}
                            style={{padding:'3px 10px',borderRadius:4,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.08)',color:'var(--ac-gold)',fontSize:10,cursor:'pointer',fontWeight:600,whiteSpace:'nowrap'}}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(200,168,75,0.18)')}
                            onMouseLeave={e=>(e.currentTarget.style.background='rgba(200,168,75,0.08)')}>
                            {t('common.view')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
