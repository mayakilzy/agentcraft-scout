import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, Save, CalendarClock } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { SearchDropdown, type DropdownOption } from '../ui/SearchDropdown';
import { useLanguage } from '../../contexts/LanguageContext';

const API = 'https://api.agentcraft.info';

const PROVINCE_OPTIONS: DropdownOption[] = [
  ...['Istanbul','Bursa','Kocaeli','Ankara','İzmir','Antalya','Gaziantep','Konya','Kayseri','Mersin'].map(v=>({value:v,label:v,group:'Popular'})),
  ...['Sakarya','Tekirdağ','Edirne','Manisa','Aydın','Denizli','Eskişehir','Sivas','Trabzon','Samsun'].map(v=>({value:v,label:v,group:'Other'})),
];
const CATEGORY_OPTIONS: DropdownOption[] = [
  ...['Food Processing Machinery','Dairy Processing Lines','Packaging Machinery','Bakery Equipment'].map(v=>({value:v,label:v,group:'Food & Beverage'})),
  ...['Textile Machinery','Knitting Machines','Weaving Equipment'].map(v=>({value:v,label:v,group:'Textile'})),
  ...['Metal Fabrication','CNC Machinery','Welding Equipment','Casting & Forging'].map(v=>({value:v,label:v,group:'Metal & Engineering'})),
  ...['Industrial Manufacturer','OSB Company','Exporter','Wholesaler'].map(v=>({value:v,label:v,group:'General'})),
];
const DAYS=['M','T','W','T','F','S','S'];
const FREQUENCIES=['Once','Daily','Weekly','Monthly'] as const;
const RESULT_LIMITS=['20','60','100','Max'] as const;
const FORMATS=['CSV','Excel'] as const;

export function SchedulerPage() {
  const {t}=useLanguage();
  const [jobs,setJobs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [jobName,setJobName]=useState('');
  const [arm,setArm]=useState<'industrial'|'web'>('industrial');
  const [province,setProvince]=useState('');
  const [category,setCategory]=useState('');
  const [frequency,setFrequency]=useState<typeof FREQUENCIES[number]>('Weekly');
  const [activeDays,setActiveDays]=useState<number[]>([1,3]);
  const [runTime,setRunTime]=useState('09:00');
  const [resultLimit,setResultLimit]=useState<typeof RESULT_LIMITS[number]>('60');
  const [autoExport,setAutoExport]=useState(false);
  const [exportFormat,setExportFormat]=useState<typeof FORMATS[number]>('CSV');
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    setLoading(true);
    window.fetch(`${API}/scout/jobs`)
      .then(r=>r.json())
      .then(data=>setJobs(Array.isArray(data)?data:data.jobs||[]))
      .catch(e=>setError(String(e)))
      .finally(()=>setLoading(false));
  },[]);

  const toggleDay=(i:number)=>setActiveDays(prev=>prev.includes(i)?prev.filter(d=>d!==i):[...prev,i]);

  const toggleJobStatus=(id:number)=>{
    const job=jobs.find(j=>j.id===id);if(!job)return;
    const newStatus=job.status==='active'?'paused':'active';
    window.fetch(`${API}/scout/jobs/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:newStatus})})
      .then(()=>setJobs(prev=>prev.map(j=>j.id===id?{...j,status:newStatus}:j))).catch(()=>{});
  };

  const deleteJob=(id:number)=>{
    window.fetch(`${API}/scout/jobs/${id}`,{method:'DELETE'})
      .then(()=>setJobs(prev=>prev.filter(j=>j.id!==id))).catch(()=>{});
  };

  const saveJob=()=>{
    if(!jobName||!province||!category)return;
    setSaving(true);
    window.fetch(`${API}/scout/jobs`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:jobName,arm,province,category,frequency:frequency.toLowerCase(),run_time:runTime,limit:resultLimit==='Max'?500:Number(resultLimit),auto_export:autoExport,export_format:exportFormat.toLowerCase()})
    }).then(r=>r.json()).then(newJob=>{
      setJobs(prev=>[newJob,...prev]);setJobName('');setProvince('');setCategory('');
    }).catch(()=>{
      setJobs(prev=>[{id:Date.now(),name:jobName,arm,province,category,frequency:frequency.toLowerCase(),status:'active',next_run:null,last_run:null},...prev]);
      setJobName('');setProvince('');setCategory('');
    }).finally(()=>setSaving(false));
  };

  const fmt=(iso:string|null)=>{if(!iso||iso==='—')return'—';try{return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return iso;}};
  const activeCount=jobs.filter(j=>j.status==='active').length;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:600,color:'var(--ac-text-primary)'}}>{t('nav.scheduler')}</h2>
          <p style={{margin:'4px 0 0',fontSize:12,color:'var(--ac-text-muted)'}}>{loading?'…':activeCount} {t('scheduler.activeJobs')}</p>
        </div>
      </div>

      {error&&<div style={{background:'rgba(226,85,85,0.1)',border:'1px solid rgba(226,85,85,0.3)',borderRadius:6,padding:'10px 14px',fontSize:12,color:'var(--ac-danger)'}}>{t('common.apiError')}: {error}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20,alignItems:'flex-start'}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,overflow:'hidden'}}>
            <div style={{padding:'12px 18px',borderBottom:'1px solid var(--ac-border)',fontWeight:500,fontSize:13,color:'var(--ac-text-primary)'}}>
              {t('scheduler.allJobs')} {!loading&&<span style={{fontSize:11,color:'var(--ac-text-muted)',fontWeight:400,marginLeft:6}}>({jobs.length})</span>}
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--ac-font-ui)'}}>
                <thead><tr style={{borderBottom:'1px solid var(--ac-border)'}}>
                  {[t('scheduler.jobName'),t('scheduler.arm'),t('dashboard.province'),t('scheduler.frequency'),t('scheduler.nextRun'),t('scheduler.lastRun'),t('common.status'),t('scheduler.actions')].map(h=>(
                    <th key={h} style={{padding:'9px 13px',textAlign:'left',color:'var(--ac-text-muted)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap',background:'var(--ac-bg-card)'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading?Array.from({length:3}).map((_,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid var(--ac-border)'}}>
                      {[140,40,80,60,100,100,70,60].map((w,j)=><td key={j} style={{padding:'10px 13px'}}><div style={{height:11,borderRadius:3,background:'var(--ac-bg-hover)',width:w}}/></td>)}
                    </tr>
                  )):jobs.length===0?(
                    <tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'var(--ac-text-muted)',fontSize:12}}>{t('scheduler.noJobs')}</td></tr>
                  ):jobs.map((job:any)=>(
                    <tr key={job.id} style={{borderBottom:'1px solid var(--ac-border)',transition:'background 150ms'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                      <td style={{padding:'10px 13px',fontWeight:500,color:'var(--ac-text-primary)'}}>{job.name}</td>
                      <td style={{padding:'10px 13px'}}><span style={{fontSize:11}}>{job.arm==='web'?'🌐':'🏭'}</span></td>
                      <td style={{padding:'10px 13px',color:'var(--ac-text-sec)'}}>{job.province}</td>
                      <td style={{padding:'10px 13px'}}><span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(200,168,75,0.1)',color:'var(--ac-gold)',border:'1px solid rgba(200,168,75,0.25)',fontWeight:600,textTransform:'capitalize'}}>{job.frequency}</span></td>
                      <td style={{padding:'10px 13px',fontFamily:'var(--ac-font-mono)',color:'var(--ac-info)',fontSize:11,whiteSpace:'nowrap'}}>{fmt(job.next_run)}</td>
                      <td style={{padding:'10px 13px',color:'var(--ac-text-muted)',fontSize:11,whiteSpace:'nowrap'}}>{fmt(job.last_run)}</td>
                      <td style={{padding:'10px 13px'}}><StatusBadge status={job.status}/></td>
                      <td style={{padding:'10px 13px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button title={job.status==='active'?t('common.pause'):t('common.resume')} onClick={()=>toggleJobStatus(job.id)}
                            style={{padding:'4px 8px',borderRadius:4,border:`1px solid ${job.status==='active'?'var(--ac-border-gold)':'rgba(45,212,160,0.3)'}`,background:job.status==='active'?'rgba(200,168,75,0.1)':'rgba(45,212,160,0.1)',color:job.status==='active'?'var(--ac-gold)':'var(--ac-success)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                            {job.status==='active'?<Pause size={12}/>:<Play size={12}/>}
                          </button>
                          <button title={t('common.delete')} onClick={()=>deleteJob(job.id)}
                            style={{padding:'4px 8px',borderRadius:4,border:'1px solid var(--ac-border)',background:'none',color:'var(--ac-text-muted)',cursor:'pointer',display:'flex',alignItems:'center',transition:'all 150ms'}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(226,85,85,0.4)';e.currentTarget.style.color='var(--ac-danger)';}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--ac-border)';e.currentTarget.style.color='var(--ac-text-muted)';}}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:8,padding:18}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--ac-text-primary)',marginBottom:14,display:'flex',alignItems:'center',gap:7}}>
              <CalendarClock size={14} style={{color:'var(--ac-gold)'}}/> {t('scheduler.upcomingRuns')}
            </div>
            {jobs.filter(j=>j.status==='active'&&j.next_run).slice(0,5).length>0?(
              <div style={{display:'flex',gap:0,overflowX:'auto'}}>
                {jobs.filter(j=>j.status==='active'&&j.next_run).slice(0,5).map((job:any,i:number)=>(
                  <div key={job.id} style={{flex:'0 0 auto',minWidth:140}}>
                    <div style={{display:'flex',alignItems:'center'}}>
                      <div style={{flex:1,height:2,background:i===0?'var(--ac-gold)':'rgba(255,255,255,0.1)'}}/>
                      <div style={{width:10,height:10,borderRadius:'50%',background:i===0?'var(--ac-gold)':'rgba(255,255,255,0.2)',border:`2px solid ${i===0?'var(--ac-gold-bright)':'rgba(255,255,255,0.1)'}`,flexShrink:0}}/>
                      <div style={{flex:1,height:2,background:'rgba(255,255,255,0.1)'}}/>
                    </div>
                    <div style={{padding:'8px 6px',textAlign:'center'}}>
                      <div style={{fontFamily:'var(--ac-font-mono)',fontSize:11,fontWeight:700,color:i===0?'var(--ac-gold)':'var(--ac-text-primary)'}}>
                        {new Date(job.next_run).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                      </div>
                      <div style={{fontFamily:'var(--ac-font-mono)',fontSize:10,color:'var(--ac-text-muted)',marginBottom:4}}>
                        {new Date(job.next_run).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                      <div style={{fontSize:10,color:'var(--ac-text-sec)'}}>{job.province}</div>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div style={{color:'var(--ac-text-muted)',fontSize:12,textAlign:'center',padding:'16px 0'}}>{t('common.noResults')}</div>
            )}
          </div>
        </div>

        {/* New Job Form */}
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border-gold)',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--ac-border)',background:'rgba(200,168,75,0.04)',display:'flex',alignItems:'center',gap:7}}>
            <Plus size={14} style={{color:'var(--ac-gold)'}}/>
            <span style={{fontSize:13,fontWeight:600,color:'var(--ac-text-primary)'}}>{t('scheduler.newJob')}</span>
          </div>
          <div style={{padding:18,display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('scheduler.jobName')}</label>
              <input value={jobName} onChange={e=>setJobName(e.target.value)} placeholder="e.g. Istanbul Weekly Food Scan"
                style={{width:'100%',background:'var(--ac-bg-input)',border:'1px solid var(--ac-border-med)',borderRadius:5,padding:'7px 10px',color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',fontSize:12,outline:'none',boxSizing:'border-box'}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--ac-border-gold)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--ac-border-med)')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('scheduler.arm')}</label>
              <div style={{display:'flex',gap:6}}>
                {(['industrial','web'] as const).map(a=>(
                  <button key={a} onClick={()=>setArm(a)} style={{flex:1,padding:'7px 0',borderRadius:5,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',transition:'all 150ms',borderColor:arm===a?'var(--ac-gold)':'var(--ac-border-med)',background:arm===a?'rgba(200,168,75,0.15)':'none',color:arm===a?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:arm===a?600:400}}>
                    {a==='industrial'?'🏭 Industrial':'🌐 Web'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('dashboard.province')}</label>
              <SearchDropdown options={PROVINCE_OPTIONS} value={province} onChange={setProvince} placeholder={t('dashboard.selectProvince')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('dashboard.category')}</label>
              <SearchDropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder={t('dashboard.selectCategory')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('scheduler.frequency')}</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
                {FREQUENCIES.map(f=>(
                  <button key={f} onClick={()=>setFrequency(f)} style={{padding:'5px 0',borderRadius:4,border:'1px solid',fontSize:11,cursor:'pointer',fontFamily:'var(--ac-font-ui)',transition:'all 150ms',borderColor:frequency===f?'var(--ac-gold)':'var(--ac-border-med)',background:frequency===f?'rgba(200,168,75,0.15)':'none',color:frequency===f?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:frequency===f?600:400}}>{f}</button>
                ))}
              </div>
            </div>
            {(frequency==='Weekly'||frequency==='Daily')&&(
              <div>
                <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('scheduler.days')}</label>
                <div style={{display:'flex',gap:5}}>
                  {DAYS.map((d,i)=>(
                    <button key={i} onClick={()=>toggleDay(i)} style={{width:30,height:30,borderRadius:5,border:'1px solid',fontSize:11,cursor:'pointer',fontFamily:'var(--ac-font-ui)',transition:'all 150ms',borderColor:activeDays.includes(i)?'var(--ac-gold)':'var(--ac-border-med)',background:activeDays.includes(i)?'rgba(200,168,75,0.2)':'none',color:activeDays.includes(i)?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:activeDays.includes(i)?700:400}}>{d}</button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('scheduler.runTime')}</label>
              <input type="time" value={runTime} onChange={e=>setRunTime(e.target.value)}
                style={{background:'var(--ac-bg-input)',border:'1px solid var(--ac-border-med)',borderRadius:5,padding:'7px 10px',color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-mono)',fontSize:12,outline:'none',colorScheme:'dark'}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--ac-border-gold)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--ac-border-med)')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,color:'var(--ac-text-sec)',marginBottom:5,fontWeight:500}}>{t('scheduler.resultsLimit')}</label>
              <div style={{display:'flex',gap:4}}>
                {RESULT_LIMITS.map(r=>(
                  <button key={r} onClick={()=>setResultLimit(r)} style={{flex:1,padding:'5px 0',borderRadius:4,border:'1px solid',fontSize:11,cursor:'pointer',fontFamily:'var(--ac-font-ui)',borderColor:resultLimit===r?'var(--ac-gold)':'var(--ac-border-med)',background:resultLimit===r?'rgba(200,168,75,0.15)':'none',color:resultLimit===r?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:resultLimit===r?600:400}}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <ToggleSwitch checked={autoExport} onChange={setAutoExport} label={t('newScout.autoExport')}/>
              {autoExport&&(
                <div style={{display:'flex',gap:5,paddingLeft:44}}>
                  {FORMATS.map(f=>(
                    <button key={f} onClick={()=>setExportFormat(f)} style={{padding:'4px 12px',borderRadius:4,border:'1px solid',fontSize:11,cursor:'pointer',borderColor:exportFormat===f?'var(--ac-gold)':'var(--ac-border-med)',background:exportFormat===f?'rgba(200,168,75,0.15)':'none',color:exportFormat===f?'var(--ac-gold)':'var(--ac-text-sec)',fontFamily:'var(--ac-font-ui)'}}>{f}</button>
                  ))}
                </div>
              )}
            </div>
            <button className="ac-btn-gold" onClick={saveJob} disabled={!jobName||!province||!category||saving}
              style={{width:'100%',padding:'10px',fontSize:13,fontWeight:700,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',gap:7,opacity:(!jobName||!province||!category)?0.45:1,cursor:(!jobName||!province||!category)?'not-allowed':'pointer'}}>
              <Save size={14}/>{saving?t('common.loading'):t('scheduler.saveSchedule')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
