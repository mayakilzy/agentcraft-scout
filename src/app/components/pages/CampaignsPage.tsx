import { useState, useEffect } from 'react';
import { Plus, Eye, Upload, RefreshCw, Trash2, Search, Loader, X, Phone, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { QualityBadge } from '../ui/QualityBadge';
import { ScoreBar } from '../ui/ScoreBar';
import { EmptyState } from '../ui/EmptyState';
import type { PageId } from '../Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';

const STATUS_OPTIONS = ['All','Completed','Running','Scheduled','Paused'];
const ARM_OPTIONS = ['All','Industrial','Web'];

// ─── Campaign Companies Modal ─────────────────────────────────────────────────
function CampaignModal({campaign,onClose,onExport}:{campaign:any;onClose:()=>void;onExport:(c:any)=>void}) {
  const [companies,setCompanies]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    window.fetch(`https://api.agentcraft.info/scout/companies?campaign_id=${campaign.id}&limit=500`)
      .then(r=>r.json()).then(d=>setCompanies(d.companies||[])).catch(()=>setCompanies([])).finally(()=>setLoading(false));
  },[campaign.id]);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:10,width:'100%',maxWidth:900,maxHeight:'82vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid var(--ac-border)'}}>
          <div>
            <div style={{fontWeight:600,fontSize:15,color:'var(--ac-text-primary)'}}>{campaign.name}</div>
            <div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:2}}>{campaign.province} · {campaign.category} · <span style={{color:'var(--ac-gold)'}}>{campaign.total_found||0} companies</span></div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>onExport(campaign)} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(45,212,160,0.1)',border:'1px solid rgba(45,212,160,0.3)',borderRadius:6,padding:'6px 12px',cursor:'pointer',color:'var(--ac-success)',fontSize:12}}>
              <Upload size={13}/>Export CSV
            </button>
            <button onClick={onClose} style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:6,padding:6,cursor:'pointer',color:'var(--ac-text-sec)',display:'flex'}}>
              <X size={16}/>
            </button>
          </div>
        </div>
        <div style={{overflowY:'auto',flex:1}}>
          {loading?(
            <div style={{padding:40,textAlign:'center',color:'var(--ac-text-muted)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <Loader size={14} style={{animation:'spin 1s linear infinite'}}/>Loading companies...
            </div>
          ):companies.length===0?(
            <div style={{padding:40,textAlign:'center',color:'var(--ac-text-muted)',fontSize:13}}>No companies found for this campaign.</div>
          ):(
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead style={{position:'sticky',top:0,background:'var(--ac-bg-card)',zIndex:1}}>
                <tr style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {['#','Company','Province','Phone','Website','Rating','Score'].map(h=>(
                    <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c:any,i:number)=>(
                  <tr key={c.id} style={{borderBottom:'1px solid var(--ac-border)'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                    <td style={{padding:'9px 14px',color:'var(--ac-text-muted)',fontFamily:'var(--ac-font-mono)',fontSize:11}}>{i+1}</td>
                    <td style={{padding:'9px 14px',color:'var(--ac-text-primary)',fontWeight:500}}>{c.name}</td>
                    <td style={{padding:'9px 14px',color:'var(--ac-text-sec)'}}>{c.province}</td>
                    <td style={{padding:'9px 14px',textAlign:'center'}}><span style={{color:c.has_phone?'var(--ac-success)':'var(--ac-text-muted)'}}>{c.has_phone?'✓':'✗'}</span></td>
                    <td style={{padding:'9px 14px',textAlign:'center'}}>
                      {c.has_website&&c.website
                        ?<a href={c.website} target="_blank" rel="noreferrer" style={{color:'var(--ac-info)',fontSize:11,display:'flex',alignItems:'center',gap:3,justifyContent:'center'}}><ExternalLink size={11}/>Visit</a>
                        :<span style={{color:'var(--ac-text-muted)'}}>✗</span>}
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

function ArmBadge({arm}:{arm:string}) {
  const {t}=useLanguage();
  const web=arm==='web';
  return (
    <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600,background:web?'rgba(91,156,246,0.12)':'rgba(200,168,75,0.12)',color:web?'var(--ac-info)':'var(--ac-gold)',border:`1px solid ${web?'rgba(91,156,246,0.3)':'rgba(200,168,75,0.3)'}`}}>
      {web?t('campaignsPage.web'):t('campaignsPage.industrial')}
    </span>
  );
}

function ScoreCell({score}:{score:number|null}) {
  if(score===null||score===0)return <span style={{color:'var(--ac-text-muted)',fontSize:12}}>—</span>;
  const color=score>=7.5?'var(--ac-success)':score>=5?'var(--ac-gold)':'var(--ac-danger)';
  return <span style={{fontFamily:'var(--ac-font-mono)',fontSize:12,color,fontWeight:600}}>{score.toFixed(1)}</span>;
}

export function CampaignsPage({onNavigate,isEmpty}:{onNavigate?:(p:PageId)=>void;isEmpty?:boolean}={}) {
  const {t}=useLanguage();
  const [search,setSearch]=useState('');
  const [armFilter,setArmFilter]=useState('All');
  const [statusFilter,setStatusFilter]=useState('All');
  const [campaigns,setCampaigns]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [viewModal,setViewModal]=useState<any|null>(null);

  useEffect(()=>{
    setLoading(true);
    window.fetch('https://api.agentcraft.info/scout/campaigns?limit=100')
      .then(r=>r.json()).then(data=>{setCampaigns(data.campaigns||[]);})
      .catch(e=>setError(String(e))).finally(()=>setLoading(false));
  },[]);

  const fmt=(iso:string)=>{try{return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}catch{return iso;}};

  const exportCSV=async(campaign:any)=>{
    try{
      const r=await window.fetch(`https://api.agentcraft.info/scout/companies?campaign_id=${campaign.id}&limit=500`);
      const data=await r.json();
      const companies=data.companies||[];
      if(companies.length===0){alert('No companies found.');return;}
      const headers=['Name','Province','City','Category','Phone','Website','Email','Rating','Quality Score','Has Phone','Has Website'];
      const rows=companies.map((c:any)=>[
        `"${(c.name||'').replace(/"/g,'""')}"`,`"${c.province||''}"`,`"${c.city||''}"`,`"${c.category||''}"`,
        `"${c.phone||''}"`,`"${c.website||''}"`,`"${c.email||''}"`,
        c.rating||'',c.quality_score||'',c.has_phone?'Yes':'No',c.has_website?'Yes':'No',
      ]);
      const csv=[headers.join(','),...rows.map((r:any[])=>r.join(','))].join('\n');
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=`${(campaign.name||'campaign').replace(/[^a-zA-Z0-9_-]/g,'_')}.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }catch(e){alert('Export failed: '+String(e));}
  };

  const filtered=campaigns.filter(c=>{
    const matchSearch=c.name?.toLowerCase().includes(search.toLowerCase())||c.province?.toLowerCase().includes(search.toLowerCase());
    const matchArm=armFilter==='All'||c.arm===armFilter.toLowerCase();
    const matchStatus=statusFilter==='All'||c.status?.toLowerCase()===statusFilter.toLowerCase();
    return matchSearch&&matchArm&&matchStatus;
  });

  const handleDelete=(id:number)=>{
    window.fetch(`https://api.agentcraft.info/scout/campaigns/${id}`,{method:'DELETE'})
      .then(()=>setCampaigns(prev=>prev.filter(c=>c.id!==id))).catch(()=>{});
  };

  if(!loading&&!error&&campaigns.length===0&&isEmpty){
    return <EmptyState variant="campaigns" title={t('campaigns.noData')} subtitle={t('campaigns.noDataSub')} ctaLabel={t('campaigns.createFirst')} onCta={()=>onNavigate?.('new-scout')}/>;
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {viewModal&&<CampaignModal campaign={viewModal} onClose={()=>setViewModal(null)} onExport={exportCSV}/>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:600,color:'var(--ac-text-primary)'}}>{t('campaignsPage.all')}</h2>
          <p style={{margin:'4px 0 0',fontSize:12,color:'var(--ac-text-muted)'}}>{loading?'…':campaigns.length} {t('campaignsPage.total')}</p>
        </div>
        <button onClick={()=>onNavigate?.('new-scout')} className="ac-btn-gold" style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',fontSize:13,borderRadius:6}}>
          <Plus size={15}/> {t('campaignsPage.newCampaign')}
        </button>
      </div>

      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'7px 12px',flex:'0 0 240px'}}>
          <Search size={13} style={{color:'var(--ac-text-muted)',flexShrink:0}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('campaignsPage.searchPlaceholder')}
            style={{background:'none',border:'none',outline:'none',fontSize:12,color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',width:'100%'}}/>
        </div>
        <div style={{display:'flex',gap:4}}>
          {ARM_OPTIONS.map(opt=>(
            <button key={opt} onClick={()=>setArmFilter(opt)} style={{padding:'6px 12px',borderRadius:5,fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',border:'1px solid',transition:'all 150ms',borderColor:armFilter===opt?'var(--ac-gold)':'var(--ac-border-med)',background:armFilter===opt?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:armFilter===opt?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:armFilter===opt?600:400}}>{opt}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:4}}>
          {STATUS_OPTIONS.map(opt=>(
            <button key={opt} onClick={()=>setStatusFilter(opt)} style={{padding:'6px 12px',borderRadius:5,fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',border:'1px solid',transition:'all 150ms',borderColor:statusFilter===opt?'var(--ac-gold)':'var(--ac-border-med)',background:statusFilter===opt?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:statusFilter===opt?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:statusFilter===opt?600:400}}>{opt}</button>
          ))}
        </div>
        <span style={{marginLeft:'auto',fontSize:12,color:'var(--ac-text-muted)'}}>{filtered.length} {t('common.noResults').replace('No results','results')}</span>
      </div>

      {error&&<div style={{background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:6,padding:'10px 14px',fontSize:12,color:'var(--ac-danger)'}}>⚠ {error}</div>}

      <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,fontFamily:'var(--ac-font-ui)'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--ac-border-med)'}}>
                {[t('campaignsPage.campaign'),t('campaignsPage.arm'),t('campaignsPage.province'),t('campaignsPage.category'),t('campaignsPage.companies'),t('campaignsPage.avgScore'),t('common.status'),t('common.date'),t('common.actions')].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap',background:'var(--ac-bg-card)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading?Array.from({length:5}).map((_,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {[180,60,80,120,60,60,80,80,80].map((w,j)=><td key={j} style={{padding:'11px 14px'}}><div style={{height:12,borderRadius:4,background:'var(--ac-bg-hover)',width:w}}/></td>)}
                </tr>
              )):filtered.length===0?(
                <tr><td colSpan={9} style={{padding:'40px',textAlign:'center',color:'var(--ac-text-muted)',fontSize:13}}>{t('common.noResults')}</td></tr>
              ):filtered.map((c:any)=>(
                <tr key={c.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <td style={{padding:'11px 14px',fontWeight:500,color:'var(--ac-text-primary)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      {c.status==='running'&&<Loader size={12} style={{color:'var(--ac-info)',animation:'spin 1.2s linear infinite',flexShrink:0}}/>}
                      {c.name}
                    </div>
                  </td>
                  <td style={{padding:'11px 14px'}}><ArmBadge arm={c.arm||'industrial'}/></td>
                  <td style={{padding:'11px 14px',color:'var(--ac-text-sec)'}}>{c.province}</td>
                  <td style={{padding:'11px 14px',color:'var(--ac-text-sec)',whiteSpace:'nowrap'}}>{c.category}</td>
                  <td style={{padding:'11px 14px',fontFamily:'var(--ac-font-mono)',color:c.total_found>0?'var(--ac-text-primary)':'var(--ac-text-muted)',fontSize:12}}>{c.total_found>0?c.total_found:'—'}</td>
                  <td style={{padding:'11px 14px'}}><ScoreCell score={c.avg_score}/></td>
                  <td style={{padding:'11px 14px'}}><StatusBadge status={c.status}/></td>
                  <td style={{padding:'11px 14px',color:'var(--ac-text-muted)',fontSize:12,whiteSpace:'nowrap'}}>{fmt(c.created_at)}</td>
                  <td style={{padding:'11px 14px'}}>
                    <div style={{display:'flex',gap:5}}>
                      <button title={t('common.view')} onClick={()=>setViewModal(c)}
                        style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:4,padding:'4px 8px',cursor:'pointer',color:'var(--ac-text-sec)',transition:'all 150ms',display:'flex',alignItems:'center'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ac-gold)';e.currentTarget.style.color='var(--ac-gold)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.color='var(--ac-text-sec)';}}>
                        <Eye size={13}/>
                      </button>
                      <button title={t('common.export')} onClick={()=>exportCSV(c)}
                        style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:4,padding:'4px 8px',cursor:'pointer',color:'var(--ac-text-sec)',transition:'all 150ms',display:'flex',alignItems:'center'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ac-success)';e.currentTarget.style.color='var(--ac-success)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.color='var(--ac-text-sec)';}}>
                        <Upload size={13}/>
                      </button>
                      <button title={t('common.run')} onClick={()=>onNavigate?.('new-scout')}
                        style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:4,padding:'4px 8px',cursor:'pointer',color:'var(--ac-text-sec)',transition:'all 150ms',display:'flex',alignItems:'center'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ac-info)';e.currentTarget.style.color='var(--ac-info)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.color='var(--ac-text-sec)';}}>
                        <RefreshCw size={13}/>
                      </button>
                      <button title={t('common.delete')} onClick={()=>handleDelete(c.id)}
                        style={{background:'none',border:'1px solid var(--ac-border)',borderRadius:4,padding:'4px 8px',cursor:'pointer',color:'var(--ac-text-muted)',transition:'all 150ms',display:'flex',alignItems:'center'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(226,85,85,0.4)';e.currentTarget.style.color='var(--ac-danger)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.color='var(--ac-text-muted)';}}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
