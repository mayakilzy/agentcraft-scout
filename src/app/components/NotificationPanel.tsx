import { useEffect, useRef, useState } from 'react';
import { CheckCheck, Bell, X, CheckCircle2, Calendar, Download, Flame } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface Notification {
  id: string;
  type: 'scout' | 'scheduled' | 'export' | 'hot';
  title: string;
  subtitle: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'scout',     title: 'Istanbul Food Scout completed',       subtitle: '127 companies found',               timestamp: '2 min ago',  read: false },
  { id: '2', type: 'hot',       title: '3 new hot leads in your queue',        subtitle: 'Textile, Ceramics, Machinery',       timestamp: '14 min ago', read: false },
  { id: '3', type: 'export',    title: 'export_istanbul_jun1.csv is ready',    subtitle: '1,247 rows · 3.2 MB',               timestamp: '1 hr ago',   read: false },
  { id: '4', type: 'scheduled', title: 'Weekly Bursa Scout completed',          subtitle: '89 companies found',               timestamp: '3 hrs ago',  read: true  },
  { id: '5', type: 'scout',     title: 'Ankara Machinery Scout completed',     subtitle: '214 companies found',               timestamp: 'Yesterday',  read: true  },
  { id: '6', type: 'hot',       title: 'New hot lead: Kaya Tekstil A.Ş.',     subtitle: 'Score 9/10 — broken website found',  timestamp: 'Yesterday',  read: true  },
  { id: '7', type: 'export',    title: 'export_bursa_may28.xlsx is ready',     subtitle: '892 rows · 2.1 MB',                timestamp: '2 days ago', read: true  },
  { id: '8', type: 'scheduled', title: 'Daily Izmir Scout completed',          subtitle: '56 new companies added',            timestamp: '2 days ago', read: true  },
  { id: '9', type: 'scout',     title: 'Konya Industrial Scout completed',     subtitle: '178 companies found',               timestamp: '3 days ago', read: true  },
  { id: '10',type: 'hot',       title: '5 new hot leads in pipeline',          subtitle: 'Ready for outreach',               timestamp: '3 days ago', read: true  },
];

const TYPE_ICONS = {
  scout:     <CheckCircle2 size={14} style={{ color: '#2dd4a0' }} />,
  scheduled: <Calendar size={14} style={{ color: '#5b9cf6' }} />,
  export:    <Download size={14} style={{ color: '#c8a84b' }} />,
  hot:       <Flame size={14} style={{ color: '#e25555' }} />,
};

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={panelRef} style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: 360,
      maxHeight: 480,
      background: 'var(--ac-bg-card)',
      border: '1px solid var(--ac-border-med)',
      borderRadius: 10,
      boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--ac-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} style={{ color: 'var(--ac-gold)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ac-text-primary)' }}>
            {t('notif.title')}
          </span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
              background: 'var(--ac-danger)', color: '#fff',
            }}>{unreadCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'var(--ac-gold)', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <CheckCheck size={12} />
              {t('common.markAllRead')}
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text-muted)', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--ac-text-muted)', fontSize: 13 }}>
            {t('notif.empty')}
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 12, padding: '11px 16px',
                borderBottom: '1px solid var(--ac-border)',
                background: n.read ? 'none' : 'rgba(200,168,75,0.04)',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
            >
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                {TYPE_ICONS[n.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: 'var(--ac-text-primary)', lineHeight: 1.4 }}>
                    {n.title}
                  </span>
                  {!n.read && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--ac-gold)', flexShrink: 0, marginTop: 4,
                    }} />
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ac-text-muted)', marginTop: 2 }}>{n.subtitle}</div>
                <div style={{ fontSize: 10, color: 'var(--ac-text-muted)', marginTop: 4 }}>{n.timestamp}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--ac-border)',
        textAlign: 'center',
      }}>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: 'var(--ac-gold)',
        }}>
          {t('common.viewAll')} →
        </button>
      </div>
    </div>
  );
}
