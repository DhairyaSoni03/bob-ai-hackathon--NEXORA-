import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';
import {
  getComplaints, updateComplaint, addAuditEntry, addNotification, getCommunitySignals,
} from '../../store/nexoraStore';
import type { NexoraComplaint } from '../../types/extended';

const STATUSES = ['OPEN', 'UNDER REVIEW', 'ASSIGNED', 'INVESTIGATING', 'REPAIR IN PROGRESS', 'RESOLVED'] as const;

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'OPEN':               { bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8' },
  'UNDER REVIEW':       { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  'ASSIGNED':           { bg: 'rgba(129,140,248,0.12)', color: '#818cf8' },
  'INVESTIGATING':      { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  'REPAIR IN PROGRESS': { bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8' },
  'RESOLVED':           { bg: 'rgba(74,222,128,0.12)',  color: '#4ade80' },
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
  padding: '1.4rem 1.6rem',
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

interface ModalProps {
  complaint: NexoraComplaint;
  onClose: () => void;
  onUpdate: () => void;
  adminId: string;
  adminName: string;
}

function ComplaintModal({ complaint, onClose, onUpdate, adminId, adminName }: ModalProps) {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>(complaint.status as (typeof STATUSES)[number]);
  const [team, setTeam] = useState(complaint.assignedTeam ?? '');
  const [note, setNote] = useState(complaint.adminNotes ?? '');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    const now = new Date().toISOString();
    const changed = status !== complaint.status;
    const newTimeline = [...complaint.timeline];
    if (changed) {
      newTimeline.push({ timestamp: now, status, message: `Status updated to ${status} by admin.`, actor: adminName });
    }
    updateComplaint(complaint.id, {
      status,
      assignedTeam: team || undefined,
      adminNotes: note || undefined,
      timeline: newTimeline,
    });

    addAuditEntry({
      adminId, adminName,
      action: 'UPDATE_COMPLAINT',
      entity: 'Complaint',
      entityId: complaint.id,
      description: `Status → ${status}${team ? `, team → ${team}` : ''}`,
      timestamp: now,
    });

    if (changed) {
      addNotification({
        userId: complaint.userId,
        message: `Your complaint ${complaint.id} status has been updated to: ${status}.${note ? ` Admin note: ${note}` : ''}`,
        type: status === 'RESOLVED' ? 'success' : 'info',
        read: false,
        createdAt: now,
        relatedEntityId: complaint.id,
      });
    }

    setTimeout(() => { setSaving(false); onUpdate(); onClose(); }, 400);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(3,11,24,0.7)',
    border: '1px solid rgba(56,189,248,0.15)',
    borderRadius: 8,
    color: '#e2e8f0',
    padding: '0.6rem 0.9rem',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{ ...glass, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{complaint.id}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{complaint.problemType} · {complaint.userRegion}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.2rem', padding: '0.8rem', background: 'rgba(3,11,24,0.4)', borderRadius: 8 }}>
          {complaint.description}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Update Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assign Team</label>
            <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Crew Alpha, Engineering Team B" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin Notes (visible to user)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add a note for the user…" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(56,189,248,0.08)' }}>
            <Btn variant="secondary" small onClick={onClose}>Cancel</Btn>
            <Btn small onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComplaintManagement() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<NexoraComplaint[]>([]);
  const [signals, setSignals] = useState<{ transformerId: string; count: number; region: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [selected, setSelected] = useState<NexoraComplaint | null>(null);

  function refresh() {
    setComplaints(getComplaints());
    setSignals(getCommunitySignals());
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;

  let filtered = complaints;
  if (filterStatus) filtered = filtered.filter((c) => c.status === filterStatus);
  if (filterRegion) filtered = filtered.filter((c) => c.userRegion === filterRegion);
  if (filterUrgency) filtered = filtered.filter((c) => c.urgency === filterUrgency);

  const regions = [...new Set(complaints.map((c) => c.userRegion))];

  const selectStyle: React.CSSProperties = {
    background: 'rgba(3,11,24,0.7)',
    border: '1px solid rgba(56,189,248,0.15)',
    borderRadius: 8,
    color: '#e2e8f0',
    padding: '0.45rem 0.8rem',
    fontSize: 12,
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <PageHeader
        title="Complaint Management"
        subtitle={`${complaints.length} total · ${complaints.filter((c) => c.status !== 'RESOLVED').length} open`}
      />

      {/* Community signals */}
      {signals.map((sig) => (
        <div key={sig.transformerId} style={{
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.35)',
          borderRadius: 10,
          padding: '0.8rem 1.2rem',
          marginBottom: '1rem',
          fontSize: 13,
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
        }}>
          🚨 <strong>COMMUNITY SIGNAL:</strong> {sig.count} complaints near {sig.transformerId} in last 2 hours — {sig.region}
        </div>
      ))}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} style={selectStyle}>
          <option value="">All Regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} style={selectStyle}>
          <option value="">All Urgency</option>
          {(['low', 'medium', 'high', 'critical'] as const).map((u) => <option key={u} value={u}>{u.toUpperCase()}</option>)}
        </select>
        {(filterStatus || filterRegion || filterUrgency) && (
          <Btn small variant="ghost" onClick={() => { setFilterStatus(''); setFilterRegion(''); setFilterUrgency(''); }}>Clear Filters</Btn>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ ...glass, textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>No complaints match the current filters.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
                {['ID', 'User', 'Region', 'Problem Type', 'Transformer', 'Urgency', 'Status', 'Submitted', 'Team', 'Action'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const sc = STATUS_COLORS[c.status] ?? STATUS_COLORS['OPEN'];
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(56,189,248,0.06)', background: idx % 2 === 0 ? 'rgba(8,20,40,0.3)' : 'transparent' }}>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#38bdf8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.id}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{c.userName}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{c.userRegion}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{c.problemType}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#818cf8', fontFamily: 'monospace' }}>{c.linkedTransformerId ?? '—'}</td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <span style={{ color: URGENCY_COLORS[c.urgency], fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{c.urgency}</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 5, padding: '0.2rem 0.6rem', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{timeAgo(c.createdAt)}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{c.assignedTeam ?? '—'}</td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <Btn small onClick={() => setSelected(c)}>Manage</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ComplaintModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onUpdate={refresh}
          adminId={user.id}
          adminName={user.name}
        />
      )}
    </div>
  );
}
