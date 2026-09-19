// Extended types for NEXORA user portal and admin features
// All data is synthetic demo data stored in localStorage

export interface NexoraComplaintTimelineEvent {
  timestamp: string;
  status: string;
  message: string;
  actor?: string;
}

export interface NexoraComplaint {
  id: string;
  userId: string;
  userName: string;
  userRegion: string;
  location: string;
  problemType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'OPEN' | 'UNDER REVIEW' | 'ASSIGNED' | 'INVESTIGATING' | 'REPAIR IN PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  assignedTeam?: string;
  linkedTransformerId?: string;
  adminNotes?: string;
  timeline: NexoraComplaintTimelineEvent[];
  photoUrl?: string;
}

export interface NexoraIncidentTimelineEvent {
  timestamp: string;
  status: string;
  message: string;
  actor?: string;
}

export interface NexoraIncident {
  id: string;
  type: string;
  region: string;
  substation: string;
  affectedAssets: string[];
  damageSeverity: 'low' | 'medium' | 'high' | 'critical';
  damageType: string;
  description: string;
  customersAffected: number;
  estimatedDuration: string;
  personnelRequired: number;
  deploymentLocation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'REPORTED' | 'INVESTIGATING' | 'CREW DISPATCHED' | 'EN ROUTE' | 'ON SITE' | 'REPAIRING' | 'RESOLVED';
  assignedCrew?: string;
  timeline: NexoraIncidentTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  estimatedRepairTime: string;
}

export interface NexoraCrew {
  id: string;
  name: string;
  personnel: number;
  specialization: string[];
  vehicle: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN ROUTE' | 'ON SITE' | 'REPAIRING';
  currentLocation: string;
  assignedIncidentId?: string;
  eta?: string;
}

export interface NexoraDispatch {
  id: string;
  crewId: string;
  incidentId: string;
  destination: string;
  task: string;
  eta: string;
  dispatchedAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface NexoraNotification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  read: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

export interface NexoraAuditEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  timestamp: string;
}

export interface NexoraUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  region?: string;
  avatar?: string;
}
