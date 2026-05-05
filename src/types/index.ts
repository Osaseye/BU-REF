// ─── UMIS API ──────────────────────────────────────────────────────────────
export interface UmisStudentData {
  fullName: string;
  department: string;
  faculty: string;
  cgpa: number;
  level: string;
  graduationYear?: string | null;
}

// ─── Firestore Document Shapes ─────────────────────────────────────────────
export interface StudentProfile {
  matricNo: string;
  fullName: string;
  department: string;
  faculty: string;
  cgpa: number;
  level: string;
  graduationYear?: string | null;
  lastUmisSyncAt?: unknown; // Firestore Timestamp or null
  // Student-editable fields
  contactEmail?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  projectTitle?: string;
  supervisorName?: string;
  linkedInURL?: string;
  avatarUrl?: string;
  photoURL?: string;
  profileComplete?: boolean;
  status?: string;
  updatedAt?: unknown;
  referenceData?: {
    academicSummary?: string;
    characterAssessment?: string;
    achievements?: string[];
    recommendationStatus?: string;
  };
}

export interface LecturerProfile {
  uid: string;
  fullName: string;
  email: string;
  department?: string;
  status: 'active' | 'revoked';
  invitedBy?: string;
  invitedAt?: { toDate: () => Date } | null;
  lastLoginAt?: unknown;
}

export interface AdminProfile {
  uid: string;
  email: string;
  name?: string;
}

// ─── Sync Metadata ─────────────────────────────────────────────────────────
export interface SyncMeta {
  lastSyncAt: unknown; // Firestore Timestamp
  studentCount: number;
  status: 'success' | 'partial' | 'failed';
  syncedBy?: string;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'lecturer' | 'admin';

export type AuthUser =
  | { uid: string; role: 'student';  profile: StudentProfile }
  | { uid: string; role: 'lecturer'; profile: LecturerProfile }
  | { uid: string; role: 'admin';    profile: AdminProfile };
