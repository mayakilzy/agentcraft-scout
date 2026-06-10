import { useState, useEffect } from 'react';
import { Building2, Zap, Globe, Clock, Eye, Upload, ChevronRight, RefreshCw, X, Phone, ExternalLink, Mail, MapPin, Star, Tag } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import type { PageId } from '../Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StatusBadge } from '../ui/StatusBadge';
import { QualityBadge } from '../ui/QualityBadge';
import { ScoreBar } from '../ui/ScoreBar';
import { SearchDropdown, type DropdownOption } from '../ui/SearchDropdown';
import { useLanguage } from '../../contexts/LanguageContext';

const ALL_PROVINCES = [
  'Istanbul','Bursa','Kocaeli','Sakarya','Tekirdağ','Edirne','Kırklareli','Çanakkale','Balıkesir','Yalova','Bilecik','Düzce',
  'İzmir','Manisa','Aydın','Denizli','Muğla','Afyonkarahisar','Kütahya','Uşak',
  'Ankara','Konya','Eskişehir','Kayseri','Sivas','Yozgat','Kırıkkale','Aksaray','Niğde','Nevşehir','Kırşehir','Karaman',
  'Antalya','Mersin','Adana','Hatay','Kahramanmaraş','Osmaniye','Isparta','Burdur',
  'Gaziantep','Şanlıurfa','Diyarbakır','Adıyaman','Mardin','Kilis','Siirt','Batman','Şırnak',
  'Trabzon','Samsun','Zonguldak','Karabük','Kastamonu','Bartın','Bolu','Sinop','Ordu','Giresun','Rize','Artvin','Amasya','Tokat','Çorum',
  'Erzurum','Malatya','Elazığ','Van','Ağrı','Kars','Iğdır','Ardahan','Erzincan','Bingöl','Muş','Bitlis','Tunceli','Hakkari','Bayburt','Gümüşhane',
];
const PROVINCE_OPTIONS: DropdownOption[] = [
  ...['Istanbul','Bursa','Kocaeli','Sakarya','Tekirdağ','Edirne','Kırklareli','Çanakkale','Balıkesir','Yalova','Bilecik','Düzce'].map(v=>({value:v,label:v,group:'Marmara'})),
  ...['İzmir','Manisa','Aydın','Denizli','Muğla','Afyonkarahisar','Kütahya','Uşak'].map(v=>({value:v,label:v,group:'Aegean'})),
  ...['Ankara','Konya','Eskişehir','Kayseri','Sivas','Yozgat','Kırıkkale','Aksaray','Niğde','Nevşehir','Kırşehir','Karaman'].map(v=>({value:v,label:v,group:'Central Anatolia'})),
  ...['Antalya','Mersin','Adana','Hatay','Kahramanmaraş','Osmaniye','Isparta','Burdur'].map(v=>({value:v,label:v,group:'Mediterranean'})),
  ...['Gaziantep','Şanlıurfa','Diyarbakır','Adıyaman','Mardin','Kilis','Siirt','Batman','Şırnak'].map(v=>({value:v,label:v,group:'Southeast & East'})),
];
const CATEGORY_OPTIONS: DropdownOption[] = [
  ...['Food Processing Machinery','Dairy Processing Lines','Water Bottling Lines','Vegetable Processing','Beverage Production','Bakery Equipment','Meat Processing','Packaging Machinery'].map(v=>({value:v,label:v,group:'Food & Beverage'})),
  ...['Textile Machinery','Knitting Machines','Weaving Equipment','Dyeing & Finishing','Garment Manufacturing'].map(v=>({value:v,label:v,group:'Textile & Apparel'})),
  ...['Metal Fabrication','CNC Machinery','Welding Equipment','Sheet Metal','Casting & Forging','Industrial Automation'].map(v=>({value:v,label:v,group:'Metal & Engineering'})),
  ...['Plastic Injection Molding','Extrusion Lines','Blow Molding','Chemical Manufacturing','Paint Production'].map(v=>({value:v,label:v,group:'Plastics & Chemicals'})),
];

// ─── Campaign Companies Modal ───────────────────────────────────────────────
function CampaignModal({campaign,onClose,onExport}:{campaign:any;onClose:()=>void;onExport:(c:any)=>void}) {
  const [companies,setCompanies]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    window.fetch(`https://api.agentcraft.info/scout/companies?campaign_id=${campaign.id}&limit=500`)
      .then(r=>r.json()).then(d=>setCompanies(d.companies||[])).catch(()=>setCompanies([])).finally(()=>setLoading(false));
  },[campaign.id]);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:10,width:'100%',maxWidth:860,maxHeight:'80vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid var(--ac-border)'}}>
          <div>
            <div style={{fontWeight:600,fontSize:15,color:'var(--ac-text-primary)'}}>{campaign.name}</div>
            <div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:2}}>{campaign.province} · {campaign.category} · {companies.length} companies</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={()=>onExport(campaign)} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(45,212,160,0.1)',border:'1px solid rgba(45,212,160,0.3)',borderRadius:6,padding:'6px 12px',cursor:'pointer',color:'var(--ac-success)',fontSize:12}}>
              <Upload size={13}/>Export CSV
            </button>
            <button onClick={onClose} style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:6,padding:6,cursor:'pointer',color:'var(--ac-text-sec)',display:'flex'}}>
              <X size={16}/>
            </button>
          </div>
        </div>
        {/* Table */}
        <div style={{overflowY:'auto',flex:1}}>
          {loading?(
            <div style={{padding:40,textAlign:'center',color:'var(--ac-text-muted)',fontSize:13}}>Loading companies...</div>
          ):companies.length===0?(
            <div style={{padding:40,textAlign:'center',color:'var(--ac-text-muted)',fontSize:13}}>No companies found for this campaign.</div>
          ):(
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead style={{position:'sticky',top:0,background:'var(--ac-bg-card)',zIndex:1}}>
                <tr style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {['Company','Province','Phone','Website','Rating','Score'].map(h=>(
                    <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c:any)=>(
                  <tr key={c.id} style={{borderBottom:'1px solid var(--ac-border)'}} onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                    <td style={{padding:'9px 14px',color:'var(--ac-text-primary)',fontWeight:500}}>{c.name}</td>
                    <td style={{padding:'9px 14px',color:'var(--ac-text-sec)'}}>{c.province}</td>
                    <td style={{padding:'9px 14px',textAlign:'center'}}><span style={{color:c.has_phone?'var(--ac-success)':'var(--ac-text-muted)'}}>{c.has_phone?'✓':'✗'}</span></td>
                    <td style={{padding:'9px 14px',textAlign:'center'}}>
                      {c.has_website&&c.website?(
                        <a href={c.website} target="_blank" rel="noreferrer" style={{color:'var(--ac-info)',fontSize:11,display:'flex',alignItems:'center',gap:3,justifyContent:'center'}}>
                          <ExternalLink size={11}/>Visit
                        </a>
                      ):<span style={{color:'var(--ac-text-muted)'}}>✗</span>}
                    </td>
                    <td style={{padding:'9px 14px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)',fontSize:11}}>★ {c.rating?.toFixed(1)??'—'}</td>
                    <td style={{padding:'9px 14px',minWidth:120}}><div style={{display:'flex',alignItems:'center',gap:6}}><ScoreBar score={c.quality_score}/><QualityBadge score={c.quality_score}/></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Company Profile Modal ───────────────────────────────────────────────────
function CompanyModal({company,onClose}:{company:any;onClose:()=>void}) {
  const InfoRow=({icon,label,value,link}:{icon:React.ReactNode;label:string;value:string;link?:string})=>(
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:'1px solid var(--ac-border)'}}>
      <div style={{color:'var(--ac-gold)',marginTop:1,flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:'var(--ac-text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{label}</div>
        {link?(
          <a href={link} target="_blank" rel="noreferrer" style={{color:'var(--ac-info)',fontSize:13,wordBreak:'break-all'}}>{value}</a>
        ):(
          <div style={{color:'var(--ac-text-primary)',fontSize:13}}>{value||'—'}</div>
        )}
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:10,width:'100%',maxWidth:540,maxHeight:'85vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'20px 20px 16px',borderBottom:'1px solid var(--ac-border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{flex:1,paddingRight:12}}>
            <div style={{fontWeight:700,fontSize:16,color:'var(--ac-text-primary)',lineHeight:1.3}}>{company.name}</div>
            <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
              <span style={{background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',borderRadius:4,padding:'2px 8px',fontSize:11,color:'var(--ac-gold)'}}>{company.category||'—'}</span>
              <span style={{background:'var(--ac-bg-hover)',borderRadius:4,padding:'2px 8px',fontSize:11,color:'var(--ac-text-sec)'}}>{company.province||'—'}</span>
              {company.city&&company.city!==company.province&&<span style={{background:'var(--ac-bg-hover)',borderRadius:4,padding:'2px 8px',fontSize:11,color:'var(--ac-text-sec)'}}>{company.city}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:6,padding:6,cursor:'pointer',color:'var(--ac-text-sec)',display:'flex',flexShrink:0}}>
            <X size={16}/>
          </button>
        </div>
        {/* Score bar */}
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',gap:16,background:'var(--ac-bg-input)'}}>
          <div style={{display:'flex',align:'center',gap:6}}>
            <Star size={14} style={{color:'var(--ac-gold)'}}/>
            <span style={{fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)',fontWeight:600}}>{company.rating?.toFixed(1)??'—'}</span>
            <span style={{color:'var(--ac-text-muted)',fontSize:12}}>rating</span>
          </div>
          <div style={{width:1,height:20,background:'var(--ac-border)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <ScoreBar score={company.quality_score}/>
            <QualityBadge score={company.quality_score}/>
          </div>
          {company.reviews_count&&<>
            <div style={{width:1,height:20,background:'var(--ac-border)'}}/>
            <span style={{fontSize:12,color:'var(--ac-text-sec)'}}>{company.reviews_count} reviews</span>
          </>}
        </div>
        {/* Details */}
        <div style={{overflowY:'auto',flex:1,padding:'0 20px'}}>
          {company.phone&&<InfoRow icon={<Phone size={14}/>} label="Phone" value={company.phone}/>}
          {company.website&&<InfoRow icon={<ExternalLink size={14}/>} label="Website" value={company.website} link={company.website}/>}
          {company.email&&<InfoRow icon={<Mail size={14}/>} label="Email" value={company.email} link={`mailto:${company.email}`}/>}
          <InfoRow icon={<MapPin size={14}/>} label="Location" value={[company.city,company.province,'Turkey'].filter(Boolean).join(', ')}/>
          {company.address&&<InfoRow icon={<MapPin size={14}/>} label="Address" value={company.address}/>}
          <InfoRow icon={<Tag size={14}/>} label="Category" value={company.category||'—'}/>
          {company.business_status&&<InfoRow icon={<Building2 size={14}/>} label="Status" value={company.business_status}/>}
          {company.notes&&<InfoRow icon={<Tag size={14}/>} label="Notes" value={company.notes}/>}
        </div>
        {/* Footer actions */}
        <div style={{padding:'14px 20px',borderTop:'1px solid var(--ac-border)',display:'flex',gap:8}}>
          {company.website&&(
            <a href={company.website} target="_blank" rel="noreferrer" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(91,156,246,0.1)',border:'1px solid rgba(91,156,246,0.3)',borderRadius:6,padding:'8px',cursor:'pointer',color:'var(--ac-info)',fontSize:12,textDecoration:'none'}}>
              <ExternalLink size={13}/>Visit Website
            </a>
          )}
          {company.phone&&(
            <a href={`tel:${company.phone}`} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(45,212,160,0.1)',border:'1px solid rgba(45,212,160,0.3)',borderRadius:6,padding:'8px',cursor:'pointer',color:'var(--ac-success)',fontSize:12,textDecoration:'none'}}>
              <Phone size={13}/>Call
            </a>
          )}
          {company.email&&(
            <a href={`mailto:${company.email}`} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',borderRadius:6,padding:'8px',cursor:'pointer',color:'var(--ac-gold)',fontSize:12,textDecoration:'none'}}>
              <Mail size={13}/>Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({icon,value,label,valueColor,loading}:{icon:React.ReactNode;value:number;label:string;valueColor:string;loading:boolean}) {
  return (
    <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:24,display:'flex',alignItems:'flex-start',gap:16,flex:1}}>
      <div style={{width:40,height:40,borderRadius:8,background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ac-gold)',flexShrink:0}}>{icon}</div>
      <div>
        <div style={{fontFamily:'var(--ac-font-mono)',fontSize:28,fontWeight:600,color:valueColor,lineHeight:1.1}}>{loading?<span style={{opacity:0.3}}>—</span>:value}</div>
        <div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:4}}>{label}</div>
      </div>
    </div>
  );
}
function Card({title,children,action}:{title:string;children:React.ReactNode;action?:React.ReactNode}) {
  return (
    <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderBottom:'1px solid var(--ac-border)'}}>
        <span style={{fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{title}</span>{action}
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  );
}
function ProvinceCoverage({scraped}:{scraped:Set<string>}) {
  const {t}=useLanguage();
  const [hovered,setHovered]=useState<string|null>(null);
  return (
    <div>
      <div style={{display:'flex',gap:16,marginBottom:12,fontSize:11}}>
        <span style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac-text-sec)'}}><span style={{width:10,height:10,borderRadius:2,background:'var(--ac-gold)',display:'inline-block'}}/>{t('dashboard.scraped')} ({scraped.size})</span>
        <span style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac-text-sec)'}}><span style={{width:10,height:10,borderRadius:2,background:'var(--ac-bg-hover)',border:'1px solid var(--ac-border-med)',display:'inline-block'}}/>{t('dashboard.pending')} ({ALL_PROVINCES.length-scraped.size})</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
        {ALL_PROVINCES.map(p=>{const s=scraped.has(p),h=hovered===p;return(
          <div key={p} title={p} onMouseEnter={()=>setHovered(p)} onMouseLeave={()=>setHovered(null)}
            style={{width:22,height:22,borderRadius:3,background:s?(h?'var(--ac-gold-bright)':'var(--ac-gold)'):(h?'var(--ac-bg-hover)':'rgba(255,255,255,0.05)'),border:`1px solid ${s?'rgba(200,168,75,0.5)':'var(--ac-border)'}`,cursor:'default',transition:'all 150ms ease',flexShrink:0}}/>
        );})}
      </div>
      {hovered&&<div style={{marginTop:8,fontSize:11,color:scraped.has(hovered)?'var(--ac-gold)':'var(--ac-text-muted)'}}>{hovered} — {scraped.has(hovered)?`✓ ${t('dashboard.scraped')}`:t('dashboard.notScrapedYet')}</div>}
    </div>
  );
}
const CustomTooltip=({active,payload,label,t}:any)=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'8px 12px',fontSize:12}}><div style={{color:'var(--ac-text-sec)',marginBottom:2}}>{label}</div><div style={{color:'var(--ac-gold)',fontFamily:'var(--ac-font-mono)',fontWeight:600}}>{payload[0].value} {t('dashboard.companies')}</div></div>;
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export function DashboardPage({onNavigate,isEmpty}:{onNavigate?:(p:PageId)=>void;isEmpty?:boolean}={}) {
  const {t}=useLanguage();
  const [sp,setSp]=useState('');
  const [sc,setSc]=useState('');
  const [stats,setStats]=useState({total_companies:0,active_campaigns:0,have_website:0,scheduled_jobs:0});
  const [campaigns,setCampaigns]=useState<any[]>([]);
  const [top,setTop]=useState<any[]>([]);
  const [cats,setCats]=useState<{name:string;count:number}[]>([]);
  const [provs,setProvs]=useState<Set<string>>(new Set());
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState('');

  // Modals
  const [campaignModal,setCampaignModal]=useState<any|null>(null);
  const [companyModal,setCompanyModal]=useState<any|null>(null);

  useEffect(()=>{
    setLoading(true);setErr('');
    Promise.all([
      window.fetch('https://api.agentcraft.info/scout/stats').then(r=>r.json()),
      window.fetch('https://api.agentcraft.info/scout/campaigns?limit=5').then(r=>r.json()),
      window.fetch('https://api.agentcraft.info/scout/companies?limit=200&sort_by=quality_score').then(r=>r.json()),
    ]).then(([s,c,co])=>{
      setStats(s);
      setCampaigns(c.campaigns||[]);
      const companies=co.companies||[];
      setTop(companies.slice(0,10));
      const cm:Record<string,number>={};
      const ps=new Set<string>();
      companies.forEach((x:any)=>{if(x.category)cm[x.category]=(cm[x.category]||0)+1;if(x.province)ps.add(x.province);});
      setCats(Object.entries(cm).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=>({name,count})));
      setProvs(ps);
    }).catch(e=>setErr(String(e))).finally(()=>setLoading(false));
  },[]);

  const fmt=(iso:string)=>{try{return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}catch{return iso;}};

  const exportCampaignCSV=async(campaign:any)=>{
    try{
      const r=await window.fetch(`https://api.agentcraft.info/scout/companies?campaign_id=${campaign.id}&limit=500`);
      const data=await r.json();
      const companies=data.companies||[];
      if(companies.length===0){alert('No companies found for this campaign.');return;}
      const headers=['Name','Province','City','Category','Phone','Website','Email','Rating','Quality Score','Has Phone','Has Website','Has Email'];
      const rows=companies.map((c:any)=>[
        `"${(c.name||'').replace(/"/g,'""')}"`,`"${c.province||''}"`,`"${c.city||''}"`,`"${c.category||''}"`,
        `"${c.phone||''}"`,`"${c.website||''}"`,`"${c.email||''}"`,
        c.rating||'',c.quality_score||'',c.has_phone?'Yes':'No',c.has_website?'Yes':'No',c.has_email?'Yes':'No',
      ]);
      const csv=[headers.join(','),...rows.map((r:string[])=>r.join(','))].join('\n');
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=`${campaign.name||'campaign'}_companies.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }catch(e){alert('Export failed: '+String(e));}
  };

  if(!loading&&!err&&campaigns.length===0&&isEmpty)return <EmptyState variant="radar" title={t('dashboard.noData')} subtitle={t('dashboard.noDataSub')} ctaLabel={t('dashboard.startFirst')} onCta={()=>onNavigate?.('new-scout')}/>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {/* Modals */}
      {campaignModal&&<CampaignModal campaign={campaignModal} onClose={()=>setCampaignModal(null)} onExport={exportCampaignCSV}/>}
      {companyModal&&<CompanyModal company={companyModal} onClose={()=>setCompanyModal(null)}/>}

      {err&&<div style={{background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:6,padding:'10px 16px',fontSize:12,color:'var(--ac-danger)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span>⚠ {err}</span><button onClick={()=>window.location.reload()} style={{background:'none',border:'none',color:'var(--ac-danger)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:11}}><RefreshCw size={12}/>Retry</button></div>}
      <div style={{display:'flex',gap:16}}>
        <StatCard icon={<Building2 size={20}/>} value={stats.total_companies}  label={t('dashboard.totalCompanies')}  valueColor="var(--ac-gold)"    loading={loading}/>
        <StatCard icon={<Zap size={20}/>}       value={stats.active_campaigns} label={t('dashboard.activeCampaigns')} valueColor="var(--ac-success)" loading={loading}/>
        <StatCard icon={<Globe size={20}/>}      value={stats.have_website}     label={t('dashboard.haveWebsite')}     valueColor="var(--ac-info)"    loading={loading}/>
        <StatCard icon={<Clock size={20}/>}      value={stats.scheduled_jobs}   label={t('dashboard.scheduledJobs')}   valueColor="var(--ac-gold)"    loading={loading}/>
      </div>
      <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
        <div style={{flex:'0 0 60%'}}>
          <Card title={t('dashboard.recentCampaigns')} action={<button onClick={()=>onNavigate?.('campaigns')} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:'var(--ac-gold)',fontSize:12}}>{t('common.viewAll')}<ChevronRight size={12}/></button>}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {[t('dashboard.campaign'),t('dashboard.province'),t('dashboard.category'),t('dashboard.count'),t('common.status'),t('common.date'),t('common.actions')].map(h=>(
                    <th key={h} style={{padding:'8px 12px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading?Array.from({length:5}).map((_,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                      {[160,80,100,40,70,80,60].map((w,j)=><td key={j} style={{padding:'10px 12px'}}><div style={{height:12,borderRadius:4,background:'var(--ac-bg-hover)',width:w}}/></td>)}
                    </tr>
                  )):campaigns.map((c:any)=>(
                    <tr key={c.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms'}} onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                      <td style={{padding:'10px 12px',color:'var(--ac-text-primary)',fontWeight:500}}>{c.name}</td>
                      <td style={{padding:'10px 12px',color:'var(--ac-text-sec)'}}>{c.province}</td>
                      <td style={{padding:'10px 12px',color:'var(--ac-text-sec)',whiteSpace:'nowrap'}}>{c.category}</td>
                      <td style={{padding:'10px 12px',fontFamily:'var(--ac-font-mono)',color:c.total_found>0?'var(--ac-text-primary)':'var(--ac-text-muted)'}}>{c.total_found>0?c.total_found:'—'}</td>
                      <td style={{padding:'10px 12px'}}><StatusBadge status={c.status}/></td>
                      <td style={{padding:'10px 12px',color:'var(--ac-text-muted)',fontSize:12,whiteSpace:'nowrap'}}>{fmt(c.created_at)}</td>
                      <td style={{padding:'10px 12px'}}><div style={{display:'flex',gap:6}}>
                        <button title="View Campaign Companies" onClick={()=>setCampaignModal(c)}
                          style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:4,padding:'3px 8px',cursor:'pointer',color:'var(--ac-text-sec)',transition:'all 150ms'}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--ac-gold)';(e.currentTarget as HTMLButtonElement).style.color='var(--ac-gold)';}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--ac-border)';(e.currentTarget as HTMLButtonElement).style.color='var(--ac-text-sec)';}}>
                          <Eye size={13}/>
                        </button>
                        <button title="Export CSV" onClick={()=>exportCampaignCSV(c)}
                          style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:4,padding:'3px 8px',cursor:'pointer',color:'var(--ac-text-sec)',transition:'all 150ms'}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--ac-success)';(e.currentTarget as HTMLButtonElement).style.color='var(--ac-success)';}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--ac-border)';(e.currentTarget as HTMLButtonElement).style.color='var(--ac-text-sec)';}}>
                          <Upload size={13}/>
                        </button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:16}}>
          <Card title={t('dashboard.provinceCoverage')}><ProvinceCoverage scraped={provs}/></Card>
          <Card title={t('dashboard.topCategories')}>
            {cats.length>0?<ResponsiveContainer width="100%" height={200}><BarChart data={cats} layout="vertical" margin={{left:0,right:16,top:0,bottom:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={140} tick={{fill:'var(--ac-text-sec)',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip content={<CustomTooltip t={t}/>} cursor={{fill:'rgba(255,255,255,0.03)'}}/><Bar dataKey="count" radius={[0,3,3,0]}>{cats.map((_,i)=><Cell key={i} fill={i===0?'var(--ac-gold)':i===1?'rgba(200,168,75,0.7)':'rgba(200,168,75,0.4)'}/>)}</Bar></BarChart></ResponsiveContainer>:<div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ac-text-muted)',fontSize:12}}>—</div>}
          </Card>
          <Card title={t('dashboard.quickScout')}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <SearchDropdown options={PROVINCE_OPTIONS} value={sp} onChange={setSp} placeholder={t('dashboard.selectProvince')}/>
              <SearchDropdown options={CATEGORY_OPTIONS} value={sc} onChange={setSc} placeholder={t('dashboard.selectCategory')}/>
              <button className="ac-btn-gold" disabled={!sp||!sc} onClick={()=>onNavigate?.('new-scout')} style={{width:'100%',padding:'10px',fontSize:13,borderRadius:6,marginTop:4,opacity:(!sp||!sc)?0.5:1}}>{t('dashboard.scoutNow')}</button>
            </div>
          </Card>
        </div>
      </div>

      {/* Top 10 Companies */}
      <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--ac-border)',fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{t('dashboard.topCompaniesByScore')}</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{borderBottom:'1px solid var(--ac-border)'}}>
              {['#',t('dashboard.company'),t('dashboard.province'),t('dashboard.category'),t('dashboard.phone'),t('dashboard.website'),t('dashboard.rating'),t('dashboard.qualityScore'),t('dashboard.action')].map(h=>(
                <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading?Array.from({length:5}).map((_,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {[40,140,80,100,40,40,60,100,60].map((w,j)=><td key={j} style={{padding:'10px 14px'}}><div style={{height:12,borderRadius:4,background:'var(--ac-bg-hover)',width:w}}/></td>)}
                </tr>
              )):top.map((c:any,idx:number)=>{const rank=idx+1;return(
                <tr key={c.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms',cursor:'pointer'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <td style={{padding:'10px 14px',fontFamily:'var(--ac-font-mono)',color:rank<=3?'var(--ac-gold)':'var(--ac-text-muted)',fontWeight:600}}>{rank<=3?['🥇','🥈','🥉'][rank-1]:`#${rank}`}</td>
                  <td style={{padding:'10px 14px',color:'var(--ac-text-primary)',fontWeight:500,whiteSpace:'nowrap'}}>{c.name}</td>
                  <td style={{padding:'10px 14px',color:'var(--ac-text-sec)'}}>{c.province}</td>
                  <td style={{padding:'10px 14px',color:'var(--ac-text-sec)',whiteSpace:'nowrap'}}>{c.category}</td>
                  <td style={{padding:'10px 14px',textAlign:'center'}}><span style={{color:c.has_phone?'var(--ac-success)':'var(--ac-text-muted)',fontSize:14}}>{c.has_phone?'✓':'✗'}</span></td>
                  <td style={{padding:'10px 14px',textAlign:'center'}}><span style={{color:c.has_website?'var(--ac-info)':'var(--ac-text-muted)',fontSize:14}}>{c.has_website?'✓':'✗'}</span></td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-gold)'}}>★ {c.rating?.toFixed(1)??'—'}</td>
                  <td style={{padding:'10px 14px',minWidth:140}}><div style={{display:'flex',alignItems:'center',gap:8}}><ScoreBar score={c.quality_score}/><QualityBadge score={c.quality_score}/></div></td>
                  <td style={{padding:'10px 14px'}}>
                    <button onClick={()=>setCompanyModal(c)}
                      style={{background:'none',border:'1px solid var(--ac-border-gold)',borderRadius:4,padding:'4px 10px',cursor:'pointer',color:'var(--ac-gold)',fontSize:11,whiteSpace:'nowrap'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='rgba(200,168,75,0.1)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                      {t('common.view')} →
                    </button>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
