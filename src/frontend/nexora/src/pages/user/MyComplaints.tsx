import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { getComplaintsByUser } from '../../store/nexoraStore';
import type { NexoraComplaint } from '../../types/extended';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'OPEN':              { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  'UNDER REVIEW':      { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'ASSIGNED':          { bg: 'rgba(129,140,248,0.1)', color: '#818cf8' },
  'INVESTIGATING':     { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'REPAIR IN PROGRESS':{ bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  'RESOLVED':          { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80' },
};

const URGENCY_COLORS: Record<string, string> = {
  low: '#4ade80', medium: '#94a3b8', high: '#fbbf24', critical: '#f87171',
};

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '1.2rem 1.4rem',
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: 'rgba(51,65,85,0.3)', color: '#94a3b8' };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 6,
      padding: '0.25rem 0.7rem',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MyComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<NexoraComplaint[]>([]);

  useEffect(() => {
    function refresh() {
      if (!user) return;
      setComplaints(getComplaintsByUser(user.id));
    }
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <PageHeader
        title="My Complaints"
        subtitle={`${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} submitted`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small onClick={() => navigate('/user/complaints/new')}>+ New Complaint</Btn>
            <Btn small variant="secondary" onClick={() => navigate('/user')}>← Dashboard</Btn>
          </div>
        }
      />

      {complaints.length === 0 ? (
        <div style={{ ...glass, textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 40, marginBottom: '1rem' }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>No complaints yet</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: '1.5rem' }}>
            If you're experiencing a power issue in your area, let us know.
          </div>
          <Btn onClick={() => navigate('/user/complaints/new')}>Report a Problem</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/user/complaints/${c.id}`)}
              style={{
                ...glass,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.2rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(56,189,248,0.35)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(56,189,248,0.12)')}
            >
              {/* Urgency indicator */}
              <div style={{
                width: 4,
                alignSelf: 'stretch',
                borderRadius: 4,
                background: URGENCY_COLORS[c.urgency] ?? '#94a3b8',
                flexShrink: 0,
              }} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{c.id}</span>
                  <StatusPill status={c.status} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{c.problemType}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  📍 {c.location}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: 11, color: '#475569' }}>
                  <span>Urgency: <span style={{ color: URGENCY_COLORS[c.urgency] }}>{c.urgency.toUpperCase()}</span></span>
                  <span>Submitted: {timeAgo(c.createdAt)}</span>
                  {c.assignedTeam && <span>Team: {c.assignedTeam}</span>}
                </div>
              </div>

              <div style={{ color: '#475569', fontSize: 18, alignSelf: 'center' }}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
