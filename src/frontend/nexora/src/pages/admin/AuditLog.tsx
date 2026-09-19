import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { getAuditLog, clearAuditLog } from '../../store/nexoraStore';
import type { NexoraAuditEntry } from '../../types/extended';

const ACTION_COLORS: Record<string, string> = {
  UPDATE_COMPLAINT:    '#38bdf8',
  SIMULATE_INCIDENT:  '#f87171',
  UPDATE_INCIDENT_STATUS: '#fbbf24',
  DISPATCH_CREW:      '#818cf8',
  RETURN_CREW:        '#4ade80',
};

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '1.4rem 1.6rem',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return iso; }
}

export default function AuditLog() {
  const [entries, setEntries] = useState<NexoraAuditEntry[]>([]);
  const [filterAction, setFilterAction] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  function refresh() { setEntries(getAuditLog()); }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  const actions = [...new Set(entries.map((e) => e.action))];

  const filtered = filterAction ? entries.filter((e) => e.action === filterAction) : entries;

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAuditLog();
    setConfirmClear(false);
    refresh();
  }

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
        title="Audit Log"
        subtitle={`${entries.length} entries — admin actions history`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small variant="danger" onClick={handleClear}>
              {confirmClear ? '⚠️ Click to Confirm Clear' : 'Clear Log'}
            </Btn>
            {confirmClear && <Btn small variant="ghost" onClick={() => setConfirmClear(false)}>Cancel</Btn>}
          </div>
        }
      />

      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={selectStyle}>
          <option value="">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        {filterAction && <Btn small variant="ghost" onClick={() => setFilterAction('')}>Clear Filter</Btn>}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...glass, textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
          No audit entries yet. Admin actions will be logged here.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
                {['Timestamp', 'Admin', 'Action', 'Entity', 'Entity ID', 'Description'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, idx) => {
                const actionColor = ACTION_COLORS[entry.action] ?? '#94a3b8';
                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid rgba(56,189,248,0.06)', background: idx % 2 === 0 ? 'rgba(8,20,40,0.3)' : 'transparent' }}>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#64748b', whiteSpace: 'nowrap', fontSize: 12 }}>{formatTime(entry.timestamp)}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{entry.adminName}</td>
                    <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>
                      <span style={{ color: actionColor, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#94a3b8' }}>{entry.entity}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#818cf8', fontFamily: 'monospace', fontSize: 12 }}>{entry.entityId}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#94a3b8', maxWidth: 300 }}>{entry.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
