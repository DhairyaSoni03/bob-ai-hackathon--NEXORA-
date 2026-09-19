import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { addComplaint, addNotification } from '../../store/nexoraStore';

const PROBLEM_TYPES = [
  'Power Outage',
  'Flickering Lights',
  'No Power to Partial Area',
  'Sparking / Arcing',
  'Burning Smell',
  'Transformer Noise',
  'Fallen Power Line',
  'Other',
] as const;

const TRANSFORMER_MAP: Record<string, string> = {
  'Houston North': 'TX-047',
  'Houston South': 'TX-031',
};

const ADMIN_USER_IDS = ['usr-admin-001'];

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '1.6rem 1.8rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(3,11,24,0.7)',
  border: '1px solid rgba(56,189,248,0.15)',
  borderRadius: 9,
  color: '#e2e8f0',
  padding: '0.65rem 1rem',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#94a3b8',
  marginBottom: 6,
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

export default function ComplaintForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [photoB64, setPhotoB64] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoB64(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !location.trim() || !problemType || !description.trim()) return;
    const currentUser = user;
    setSubmitting(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const complaint = addComplaint({
        userId: currentUser.id,
        userName: currentUser.name,
        userRegion: currentUser.region ?? 'Unknown',
        location: location.trim(),
        problemType,
        description: description.trim(),
        urgency,
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
        linkedTransformerId: currentUser.region ? TRANSFORMER_MAP[currentUser.region] : undefined,
        timeline: [
          {
            timestamp: now,
            status: 'OPEN',
            message: `Complaint submitted by ${currentUser.name}. Problem type: ${problemType}.`,
            actor: currentUser.name,
          },
        ],
        photoUrl: photoB64,
      });

      // Notify all admins
      for (const adminId of ADMIN_USER_IDS) {
        addNotification({
          userId: adminId,
          message: `New complaint ${complaint.id} from ${currentUser.name}: ${problemType} at ${location.trim()}.`,
          type: urgency === 'critical' || urgency === 'high' ? 'warning' : 'info',
          read: false,
          createdAt: now,
          relatedEntityId: complaint.id,
        });
      }

      setSubmitting(false);
      setSubmitted({ id: complaint.id });
    }, 800);
  }

  if (submitted) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ ...glass, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80', marginBottom: '0.5rem' }}>
            Complaint Submitted!
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your complaint has been received. Our team will review it shortly.
          </div>
          <div style={{
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 10,
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaint ID</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{submitted.id}</div>
            <div style={{ fontSize: 11, color: '#4ade80', marginTop: 6 }}>STATUS: OPEN</div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Btn onClick={() => navigate('/user/complaints')}>View My Complaints</Btn>
            <Btn variant="secondary" onClick={() => navigate('/user')}>Back to Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 760, margin: '0 auto' }}>
      <PageHeader
        title="Report a Problem"
        subtitle="Submit a service issue or infrastructure concern in your area"
        actions={<Btn small variant="secondary" onClick={() => navigate('/user')}>← Cancel</Btn>}
      />

      <form onSubmit={handleSubmit}>
        <div style={{ ...glass, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Location */}
          <div>
            <label style={labelStyle}>Location / Address *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 123 Main St, Houston North, or intersection of Oak Ave & 5th"
              required
              style={inputStyle}
            />
          </div>

          {/* Problem Type */}
          <div>
            <label style={labelStyle}>Problem Type *</label>
            <select
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              required
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select problem type…</option>
              {PROBLEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're experiencing — include any details about affected equipment, when it started, and how widespread the issue appears to be."
              required
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
            />
          </div>

          {/* Urgency */}
          <div>
            <label style={labelStyle}>Urgency Level *</label>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => {
                const colors: Record<string, { bg: string; border: string; color: string }> = {
                  low: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.3)', color: '#4ade80' },
                  medium: { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.3)', color: '#94a3b8' },
                  high: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
                  critical: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
                };
                const c = colors[level];
                const selected = urgency === level;
                return (
                  <label
                    key={level}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 8,
                      border: `1px solid ${selected ? c.border : 'rgba(51,65,85,0.4)'}`,
                      background: selected ? c.bg : 'rgba(3,11,24,0.4)',
                      color: selected ? c.color : '#64748b',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: selected ? 600 : 400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={selected}
                      onChange={() => setUrgency(level)}
                      style={{ display: 'none' }}
                    />
                    {level}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label style={labelStyle}>
              Photo (optional) —{' '}
              <span style={{ color: '#475569', textTransform: 'none', letterSpacing: 0 }}>
                Stored locally in your browser for this demo session
              </span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(56,189,248,0.2)',
                borderRadius: 9,
                padding: '1.2rem',
                textAlign: 'center',
                color: '#475569',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {photoB64 ? (
                <div>
                  <img src={photoB64} alt="preview" style={{ maxHeight: 120, borderRadius: 6 }} />
                  <div style={{ marginTop: 6, color: '#4ade80', fontSize: 12 }}>Photo attached ✓</div>
                </div>
              ) : (
                <>Click to attach a photo</>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: '0.5rem', borderTop: '1px solid rgba(56,189,248,0.08)' }}>
            <Btn variant="secondary" onClick={() => navigate('/user')}>Cancel</Btn>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? 'rgba(14,165,233,0.3)' : 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: 9,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                padding: '0.65rem 1.8rem',
                cursor: submitting ? 'default' : 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Complaint'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
