import { useState, useEffect } from 'react';
import { AlertTriangle, Send, ExternalLink, RefreshCw, Loader, Globe } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import type { PageId } from '../Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';

const API = 'https://api.agentcraft.info';

const ISSUE_BADGES: Record<string,{label:string;bg:string;color:string;border:string}> = {
  'Domain Expired':  {label:'Domain Expired', bg:'rgba(226,85,85,0.12)',  color:'#e25555', border:'rgba(226,85,85,0.3)'},
  'Server Error':    {label:'Server Error',   bg:'rgba(255,140,0,0.12)',  color:'#ff8c00', border:'rgba(255,140,0,0.3)'},
  'SSL Expired':     {label:'SSL Expired',    bg:'rgba(200,168,75,0.12)', color:'#c8a84b', border:'rgba(200,168,75,0.3)'},
  'Redirect Loop':   {label:'Redirect Loop',  bg:'rgba(138,138,138,0.12)',color:'#8a8a8a', border:'rgba(138,138,138,0.3)'},
  'Slow/Broken WP':  {label:'Broken WP',      bg:'rgba(91,156,246,0.12)', color:'#5b9cf6', border:'rgba(91,156,246,0.3)'},
  'no_website':      {label:'No Website',     bg:'rgba(226,85,85,0.12)',  color:'#e25555', border:'rgba(226,85,85,0.3)'},
  'broken':          {label:'Broken Site',    bg:'rgba(255,140,0,0.12)',  color:'#ff8c00', border:'rgba(255,140,0,0.3)'},
  'ssl_expired':     {label:'SSL Expired',    bg:'rgba(200,168,75,0.12)', color:'#c8a84b', border:'rgba(200,168,75,0.3)'},
  'domain_expired':  {label:'Domain Expired', bg:'rgba(226,85,85,0.12)',  color:'#e25555', border:'rgba(226,85,85,0.3)'},
  'server_error':    {label:'Server Error',   bg:'rgba(255,140,0,0.12)',  color:'#ff8c00', border:'rgba(255,140,0,0.3)'},
  'broken_wp':       {label:'Broken WP',      bg:'rgba(91,156,246,0.12)', color:'#5b9cf6', border:'rgba(91,156,246,0.3)'},
};
const PRIORITY_COLORS: Record<string,string> = {urgent:'#e25555',high:'#e25555',medium:'#c8a84b',low:'#2dd4a0'};
const FILTERS = ['All','Domain Expired','Server Error','SSL Expired','Redirect Loop','WordPress Issues'];

export function BrokenSitesPage({onNavigate,isEmpty}:{onNavigate?:(p:PageId)=>void;isEmpty?:boolean}={}) {
  const {t}=useLanguage();
  const [data,setData]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [checking,setChecking]=useState(false);
  const [activeFilter,setActiveFilter]=useState('All');
  const [recheckingId,setRecheckingId]=useState<number|null>(null);
  const [contactingId,setContactingId]=useState<number|null>(null);
  const [toast,setToast]=useState('');

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000);};

  const loadData=()=>{
    setLoading(true);
    window.fetch(`${API}/scout/web/opportunities?limit=100`)
      .then(r=>r.json())
      .then(d=>{
        const list=d.opportunities||d.results||[];
        setData(list);
      })
      .catch(()=>setData([]))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ loadData(); },[]);

  // Run batch check on all companies with websites
  const runBatchCheck=async()=>{
    setChecking(true);
    try{
      // Get companies with websites
      const r=await window.fetch(`${API}/scout/companies?has_website=true&limit=200`);
      const d=await r.json();
      const ids=(d.companies||[]).map((c:any)=>c.id);
      if(ids.length===0){showToast('No companies with websites found.');setChecking(false);return;}
      // Run batch check
      const res=await window.fetch(`${API}/scout/web/batch-check`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({company_ids:ids}),
      });
      const result=await res.json();
      showToast(`✓ Checked ${result.checked||0} sites — ${result.issues_found||0} issues found`);
      loadData();
    }catch(e){
      showToast('Check failed: '+String(e));
    }finally{
      setChecking(false);
    }
  };

  // Recheck single site
  const recheckSingle=async(row:any)=>{
    const url=row.website_url||row.url;
    if(!url) return;
    setRecheckingId(row.id);
    try{
      const res=await window.fetch(`${API}/scout/web/check-single`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({url}),
      });
      const result=await res.json();
      showToast(`${url}: ${result.issue_type||'OK'}`);
      loadData();
    }catch(e){
      showToast('Recheck failed');
    }finally{
      setRecheckingId(null);
    }
  };

  // Mark as contacted
  const markContacted=async(row:any)=>{
    setContactingId(row.id);
    try{
      await window.fetch(`${API}/scout/companies/${row.company_id}/status`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({status:'contacted'}),
      });
      setData(prev=>prev.map(r=>r.id===row.id?{...r,contact_status:'contacted'}:r));
      showToast(`✓ ${row.company_name} marked as contacted`);
    }catch{
      showToast('Failed to update status');
    }finally{
      setContactingId(null);
    }
  };

  const filtered=data.filter(r=>{
    if(activeFilter==='All') return true;
    if(activeFilter==='WordPress Issues') return (r.issue_type||'').includes('wp')||(r.issue||'').toLowerCase().includes('wp');
    const issue=r.issue_type||r.issue||'';
    return issue===activeFilter||issue.replace('_',' ').toLowerCase()===activeFilter.toLowerCase();
  });

  if(!loading&&data.length===0&&isEmpty)return(
    <EmptyState variant="web" title={t('brokenSites.noData')} subtitle={t('brokenSites.noDataSub')} ctaLabel={t('brokenSites.runWebScout')} onCta={()=>onNavigate?.('web-scout')}/>
  );

  const fmtDate=(iso:string)=>{
    if(!iso) return '—';
    try{
      const diff=Math.floor((Date.now()-new Date(iso).getTime())/1000);
      if(diff<3600) return `${Math.floor(diff/60)}m ago`;
      if(diff<86400) return `${Math.floor(diff/3600)}h ago`;
      return `${Math.floor(diff/86400)}d ago`;
    }catch{return iso;}
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* Toast */}
      {toast&&(
        <div style={{position:'fixed',top:20,right:20,background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-gold)',borderRadius:8,padding:'12px 18px',fontSize:13,color:'var(--ac-text-primary)',zIndex:2000,boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:600,color:'var(--ac-text-primary)'}}>Broken Sites Monitor</h2>
          <p style={{margin:'4px 0 0',fontSize:12,color:'var(--ac-text-muted)'}}>Companies with broken, expired, or missing websites</p>
        </div>
        <button onClick={runBatchCheck} disabled={checking}
          style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:6,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.1)',color:'var(--ac-gold)',fontSize:13,cursor:checking?'wait':'pointer',fontWeight:500,opacity:checking?0.7:1}}>
          {checking?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<Globe size={14}/>}
          {checking?'Checking websites...':'Check All Websites'}
        </button>
      </div>

      {/* Stats */}
      <div style={{display:'flex',gap:12}}>
        {[
          {label:t('brokenSites.totalIssues'), value:data.length,                                                                                   color:'var(--ac-gold)'},
          {label:t('brokenSites.urgent'),      value:data.filter(r=>(r.priority==='urgent'||r.priority==='high')).length,                           color:'var(--ac-danger)'},
          {label:t('brokenSites.domainExpired'),value:data.filter(r=>(r.issue_type||r.issue||'').toLowerCase().includes('domain')).length,          color:'var(--ac-danger)'},
          {label:t('brokenSites.serverErrors'), value:data.filter(r=>(r.issue_type||r.issue||'').toLowerCase().includes('server')).length,          color:'#ff8c00'},
          {label:t('brokenSites.sslIssues'),    value:data.filter(r=>(r.issue_type||r.issue||'').toLowerCase().includes('ssl')).length,             color:'var(--ac-gold)'},
        ].map(s=>(
          <div key={s.label} style={{flex:1,background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:'14px 18px'}}>
            <div style={{fontFamily:'var(--ac-font-mono)',fontSize:22,fontWeight:700,color:s.color}}>{loading?'…':s.value}</div>
            <div style={{fontSize:11,color:'var(--ac-text-sec)',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state after load */}
      {!loading&&data.length===0&&(
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:40,textAlign:'center'}}>
          <Globe size={32} style={{color:'var(--ac-text-muted)',marginBottom:12}}/>
          <div style={{fontSize:14,fontWeight:500,color:'var(--ac-text-primary)',marginBottom:6}}>No broken sites detected yet</div>
          <div style={{fontSize:12,color:'var(--ac-text-muted)',marginBottom:16}}>Run "Check All Websites" to scan companies from your database, or run a Web Scout mission first.</div>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={runBatchCheck} disabled={checking}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:6,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.1)',color:'var(--ac-gold)',fontSize:12,cursor:'pointer'}}>
              {checking?<Loader size={12} style={{animation:'spin 1s linear infinite'}}/>:<Globe size={12}/>}
              {checking?'Checking...':'Check All Websites'}
            </button>
            <button onClick={()=>onNavigate?.('web-scout')}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:6,border:'1px solid var(--ac-border)',background:'none',color:'var(--ac-text-sec)',fontSize:12,cursor:'pointer'}}>
              Run Web Scout →
            </button>
          </div>
        </div>
      )}

      {/* Filters + Table */}
      {data.length>0&&(<>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {FILTERS.map(f=>(
            <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'5px 14px',borderRadius:20,fontSize:11,cursor:'pointer',border:'1px solid',transition:'all 150ms',borderColor:activeFilter===f?'var(--ac-gold)':'var(--ac-border-med)',background:activeFilter===f?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:activeFilter===f?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:activeFilter===f?600:400}}>{f}</button>
          ))}
          <span style={{marginLeft:'auto',fontSize:12,color:'var(--ac-text-muted)',alignSelf:'center'}}>{filtered.length} sites</span>
        </div>

        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--ac-font-ui)'}}>
              <thead><tr style={{borderBottom:'1px solid var(--ac-border-med)'}}>
                {['Company','Province','Phone','Website URL','Issue','Last Checked','Priority','Contacted','Actions'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap',background:'var(--ac-bg-card)'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading?Array.from({length:5}).map((_,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                    {[140,80,40,120,80,80,70,60,80].map((w,j)=><td key={j} style={{padding:'10px 14px'}}><div style={{height:11,borderRadius:3,background:'var(--ac-bg-hover)',width:w}}/></td>)}
                  </tr>
                )):filtered.map((r:any)=>{
                  const issueKey=r.issue_type||r.issue||'';
                  const badge=ISSUE_BADGES[issueKey]||{label:issueKey||'Unknown',bg:'rgba(138,138,138,0.12)',color:'#8a8a8a',border:'rgba(138,138,138,0.3)'};
                  const priKey=r.priority||'medium';
                  const priColor=PRIORITY_COLORS[priKey]||'#c8a84b';
                  const priLabel=priKey==='urgent'||priKey==='high'?'🔴 Urgent':priKey==='low'?'🟢 Low':'🟡 Medium';
                  const isContacted=r.contact_status==='contacted';
                  const isRechecking=recheckingId===r.id;
                  const isContacting=contactingId===r.id;
                  const websiteUrl=r.website_url||r.url||'';
                  return(
                    <tr key={r.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                      <td style={{padding:'10px 14px',color:'var(--ac-text-primary)',fontWeight:500,whiteSpace:'nowrap'}}>{r.company_name||r.company||'—'}</td>
                      <td style={{padding:'10px 14px',color:'var(--ac-text-sec)'}}>{r.province||'—'}</td>
                      <td style={{padding:'10px 14px',textAlign:'center',color:r.has_phone?'var(--ac-success)':'var(--ac-text-muted)'}}>{r.has_phone?'✓':'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        {websiteUrl&&(
                          <a href={websiteUrl.startsWith('http')?websiteUrl:`https://${websiteUrl}`} target="_blank" rel="noopener" style={{display:'flex',alignItems:'center',gap:4,color:'var(--ac-info)',textDecoration:'none',fontSize:11}}>
                            <ExternalLink size={10}/>{websiteUrl.replace(/^https?:\/\//,'').slice(0,28)}
                          </a>
                        )}
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600,background:badge.bg,color:badge.color,border:`1px solid ${badge.border}`,whiteSpace:'nowrap'}}>{badge.label}</span>
                      </td>
                      <td style={{padding:'10px 14px',color:'var(--ac-text-muted)',fontSize:11,whiteSpace:'nowrap'}}>{fmtDate(r.last_checked||r.checked||'')}</td>
                      <td style={{padding:'10px 14px'}}><span style={{fontSize:11,color:priColor,fontWeight:500}}>{priLabel}</span></td>
                      <td style={{padding:'10px 14px'}}>
                        <button onClick={()=>!isContacted&&markContacted(r)} disabled={isContacting}
                          style={{padding:'3px 10px',borderRadius:4,border:`1px solid ${isContacted?'rgba(45,212,160,0.4)':'var(--ac-border)'}`,background:isContacted?'rgba(45,212,160,0.1)':'none',color:isContacted?'var(--ac-success)':'var(--ac-text-muted)',fontSize:10,cursor:isContacted?'default':'pointer',whiteSpace:'nowrap'}}>
                          {isContacting?'…':isContacted?'✓ Contacted':'Mark'}
                        </button>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>onNavigate?.('outreach-queue')}
                            style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:4,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.08)',color:'var(--ac-gold)',fontSize:10,cursor:'pointer',whiteSpace:'nowrap'}}>
                            <Send size={10}/>Contact
                          </button>
                          <button onClick={()=>recheckSingle(r)} disabled={isRechecking}
                            style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:4,border:'1px solid var(--ac-border)',background:'none',color:'var(--ac-text-sec)',fontSize:10,cursor:isRechecking?'wait':'pointer',whiteSpace:'nowrap'}}>
                            {isRechecking?<Loader size={10} style={{animation:'spin 1s linear infinite'}}/>:<RefreshCw size={10}/>}
                            {isRechecking?'…':'Recheck'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>)}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
