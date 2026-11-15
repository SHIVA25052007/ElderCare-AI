export type UserRole = 'elderly' | 'family' | 'caregiver';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar: string;
  relationshipToSenior?: string;
  title?: string;
}

export interface SeniorProfile {
  id: string;
  fullName: string;
  preferredName: string;
  age: number;
  dob: string;
  gender: string;
  address: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  primaryDoctor: {
    name: string;
    specialty: string;
    clinic: string;
    phone: string;
  };
  preferredHospital: string;
  dnrStatus: boolean;
  notes: string;
}

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'As Needed';
export type DoseStatus = 'taken' | 'missed' | 'skipped' | 'pending';

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  timeOfDay: TimeOfDay[];
  scheduleTimes: string[]; // e.g., ["08:00", "20:00"]
  instructions: string;
  prescribingDoctor: string;
  pillColor: string;
  pillShape: string;
  remainingQuantity: number;
  totalQuantity: number;
  refillThreshold: number;
  refillRequested?: boolean;
  status: 'active' | 'paused' | 'discontinued';
  sideEffects?: string;
  foodRequirement?: 'Take with food' | 'Take before meal' | 'Take on empty stomach' | 'No food restrictions';
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  timeOfDay: TimeOfDay;
  status: DoseStatus;
  recordedAt?: string; // ISO string
  recordedBy: string; // User name or 'System'
  notes?: string;
}

export type AppointmentType = 'in-person' | 'telehealth';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: AppointmentType;
  locationOrUrl: string;
  preparationNotes: string;
  status: AppointmentStatus;
  companionName?: string;
  phone?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  email?: string;
  isPrimary: boolean;
  notifyPriority: number;
}

export interface VitalSign {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heartRate: number; // bpm
  bloodGlucose?: number; // mg/dL
  glucoseContext?: 'Fasting' | 'Post-Meal' | 'Bedtime' | 'Random';
  oxygenSaturation: number; // %
  temperature?: number; // °F
  weight?: number; // lbs
  recordedBy: string;
  notes?: string;
}

export interface CareNote {
  id: string;
  authorName: string;
  authorRole: string;
  date: string;
  time: string;
  title: string;
  content: string;
  category: 'general' | 'mood' | 'nutrition' | 'activity' | 'clinical';
  priority?: 'normal' | 'important';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'dose_reminder' | 'missed_dose' | 'appointment' | 'refill_alert' | 'sos_alert' | 'system';
  timestamp: string; // ISO
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
}

export interface SOSIncident {
  id: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'cancelled';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  notifiedContacts: {
    name: string;
    phone: string;
    status: 'sent' | 'delivered' | 'calling' | 'simulated';
  }[];
  resolutionNotes?: string;
  resolvedAt?: string;
}
