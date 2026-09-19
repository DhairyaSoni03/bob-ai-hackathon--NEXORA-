// nexoraStore.ts — localStorage-backed store for NEXORA demo data
// All data is SYNTHETIC. No real backend required.

import type {
  NexoraComplaint,
  NexoraIncident,
  NexoraCrew,
  NexoraDispatch,
  NexoraNotification,
  NexoraAuditEntry,
} from '../types/extended';

// ─── Storage keys ──────────────────────────────────────────────────────────────
const KEYS = {
  complaints: 'nexora_complaints',
  incidents: 'nexora_incidents',
  crews: 'nexora_crews',
  dispatches: 'nexora_dispatches',
  notifications: 'nexora_notifications',
  auditLog: 'nexora_audit_log',
  counters: 'nexora_counters',
} as const;

// ─── Counter helpers ───────────────────────────────────────────────────────────
function getCounters(): { complaint: number; incident: number; dispatch: number; notification: number; audit: number } {
  try {
    const s = localStorage.getItem(KEYS.counters);
    return s ? JSON.parse(s) : { complaint: 0, incident: 0, dispatch: 0, notification: 0, audit: 0 };
  } catch {
    return { complaint: 0, incident: 0, dispatch: 0, notification: 0, audit: 0 };
  }
}

function saveCounters(c: ReturnType<typeof getCounters>) {
  localStorage.setItem(KEYS.counters, JSON.stringify(c));
}

function nextComplaintId(): string {
  const c = getCounters();
  c.complaint += 1;
  saveCounters(c);
  return `CMP-2026-${String(c.complaint).padStart(5, '0')}`;
}

function nextIncidentId(): string {
  const c = getCounters();
  c.incident += 1;
  saveCounters(c);
  return `INC-2026-${String(c.incident).padStart(4, '0')}`;
}

function nextDispatchId(): string {
  const c = getCounters();
  c.dispatch += 1;
  saveCounters(c);
  return `DSP-2026-${String(c.dispatch).padStart(4, '0')}`;
}

function nextNotificationId(): string {
  const c = getCounters();
  c.notification += 1;
  saveCounters(c);
  return `NTF-${String(c.notification).padStart(5, '0')}`;
}

function nextAuditId(): string {
  const c = getCounters();
  c.audit += 1;
  saveCounters(c);
  return `AUD-${String(c.audit).padStart(5, '0')}`;
}

// ─── Generic load/save ─────────────────────────────────────────────────────────
function load<T>(key: string): T[] {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Seed data ────────────────────────────────────────────────────────────────
function initSeedData() {
  // Only seed if empty
  const crewsSeed: NexoraCrew[] = [
    {
      id: 'crew-001',
      name: 'Crew Alpha',
      personnel: 5,
      specialization: ['Transformer', 'Substation'],
      vehicle: 'Heavy Utility Truck A-1',
      status: 'AVAILABLE',
      currentLocation: 'Houston North Depot',
    },
    {
      id: 'crew-002',
      name: 'Crew Beta',
      personnel: 4,
      specialization: ['Distribution', 'High Voltage'],
      vehicle: 'Bucket Truck B-2',
      status: 'AVAILABLE',
      currentLocation: 'Houston South Depot',
    },
    {
      id: 'crew-003',
      name: 'Crew Gamma',
      personnel: 3,
      specialization: ['Emergency Response', 'Substation'],
      vehicle: 'Rapid Response Van G-1',
      status: 'AVAILABLE',
      currentLocation: 'Central Operations',
    },
  ];

  const now = new Date().toISOString();

  const incidentSeed: NexoraIncident[] = [
    {
      id: 'INC-2026-0001',
      type: 'Transformer Fault',
      region: 'Houston North',
      substation: 'Substation Alpha',
      affectedAssets: ['TX-047'],
      damageSeverity: 'high',
      damageType: 'Electrical Fault',
      description: 'Synthetic demo incident: Transformer TX-047 reporting elevated temperature and load anomaly. Monitoring in progress.',
      customersAffected: 1240,
      estimatedDuration: '4-6 hours',
      personnelRequired: 4,
      deploymentLocation: 'Houston North Grid Sector 3',
      priority: 'high',
      status: 'INVESTIGATING',
      timeline: [
        { timestamp: now, status: 'REPORTED', message: 'Incident auto-detected by NEXORA AI monitoring system.', actor: 'NEXORA AI' },
        { timestamp: now, status: 'INVESTIGATING', message: 'Engineering team dispatched for assessment.', actor: 'Admin System' },
      ],
      createdAt: now,
      updatedAt: now,
      estimatedRepairTime: '6 hours',
    },
  ];

  if (load<NexoraCrew>(KEYS.crews).length === 0) {
    save(KEYS.crews, crewsSeed);
  }
  if (load<NexoraIncident>(KEYS.incidents).length === 0) {
    save(KEYS.incidents, incidentSeed);
    const c = getCounters();
    c.incident = 1;
    saveCounters(c);
  }
}

// Run seed on module load
initSeedData();

// ─── Complaints ────────────────────────────────────────────────────────────────
export function getComplaints(): NexoraComplaint[] {
  return load<NexoraComplaint>(KEYS.complaints);
}

export function getComplaintsByUser(userId: string): NexoraComplaint[] {
  return getComplaints().filter((c) => c.userId === userId);
}

export function getComplaintById(id: string): NexoraComplaint | undefined {
  return getComplaints().find((c) => c.id === id);
}

export function addComplaint(data: Omit<NexoraComplaint, 'id'>): NexoraComplaint {
  const complaint: NexoraComplaint = { id: nextComplaintId(), ...data };
  const all = getComplaints();
  all.unshift(complaint);
  save(KEYS.complaints, all);
  return complaint;
}

export function updateComplaint(id: string, patch: Partial<NexoraComplaint>): void {
  const all = getComplaints().map((c) =>
    c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
  );
  save(KEYS.complaints, all);
}

// ─── Incidents ─────────────────────────────────────────────────────────────────
export function getIncidents(): NexoraIncident[] {
  return load<NexoraIncident>(KEYS.incidents);
}

export function getIncidentById(id: string): NexoraIncident | undefined {
  return getIncidents().find((i) => i.id === id);
}

export function addIncident(data: Omit<NexoraIncident, 'id'>): NexoraIncident {
  const incident: NexoraIncident = { id: nextIncidentId(), ...data };
  const all = getIncidents();
  all.unshift(incident);
  save(KEYS.incidents, all);
  return incident;
}

export function updateIncident(id: string, patch: Partial<NexoraIncident>): void {
  const all = getIncidents().map((i) =>
    i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
  );
  save(KEYS.incidents, all);
}

// ─── Crews ─────────────────────────────────────────────────────────────────────
export function getCrews(): NexoraCrew[] {
  return load<NexoraCrew>(KEYS.crews);
}

export function getCrewById(id: string): NexoraCrew | undefined {
  return getCrews().find((c) => c.id === id);
}

export function updateCrew(id: string, patch: Partial<NexoraCrew>): void {
  const all = getCrews().map((c) => (c.id === id ? { ...c, ...patch } : c));
  save(KEYS.crews, all);
}

// ─── Dispatches ────────────────────────────────────────────────────────────────
export function getDispatches(): NexoraDispatch[] {
  return load<NexoraDispatch>(KEYS.dispatches);
}

export function addDispatch(data: Omit<NexoraDispatch, 'id'>): NexoraDispatch {
  const dispatch: NexoraDispatch = { id: nextDispatchId(), ...data };
  const all = getDispatches();
  all.unshift(dispatch);
  save(KEYS.dispatches, all);
  return dispatch;
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export function getNotifications(): NexoraNotification[] {
  return load<NexoraNotification>(KEYS.notifications);
}

export function getNotificationsByUser(userId: string): NexoraNotification[] {
  return getNotifications().filter((n) => n.userId === userId);
}

export function addNotification(data: Omit<NexoraNotification, 'id'>): NexoraNotification {
  const notif: NexoraNotification = { id: nextNotificationId(), ...data };
  const all = getNotifications();
  all.unshift(notif);
  save(KEYS.notifications, all);
  return notif;
}

export function markNotificationRead(id: string): void {
  const all = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  save(KEYS.notifications, all);
}

export function markAllNotificationsRead(userId: string): void {
  const all = getNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n));
  save(KEYS.notifications, all);
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────
export function getAuditLog(): NexoraAuditEntry[] {
  return load<NexoraAuditEntry>(KEYS.auditLog);
}

export function addAuditEntry(data: Omit<NexoraAuditEntry, 'id'>): NexoraAuditEntry {
  const entry: NexoraAuditEntry = { id: nextAuditId(), ...data };
  const all = getAuditLog();
  all.unshift(entry);
  save(KEYS.auditLog, all);
  return entry;
}

export function clearAuditLog(): void {
  save(KEYS.auditLog, []);
}

// ─── Community signal detection ────────────────────────────────────────────────
export function getCommunitySignals(): { transformerId: string; count: number; region: string }[] {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const recent = getComplaints().filter((c) => c.createdAt >= twoHoursAgo && c.linkedTransformerId);
  const byTransformer: Record<string, { count: number; region: string }> = {};
  for (const c of recent) {
    const tid = c.linkedTransformerId!;
    if (!byTransformer[tid]) byTransformer[tid] = { count: 0, region: c.userRegion };
    byTransformer[tid].count += 1;
  }
  return Object.entries(byTransformer)
    .filter(([, v]) => v.count >= 3)
    .map(([transformerId, v]) => ({ transformerId, count: v.count, region: v.region }));
}
