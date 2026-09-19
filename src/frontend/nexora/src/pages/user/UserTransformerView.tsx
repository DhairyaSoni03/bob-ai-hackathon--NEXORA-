import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { HealthBar, StatusBadge } from '../../components/shared';
import { getIncidents } from '../../store/nexoraStore';

const TRANSFORMER_MAP: Record<string, {
  id: string; name: string; location: string; health: number; load: number; temp: number;
  condition: string; lastUpdated: string; voltage: string; capacity: string;
}> = {
  'Houston North': {
    id: 'TX-047', name: 'Houston North Primary Transformer', location: 'Substation Alpha, Houston North',
    health: 62, load: 87, temp: 78, condition: 'warning', lastUpdated: '2 min ago',
    voltage: '138 kV', capacity: '450 MVA',
  },
  'Houston South': {
    id: 'TX-031', name: 'Houston South Primary Transformer', location: 'Substation Delta, Houston South',
    health: 71, load: 74, temp: 71, condition: 'warning', lastUpdated: '5 min ago',
    voltage: '115 kV', capacity: '380 MVA',
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

const conditionExplanation: Record<string, { title: string; text: string; color: string }> = {
  critical: {
    title: 'Critical Condition',
    text: 'This transformer is in a CRITICAL state. Emergency maintenance teams have been notified. Service interruptions are possible. Our crews are working to restore full capacity as quickly as possible.',
    color: '#f87171',
  },
  warning: {
    title: 'Elevated Monitoring',
    text: 'This transformer is showing elevated load and temperature readings. Our engineering team is actively monitoring this unit. Minor performance degradation may be observed. No immediate outages are expected, but maintenance is being planned.',
    color: '#fbbf24',
  },
  normal: {
    title: 'Normal Operation',
    text: 'This transformer is operating within all normal parameters. No issues detected. Regular scheduled maintenance is keeping this unit in optimal condition.',
    color: '#4ade80',
  },
};

export default function UserTransformerView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const transformer = user.region ? TRANSFORMER_MAP[user.region] : null;

  if (!transformer) {
    return (
      <div style={{ padding: '2rem', color: '#64748b' }}>
        No transformer found for your region. <Btn small onClick={() => navigate('/user')}>Back to Dashboard</Btn>
      </div>
    );
  }

  const explanation = conditionExplanation[transformer.condition] ?? conditionExplanation.normal;
  const areaIncidents = getIncidents().filter((i) => i.region === user.region && i.status !== 'RESOLVED');

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader
        title={`${transformer.id} — Transformer Status`}
        subtitle={`${transformer.location} · Public-facing status view`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small onClick={() => navigate('/user/complaints/new')}>Report a Problem</Btn>
            <Btn small variant="secondary" onClick={() => navigate('/user')}>← Back to Dashboard</Btn>
          </div>
        }
      />

      {/* Status Card */}
      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>{transformer.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{transformer.location}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Last updated: {transformer.lastUpdated}</div>
          </div>
          <StatusBadge status={transformer.condition} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.2rem' }}>
          {[
            { label: 'Voltage', value: transformer.voltage, color: '#38bdf8' },
            { label: 'Capacity', value: transformer.capacity, color: '#818cf8' },
            { label: 'Load', value: `${transformer.load}%`, color: transformer.load > 85 ? '#fbbf24' : '#4ade80' },
            { label: 'Temperature', value: `${transformer.temp}°C`, color: transformer.temp > 75 ? '#fbbf24' : '#4ade80' },
          ].map((m) => (
            <div key={m.label} style={{ background: 'rgba(3,11,24,0.5)', borderRadius: 10, padding: '0.9rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Health Score</div>
          <HealthBar score={transformer.health} size="lg" />
        </div>

        {/* Status explanation */}
        <div style={{
          background: `rgba(${explanation.color === '#f87171' ? '248,113,113' : explanation.color === '#fbbf24' ? '251,191,36' : '74,222,128'},0.07)`,
          border: `1px solid rgba(${explanation.color === '#f87171' ? '248,113,113' : explanation.color === '#fbbf24' ? '251,191,36' : '74,222,128'},0.2)`,
          borderRadius: 10,
          padding: '1rem 1.2rem',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: explanation.color, marginBottom: 6 }}>{explanation.title}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{explanation.text}</div>
        </div>
      </div>

      {/* Recent incidents */}
      <div style={glass}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          Recent Incidents in Your Area
        </div>
        {areaIncidents.length === 0 ? (
          <div style={{ color: '#4ade80', fontSize: 13, textAlign: 'center', padding: '1.5rem' }}>
            ✓ No active incidents — your area is operating normally
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {areaIncidents.map((inc) => (
              <div key={inc.id} style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 8, padding: '0.8rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{inc.type}</span>
                  <StatusBadge status={inc.status.toLowerCase().replace(/ /g, '-')} small />
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Affecting approximately {inc.customersAffected.toLocaleString()} customers · Est. repair: {inc.estimatedRepairTime}
                </div>
                {inc.assignedCrew && (
                  <div style={{ fontSize: 11, color: '#4ade80', marginTop: 3 }}>Repair crew assigned · {inc.assignedCrew}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
