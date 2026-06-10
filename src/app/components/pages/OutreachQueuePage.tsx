import { useState, useEffect } from 'react';
import { Send, Eye, Edit3, Check, Clock, RefreshCw, Loader, X, Copy } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useLanguage } from '../../contexts/LanguageContext';

type DailyLimit = 50|100|200;
type GapMinutes = 5|10|15;

function MessageModal({message,company,onClose,onSend}:{message:string;company:string;onClose:()=>void;onSend:(msg:string)=>void}) {
  const [edited,setEdited]=useState(message);
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(edited);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-gold)',borderRadius:10,width:'100%',maxWidth:600,display:'flex',flexDirection:'column',gap:0,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontWeight:600,fontSize:14,color:'var(--ac-text-primary)'}}>Outreach Message</div>
            <div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:2}}>{company}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ac-text-muted)',padding:4}}><X size={16}/></button>
        </div>
        <div style={{padding:20}}>
          <textarea value={edited} onChange={e=>setEdited(e.target.value)}
            style={{width:'100%',minHeight:200,background:'var(--ac-bg-input)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:12,color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',fontSize:13,lineHeight:1.6,resize:'vertical',outline:'none',boxSizing:'border-box'}}
            onFocus={e=>(e.currentTarget.style.borderColor='var(--ac-border-gold)')}
            onBlur={e=>(e.currentTarget.style.borderColor='var(--ac-border-med)')}/>
          <div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:6}}>{edited.length} characters · {edited.split(' ').length} words</div>
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid var(--ac-border)',display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={copy} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:5,border:'1px solid var(--ac-border-med)',background:'none',color:'var(--ac-text-sec)',cursor:'pointer',fontSize:12,fontFamily:'var(--ac-font-ui)'}}>
            <Copy size={12}/>{copied?'Copied!':'Copy'}
          </button>
          <button onClick={onClose} style={{padding:'7px 14px',borderRadius:5,border:'1px solid var(--ac-border-med)',background:'none',color:'var(--ac-text-sec)',cursor:'pointer',fontSize:12,fontFamily:'var(--ac-font-ui)'}}>Cancel</button>
          <button onClick={()=>{onSend(edited);onClose();}} className="ac-btn-gold" style={{display:'flex',alignItems:'center',gap:5,padding:'7px 18px',borderRadius:5,fontSize:12,fontWeight:700}}>
            <Send size={12}/>Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

export function OutreachQueuePage() {
  const {t}=useLanguage();
  const [companies,setCompanies]=useState<any[]>([]);
  const [queue,setQueue]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [generating,setGenerating]=useState<number|null>(null);
  const [dailyLimit,setDailyLimit]=useState<DailyLimit>(100);
  const [gapMinutes,setGapMinutes]=useState<GapMinutes>(10);
  const [followUp,setFollowUp]=useState(true);
  const [activeTemplate,setActiveTemplate]=useState('A');
  const [modalItem,setModalItem]=useState<any|null>(null);

  const TEMPLATES = [
    {id:'A',name:'No Website',preview:'"منافسوكم في [المدينة] يحصلون على عملاء من الإنترنت بينما شركتكم غائبة رقمياً..."'},
    {id:'B',name:'Expired Site',preview:'"موقعكم توقف مؤخراً — عملاؤكم الحاليون لا يستطيعون الوصول إليكم..."'},
    {id:'C',name:'Outdated Site',preview:'"موقعكم يعمل لكن سرعته وتصميمه قد يخسركم عملاء محتملين..."'},
  ];

  useEffect(()=>{
    setLoading(true);
    window.fetch('https://api.agentcraft.info/scout/companies?limit=50&sort_by=quality_score')
      .then(r=>r.json()).then(data=>{
        const list=(data.companies||[]).slice(0,8);
        setCompanies(list);
        setQueue(list.map((c:any,i:number)=>({
          id:c.id,company:c.name,province:c.province,
          issue:!c.has_website?'No Website':c.has_email?'Has Email':'No Email',
          preview:'',status:i===0?'sent':i<3?'scheduled':'pending',
          time:`${String(9+Math.floor(i*0.5)).padStart(2,'0')}:${i%2===0?'00':'30'}`,
          message:null,
        })));
      }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const generateMessage=async(companyId:number)=>{
    const company=companies.find(c=>c.id===companyId);if(!company)return;
    setGenerating(companyId);
    try {
      const res=await window.fetch('https://api.agentcraft.info/scout/outreach/generate',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({company_id:companyId,template:activeTemplate,language:'ar'}),
      });
      const data=await res.json();
      const msg=data.message||data.content||'';
      setQueue(prev=>prev.map(q=>q.id===companyId?{...q,preview:msg.slice(0,100)+'...',message:msg}:q));
      // فتح Modal مباشرة
      setModalItem({id:companyId,company:company.name,message:msg});
    } catch {
      const msg=`مرحباً ${company.name}، نود تقديم خدماتنا الرقمية لشركتكم في ${company.province}. نتخصص في بناء مواقع احترافية لشركات ${company.category}. هل يمكننا ترتيب مكالمة سريعة؟\n\nمع التحية،\nفريق AgentCraft Scout`;
      setQueue(prev=>prev.map(q=>q.id===companyId?{...q,preview:msg.slice(0,100)+'...',message:msg}:q));
      setModalItem({id:companyId,company:company.name,message:msg});
    } finally {setGenerating(null);}
  };

  const sendMessage=(companyId:number,msg?:string)=>{
    setQueue(prev=>prev.map(q=>q.id===companyId?{...q,status:'sent',message:msg||q.message}:q));
  };

  const sent=queue.filter(q=>q.status==='sent').length;
  const scheduled=queue.filter(q=>q.status==='scheduled').length;
  const pending=queue.filter(q=>q.status==='pending').length;
  const total=queue.length||100;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {modalItem&&<MessageModal message={modalItem.message} company={modalItem.company} onClose={()=>setModalItem(null)} onSend={(msg)=>sendMessage(modalItem.id,msg)}/>}

      {/* Banner */}
      <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-gold)',borderRadius:8,padding:'18px 24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{display:'flex',gap:24}}>
            {[{label:'Scheduled Today',value:total,color:'var(--ac-text-primary)'},{label:t('outreach.sent'),value:sent,color:'var(--ac-success)'},{label:t('outreach.queued'),value:scheduled+pending,color:'var(--ac-gold)'}].map(s=>(
              <div key={s.label}><span style={{fontFamily:'var(--ac-font-mono)',fontSize:22,fontWeight:700,color:s.color}}>{s.value}</span><span style={{fontSize:12,color:'var(--ac-text-sec)',marginLeft:6}}>{s.label}</span></div>
            ))}
          </div>
          <button className="ac-btn-gold" style={{padding:'8px 18px',fontSize:12,borderRadius:5,display:'flex',alignItems:'center',gap:6}}>
            <Send size={13}/>{t('outreach.startSending')}
          </button>
        </div>
        <ProgressBar value={sent} max={total} showLabel/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'flex-start'}}>
        {/* Queue Table */}
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'12px 18px',borderBottom:'1px solid var(--ac-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>{t('nav.outreachQueue')}</span>
            <span style={{fontSize:11,color:'var(--ac-text-muted)',fontFamily:'var(--ac-font-mono)'}}>{queue.length} messages</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--ac-font-ui)'}}>
            <thead><tr style={{borderBottom:'1px solid var(--ac-border)'}}>
              {['#',t('outreach.company'),t('outreach.issue'),t('outreach.preview'),t('common.status'),t('outreach.time'),t('outreach.actions')].map(h=>(
                <th key={h} style={{padding:'8px 14px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading?Array.from({length:5}).map((_,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {[40,140,80,200,70,60,80].map((w,j)=><td key={j} style={{padding:'10px 14px'}}><div style={{height:11,borderRadius:3,background:'var(--ac-bg-hover)',width:w}}/></td>)}
                </tr>
              )):queue.map((q:any,i:number)=>{
                const isSent=q.status==='sent';
                const isScheduled=q.status==='scheduled';
                const isGen=generating===q.id;
                return(
                  <tr key={q.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                    <td style={{padding:'10px 14px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-text-muted)',fontSize:11}}>{i+1}</td>
                    <td style={{padding:'10px 14px',color:'var(--ac-text-primary)',fontWeight:500,whiteSpace:'nowrap'}}>{q.company}</td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600,whiteSpace:'nowrap',background:q.issue==='No Website'?'rgba(226,85,85,0.12)':'rgba(200,168,75,0.12)',color:q.issue==='No Website'?'var(--ac-danger)':'var(--ac-gold)',border:`1px solid ${q.issue==='No Website'?'rgba(226,85,85,0.3)':'rgba(200,168,75,0.3)'}`}}>{q.issue}</span>
                    </td>
                    <td style={{padding:'10px 14px',color:q.preview?'var(--ac-text-sec)':'var(--ac-text-muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11,cursor:q.message?'pointer':'default'}}
                      onClick={()=>q.message&&setModalItem({id:q.id,company:q.company,message:q.message})}>
                      {q.preview||<span style={{color:'var(--ac-text-muted)',fontStyle:'italic'}}>Click Generate →</span>}
                    </td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        {isSent?<Check size={12} style={{color:'var(--ac-success)'}}/>:<Clock size={12} style={{color:'var(--ac-text-muted)'}}/>}
                        <span style={{fontSize:11,color:isSent?'var(--ac-success)':isScheduled?'var(--ac-gold)':'var(--ac-text-muted)',fontWeight:500}}>
                          {isSent?t('outreach.sent'):isScheduled?'Scheduled':'Pending'}
                        </span>
                      </div>
                    </td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-text-sec)',fontSize:11}}>{q.time}</td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:4}}>
                        {!isSent&&(
                          <button onClick={()=>generateMessage(q.id)} disabled={isGen}
                            style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:4,border:'1px solid rgba(91,156,246,0.4)',background:'rgba(91,156,246,0.1)',color:'var(--ac-info)',cursor:'pointer',fontSize:10,opacity:isGen?0.6:1,whiteSpace:'nowrap'}}>
                            {isGen?<Loader size={10} style={{animation:'spin 1s linear infinite'}}/>:<RefreshCw size={10}/>}
                            {t('outreach.generate')}
                          </button>
                        )}
                        {q.message&&!isSent&&(
                          <button onClick={()=>setModalItem({id:q.id,company:q.company,message:q.message})}
                            style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:4,border:'1px solid var(--ac-border-gold)',background:'rgba(200,168,75,0.08)',color:'var(--ac-gold)',cursor:'pointer',fontSize:10}}>
                            <Edit3 size={10}/>{t('common.view')}
                          </button>
                        )}
                        {isSent&&(
                          <button onClick={()=>q.message&&setModalItem({id:q.id,company:q.company,message:q.message})}
                            style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:4,border:'1px solid var(--ac-border)',background:'none',color:'var(--ac-text-sec)',cursor:'pointer',fontSize:11}}>
                            <Eye size={11}/>{t('common.view')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Panel */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:18}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--ac-text-primary)',marginBottom:14}}>Sending Settings</div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <div style={{fontSize:11,color:'var(--ac-text-sec)',marginBottom:6}}>{t('outreach.dailyLimit')}</div>
                <div style={{display:'flex',gap:5}}>
                  {([50,100,200] as DailyLimit[]).map(v=>(
                    <button key={v} onClick={()=>setDailyLimit(v)} style={{flex:1,padding:'5px 0',borderRadius:5,border:'1px solid',borderColor:dailyLimit===v?'var(--ac-gold)':'var(--ac-border-med)',background:dailyLimit===v?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:dailyLimit===v?'var(--ac-gold)':'var(--ac-text-sec)',fontSize:12,cursor:'pointer',fontWeight:dailyLimit===v?600:400}}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--ac-text-sec)',marginBottom:6}}>{t('outreach.gap')}</div>
                <div style={{display:'flex',gap:5}}>
                  {([5,10,15] as GapMinutes[]).map(v=>(
                    <button key={v} onClick={()=>setGapMinutes(v)} style={{flex:1,padding:'5px 0',borderRadius:5,border:'1px solid',borderColor:gapMinutes===v?'var(--ac-gold)':'var(--ac-border-med)',background:gapMinutes===v?'rgba(200,168,75,0.15)':'var(--ac-bg-input)',color:gapMinutes===v?'var(--ac-gold)':'var(--ac-text-sec)',fontSize:12,cursor:'pointer',fontWeight:gapMinutes===v?600:400}}>{v}m</button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontSize:11,color:'var(--ac-text-sec)'}}>{t('outreach.window')}</div>
                <span style={{fontFamily:'var(--ac-font-mono)',fontSize:11,color:'var(--ac-gold)'}}>09:00 — 17:00</span>
              </div>
              <ToggleSwitch checked={followUp} onChange={setFollowUp} label="Auto follow-up after 7 days"/>
            </div>
          </div>
          <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:18}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--ac-text-primary)',marginBottom:12}}>{t('outreach.templates')}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {TEMPLATES.map(tmpl=>(
                <div key={tmpl.id} onClick={()=>setActiveTemplate(tmpl.id)}
                  style={{border:`1px solid ${activeTemplate===tmpl.id?'var(--ac-border-gold)':'var(--ac-border)'}`,background:activeTemplate===tmpl.id?'rgba(200,168,75,0.06)':'var(--ac-bg-input)',borderRadius:6,padding:'10px 12px',cursor:'pointer',transition:'all 150ms'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                    <span style={{width:20,height:20,borderRadius:4,background:activeTemplate===tmpl.id?'var(--ac-gold)':'rgba(255,255,255,0.1)',color:activeTemplate===tmpl.id?'#0a0d12':'var(--ac-text-sec)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{tmpl.id}</span>
                    <span style={{fontSize:12,fontWeight:500,color:'var(--ac-text-primary)'}}>Template {tmpl.id} — {tmpl.name}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--ac-text-muted)',lineHeight:1.5}}>{tmpl.preview}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
