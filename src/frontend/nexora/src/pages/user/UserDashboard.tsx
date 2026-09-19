import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { HealthBar, StatusBadge } from '../../components/shared';
import { getComplaintsByUser, getIncidents, getNotificationsByUser } from '../../store/nexoraStore';
import type { NexoraComplaint, NexoraIncident, NexoraNotification } from '../../types/extended';

const TRANSFORMER_MAP: Record<string, { id: string; name: string; health: number; load: number; temp: number; condition: string; lastUpdated: string }> = {
  'Houston North': {
    id: 'TX-047', name: 'Houston North Transformer', health: 62, load: 87, temp: 78,
    condition: 'warning', lastUpdated: '2 min ago',
  },
  'Houston South': {
    id: 'TX-031', name: 'Houston South Transformer', health: 71, load: 74, temp: 71,
    condition: 'warning', lastUpdated: '5 min ago',
  },
};

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '1.4rem 1.6rem',
};

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<NexoraComplaint[]>([]);
  const [incidents, setIncidents] = useState<NexoraIncident[]>([]);
  const [notifications, setNotifications] = useState<NexoraNotification[]>([]);

  useEffect(() => {
    function refresh() {
      if (!user) return;
      setComplaints(getComplaintsByUser(user.id));
      setIncidents(getIncidents().filter((i) => i.region === user.region));
      setNotifications(getNotificationsByUser(user.id).filter((n) => !n.read));
    }
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [user]);

  if (!user) return null;

  const transformer = user.region ? TRANSFORMER_MAP[user.region] : null;
  const openComplaints = complaints.filter((c) => c.status !== 'RESOLVED').length;
  const unread = notifications.length;

  const conditionText: Record<string, string> = {
    critical: 'This transformer is in a CRITICAL state. Emergency repairs may be in progress.',
    warning: 'This transformer is showing WARNING signs. Increased monitoring is active.',
    normal: 'This transformer is operating normally. No issues detected.',
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title={`Welcome back, ${user.name}`}
        subtitle={`Region: ${user.region ?? 'All Regions'} · Role: Customer Portal`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small onClick={() => navigate('/user/complaints/new')}>+ Report a Problem</Btn>
            <Btn small variant="secondary" onClick={() => navigate('/user/notifications')}>
              🔔 {unread > 0 ? `${unread} New` : 'Notifications'}
            </Btn>
          </div>
        }
      />

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'My Open Complaints', value: openComplaints, color: openComplaints > 0 ? '#fbbf24' : '#4ade80' },
          { label: 'Active Area Incidents', value: incidents.filter((i) => i.status !== 'RESOLVED').length, color: '#f87171' },
          { label: 'Unread Notifications', value: unread, color: '#818cf8' },
          { label: 'Area Health Score', value: transformer ? `${transformer.health}%` : 'N/A', color: '#38bdf8' },
        ].map((stat) => (
          <div key={stat.label} style={{ ...glass, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Nearest Transformer */}
        {transformer ? (
          <div style={glass}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                My Nearest Transformer
              </div>
              <StatusBadge status={transformer.condition} small />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{transformer.id}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: '1rem' }}>
              {transformer.name} · Last updated {transformer.lastUpdated}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>Health Score</div>
                <HealthBar score={transformer.health} size="sm" />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Load</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: transformer.load > 85 ? '#fbbf24' : '#4ade80' }}>{transformer.load}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Temperature</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: transformer.temp > 75 ? '#fbbf24' : '#4ade80' }}>{transformer.temp}°C</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5, padding: '0.6rem', background: 'rgba(56,189,248,0.05)', borderRadius: 8 }}>
              {conditionText[transformer.condition] ?? conditionText.normal}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn small onClick={() => navigate('/user/transformer')}>View Transformer</Btn>
              <Btn small variant="secondary" onClick={() => navigate('/user/complaints/new')}>Report Problem</Btn>
            </div>
          </div>
        ) : (
          <div style={{ ...glass, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>No transformer assigned to your region.</div>
          </div>
        )}

        {/* Active Incidents */}
        <div style={glass}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            Active Incidents in My Area
          </div>
          {incidents.filter((i) => i.status !== 'RESOLVED').length === 0 ? (
            <div style={{ color: '#4ade80', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>
              ✓ No active incidents in your area
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {incidents.filter((i) => i.status !== 'RESOLVED').slice(0, 4).map((inc) => (
                <div key={inc.id} style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, padding: '0.7rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>{inc.id}</span>
                    <StatusBadge status={inc.status.toLowerCase().replace(/ /g, '-')} small />
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{inc.type}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {inc.customersAffected.toLocaleString()} customers affected · ETA: {inc.estimatedRepairTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'View Transformer', icon: '⚡', path: '/user/transformer', color: '#38bdf8' },
          { label: 'Report a Problem', icon: '🔧', path: '/user/complaints/new', color: '#fbbf24' },
          { label: 'My Complaints', icon: '📋', path: '/user/complaints', color: '#818cf8' },
          { label: 'Outage Status', icon: '📊', path: '/predictions', color: '#4ade80' },
        ].map((nav) => (
          <button
            key={nav.label}
            onClick={() => navigate(nav.path)}
            style={{
              ...glass,
              border: `1px solid rgba(${nav.color === '#38bdf8' ? '56,189,248' : nav.color === '#fbbf24' ? '251,191,36' : nav.color === '#818cf8' ? '129,140,248' : '74,222,128'},0.2)`,
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 24 }}>{nav.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: nav.color }}>{nav.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
