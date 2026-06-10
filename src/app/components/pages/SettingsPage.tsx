import { useState } from 'react';
import { Save, Upload, CheckCircle, Circle, Trash2, AlertTriangle } from 'lucide-react';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Modal } from '../ui/Modal';
import { SearchDropdown, type DropdownOption } from '../ui/SearchDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppSettings, type TableDensity, type CurrencyCode, type DateFormatCode, type NumberFormatCode } from '../../contexts/AppSettingsContext';
import { LANGUAGES } from '../../i18n/translations';

type Tab = 'profile'|'preferences'|'notifications'|'about';

const COUNTRY_OPTIONS: DropdownOption[] = [
  {value:'turkey',label:'Turkey',group:'Middle East'},{value:'uae',label:'UAE',group:'Middle East'},
  {value:'saudi',label:'Saudi Arabia',group:'Middle East'},{value:'germany',label:'Germany',group:'Europe'},
  {value:'uk',label:'United Kingdom',group:'Europe'},{value:'usa',label:'USA',group:'Americas'},
];
const PROVINCE_OPTIONS: DropdownOption[] = [
  ...['Istanbul','Bursa','Kocaeli','Ankara','İzmir','Antalya','Konya','Kayseri'].map(v=>({value:v,label:v,group:'Popular'})),
];
const CATEGORY_OPTIONS: DropdownOption[] = [
  {value:'food',label:'Food Processing Machinery',group:'Food & Beverage'},
  {value:'textile',label:'Textile Machinery',group:'Textile'},
  {value:'metal',label:'Metal Fabrication',group:'Metal'},
  {value:'general',label:'Industrial Manufacturer',group:'General'},
];
const SERVICES=[
  {name:'Google Places API',status:'connected'},
  {name:'Scrapling Service',status:'connected'},
  {name:'Claude API',status:'connected'},
  {name:'SMTP',status:'disconnected'},
];

function TabBtn({id,label,active,onClick}:{id:Tab;label:string;active:boolean;onClick:()=>void}) {
  return <button onClick={onClick} style={{padding:'9px 20px',border:'none',cursor:'pointer',background:'none',fontFamily:'var(--ac-font-ui)',fontSize:13,color:active?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:active?600:400,borderBottom:`2px solid ${active?'var(--ac-gold)':'transparent'}`,transition:'all 150ms'}}>{label}</button>;
}
function FieldRow({label,children}:{label:string;children:React.ReactNode}) {
  return <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:16,alignItems:'center'}}><label style={{fontSize:12,color:'var(--ac-text-sec)',fontWeight:500}}>{label}</label>{children}</div>;
}
function TextInput({value,onChange,placeholder}:{value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:'var(--ac-bg-input)',border:'1px solid var(--ac-border-med)',borderRadius:6,padding:'8px 12px',color:'var(--ac-text-primary)',fontFamily:'var(--ac-font-ui)',fontSize:13,outline:'none',width:'100%',boxSizing:'border-box'}} onFocus={e=>(e.currentTarget.style.borderColor='var(--ac-border-gold)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--ac-border-med)')}/>;
}

export function SettingsPage() {
  const {t}=useLanguage();
  const [activeTab,setActiveTab]=useState<Tab>('profile');
  const {lang,setLang}=useLanguage();
  const {density,setDensity,currency,setCurrency,dateFormat,setDateFormat,numberFormat,setNumberFormat}=useAppSettings();
  const [fullName,setFullName]=useState('Ayman Al-Saeed');
  const [company,setCompany]=useState('AgentCraft');
  const [email,setEmail]=useState('ayman@agentcraft.info');
  const [phone,setPhone]=useState('+90 555 000 0000');
  const [jobTitle,setJobTitle]=useState('Business Development');
  const [country,setCountry]=useState('turkey');
  const [saved,setSaved]=useState(false);
  const [defaultArm,setDefaultArm]=useState<'industrial'|'web'>('industrial');
  const [defaultProv,setDefaultProv]=useState('');
  const [defaultCat,setDefaultCat]=useState('');
  const [defaultLimit,setDefaultLimit]=useState<20|60|100>(60);
  const [autoSave,setAutoSave]=useState(true);
  const [qualityWarns,setQualityWarns]=useState(true);
  const [notifs,setNotifs]=useState({scoutComplete:true,newCompanies:true,scheduledJob:true,exportReady:true,weeklySummary:false,seasonalAlerts:true});
  const toggleNotif=(key:keyof typeof notifs)=>setNotifs(p=>({...p,[key]:!p[key]}));
  const [clearModal,setClearModal]=useState(false);
  const [clearConfirmed,setClearConfirmed]=useState(false);
  const handleSave=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};

  const TABS=[
    {id:'profile' as Tab,label:t('settings.profile')},
    {id:'preferences' as Tab,label:t('settings.preferences')},
    {id:'notifications' as Tab,label:t('settings.notifications')},
    {id:'about' as Tab,label:t('settings.about')},
  ];

  return (
    <div style={{maxWidth:700}}>
      <div style={{display:'flex',borderBottom:'1px solid var(--ac-border)',marginBottom:24,background:'var(--ac-bg-card)',borderRadius:'8px 8px 0 0',overflow:'hidden'}}>
        {TABS.map(tab=><TabBtn key={tab.id} id={tab.id} label={tab.label} active={activeTab===tab.id} onClick={()=>setActiveTab(tab.id)}/>)}
      </div>

      {/* Profile */}
      {activeTab==='profile'&&(
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:'0 0 8px 8px',padding:28,display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'flex',alignItems:'center',gap:18,paddingBottom:20,borderBottom:'1px solid var(--ac-border)'}}>
            <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(200,168,75,0.2)',border:'2px solid var(--ac-border-gold)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--ac-font-display)',fontSize:22,fontWeight:700,color:'var(--ac-gold)'}}>
              {fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:'var(--ac-text-primary)'}}>{fullName||'Your Name'}</div>
              <div style={{fontSize:12,color:'var(--ac-text-muted)',marginTop:2}}>{company} · {COUNTRY_OPTIONS.find(c=>c.value===country)?.label??'Country'}</div>
            </div>
            <button style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:6,border:'1px solid var(--ac-border-med)',background:'none',color:'var(--ac-text-sec)',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)'}}>
              <Upload size={13}/>{t('settings.uploadPhoto')}
            </button>
          </div>
          <FieldRow label={t('settings.fullName')}><TextInput value={fullName} onChange={setFullName} placeholder="Your full name"/></FieldRow>
          <FieldRow label={t('settings.company')}><TextInput value={company} onChange={setCompany} placeholder="Company name"/></FieldRow>
          <FieldRow label={t('companiesPage.email')}><TextInput value={email} onChange={setEmail} placeholder="email@domain.com"/></FieldRow>
          <FieldRow label={t('settings.phone')}><TextInput value={phone} onChange={setPhone} placeholder="+90 555 000 0000"/></FieldRow>
          <FieldRow label={t('settings.jobTitle')}><TextInput value={jobTitle} onChange={setJobTitle} placeholder="Your role"/></FieldRow>
          <FieldRow label={t('settings.country')}><SearchDropdown options={COUNTRY_OPTIONS} value={country} onChange={setCountry} placeholder="Select country..."/></FieldRow>
          <div style={{paddingTop:8}}>
            <button className="ac-btn-gold" onClick={handleSave} style={{padding:'10px 28px',fontSize:13,borderRadius:6,display:'flex',alignItems:'center',gap:7}}>
              {saved?<><CheckCircle size={15}/>{t('settings.saved')}</>:<><Save size={15}/>{t('settings.saveProfile')}</>}
            </button>
          </div>
        </div>
      )}

      {/* Preferences */}
      {activeTab==='preferences'&&(
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:'0 0 8px 8px',padding:28,display:'flex',flexDirection:'column',gap:22}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)',marginBottom:10}}>{t('settings.appearance')}</div>
            <FieldRow label={t('settings.language')}>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {LANGUAGES.map(l=>(
                  <button key={l.code} onClick={()=>setLang(l.code)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',transition:'all 150ms',borderColor:lang===l.code?'var(--ac-gold)':'var(--ac-border-med)',background:lang===l.code?'rgba(200,168,75,0.15)':'none',color:lang===l.code?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:lang===l.code?600:400,display:'flex',alignItems:'center',gap:5}}>
                    <span>{l.flag}</span>{l.name}
                  </button>
                ))}
              </div>
            </FieldRow>
            <div style={{height:14}}/>
            <FieldRow label={t('settings.tableDensity')}>
              <div style={{display:'flex',gap:8}}>
                {(['compact','normal','comfortable'] as TableDensity[]).map(d=>(
                  <button key={d} onClick={()=>setDensity(d)} style={{padding:'6px 14px',borderRadius:6,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',borderColor:density===d?'var(--ac-gold)':'var(--ac-border-med)',background:density===d?'rgba(200,168,75,0.15)':'none',color:density===d?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:density===d?600:400,textTransform:'capitalize'}}>{d}</button>
                ))}
              </div>
            </FieldRow>
          </div>
          <div style={{borderTop:'1px solid var(--ac-border)',paddingTop:20}}>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)',marginBottom:12}}>Scout Defaults</div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <FieldRow label="Default Arm">
                <div style={{display:'flex',gap:8}}>
                  {(['industrial','web'] as const).map(a=>(
                    <button key={a} onClick={()=>setDefaultArm(a)} style={{padding:'6px 14px',borderRadius:6,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',borderColor:defaultArm===a?'var(--ac-gold)':'var(--ac-border-med)',background:defaultArm===a?'rgba(200,168,75,0.15)':'none',color:defaultArm===a?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:defaultArm===a?600:400}}>
                      {a==='industrial'?'🏭 Industrial':'🌐 Web'}
                    </button>
                  ))}
                </div>
              </FieldRow>
              <FieldRow label="Default Province"><SearchDropdown options={PROVINCE_OPTIONS} value={defaultProv} onChange={setDefaultProv} placeholder="Any province"/></FieldRow>
              <FieldRow label="Default Category"><SearchDropdown options={CATEGORY_OPTIONS} value={defaultCat} onChange={setDefaultCat} placeholder="Any category"/></FieldRow>
              <FieldRow label="Default Limit">
                <div style={{display:'flex',gap:8}}>
                  {([20,60,100] as const).map(l=>(
                    <button key={l} onClick={()=>setDefaultLimit(l)} style={{padding:'6px 14px',borderRadius:6,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-ui)',borderColor:defaultLimit===l?'var(--ac-gold)':'var(--ac-border-med)',background:defaultLimit===l?'rgba(200,168,75,0.15)':'none',color:defaultLimit===l?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:defaultLimit===l?600:400}}>{l}</button>
                  ))}
                </div>
              </FieldRow>
              <ToggleSwitch checked={autoSave} onChange={setAutoSave} label="Auto-save results after each scout"/>
              <ToggleSwitch checked={qualityWarns} onChange={setQualityWarns} label="Show quality warnings on low-score companies"/>
            </div>
          </div>
          <div style={{borderTop:'1px solid var(--ac-border)',paddingTop:20}}>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)',marginBottom:12}}>Data Format</div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <FieldRow label="Currency">
                <div style={{display:'flex',gap:6}}>
                  {(['USD','EUR','GBP','TRY'] as CurrencyCode[]).map(c=>(
                    <button key={c} onClick={()=>setCurrency(c)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--ac-font-mono)',borderColor:currency===c?'var(--ac-gold)':'var(--ac-border-med)',background:currency===c?'rgba(200,168,75,0.15)':'none',color:currency===c?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:currency===c?600:400}}>{c}</button>
                  ))}
                </div>
              </FieldRow>
              <FieldRow label="Date Format">
                <div style={{display:'flex',gap:6}}>
                  {(['MMM DD, YYYY','DD/MM/YYYY','YYYY-MM-DD'] as DateFormatCode[]).map(d=>(
                    <button key={d} onClick={()=>setDateFormat(d)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid',fontSize:11,cursor:'pointer',fontFamily:'var(--ac-font-mono)',borderColor:dateFormat===d?'var(--ac-gold)':'var(--ac-border-med)',background:dateFormat===d?'rgba(200,168,75,0.15)':'none',color:dateFormat===d?'var(--ac-gold)':'var(--ac-text-sec)',fontWeight:dateFormat===d?600:400}}>{d}</button>
                  ))}
                </div>
              </FieldRow>
            </div>
          </div>
          <div style={{paddingTop:8}}>
            <button className="ac-btn-gold" onClick={handleSave} style={{padding:'10px 28px',fontSize:13,borderRadius:6,display:'flex',alignItems:'center',gap:7}}>
              {saved?<><CheckCircle size={15}/>{t('settings.saved')}</>:<><Save size={15}/>{t('common.save')}</>}
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab==='notifications'&&(
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:'0 0 8px 8px',padding:28,display:'flex',flexDirection:'column',gap:4}}>
          {[
            {key:'scoutComplete' as const,label:'Scout mission completed',sub:'Notified when a scout finishes and results are ready'},
            {key:'newCompanies' as const,label:'New companies found',sub:'Alert when new high-quality leads are added to the DB'},
            {key:'scheduledJob' as const,label:'Scheduled job run',sub:'Confirm each time a scheduled scout executes'},
            {key:'exportReady' as const,label:'Export file ready',sub:'Notified when CSV/Excel exports finish generating'},
            {key:'weeklySummary' as const,label:'Weekly activity summary',sub:'Email digest every Sunday with platform stats'},
            {key:'seasonalAlerts' as const,label:'Seasonal business alerts',sub:'Receive intelligence about market seasonality windows'},
          ].map(n=>(
            <div key={n.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderRadius:6,transition:'background 150ms'}} onMouseEnter={e=>(e.currentTarget.style.background='var(--ac-bg-hover)')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
              <div>
                <div style={{fontSize:13,color:'var(--ac-text-primary)',fontWeight:500}}>{n.label}</div>
                <div style={{fontSize:11,color:'var(--ac-text-muted)',marginTop:2}}>{n.sub}</div>
              </div>
              <ToggleSwitch checked={notifs[n.key]} onChange={()=>toggleNotif(n.key)}/>
            </div>
          ))}
          <div style={{borderTop:'1px solid var(--ac-border)',paddingTop:16,marginTop:8}}>
            <button className="ac-btn-gold" onClick={handleSave} style={{padding:'10px 28px',fontSize:13,borderRadius:6,display:'flex',alignItems:'center',gap:7}}>
              {saved?<><CheckCircle size={15}/>{t('settings.saved')}</>:<><Save size={15}/>{t('settings.saveNotifications')}</>}
            </button>
          </div>
        </div>
      )}

      {/* About */}
      {activeTab==='about'&&(
        <div style={{background:'var(--ac-bg-card)',border:'1px solid var(--ac-border)',borderRadius:'0 0 8px 8px',padding:28,display:'flex',flexDirection:'column',gap:24}}>
          <div style={{display:'flex',alignItems:'center',gap:16,paddingBottom:20,borderBottom:'1px solid var(--ac-border)'}}>
            <div style={{width:52,height:52,borderRadius:12,background:'rgba(200,168,75,0.15)',border:'1px solid var(--ac-border-gold)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🎯</div>
            <div>
              <div style={{fontFamily:'var(--ac-font-display)',fontSize:20,fontWeight:700,color:'var(--ac-text-primary)'}}>AgentCraft Scout</div>
              <div style={{fontSize:12,color:'var(--ac-text-muted)',marginTop:2}}>B2B Intelligence Platform · Turkey & Beyond</div>
              <div style={{display:'flex',gap:10,marginTop:6}}>
                <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(200,168,75,0.12)',color:'var(--ac-gold)',border:'1px solid rgba(200,168,75,0.25)',fontFamily:'var(--ac-font-mono)',fontWeight:600}}>v2.0.0</span>
                <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(91,156,246,0.1)',color:'var(--ac-info)',border:'1px solid rgba(91,156,246,0.2)',fontWeight:600}}>Built: June 2026</span>
              </div>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-text-muted)',marginBottom:12}}>{t('settings.servicesStatus')}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {SERVICES.map(s=>(
                <div key={s.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--ac-bg-input)',borderRadius:6,border:'1px solid var(--ac-border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {s.status==='connected'?<CheckCircle size={14} style={{color:'var(--ac-success)'}}/>:<Circle size={14} style={{color:'var(--ac-text-muted)'}}/>}
                    <span style={{fontSize:13,color:'var(--ac-text-primary)'}}>{s.name}</span>
                  </div>
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600,background:s.status==='connected'?'rgba(45,212,160,0.12)':'rgba(138,138,138,0.12)',color:s.status==='connected'?'var(--ac-success)':'var(--ac-text-muted)',border:`1px solid ${s.status==='connected'?'rgba(45,212,160,0.25)':'rgba(138,138,138,0.2)'}`}}>
                    {s.status==='connected'?t('settings.connected'):t('settings.notConfigured')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:'1px solid var(--ac-border)',paddingTop:20}}>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--ac-danger)',marginBottom:10}}>{t('settings.dangerZone')}</div>
            <button onClick={()=>setClearModal(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 20px',borderRadius:6,border:'1px solid rgba(226,85,85,0.4)',background:'rgba(226,85,85,0.08)',color:'var(--ac-danger)',cursor:'pointer',fontFamily:'var(--ac-font-ui)',fontSize:13,fontWeight:600}} onMouseEnter={e=>(e.currentTarget.style.background='rgba(226,85,85,0.15)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(226,85,85,0.08)')}>
              <Trash2 size={14}/>{t('settings.clearAllData')}
            </button>
          </div>
        </div>
      )}

      <Modal open={clearModal} onClose={()=>{setClearModal(false);setClearConfirmed(false);}} title={t('settings.clearAllData')}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'flex',gap:12,padding:'14px',background:'rgba(226,85,85,0.08)',border:'1px solid rgba(226,85,85,0.25)',borderRadius:6}}>
            <AlertTriangle size={18} style={{color:'var(--ac-danger)',flexShrink:0,marginTop:1}}/>
            <div style={{fontSize:13,color:'var(--ac-text-sec)',lineHeight:1.6}}>This will permanently delete <strong style={{color:'var(--ac-text-primary)'}}>all companies, campaigns, API keys, and settings</strong>. This action cannot be undone.</div>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
            <div onClick={()=>setClearConfirmed(p=>!p)} style={{width:16,height:16,borderRadius:4,border:`2px solid ${clearConfirmed?'var(--ac-danger)':'var(--ac-border-med)'}`,background:clearConfirmed?'rgba(226,85,85,0.3)':'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
              {clearConfirmed&&<span style={{fontSize:10,color:'var(--ac-danger)',fontWeight:900}}>✓</span>}
            </div>
            <span style={{fontSize:12,color:'var(--ac-text-sec)'}}>I understand this will delete all data permanently</span>
          </label>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
            <button onClick={()=>{setClearModal(false);setClearConfirmed(false);}} style={{padding:'8px 18px',borderRadius:6,border:'1px solid var(--ac-border-med)',background:'none',color:'var(--ac-text-sec)',cursor:'pointer',fontSize:13,fontFamily:'var(--ac-font-ui)'}}>{t('settings.cancel')}</button>
            <button disabled={!clearConfirmed} onClick={()=>{setClearModal(false);setClearConfirmed(false);}} style={{padding:'8px 20px',borderRadius:6,border:'none',background:clearConfirmed?'var(--ac-danger)':'rgba(226,85,85,0.3)',color:clearConfirmed?'#fff':'rgba(226,85,85,0.5)',cursor:clearConfirmed?'pointer':'not-allowed',fontSize:13,fontWeight:600,fontFamily:'var(--ac-font-ui)'}}>
              {t('settings.deleteEverything')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
