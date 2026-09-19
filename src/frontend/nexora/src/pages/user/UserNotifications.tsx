import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { getNotificationsByUser, markNotificationRead, markAllNotificationsRead } from '../../store/nexoraStore';
import type { NexoraNotification } from '../../types/extended';

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  info:    { icon: 'ℹ️', color: '#38bdf8', bg: 'rgba(56,189,248,0.06)' },
  warning: { icon: '⚠️', color: '#fbbf24', bg: 'rgba(251,191,36,0.06)' },
  success: { icon: '✅', color: '#4ade80', bg: 'rgba(74,222,128,0.06)' },
  danger:  { icon: '🚨', color: '#f87171', bg: 'rgba(248,113,113,0.06)' },
};

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function UserNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NexoraNotification[]>([]);

  useEffect(() => {
    function refresh() {
      if (!user) return;
      setNotifications(getNotificationsByUser(user.id));
    }
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [user]);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.read).length;

  function handleMarkRead(id: string) {
    markNotificationRead(id);
    setNotifications(getNotificationsByUser(user!.id));
  }

  function handleMarkAll() {
    markAllNotificationsRead(user!.id);
    setNotifications(getNotificationsByUser(user!.id));
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up'}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {unread > 0 && <Btn small variant="secondary" onClick={handleMarkAll}>Mark All Read</Btn>}
            <Btn small variant="secondary" onClick={() => navigate('/user')}>← Dashboard</Btn>
          </div>
        }
      />

      {notifications.length === 0 ? (
        <div style={{ ...glass, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔔</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>No notifications</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: '1.5rem' }}>
            You&apos;ll receive updates here about your complaints and area incidents.
          </div>
          <Btn variant="secondary" onClick={() => navigate('/user')}>Back to Dashboard</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
            return (
              <div
                key={n.id}
                style={{
                  ...glass,
                  padding: '1rem 1.4rem',
                  background: n.read ? 'rgba(8,20,40,0.5)' : cfg.bg,
                  borderColor: n.read ? 'rgba(56,189,248,0.08)' : `rgba(${cfg.color === '#38bdf8' ? '56,189,248' : cfg.color === '#fbbf24' ? '251,191,36' : cfg.color === '#4ade80' ? '74,222,128' : '248,113,113'},0.25)`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: n.read ? 0.65 : 1,
                }}
              >
                <div style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: n.read ? '#64748b' : '#e2e8f0', lineHeight: 1.5, fontWeight: n.read ? 400 : 500 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      background: 'rgba(56,189,248,0.1)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: 6,
                      color: '#38bdf8',
                      fontSize: 11,
                      padding: '0.25rem 0.7rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
