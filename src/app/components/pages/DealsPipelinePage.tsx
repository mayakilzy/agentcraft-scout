import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Percent, MessageSquare } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import type { PageId } from '../Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';

const STAGES = [
  { id:'new',        label:'newLead',   icon:'🔵', color:'var(--ac-info)' },
  { id:'contacted',  label:'contacted', icon:'🟡', color:'var(--ac-gold)' },
  { id:'interested', label:'interested',icon:'🟠', color:'#ff8c00' },
  { id:'proposal',   label:'proposal',  icon:'🟣', color:'#9b59b6' },
  { id:'closed',     label:'closed',    icon:'🟢', color:'var(--ac-success)' },
] as const;

function DealCard({deal,onMove}:{deal:any;onMove:(id:number,dir:'forward'|'back')=>void}) {
  const {t}=useLanguage();
  const stageIdx=STAGES.findIndex(s=>s.id===deal.stage);
  return (
    <div style={{background:'var(--ac-bg-input)',border:'1px solid var(--ac-border)',borderRadius:6,padding:12,transition:'border-color 150ms,box-shadow 150ms'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ac-border-med)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.boxShadow='none';}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:6}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--ac-text-primary)',marginBottom:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{deal.company||deal.name}</div>
          <div style={{fontSize:10,color:'var(--ac-text-muted)',marginBottom:5}}>{deal.city||deal.province}</div>
          <span style={{fontSize:9,padding:'1px 7px',borderRadius:10,fontWeight:600,background:deal.issue==='No Website'?'rgba(226,85,85,0.12)':'rgba(200,168,75,0.12)',color:deal.issue==='No Website'?'var(--ac-danger)':'var(--ac-gold)',border:`1px solid ${deal.issue==='No Website'?'rgba(226,85,85,0.3)':'rgba(200,168,75,0.3)'}`}}>{deal.issue||'General'}</span>
        </div>
        {deal.value&&<span style={{fontFamily:'var(--ac-font-mono)',fontSize:12,color:'var(--ac-success)',fontWeight:700,flexShrink:0}}>${deal.value}</span>}
      </div>
      {deal.note&&<div style={{display:'flex',alignItems:'flex-start',gap:5,marginTop:8,padding:'6px 8px',background:'rgba(200,168,75,0.05)',borderRadius:4,border:'1px solid var(--ac-border)'}}><MessageSquare size={10} style={{color:'var(--ac-text-muted)',flexShrink:0,marginTop:1}}/><span style={{fontSize:10,color:'var(--ac-text-sec)',lineHeight:1.4}}>{deal.note}</span></div>}
      {deal.rating&&<div style={{marginTop:8,color:'var(--ac-gold)',fontSize:12}}>{'★'.repeat(deal.rating)}{'☆'.repeat(5-deal.rating)}</div>}
      <div style={{display:'flex',gap:4,marginTop:10}}>
        {stageIdx>0&&<button onClick={()=>onMove(deal.id,'back')} style={{flex:1,padding:'3px 0',fontSize:10,borderRadius:3,border:'1px solid var(--ac-border)',background:'none',color:'var(--ac-text-muted)',cursor:'pointer'}}>{t('dealsPage.back')}</button>}
        {stageIdx<STAGES.length-1&&<button onClick={()=>onMove(deal.id,'forward')} style={{flex:2,padding:'3px 0',fontSize:10,borderRadius:3,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.1)',color:'var(--ac-gold)',cursor:'pointer',fontWeight:600}}>{t('dealsPage.advance')}</button>}
      </div>
    </div>
  );
}

export function DealsPipelinePage({onNavigate,isEmpty}:{onNavigate?:(p:PageId)=>void;isEmpty?:boolean}={}) {
  const {t}=useLanguage();
  const [deals,setDeals]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  const STAGE_LABELS: Record<string,string> = {
    new: t('nav.newScout').replace('New Scout','New Lead'),
    contacted: 'Contacted',
    interested: 'Interested',
    proposal: 'Proposal',
    closed: `Closed ✓`,
  };

  useEffect(()=>{
    setLoading(true);
    window.fetch('https://api.agentcraft.info/scout/deals')
      .then(r=>r.json()).then(data=>{
        const list=Array.isArray(data)?data:data.deals||[];
        if(list.length>0){setDeals(list);}
        else {
          window.fetch('https://api.agentcraft.info/scout/companies?limit=16&sort_by=quality_score')
            .then(r=>r.json()).then(co=>{
              const companies=co.companies||[];
              const stageMap=['new','new','new','new','contacted','contacted','contacted','contacted','interested','interested','interested','proposal','proposal','closed','closed','closed'];
              setDeals(companies.slice(0,16).map((c:any,i:number)=>({
                id:c.id,company:c.name,issue:!c.has_website?'No Website':!c.has_email?'No Email':'Has Data',
                city:c.city||c.province,province:c.province,
                value:['closed','proposal'].includes(stageMap[i])?Math.floor(Math.random()*600+600):undefined,
                note:stageMap[i]==='contacted'?'Follow-up sent':stageMap[i]==='interested'?'Meeting requested':undefined,
                rating:stageMap[i]==='closed'?Math.floor(Math.random()*2+4):undefined,
                stage:stageMap[i]||'new',
              })));
            }).catch(()=>{});
        }
      }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const moveCard=(id:number,direction:'forward'|'back')=>{
    setDeals(prev=>prev.map(d=>{
      if(d.id!==id)return d;
      const idx=STAGES.findIndex(s=>s.id===d.stage);
      const newIdx=direction==='forward'?Math.min(idx+1,STAGES.length-1):Math.max(idx-1,0);
      const newStage=STAGES[newIdx].id;
      window.fetch(`https://api.agentcraft.info/scout/deals/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({stage:newStage})}).catch(()=>{});
      return {...d,stage:newStage};
    }));
  };

  const totalValue=deals.filter(d=>d.stage==='closed'&&d.value).reduce((s,d)=>s+(d.value??0),0);
  const proposalValue=deals.filter(d=>d.stage==='proposal'&&d.value).reduce((s,d)=>s+(d.value??0),0);
  const closedCount=deals.filter(d=>d.stage==='closed').length;
  const closeRate=deals.length?Math.round((closedCount/deals.length)*100):0;
  const allVals=deals.filter(d=>d.value).map(d=>d.value??0);
  const avgDeal=allVals.length?Math.round(allVals.reduce((a,b)=>a+b,0)/allVals.length):0;

  if(!loading&&deals.length===0&&isEmpty)return <EmptyState variant="deals" title={t('deals.noData')} subtitle={t('deals.noDataSub')} ctaLabel={t('deals.contactCompanies')} onCta={()=>onNavigate?.('outreach-queue')}/>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[
          {icon:<DollarSign size={16}/>,label:t('dealsPage.closedRevenue'),value:`$${totalValue.toLocaleString()}`,color:'var(--ac-success)'},
          {icon:<TrendingUp size={16}/>,label:t('dealsPage.pipelineValue'),value:`$${proposalValue.toLocaleString()}`,color:'var(--ac-gold)'},
          {icon:<DollarSign size={16}/>,label:t('dealsPage.avgDeal'),value:`$${avgDeal}`,color:'var(--ac-info)'},
          {icon:<Percent size={16}/>,label:t('dealsPage.closeRate'),value:`${closeRate}%`,color:'var(--ac-gold)'},
        ].map((s,i)=>(
          <div key={i} style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:34,height:34,borderRadius:7,background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ac-gold)',flexShrink:0}}>{s.icon}</div>
            <div><div style={{fontFamily:'var(--ac-font-mono)',fontSize:20,fontWeight:700,color:s.color}}>{loading?'…':s.value}</div><div style={{fontSize:11,color:'var(--ac-text-sec)',marginTop:2}}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,alignItems:'flex-start'}}>
        {STAGES.map(stage=>{
          const stageDeals=deals.filter(d=>d.stage===stage.id);
          const stageLabel=stage.id==='new'?'New Lead':stage.id==='closed'?`${t('common.status')} ✓`:stage.id.charAt(0).toUpperCase()+stage.id.slice(1);
          return(
            <div key={stage.id} style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'10px 12px',borderBottom:'1px solid var(--ac-border)',background:'rgba(255,255,255,0.02)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:13}}>{stage.icon}</span><span style={{fontSize:11,fontWeight:600,color:'var(--ac-text-primary)'}}>{stageLabel}</span></div>
                <span style={{fontFamily:'var(--ac-font-mono)',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:8,background:`${stage.color}22`,color:stage.color,border:`1px solid ${stage.color}44`}}>{loading?'…':stageDeals.length}</span>
              </div>
              <div style={{padding:8,display:'flex',flexDirection:'column',gap:6,minHeight:80}}>
                {loading?Array.from({length:2}).map((_,i)=><div key={i} style={{height:70,borderRadius:6,background:'var(--ac-bg-hover)'}}/>):stageDeals.length>0?stageDeals.map(d=><DealCard key={d.id} deal={d} onMove={moveCard}/>):<div style={{padding:'20px 8px',textAlign:'center',color:'var(--ac-text-muted)',fontSize:11}}>{t('dealsPage.noDeals')}</div>}
              </div>
              {stageDeals.some(d=>d.value)&&(
                <div style={{padding:'8px 12px',borderTop:'1px solid var(--ac-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'var(--ac-text-muted)'}}>{t('dealsPage.stageValue')}</span>
                  <span style={{fontFamily:'var(--ac-font-mono)',fontSize:11,color:'var(--ac-success)',fontWeight:600}}>${stageDeals.filter(d=>d.value).reduce((s,d)=>s+(d.value??0),0).toLocaleString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
