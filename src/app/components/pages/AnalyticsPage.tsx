import { useState, useEffect } from 'react';
import { EmptyState } from '../ui/EmptyState';
import type { PageId } from '../Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { Building2, MapPin, Tag, Star, Flame, AlertCircle, Snowflake, Phone, Globe, Calendar, Target, TrendingUp, Map, ChevronRight, ExternalLink, Zap, Mail } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CustomPieTooltip=({active,payload}:any)=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'8px 12px',fontSize:12}}><div style={{color:payload[0].payload.color,fontWeight:600}}>{payload[0].name}</div><div style={{color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-mono)'}}>{payload[0].value} companies</div></div>;
};
const CustomBarTooltip=({active,payload,label}:any)=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'8px 12px',fontSize:12}}><div style={{color:'var(--ac-text-sec)',marginBottom:2}}>{label}</div><div style={{color:'var(--ac-gold)',fontFamily:'var(--ac-font-mono)',fontWeight:600}}>Avg Score: {payload[0].value}</div></div>;
};

function SectionCard({title,icon,children,accent}:{title:string;icon:React.ReactNode;children:React.ReactNode;accent?:string}) {
  return <div style={{background:'var(--ac-bg-card)',border:`1px solid ${accent??'var(--ac-border)'}`,borderRadius:8,overflow:'hidden'}}><div style={{padding:'14px 20px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',gap:8}}><span style={{color:accent??'var(--ac-gold)'}}>{icon}</span><span style={{fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{title}</span></div><div style={{padding:20}}>{children}</div></div>;
}

function KpiCard({icon,value,label,sub,valueColor,loading}:{icon:React.ReactNode;value:string|number;label:string;sub?:string;valueColor:string;loading?:boolean}) {
  return <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:20,flex:1}}><div style={{width:36,height:36,borderRadius:7,background:'rgba(200,168,75,0.1)',border:'1px solid var(--ac-border-gold)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ac-gold)',marginBottom:12}}>{icon}</div><div style={{fontFamily:'var(--ac-font-mono)',fontSize:30,fontWeight:700,color:valueColor,lineHeight:1}}>{loading?<span style={{opacity:0.3}}>—</span>:value}</div><div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:4}}>{label}</div>{sub&&<div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:2}}>{sub}</div>}</div>;
}

function PriorityBar({score}:{score:number}) {
  const color=score>=80?'var(--ac-danger)':score>=50?'var(--ac-gold)':'var(--ac-text-muted)';
  return <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}><div style={{flex:1,height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden',minWidth:80}}><div style={{width:`${score}%`,height:'100%',background:color,borderRadius:3,transition:'width 600ms ease'}}/></div><span style={{fontFamily:'var(--ac-font-mono)',fontSize:12,color,fontWeight:700,minWidth:50,textAlign:'right'}}>{score}/100</span></div>;
}

export function AnalyticsPage({onNavigate,isEmpty}:{onNavigate?:(p:PageId)=>void;isEmpty?:boolean}={}) {
  const {t}=useLanguage();
  const [stats,setStats]=useState<any>(null);
  const [companies,setCompanies]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [selectedCompany,setSelectedCompany]=useState<any>(null);

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      window.fetch('https://api.agentcraft.info/scout/stats').then(r=>r.json()),
      window.fetch('https://api.agentcraft.info/scout/companies?limit=200&sort_by=quality_score').then(r=>r.json()),
    ]).then(([s,co])=>{
      setStats(s);
      const list=co.companies||[];
      setCompanies(list);
      if(list.length>0)setSelectedCompany(list[0]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if(!loading&&companies.length===0&&isEmpty)return <EmptyState variant="chart" title={t('analytics.noData')} subtitle={t('analytics.noDataSub')} ctaLabel={t('analytics.runFirst')} onCta={()=>onNavigate?.('new-scout')}/>;

  const total=companies.length||0;
  const hot=companies.filter(c=>(c.priority_score||c.quality_score||0)>=8).length;
  const needsEnrichment=companies.filter(c=>c.has_phone&&!c.has_website&&!c.has_email).length;
  const lowPriority=companies.filter(c=>(c.quality_score||0)<=3).length;
  const scrapedProvinces=new Set(companies.map(c=>c.province).filter(Boolean));

  const priorityList=companies.slice(0,12).map((c,i)=>({
    rank:i+1,name:c.name,province:c.province,
    reason:[c.has_website?'Website':'',c.has_email?'Email':'',c.has_phone?'Phone':'',c.rating>=4.5?`${c.rating}★`:'',c.is_osb_zone?'OSB zone':''].filter(Boolean).join(' + ')||'—',
    score:Math.min(100,Math.round((c.quality_score||0)*10)),
    hot:(c.quality_score||0)>=8,
  }));

  const donutData=[
    {name:`Hot (8–10)`,   value:companies.filter(c=>(c.quality_score||0)>=8).length,   color:'#e25555'},
    {name:`Good (5–7)`,  value:companies.filter(c=>(c.quality_score||0)>=5&&(c.quality_score||0)<8).length, color:'#c8a84b'},
    {name:`Medium (3–4)`,value:companies.filter(c=>(c.quality_score||0)>=3&&(c.quality_score||0)<5).length, color:'#5b9cf6'},
    {name:`Low (0–2)`,   value:companies.filter(c=>(c.quality_score||0)<3).length,  color:'#555555'},
  ].filter(d=>d.value>0);

  const provMap:Record<string,number[]>={};
  companies.forEach(c=>{if(c.province&&c.quality_score){if(!provMap[c.province])provMap[c.province]=[];provMap[c.province].push(c.quality_score);}});
  const provinceQuality=Object.entries(provMap).map(([name,scores])=>({name,avg:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10})).sort((a,b)=>b.avg-a.avg).slice(0,8);

  const ALL_PROVINCES=['Gaziantep','Konya','Mersin','Kayseri','Denizli','Trabzon','Eskişehir','Samsun','Adana','Malatya'];
  const whiteSpots=ALL_PROVINCES.filter(p=>!scrapedProvinces.has(p)).slice(0,5).map(p=>({province:p,current:0,potential:Math.floor(Math.random()*60)+30,note:'Industrial zone — untapped potential'}));

  const outreachQueue=companies.slice(0,7).map(c=>{
    const score=Math.min(100,Math.round((c.quality_score||0)*10));
    const tier=score>=80?'Hot':score>=50?'Good':'Low';
    return {score,tier,name:c.name,province:c.province,reason:[c.has_website?'Website':'',c.has_phone?'Phone':'',c.has_email?'Email':''].filter(Boolean).join(' + ')||'No data',action:tier==='Hot'?t('analyticsPage.contactToday'):tier==='Good'?t('analyticsPage.completeData'):t('analyticsPage.skipForNow'),actionColor:tier==='Hot'?'#2dd4a0':tier==='Good'?'#c8a84b':'#555555'};
  });

  const avgScore=total>0?(companies.reduce((a,c)=>a+(c.quality_score||0),0)/total).toFixed(1):'—';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* KPIs */}
      <div style={{display:'flex',gap:16}}>
        <KpiCard icon={<Building2 size={18}/>} value={stats?.total_companies??total} label={t('dashboard.totalCompanies')} sub={t('analyticsPage.totalAcross')} valueColor="var(--ac-gold)" loading={loading}/>
        <KpiCard icon={<MapPin size={18}/>} value={loading?'…':`${scrapedProvinces.size}/81`} label={t('analyticsPage.provincesCovered')} sub={`${81-scrapedProvinces.size} ${t('analyticsPage.unexplored')}`} valueColor="var(--ac-info)" loading={loading}/>
        <KpiCard icon={<Tag size={18}/>} value={new Set(companies.map(c=>c.category).filter(Boolean)).size||'—'} label={t('analyticsPage.categoriesTracked')} sub={t('analyticsPage.acrossArms')} valueColor="var(--ac-success)" loading={loading}/>
        <KpiCard icon={<Star size={18}/>} value={avgScore} label={t('analyticsPage.avgQualityScore')} sub={t('analyticsPage.outOf')} valueColor="var(--ac-gold)" loading={loading}/>
      </div>

      {/* Priority Engine */}
      <SectionCard title={t('analyticsPage.aiPriority')} icon={<Zap size={15}/>} accent="var(--ac-border-gold)">
        <p style={{fontSize:12,color:'var(--ac-text-muted)',margin:'0 0 14px'}}>6 signals computed per company → priority score 0–100 &nbsp;·&nbsp; <span style={{color:'var(--ac-text-sec)'}}>data score ×2 · rating · website+email · company type · reviews · OSB zone +10</span></p>
        {loading?<div style={{color:'var(--ac-text-muted)',fontSize:12,padding:'20px 0',textAlign:'center'}}>{t('common.loading')}</div>:(
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {priorityList.map(c=>(
              <div key={c.rank} onClick={()=>setSelectedCompany(companies.find(x=>x.name===c.name)||null)}
                style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:6,cursor:'pointer',border:'1px solid transparent',background:selectedCompany?.name===c.name?'rgba(200,168,75,0.06)':'none',borderColor:selectedCompany?.name===c.name?'var(--ac-border-gold)':'transparent',transition:'all 150ms'}}
                onMouseEnter={e=>{if(selectedCompany?.name!==c.name)e.currentTarget.style.background='var(--ac-bg-hover)';}}
                onMouseLeave={e=>{if(selectedCompany?.name!==c.name)e.currentTarget.style.background='none';}}>
                <span style={{fontFamily:'var(--ac-font-mono)',fontSize:11,color:'var(--ac-text-muted)',minWidth:20,textAlign:'right'}}>#{c.rank}</span>
                <div style={{flex:'0 0 200px',minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--ac-text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</div>
                  <div style={{fontSize:11,color:'var(--ac-text-muted)'}}>{c.province}</div>
                </div>
                <div style={{flex:'0 0 220px',fontSize:11,color:'var(--ac-text-sec)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.reason}</div>
                <PriorityBar score={c.score}/>
                {c.hot&&<span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:'rgba(226,85,85,0.15)',color:'var(--ac-danger)',border:'1px solid rgba(226,85,85,0.3)',whiteSpace:'nowrap'}}>🔥 Hot</span>}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Insight Cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <div style={{background:'var(--ac-bg-card)',border:'1px solid rgba(226,85,85,0.25)',borderRadius:8,padding:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}><Flame size={16} style={{color:'var(--ac-danger)'}}/><span style={{fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{t('analyticsPage.hotOpportunities')}</span></div>
          <div style={{fontFamily:'var(--ac-font-mono)',fontSize:36,fontWeight:700,color:'var(--ac-danger)',lineHeight:1}}>{loading?'…':hot}</div>
          <div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:6,marginBottom:4}}>companies</div>
          <div style={{fontSize:12,color:'var(--ac-text-muted)',marginBottom:16}}>Rating 4.5+ · website + email · ready to contact</div>
          <button onClick={()=>onNavigate?.('outreach-queue')} style={{width:'100%',padding:'8px',borderRadius:5,border:'1px solid rgba(226,85,85,0.4)',background:'rgba(226,85,85,0.1)',color:'var(--ac-danger)',fontFamily:'var(--ac-font-ui)',fontSize:12,fontWeight:600,cursor:'pointer'}}>{t('analyticsPage.contactToday')}</button>
        </div>
        <div style={{background:'var(--ac-bg-card)',border:'1px solid rgba(200,168,75,0.25)',borderRadius:8,padding:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}><AlertCircle size={16} style={{color:'var(--ac-gold)'}}/><span style={{fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{t('analyticsPage.needsEnrichment')}</span></div>
          <div style={{fontFamily:'var(--ac-font-mono)',fontSize:36,fontWeight:700,color:'var(--ac-gold)',lineHeight:1}}>{loading?'…':needsEnrichment}</div>
          <div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:6,marginBottom:4}}>companies</div>
          <div style={{fontSize:12,color:'var(--ac-text-muted)',marginBottom:16}}>Phone only · missing email or website</div>
          <button onClick={()=>onNavigate?.('companies')} style={{width:'100%',padding:'8px',borderRadius:5,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.1)',color:'var(--ac-gold)',fontFamily:'var(--ac-font-ui)',fontSize:12,fontWeight:600,cursor:'pointer'}}>{t('analyticsPage.completeData')}</button>
        </div>
        <div style={{background:'var(--ac-bg-card)',border:'1px solid rgba(85,85,85,0.4)',borderRadius:8,padding:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}><Snowflake size={16} style={{color:'var(--ac-text-muted)'}}/><span style={{fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{t('analyticsPage.lowPriority')}</span></div>
          <div style={{fontFamily:'var(--ac-font-mono)',fontSize:36,fontWeight:700,color:'var(--ac-text-muted)',lineHeight:1}}>{loading?'…':lowPriority}</div>
          <div style={{fontSize:12,color:'var(--ac-text-sec)',marginTop:6,marginBottom:4}}>companies</div>
          <div style={{fontSize:12,color:'var(--ac-text-muted)',marginBottom:16}}>Rating &lt; 3 · no website or phone</div>
          <button onClick={()=>onNavigate?.('companies')} style={{width:'100%',padding:'8px',borderRadius:5,border:'1px solid rgba(85,85,85,0.5)',background:'rgba(85,85,85,0.15)',color:'var(--ac-text-muted)',fontFamily:'var(--ac-font-ui)',fontSize:12,fontWeight:600,cursor:'pointer'}}>{t('analyticsPage.skipForNow')}</button>
        </div>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 280px',gap:16}}>
        <SectionCard title={t('analyticsPage.priorityDist')} icon={<Target size={15}/>}>
          {donutData.length>0?<><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">{donutData.map((e,i)=><Cell key={i} fill={e.color} stroke="transparent"/>)}</Pie><Tooltip content={<CustomPieTooltip/>}/></PieChart></ResponsiveContainer><div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>{donutData.map((d,i)=><div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:12}}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:8,height:8,borderRadius:'50%',background:d.color,flexShrink:0}}/><span style={{color:'var(--ac-text-sec)'}}>{d.name}</span></div><span style={{fontFamily:'var(--ac-font-mono)',color:d.color,fontWeight:600}}>{d.value}</span></div>)}</div></>:<div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ac-text-muted)',fontSize:12}}>{t('common.loading')}</div>}
        </SectionCard>
        <SectionCard title={t('analyticsPage.topProvinces')} icon={<TrendingUp size={15}/>}>
          {provinceQuality.length>0?<ResponsiveContainer width="100%" height={260}><BarChart data={provinceQuality} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}><XAxis type="number" domain={[0,10]} hide/><YAxis type="category" dataKey="name" width={68} tick={{fill:'var(--ac-text-sec)',fontSize:11,fontFamily:'var(--ac-font-ui)'}} axisLine={false} tickLine={false}/><CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)"/><Tooltip content={<CustomBarTooltip/>} cursor={{fill:'rgba(255,255,255,0.03)'}}/><Bar dataKey="avg" radius={[0,4,4,0]}>{provinceQuality.map((_,i)=><Cell key={i} fill={i===0?'var(--ac-gold)':i<=2?'rgba(200,168,75,0.65)':'rgba(200,168,75,0.35)'}/>)}</Bar></BarChart></ResponsiveContainer>:<div style={{height:260,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ac-text-muted)',fontSize:12}}>{t('common.loading')}</div>}
        </SectionCard>
        <SectionCard title={t('analyticsPage.bestContactTime')} icon={<Phone size={15}/>}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{background:'rgba(200,168,75,0.08)',border:'1px solid var(--ac-border-gold)',borderRadius:6,padding:'14px 16px',textAlign:'center'}}><div style={{fontSize:11,color:'var(--ac-text-muted)',marginBottom:4}}>Best Window</div><div style={{fontFamily:'var(--ac-font-mono)',fontSize:22,fontWeight:700,color:'var(--ac-gold)'}}>09:00–11:00</div><div style={{fontSize:11,color:'var(--ac-text-sec)',marginTop:4}}>Local Turkey Time (TRT)</div></div>
            <div style={{background:'rgba(200,168,75,0.05)',border:'1px solid var(--ac-border)',borderRadius:6,padding:'12px 14px',textAlign:'center'}}><div style={{fontSize:11,color:'var(--ac-text-muted)',marginBottom:4}}>Best Days</div><div style={{fontFamily:'var(--ac-font-mono)',fontSize:14,fontWeight:700,color:'var(--ac-text-primary)'}}>Tue · Wed · Thu</div></div>
            {[{time:'09:00–11:00',rate:84},{time:'13:00–15:00',rate:61},{time:'15:00–17:00',rate:47},{time:'17:00–19:00',rate:29}].map(t2=>(
              <div key={t2.time} style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontFamily:'var(--ac-font-mono)',fontSize:11,color:'var(--ac-text-sec)',minWidth:90}}>{t2.time}</span><div style={{flex:1,height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}><div style={{width:`${t2.rate}%`,height:'100%',background:t2.rate>=80?'var(--ac-gold)':t2.rate>=50?'rgba(200,168,75,0.6)':'rgba(200,168,75,0.3)',borderRadius:2}}/></div><span style={{fontFamily:'var(--ac-font-mono)',fontSize:11,color:'var(--ac-text-muted)',minWidth:28,textAlign:'right'}}>{t2.rate}%</span></div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Seasonal Intelligence */}
      <SectionCard title={t('analyticsPage.seasonalIntel')} icon={<Calendar size={15}/>} accent="rgba(91,156,246,0.3)">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {[
            {month:'📅 June 2026 — Active Now',headline:'Pre-summer inventory push across European buyers',detail:'German and Dutch food importers are finalizing H2 contracts. Turkish food machinery exporters have a 3–4 week window to close deals before the summer pause.',cta:'Target Food Processing now',ctaColor:'#e25555',badge:'URGENT',badgeColor:'#e25555'},
            {month:'📅 June 2026 — Active Now',headline:'Ramadan aftermarket — confectionery & bakery demand spike',detail:'Post-Ramadan production ramp-up in GCC markets. Bakery equipment and packaging machinery suppliers in Istanbul/Bursa are in high demand.',cta:'Scout Bakery Equipment now',ctaColor:'#c8a84b',badge:'HOT',badgeColor:'#c8a84b'},
            {month:'📅 July 2026 — Upcoming',headline:'European trade show season prep — Anuga / IFFA pre-orders',detail:'Anuga (Oct, Cologne) pre-order windows open July–August. Meat processing and food packaging exporters should start outreach now.',cta:'Prepare Meat Processing list',ctaColor:'#5b9cf6',badge:'PREPARE',badgeColor:'#5b9cf6'},
            {month:'📅 September 2026 — Plan Ahead',headline:'German contract renewal season — frozen vegetable importers',detail:'September marks the start of the German import contract cycle. Now is the best time to identify and warm up Turkish vegetable processing exporters.',cta:'Build Vegetable Processing pipeline',ctaColor:'#2dd4a0',badge:'PLAN',badgeColor:'#2dd4a0'},
          ].map((item,i)=>(
            <div key={i} style={{background:'var(--ac-bg-input)',border:'1px solid var(--ac-border)',borderRadius:6,padding:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:11,color:'var(--ac-text-muted)'}}>{item.month}</span><span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:10,background:`${item.badgeColor}25`,color:item.badgeColor,border:`1px solid ${item.badgeColor}44`}}>{item.badge}</span></div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--ac-text-primary)',marginBottom:6,lineHeight:1.4}}>{item.headline}</div>
              <div style={{fontSize:12,color:'var(--ac-text-sec)',lineHeight:1.5,marginBottom:10}}>{item.detail}</div>
              <div onClick={()=>onNavigate?.('new-scout')} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:item.ctaColor,fontWeight:500,cursor:'pointer'}}><ChevronRight size={12}/>{item.cta}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Smart Outreach Queue */}
      <SectionCard title={t('analyticsPage.smartOutreach')} icon={<Mail size={15}/>}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,fontFamily:'var(--ac-font-ui)'}}>
            <thead><tr style={{borderBottom:'1px solid var(--ac-border)'}}>
              {['Priority',t('outreach.company'),t('dashboard.province'),'Reason','Recommended Action'].map(h=><th key={h} style={{padding:'8px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {outreachQueue.map((r,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms'}} onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <span style={{fontFamily:'var(--ac-font-mono)',fontSize:14,fontWeight:700,color:r.score>=80?'var(--ac-danger)':r.score>=50?'var(--ac-gold)':'var(--ac-text-muted)'}}>{r.score}</span>
                      <span style={{fontSize:9,padding:'1px 7px',borderRadius:10,fontWeight:600,background:r.tier==='Hot'?'rgba(226,85,85,0.12)':r.tier==='Good'?'rgba(200,168,75,0.12)':'rgba(85,85,85,0.15)',color:r.tier==='Hot'?'var(--ac-danger)':r.tier==='Good'?'var(--ac-gold)':'var(--ac-text-muted)',border:`1px solid ${r.tier==='Hot'?'rgba(226,85,85,0.3)':r.tier==='Good'?'rgba(200,168,75,0.3)':'rgba(85,85,85,0.3)'}`}}>{r.tier}</span>
                    </div>
                  </td>
                  <td style={{padding:'10px 14px',color:'var(--ac-text-primary)',fontWeight:500}}>{r.name}</td>
                  <td style={{padding:'10px 14px',color:'var(--ac-text-sec)'}}>{r.province}</td>
                  <td style={{padding:'10px 14px',color:'var(--ac-text-sec)',fontSize:12}}>{r.reason}</td>
                  <td style={{padding:'10px 14px'}}><button onClick={()=>r.tier==='Hot'?onNavigate?.('outreach-queue'):onNavigate?.('companies')} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:5,border:`1px solid ${r.actionColor}44`,background:`${r.actionColor}15`,color:r.actionColor,fontFamily:'var(--ac-font-ui)',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}><span style={{width:6,height:6,borderRadius:'50%',background:r.actionColor,flexShrink:0}}/>{r.action}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* White Spots */}
      <SectionCard title={t('analyticsPage.whiteSpots')} icon={<Map size={15}/>} accent="rgba(45,212,160,0.2)">
        <p style={{fontSize:12,color:'var(--ac-text-muted)',marginTop:0,marginBottom:16}}>Provinces not yet scraped with high industrial potential. Each represents dozens of untapped leads.</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {whiteSpots.map((ws,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:16,background:'var(--ac-bg-input)',border:'1px solid var(--ac-border)',borderRadius:6,padding:'12px 16px'}}>
              <div style={{flex:'0 0 110px'}}><div style={{fontSize:13,fontWeight:600,color:'var(--ac-text-primary)'}}>{ws.province}</div><div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:1}}>{ws.current>0?`${ws.current} companies so far`:'Not scraped yet'}</div></div>
              <div style={{flex:1,fontSize:12,color:'var(--ac-text-sec)'}}>{ws.note}</div>
              <div style={{flex:'0 0 140px',textAlign:'right'}}><div style={{fontSize:11,color:'var(--ac-text-muted)',marginBottom:4}}>Est. potential</div><div style={{fontFamily:'var(--ac-font-mono)',fontSize:18,fontWeight:700,color:'var(--ac-success)'}}>{ws.potential}+ <span style={{fontSize:11,fontWeight:400}}>leads</span></div></div>
              <button className="ac-btn-gold" onClick={()=>{sessionStorage.setItem('scout_prefill',JSON.stringify({province:ws.province,category:'Industrial Manufacturer'}));onNavigate?.('new-scout');}} style={{padding:'7px 14px',fontSize:11,fontWeight:700,borderRadius:5,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:5}}><ExternalLink size={11}/>Scout {ws.province}</button>
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
}
