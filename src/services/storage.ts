import {
  Medication,
  MedicationLog,
  Appointment,
  VitalSign,
  CareNote,
  EmergencyContact,
  SeniorProfile,
  NotificationItem,
  SOSIncident,
  UserProfile,
  DoseStatus
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'eldercare_current_user',
  SENIOR_PROFILE: 'eldercare_senior_profile',
  MEDICATIONS: 'eldercare_medications',
  MEDICATION_LOGS: 'eldercare_medication_logs',
  APPOINTMENTS: 'eldercare_appointments',
  VITALS: 'eldercare_vitals',
  CARE_NOTES: 'eldercare_care_notes',
  EMERGENCY_CONTACTS: 'eldercare_emergency_contacts',
  NOTIFICATIONS: 'eldercare_notifications',
  SOS_INCIDENTS: 'eldercare_sos_incidents',
  ACCESSIBILITY: 'eldercare_accessibility_settings'
};

// Custom event to reactively update components when data changes
export const DATA_CHANGED_EVENT = 'eldercare_data_changed';

export function notifyStorageChange(detail?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail }));
  }
}

// Pre-seeded Demo Users
export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_elderly',
    name: 'Margaret Vance',
    role: 'elderly',
    email: 'margaret.vance@example.com',
    phone: '(555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    title: 'Senior Resident'
  },
  {
    id: 'user_family',
    name: 'Sarah Vance',
    role: 'family',
    email: 'sarah.vance@example.com',
    phone: '(555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    relationshipToSenior: 'Daughter & Primary Healthcare Proxy',
    title: 'Family Care Proxy'
  },
  {
    id: 'user_caregiver',
    name: 'David Miller, RN',
    role: 'caregiver',
    email: 'david.miller@valleyhealth.org',
    phone: '(555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    title: 'Certified Geriatric Care Nurse'
  }
];

export const INITIAL_SENIOR_PROFILE: SeniorProfile = {
  id: 'senior_1',
  fullName: 'Margaret Eleanor Vance',
  preferredName: 'Margaret',
  age: 74,
  dob: '1952-04-18',
  gender: 'Female',
  address: '742 Evergreen Terrace, Springfield, IL 62704',
  bloodType: 'O-Positive',
  allergies: ['Penicillin (Hives/Swelling)', 'Sulfa Drugs', 'Latex'],
  chronicConditions: ['Type 2 Diabetes Mellitus', 'Mild Hypertension', 'Osteoarthritis (Knee)'],
  primaryDoctor: {
    name: 'Dr. Robert Hayes, MD',
    specialty: 'Geriatric Internal Medicine',
    clinic: 'St. Jude Health & Wellness Pavilion',
    phone: '(555) 901-2345'
  },
  preferredHospital: 'Springfield Memorial Hospital (Level 1 Trauma)',
  dnrStatus: false,
  notes: 'Wears bifocal glasses. Prefers morning appointments. Alert and oriented.'
};

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec_1',
    name: 'Sarah Vance',
    relationship: 'Daughter (Living 10 min away)',
    phone: '(555) 234-5678',
    altPhone: '(555) 234-5679',
    email: 'sarah.vance@example.com',
    isPrimary: true,
    notifyPriority: 1
  },
  {
    id: 'ec_2',
    name: 'David Miller, RN',
    relationship: 'Visiting Care Nurse (Mon-Fri)',
    phone: '(555) 876-5432',
    email: 'david.miller@valleyhealth.org',
    isPrimary: false,
    notifyPriority: 2
  },
  {
    id: 'ec_3',
    name: 'James Vance',
    relationship: 'Son (Out of State)',
    phone: '(555) 345-6789',
    email: 'james.vance@example.com',
    isPrimary: false,
    notifyPriority: 3
  },
  {
    id: 'ec_4',
    name: 'Dr. Robert Hayes, MD',
    relationship: 'Primary Care Physician',
    phone: '(555) 901-2345',
    isPrimary: false,
    notifyPriority: 4
  }
];

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med_1',
    name: 'Metformin HCl',
    genericName: 'Glucophage',
    dosage: '500 mg',
    frequency: 'Twice daily with meals',
    timeOfDay: ['Morning', 'Evening'],
    scheduleTimes: ['08:00', '19:00'],
    instructions: 'Take with morning and evening meal with a full glass of water. Do not crush.',
    prescribingDoctor: 'Dr. Elena Patel (Endocrinology)',
    pillColor: 'White',
    pillShape: 'Round tablet',
    remainingQuantity: 24,
    totalQuantity: 60,
    refillThreshold: 14,
    refillRequested: false,
    status: 'active',
    foodRequirement: 'Take with food',
    sideEffects: 'May cause mild stomach upset if taken without food.'
  },
  {
    id: 'med_2',
    name: 'Lisinopril',
    genericName: 'Prinivil / Zestril',
    dosage: '10 mg',
    frequency: 'Once daily in morning',
    timeOfDay: ['Morning'],
    scheduleTimes: ['08:00'],
    instructions: 'Take 1 tablet every morning to manage blood pressure. Avoid salt substitutes.',
    prescribingDoctor: 'Dr. Robert Hayes (Primary Care)',
    pillColor: 'Peach',
    pillShape: 'Round scored tablet',
    remainingQuantity: 8, // Low quantity to test refill warning!
    totalQuantity: 30,
    refillThreshold: 10,
    refillRequested: false,
    status: 'active',
    foodRequirement: 'No food restrictions',
    sideEffects: 'Watch for dizziness when standing up quickly.'
  },
  {
    id: 'med_3',
    name: 'Atorvastatin Calcium',
    genericName: 'Lipitor',
    dosage: '20 mg',
    frequency: 'Once daily at bedtime',
    timeOfDay: ['Night'],
    scheduleTimes: ['21:00'],
    instructions: 'Take 1 tablet before sleeping. Avoid grapefruit juice while on this medication.',
    prescribingDoctor: 'Dr. Robert Hayes (Primary Care)',
    pillColor: 'White',
    pillShape: 'Oval tablet',
    remainingQuantity: 42,
    totalQuantity: 60,
    refillThreshold: 14,
    refillRequested: false,
    status: 'active',
    foodRequirement: 'No food restrictions'
  },
  {
    id: 'med_4',
    name: 'Vitamin D3 (Cholecalciferol)',
    genericName: 'Cholecalciferol',
    dosage: '2,000 IU',
    frequency: 'Once daily with lunch',
    timeOfDay: ['Afternoon'],
    scheduleTimes: ['12:30'],
    instructions: 'Dietary supplement for bone density and immune support. Best absorbed with fatty food.',
    prescribingDoctor: 'Dr. Robert Hayes (Primary Care)',
    pillColor: 'Translucent Yellow',
    pillShape: 'Softgel capsule',
    remainingQuantity: 45,
    totalQuantity: 90,
    refillThreshold: 15,
    refillRequested: false,
    status: 'active',
    foodRequirement: 'Take with food'
  },
  {
    id: 'med_5',
    name: 'Acetaminophen (Tylenol)',
    genericName: 'Acetaminophen Extra Strength',
    dosage: '500 mg',
    frequency: 'As needed for joint stiffness',
    timeOfDay: ['As Needed'],
    scheduleTimes: ['14:00'],
    instructions: 'Take 1-2 tablets as needed for knee discomfort. Do not exceed 2,000 mg within 24 hours.',
    prescribingDoctor: 'Dr. Michael Chang (Rheumatology)',
    pillColor: 'Red & White',
    pillShape: 'Capsule',
    remainingQuantity: 38,
    totalQuantity: 50,
    refillThreshold: 10,
    refillRequested: false,
    status: 'active',
    foodRequirement: 'No food restrictions'
  }
];

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialMedicationLogs(): MedicationLog[] {
  const today = getTodayString();
  return [
    {
      id: 'log_today_1',
      medicationId: 'med_1',
      medicationName: 'Metformin HCl 500mg',
      dosage: '500 mg',
      scheduledDate: today,
      scheduledTime: '08:00',
      timeOfDay: 'Morning',
      status: 'taken',
      recordedAt: `${today}T08:12:00Z`,
      recordedBy: 'Margaret Vance (Self)',
      notes: 'Taken with oatmeal and hot tea.'
    },
    {
      id: 'log_today_2',
      medicationId: 'med_2',
      medicationName: 'Lisinopril 10mg',
      dosage: '10 mg',
      scheduledDate: today,
      scheduledTime: '08:00',
      timeOfDay: 'Morning',
      status: 'taken',
      recordedAt: `${today}T08:13:00Z`,
      recordedBy: 'Margaret Vance (Self)',
      notes: 'BP before pill: 122/80.'
    },
    {
      id: 'log_today_3',
      medicationId: 'med_4',
      medicationName: 'Vitamin D3 2,000 IU',
      dosage: '2,000 IU',
      scheduledDate: today,
      scheduledTime: '12:30',
      timeOfDay: 'Afternoon',
      status: 'pending',
      recordedBy: 'System'
    },
    {
      id: 'log_today_4',
      medicationId: 'med_1',
      medicationName: 'Metformin HCl 500mg',
      dosage: '500 mg',
      scheduledDate: today,
      scheduledTime: '19:00',
      timeOfDay: 'Evening',
      status: 'pending',
      recordedBy: 'System'
    },
    {
      id: 'log_today_5',
      medicationId: 'med_3',
      medicationName: 'Atorvastatin Calcium 20mg',
      dosage: '20 mg',
      scheduledDate: today,
      scheduledTime: '21:00',
      timeOfDay: 'Night',
      status: 'pending',
      recordedBy: 'System'
    }
  ];
}

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    doctorName: 'Dr. Robert Hayes, MD',
    specialty: 'Geriatric Internal Medicine',
    clinicName: 'St. Jude Health & Wellness Pavilion - Suite 304',
    date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    time: '10:30',
    type: 'in-person',
    locationOrUrl: '450 Medical Arts Blvd, Springfield, IL',
    preparationNotes: 'Bring morning medication logs, list of questions, and insurance card. Fasting not required.',
    status: 'scheduled',
    companionName: 'Sarah Vance (Daughter driving)',
    phone: '(555) 901-2345'
  },
  {
    id: 'apt_2',
    doctorName: 'Dr. Elena Patel, MD',
    specialty: 'Endocrinology & Diabetes Care',
    clinicName: 'Valley Virtual Health Consultation',
    date: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
    time: '14:00',
    type: 'telehealth',
    locationOrUrl: 'https://telehealth.valleyhealth.org/room/vance-margaret-742',
    preparationNotes: 'Have recent 14-day blood glucose logs ready for screen sharing.',
    status: 'scheduled',
    companionName: 'Sarah Vance (Joining via video)',
    phone: '(555) 789-0123'
  },
  {
    id: 'apt_3',
    doctorName: 'Dr. Michael Chang, OD',
    specialty: 'Ophthalmology & Vision Care',
    clinicName: 'ClearSight Eye Institute',
    date: new Date(Date.now() - 22 * 86400000).toISOString().split('T')[0],
    time: '11:15',
    type: 'in-person',
    locationOrUrl: '120 Health Sciences Way, Springfield',
    preparationNotes: 'Annual diabetic retinal dilated exam. Routine check complete.',
    status: 'completed',
    phone: '(555) 456-7890'
  }
];

export const INITIAL_VITALS: VitalSign[] = [
  {
    id: 'vit_1',
    date: getTodayString(),
    time: '08:05',
    systolic: 122,
    diastolic: 80,
    heartRate: 72,
    bloodGlucose: 104,
    glucoseContext: 'Fasting',
    oxygenSaturation: 98,
    temperature: 98.4,
    weight: 146.2,
    recordedBy: 'David Miller, RN',
    notes: 'Morning assessment. Patient well-rested, no dizziness noted.'
  },
  {
    id: 'vit_2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '18:30',
    systolic: 126,
    diastolic: 82,
    heartRate: 74,
    bloodGlucose: 132,
    glucoseContext: 'Post-Meal',
    oxygenSaturation: 99,
    recordedBy: 'Margaret Vance (Self)',
    notes: 'After light garden walk and dinner.'
  },
  {
    id: 'vit_3',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    time: '08:15',
    systolic: 124,
    diastolic: 81,
    heartRate: 70,
    bloodGlucose: 108,
    glucoseContext: 'Fasting',
    oxygenSaturation: 98,
    recordedBy: 'David Miller, RN',
    notes: 'Stable reading.'
  }
];

export const INITIAL_CARE_NOTES: CareNote[] = [
  {
    id: 'note_1',
    authorName: 'David Miller, RN',
    authorRole: 'Visiting Care Nurse',
    date: getTodayString(),
    time: '08:20',
    title: 'Morning Wellness & Mobility Assessment',
    content: 'Margaret was in high spirits today. Assisted with checking fasting glucose (104 mg/dL - excellent). Reviewed morning medications. Knee mobility has improved with daily stretches.',
    category: 'clinical',
    priority: 'normal'
  },
  {
    id: 'note_2',
    authorName: 'Sarah Vance',
    authorRole: 'Daughter / Family Proxy',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '16:45',
    title: 'Weekly Grocery & Low-Sodium Meal Prep',
    content: 'Stocked the fridge with fresh berries, whole wheat oats, steamed vegetables, and grilled chicken breast. Emptied expired salad dressings. Margaret drank 6 glasses of water today.',
    category: 'nutrition',
    priority: 'normal'
  },
  {
    id: 'note_3',
    authorName: 'David Miller, RN',
    authorRole: 'Visiting Care Nurse',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    time: '09:00',
    title: 'Pharmacy Refill Notice: Lisinopril',
    content: 'Noticed only 8 Lisinopril tablets left in the prescription bottle. Refill threshold triggered. Flagged for reorder.',
    category: 'clinical',
    priority: 'important'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Low Medication Warning',
    message: 'Lisinopril 10mg has only 8 tablets remaining. Tap to submit a refill request.',
    type: 'refill_alert',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    priority: 'high',
    actionUrl: '#medications'
  },
  {
    id: 'notif_2',
    title: 'Upcoming Dose Reminder',
    message: 'Vitamin D3 (2,000 IU) is scheduled for 12:30 PM with lunch.',
    type: 'dose_reminder',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    priority: 'medium',
    actionUrl: '#medications'
  },
  {
    id: 'notif_3',
    title: 'Doctor Appointment Coming Up',
    message: 'Cardiology consultation with Dr. Robert Hayes in 4 days at 10:30 AM.',
    type: 'appointment',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: true,
    priority: 'medium',
    actionUrl: '#appointments'
  }
];

// Helper to safely read and write JSON to LocalStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorageChange(key);
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

// Storage Service API
export const storageService = {
  // Current User / Role
  getCurrentUser(): UserProfile {
    return getFromStorage<UserProfile>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
  },

  setCurrentUser(user: UserProfile): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  switchRole(role: 'elderly' | 'family' | 'caregiver'): UserProfile {
    const target = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    this.setCurrentUser(target);
    return target;
  },

  // Senior Profile / Medical ID
  getSeniorProfile(): SeniorProfile {
    return getFromStorage<SeniorProfile>(STORAGE_KEYS.SENIOR_PROFILE, INITIAL_SENIOR_PROFILE);
  },

  updateSeniorProfile(profile: Partial<SeniorProfile>): SeniorProfile {
    const current = this.getSeniorProfile();
    const updated = { ...current, ...profile };
    saveToStorage(STORAGE_KEYS.SENIOR_PROFILE, updated);
    return updated;
  },

  // Medications CRUD
  getMedications(): Medication[] {
    return getFromStorage<Medication[]>(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
  },

  getMedicationById(id: string): Medication | undefined {
    return this.getMedications().find(m => m.id === id);
  },

  addMedication(med: Omit<Medication, 'id'>): Medication {
    const meds = this.getMedications();
    const newMed: Medication = {
      ...med,
      id: `med_${Date.now()}`
    };
    meds.push(newMed);
    saveToStorage(STORAGE_KEYS.MEDICATIONS, meds);

    // Also seed a pending log for today if active
    const today = getTodayString();
    const logs = this.getMedicationLogs();
    newMed.scheduleTimes.forEach(time => {
      logs.push({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        medicationId: newMed.id,
        medicationName: `${newMed.name} ${newMed.dosage}`,
        dosage: newMed.dosage,
        scheduledDate: today,
        scheduledTime: time,
        timeOfDay: newMed.timeOfDay[0] || 'Morning',
        status: 'pending',
        recordedBy: 'System'
      });
    });
    saveToStorage(STORAGE_KEYS.MEDICATION_LOGS, logs);

    return newMed;
  },

  updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    const meds = this.getMedications();
    const index = meds.findIndex(m => m.id === id);
    if (index === -1) return null;
    meds[index] = { ...meds[index], ...updates };
    saveToStorage(STORAGE_KEYS.MEDICATIONS, meds);
    return meds[index];
  },

  deleteMedication(id: string): boolean {
    const meds = this.getMedications().filter(m => m.id !== id);
    saveToStorage(STORAGE_KEYS.MEDICATIONS, meds);
    return true;
  },

  requestRefill(id: string): boolean {
    const meds = this.getMedications();
    const index = meds.findIndex(m => m.id === id);
    if (index === -1) return false;
    meds[index].refillRequested = true;
    saveToStorage(STORAGE_KEYS.MEDICATIONS, meds);

    // Add notification
    this.addNotification({
      title: 'Pharmacy Refill Requested',
      message: `Prescription refill submitted for ${meds[index].name} (${meds[index].dosage}). Notification queued for CVS Caremark.`,
      type: 'refill_alert',
      priority: 'medium'
    });

    return true;
  },

  // Medication Logs / Dose Tracking
  getMedicationLogs(): MedicationLog[] {
    return getFromStorage<MedicationLog[]>(STORAGE_KEYS.MEDICATION_LOGS, createInitialMedicationLogs());
  },

  getTodayLogs(): MedicationLog[] {
    const today = getTodayString();
    return this.getMedicationLogs().filter(log => log.scheduledDate === today);
  },

  recordDoseStatus(logId: string, status: DoseStatus, recordedBy: string, notes?: string): MedicationLog | null {
    const logs = this.getMedicationLogs();
    const index = logs.findIndex(l => l.id === logId);
    if (index === -1) return null;

    logs[index] = {
      ...logs[index],
      status,
      recordedAt: new Date().toISOString(),
      recordedBy,
      notes: notes || logs[index].notes
    };

    saveToStorage(STORAGE_KEYS.MEDICATION_LOGS, logs);

    // If taken, decrement medication remainingQuantity
    if (status === 'taken') {
      const meds = this.getMedications();
      const medIndex = meds.findIndex(m => m.id === logs[index].medicationId);
      if (medIndex !== -1 && meds[medIndex].remainingQuantity > 0) {
        meds[medIndex].remainingQuantity -= 1;
        // Check if low
        if (meds[medIndex].remainingQuantity <= meds[medIndex].refillThreshold) {
          this.addNotification({
            title: 'Medication Low Warning',
            message: `${meds[medIndex].name} has only ${meds[medIndex].remainingQuantity} doses remaining. Time to reorder.`,
            type: 'refill_alert',
            priority: 'high'
          });
        }
        saveToStorage(STORAGE_KEYS.MEDICATIONS, meds);
      }
    } else if (status === 'missed') {
      // Add missed dose notification
      this.addNotification({
        title: 'Missed Dose Alert',
        message: `${logs[index].medicationName} scheduled for ${logs[index].scheduledTime} was marked as missed.`,
        type: 'missed_dose',
        priority: 'high'
      });
    }

    return logs[index];
  },

  // Appointments CRUD
  getAppointments(): Appointment[] {
    return getFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  },

  addAppointment(apt: Omit<Appointment, 'id'>): Appointment {
    const appointments = this.getAppointments();
    const newApt: Appointment = {
      ...apt,
      id: `apt_${Date.now()}`
    };
    appointments.push(newApt);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    this.addNotification({
      title: 'Appointment Scheduled',
      message: `New appointment with ${newApt.doctorName} on ${newApt.date} at ${newApt.time}.`,
      type: 'appointment',
      priority: 'medium'
    });

    return newApt;
  },

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    appointments[index] = { ...appointments[index], ...updates };
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    return appointments[index];
  },

  deleteAppointment(id: string): boolean {
    const appointments = this.getAppointments().filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    return true;
  },

  // Vitals CRUD
  getVitals(): VitalSign[] {
    return getFromStorage<VitalSign[]>(STORAGE_KEYS.VITALS, INITIAL_VITALS);
  },

  addVital(vital: Omit<VitalSign, 'id'>): VitalSign {
    const vitals = this.getVitals();
    const newVital: VitalSign = {
      ...vital,
      id: `vit_${Date.now()}`
    };
    vitals.unshift(newVital); // most recent first
    saveToStorage(STORAGE_KEYS.VITALS, vitals);

    this.addNotification({
      title: 'Health Vitals Logged',
      message: `BP: ${newVital.systolic}/${newVital.diastolic} mmHg | Pulse: ${newVital.heartRate} bpm recorded by ${newVital.recordedBy}.`,
      type: 'system',
      priority: 'low'
    });

    return newVital;
  },

  // Care Notes CRUD
  getCareNotes(): CareNote[] {
    return getFromStorage<CareNote[]>(STORAGE_KEYS.CARE_NOTES, INITIAL_CARE_NOTES);
  },

  addCareNote(note: Omit<CareNote, 'id'>): CareNote {
    const notes = this.getCareNotes();
    const newNote: CareNote = {
      ...note,
      id: `note_${Date.now()}`
    };
    notes.unshift(newNote);
    saveToStorage(STORAGE_KEYS.CARE_NOTES, notes);
    return newNote;
  },

  // Emergency Contacts CRUD
  getEmergencyContacts(): EmergencyContact[] {
    return getFromStorage<EmergencyContact[]>(STORAGE_KEYS.EMERGENCY_CONTACTS, INITIAL_EMERGENCY_CONTACTS);
  },

  addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const contacts = this.getEmergencyContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: `ec_${Date.now()}`
    };
    if (newContact.isPrimary) {
      contacts.forEach(c => (c.isPrimary = false));
    }
    contacts.push(newContact);
    saveToStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    return newContact;
  },

  updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): EmergencyContact | null {
    const contacts = this.getEmergencyContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return null;
    if (updates.isPrimary) {
      contacts.forEach(c => (c.isPrimary = false));
    }
    contacts[index] = { ...contacts[index], ...updates };
    saveToStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    return contacts[index];
  },

  deleteEmergencyContact(id: string): boolean {
    const contacts = this.getEmergencyContacts().filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    return true;
  },

  // Emergency SOS System
  getSOSIncidents(): SOSIncident[] {
    return getFromStorage<SOSIncident[]>(STORAGE_KEYS.SOS_INCIDENTS, []);
  },

  triggerSOS(): SOSIncident {
    const senior = this.getSeniorProfile();
    const contacts = this.getEmergencyContacts();
    const incident: SOSIncident = {
      id: `SOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      status: 'active',
      location: {
        lat: 39.7817,
        lng: -89.6501,
        address: senior.address
      },
      notifiedContacts: contacts.map(c => ({
        name: `${c.name} (${c.relationship})`,
        phone: c.phone,
        status: 'simulated'
      }))
    };

    const incidents = this.getSOSIncidents();
    incidents.unshift(incident);
    saveToStorage(STORAGE_KEYS.SOS_INCIDENTS, incidents);

    this.addNotification({
      title: 'EMERGENCY SOS ACTIVATED',
      message: `Emergency SOS triggered for ${senior.fullName}. Incident ID: ${incident.id}. Simulated alert dispatched to ${contacts.length} care contacts.`,
      type: 'sos_alert',
      priority: 'critical'
    });

    return incident;
  },

  resolveSOS(incidentId: string, notes: string): boolean {
    const incidents = this.getSOSIncidents();
    const index = incidents.findIndex(i => i.id === incidentId);
    if (index === -1) return false;
    incidents[index].status = 'resolved';
    incidents[index].resolvedAt = new Date().toISOString();
    incidents[index].resolutionNotes = notes;
    saveToStorage(STORAGE_KEYS.SOS_INCIDENTS, incidents);

    this.addNotification({
      title: 'SOS Incident Resolved',
      message: `Incident ${incidentId} was resolved: "${notes}". All emergency contacts notified of stand-down.`,
      type: 'system',
      priority: 'medium'
    });

    return true;
  },

  // Notifications CRUD
  getNotifications(): NotificationItem[] {
    return getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifs.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications();
    notifs.forEach(n => (n.read = true));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  clearAllNotifications(): void {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  // Accessibility Settings
  getAccessibilitySettings(): { fontSize: 'normal' | 'large' | 'xlarge'; highContrast: boolean; soundEnabled: boolean } {
    return getFromStorage(STORAGE_KEYS.ACCESSIBILITY, {
      fontSize: 'large', // Default to large for senior readability!
      highContrast: false,
      soundEnabled: true
    });
  },

  saveAccessibilitySettings(settings: { fontSize: 'normal' | 'large' | 'xlarge'; highContrast: boolean; soundEnabled: boolean }): void {
    saveToStorage(STORAGE_KEYS.ACCESSIBILITY, settings);
  },

  // Reset demo data to factory defaults
  resetAllDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SENIOR_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
    localStorage.removeItem(STORAGE_KEYS.MEDICATION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.VITALS);
    localStorage.removeItem(STORAGE_KEYS.CARE_NOTES);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SOS_INCIDENTS);
    notifyStorageChange('reset');
  }
};
