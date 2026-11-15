import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storage';
import type { UserProfile, TimeOfDay } from '../types';

// ---------------------------------------------------------------------------
// RBAC Test Fixtures
// These are test-only actor profiles. They are passed explicitly to storage
// methods that require authorization. No default privileged user is introduced
// in production code.
// ---------------------------------------------------------------------------

/** Authorized clinical caregiver — holds prescriptions:add/edit/delete */
const AUTHORIZED_CAREGIVER: UserProfile = {
  id: 'test_caregiver_rbac',
  name: 'Test Authorized Nurse',
  role: 'caregiver',
  email: 'nurse@test-clinic.org',
  phone: '(555) 000-0001',
  avatar: ''
};

/** Authorized family proxy — holds medical_id:edit and dnr:edit */
const AUTHORIZED_PROXY: UserProfile = {
  id: 'test_proxy_rbac',
  name: 'Test Authorized Proxy',
  role: 'family',
  email: 'proxy@test.com',
  phone: '(555) 000-0002',
  avatar: '',
  isAuthorizedProxy: true
};

/** Unauthorized family member (no isAuthorizedProxy) */
const UNAUTHORIZED_FAMILY: UserProfile = {
  id: 'test_family_rbac',
  name: 'Test Family Member',
  role: 'family',
  email: 'family@test.com',
  phone: '(555) 000-0003',
  avatar: ''
};

/** Senior user — read-only; cannot create/edit/delete prescriptions */
const SENIOR_USER: UserProfile = {
  id: 'test_senior_rbac',
  name: 'Test Senior User',
  role: 'elderly',
  email: 'senior@test.com',
  phone: '(555) 000-0004',
  avatar: ''
};

describe('Storage Service - Medications CRUD & Stock Tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  it('retrieves initial seeded medications', () => {
    const meds = storageService.getMedications();
    expect(meds.length).toBeGreaterThan(0);
    const metformin = meds.find(m => m.name.includes('Metformin'));
    expect(metformin).toBeDefined();
    expect(metformin?.dosage).toBe('500 mg');
  });

  it('creates a new medication prescription and seeds pending logs', () => {
    const initialMeds = storageService.getMedications();
    const newMed = storageService.addMedication({
      name: 'Amlodipine Besylate',
      genericName: 'Norvasc',
      dosage: '5 mg',
      frequency: 'Once daily in morning',
      timeOfDay: ['Morning'],
      scheduleTimes: ['09:00'],
      instructions: 'Take 1 tablet every morning with water.',
      prescribingDoctor: 'Dr. Robert Hayes, MD',
      pillColor: 'White',
      pillShape: 'Round tablet',
      remainingQuantity: 30,
      totalQuantity: 30,
      refillThreshold: 7,
      status: 'active',
      foodRequirement: 'No food restrictions'
    }, AUTHORIZED_CAREGIVER);

    expect(newMed.id).toBeDefined();
    expect(newMed.name).toBe('Amlodipine Besylate');

    const updatedMeds = storageService.getMedications();
    expect(updatedMeds.length).toBe(initialMeds.length + 1);

    const todayLogs = storageService.getTodayLogs();
    const createdLog = todayLogs.find(l => l.medicationId === newMed.id);
    expect(createdLog).toBeDefined();
    expect(createdLog?.status).toBe('pending');
    expect(createdLog?.scheduledTime).toBe('09:00');
  });

  it('updates an existing medication prescription', () => {
    const meds = storageService.getMedications();
    const target = meds[0];

    const updated = storageService.updateMedication(target.id, {
      dosage: '1000 mg',
      instructions: 'Updated instruction: take after meal'
    }, AUTHORIZED_CAREGIVER);

    expect(updated).not.toBeNull();
    expect(updated?.dosage).toBe('1000 mg');
    expect(updated?.instructions).toBe('Updated instruction: take after meal');

    const fetched = storageService.getMedicationById(target.id);
    expect(fetched?.dosage).toBe('1000 mg');
  });

  it('returns null when updating a non-existent medication (edge case)', () => {
    const result = storageService.updateMedication('med_non_existent_9999', {
      dosage: '999 mg'
    }, AUTHORIZED_CAREGIVER);
    expect(result).toBeNull();
  });

  it('deletes an existing medication prescription', () => {
    const meds = storageService.getMedications();
    const toDelete = meds[0];
    const initialCount = meds.length;

    const deleted = storageService.deleteMedication(toDelete.id, AUTHORIZED_CAREGIVER);
    expect(deleted).toBe(true);

    const afterDelete = storageService.getMedications();
    expect(afterDelete.length).toBe(initialCount - 1);
    expect(storageService.getMedicationById(toDelete.id)).toBeUndefined();
  });

  it('decrements remaining medication stock when dose is marked taken', () => {
    const todayLogs = storageService.getTodayLogs();
    const pendingLog = todayLogs.find(l => l.status === 'pending');
    expect(pendingLog).toBeDefined();

    if (!pendingLog) return;

    const targetMed = storageService.getMedicationById(pendingLog.medicationId);
    expect(targetMed).toBeDefined();
    const initialQty = targetMed!.remainingQuantity;

    const updatedLog = storageService.recordDoseStatus(pendingLog.id, 'taken', 'Margaret Vance (Self)', 'Taken with breakfast');
    expect(updatedLog?.status).toBe('taken');
    expect(updatedLog?.recordedBy).toBe('Margaret Vance (Self)');
    expect(updatedLog?.recordedAt).toBeDefined();

    const afterMed = storageService.getMedicationById(pendingLog.medicationId);
    expect(afterMed?.remainingQuantity).toBe(initialQty - 1);
  });

  // CLINICAL INVENTORY INTEGRITY TESTS
  it('prevents duplicate deductions when repeatedly confirming the same dose as taken', () => {
    const todayLogs = storageService.getTodayLogs();
    const pendingLog = todayLogs.find(l => l.status === 'pending');
    expect(pendingLog).toBeDefined();

    const targetMed = storageService.getMedicationById(pendingLog!.medicationId);
    const initialQty = targetMed!.remainingQuantity;

    // First confirmation: stock drops by 1
    storageService.recordDoseStatus(pendingLog!.id, 'taken', 'Self');
    const qtyAfterFirst = storageService.getMedicationById(pendingLog!.medicationId)!.remainingQuantity;
    expect(qtyAfterFirst).toBe(initialQty - 1);

    // Repeated confirmation: stock MUST NOT drop again!
    storageService.recordDoseStatus(pendingLog!.id, 'taken', 'Self');
    const qtyAfterSecond = storageService.getMedicationById(pendingLog!.medicationId)!.remainingQuantity;
    expect(qtyAfterSecond).toBe(initialQty - 1);
  });

  it('restores stock when transitioning from taken to missed', () => {
    const todayLogs = storageService.getTodayLogs();
    const pendingLog = todayLogs.find(l => l.status === 'pending');
    const medId = pendingLog!.medicationId;
    const initialQty = storageService.getMedicationById(medId)!.remainingQuantity;

    // Mark taken -> deducts 1
    storageService.recordDoseStatus(pendingLog!.id, 'taken', 'Self');
    expect(storageService.getMedicationById(medId)!.remainingQuantity).toBe(initialQty - 1);

    // Transition taken -> missed: restores 1
    storageService.recordDoseStatus(pendingLog!.id, 'missed', 'Caregiver', 'Corrected mistake');
    expect(storageService.getMedicationById(medId)!.remainingQuantity).toBe(initialQty);
  });

  it('restores stock when transitioning from taken to pending', () => {
    const todayLogs = storageService.getTodayLogs();
    const pendingLog = todayLogs.find(l => l.status === 'pending');
    const medId = pendingLog!.medicationId;
    const initialQty = storageService.getMedicationById(medId)!.remainingQuantity;

    // Mark taken -> deducts 1
    storageService.recordDoseStatus(pendingLog!.id, 'taken', 'Self');
    expect(storageService.getMedicationById(medId)!.remainingQuantity).toBe(initialQty - 1);

    // Transition taken -> pending (undo dose): restores 1
    storageService.recordDoseStatus(pendingLog!.id, 'pending', 'Self');
    expect(storageService.getMedicationById(medId)!.remainingQuantity).toBe(initialQty);
  });

  it('deducts stock when transitioning from missed to taken', () => {
    const todayLogs = storageService.getTodayLogs();
    const pendingLog = todayLogs.find(l => l.status === 'pending');
    const medId = pendingLog!.medicationId;
    const initialQty = storageService.getMedicationById(medId)!.remainingQuantity;

    // Mark missed -> stock unchanged
    storageService.recordDoseStatus(pendingLog!.id, 'missed', 'Self');
    expect(storageService.getMedicationById(medId)!.remainingQuantity).toBe(initialQty);

    // Transition missed -> taken -> stock decrements by 1
    storageService.recordDoseStatus(pendingLog!.id, 'taken', 'Self');
    expect(storageService.getMedicationById(medId)!.remainingQuantity).toBe(initialQty - 1);
  });

  it('triggers a low-stock notification when quantity drops to or below refill threshold', () => {
    const med = storageService.addMedication({
      name: 'Test Threshold Pill',
      dosage: '10 mg',
      frequency: 'Once daily',
      timeOfDay: ['Morning'],
      scheduleTimes: ['08:00'],
      instructions: 'Take 1',
      prescribingDoctor: 'Dr. Test',
      pillColor: 'White',
      pillShape: 'Round',
      remainingQuantity: 6,
      totalQuantity: 30,
      refillThreshold: 5,
      status: 'active'
    }, AUTHORIZED_CAREGIVER);

    const logs = storageService.getTodayLogs();
    const log = logs.find(l => l.medicationId === med.id);
    expect(log).toBeDefined();

    // Take the pill: quantity goes from 6 to 5 (equal to threshold 5)
    storageService.recordDoseStatus(log!.id, 'taken', 'Tester');

    const updatedMed = storageService.getMedicationById(med.id);
    expect(updatedMed?.remainingQuantity).toBe(5);

    const notifications = storageService.getNotifications();
    const lowStockAlert = notifications.find(n => n.type === 'refill_alert' && n.message.includes(med.name));
    expect(lowStockAlert).toBeDefined();
  });

  it('records missed dose status and triggers a missed dose notification', () => {
    const todayLogs = storageService.getTodayLogs();
    const pendingLog = todayLogs.find(l => l.status === 'pending');
    expect(pendingLog).toBeDefined();

    if (!pendingLog) return;

    const updatedLog = storageService.recordDoseStatus(pendingLog.id, 'missed', 'System', 'Patient sleeping');
    expect(updatedLog?.status).toBe('missed');
    expect(updatedLog?.notes).toBe('Patient sleeping');

    const notifications = storageService.getNotifications();
    const missedAlert = notifications.find(n => n.type === 'missed_dose' && n.message.includes(pendingLog.medicationName));
    expect(missedAlert).toBeDefined();
  });

  it('handles pharmacy refill request and flags the medication', () => {
    const meds = storageService.getMedications();
    const target = meds[0];

    const result = storageService.requestRefill(target.id);
    expect(result).toBe(true);

    const updated = storageService.getMedicationById(target.id);
    expect(updated?.refillRequested).toBe(true);

    const notifs = storageService.getNotifications();
    expect(notifs.some(n => n.title === 'Pharmacy Refill Requested')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RBAC Authorization Tests
// Verifies that the RBAC layer correctly enforces role-based access for all
// prescription mutation operations in the data layer.
// ---------------------------------------------------------------------------

describe('Storage Service - RBAC Authorization Enforcement', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  const newMedSpec = {
    name: 'RBAC Test Medication',
    dosage: '10 mg',
    frequency: 'Once daily',
    timeOfDay: ['Morning' as TimeOfDay],
    scheduleTimes: ['08:00'],
    instructions: 'Test only',
    prescribingDoctor: 'Dr. RBAC Test',
    pillColor: 'Blue',
    pillShape: 'Oval',
    remainingQuantity: 30,
    totalQuantity: 30,
    refillThreshold: 5,
    status: 'active' as const
  };

  // --- Positive: Authorized caregiver ---

  it('[RBAC] authorized caregiver can create a prescription', () => {
    expect(() => {
      storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    }).not.toThrow();

    const meds = storageService.getMedications();
    expect(meds.some(m => m.name === 'RBAC Test Medication')).toBe(true);
  });

  it('[RBAC] authorized caregiver can update a prescription', () => {
    const med = storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    expect(() => {
      storageService.updateMedication(med.id, { dosage: '20 mg' }, AUTHORIZED_CAREGIVER);
    }).not.toThrow();

    const updated = storageService.getMedicationById(med.id);
    expect(updated?.dosage).toBe('20 mg');
  });

  it('[RBAC] authorized caregiver can delete a prescription', () => {
    const originalCount = storageService.getMedications().length;
    const med = storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    // After addition, count should be originalCount + 1
    expect(storageService.getMedications().length).toBe(originalCount + 1);

    expect(() => {
      storageService.deleteMedication(med.id, AUTHORIZED_CAREGIVER);
    }).not.toThrow();

    // After deletion, count should return to original
    expect(storageService.getMedications().length).toBe(originalCount);
    expect(storageService.getMedicationById(med.id)).toBeUndefined();
  });

  // --- Negative: Senior cannot mutate prescriptions ---

  it('[RBAC] senior (elderly role) cannot create a prescription', () => {
    expect(() => {
      storageService.addMedication(newMedSpec, SENIOR_USER);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  it('[RBAC] senior (elderly role) cannot delete a prescription', () => {
    const med = storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    expect(() => {
      storageService.deleteMedication(med.id, SENIOR_USER);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  it('[RBAC] senior (elderly role) cannot update a prescription', () => {
    const med = storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    expect(() => {
      storageService.updateMedication(med.id, { dosage: '999 mg' }, SENIOR_USER);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  // --- Negative: Unauthorized family member cannot mutate prescriptions ---

  it('[RBAC] unauthorized family member cannot create a prescription', () => {
    expect(() => {
      storageService.addMedication(newMedSpec, UNAUTHORIZED_FAMILY);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  it('[RBAC] unauthorized family member cannot delete a prescription', () => {
    const med = storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    expect(() => {
      storageService.deleteMedication(med.id, UNAUTHORIZED_FAMILY);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  // --- Negative: null/missing user context fails closed ---

  it('[RBAC] missing user context (null actor) is rejected for addMedication', () => {
    expect(() => {
      storageService.addMedication(newMedSpec, null as unknown as UserProfile);
    }).toThrow(/Access Denied|Permission denied|Authentication required/i);
  });

  it('[RBAC] missing user context (null actor) is rejected for deleteMedication', () => {
    const med = storageService.addMedication(newMedSpec, AUTHORIZED_CAREGIVER);
    expect(() => {
      storageService.deleteMedication(med.id, null as unknown as UserProfile);
    }).toThrow(/Access Denied|Permission denied|Authentication required/i);
  });

  // --- Medical ID: authorized proxy vs unauthorized family vs senior ---

  it('[RBAC] authorized family proxy can edit Medical ID', () => {
    expect(() => {
      storageService.updateSeniorProfile({ bloodType: 'O+' }, AUTHORIZED_PROXY);
    }).not.toThrow();
  });

  it('[RBAC] unauthorized family member cannot edit Medical ID', () => {
    expect(() => {
      storageService.updateSeniorProfile({ bloodType: 'AB-' }, UNAUTHORIZED_FAMILY);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  it('[RBAC] senior cannot edit DNR preferences', () => {
    expect(() => {
      storageService.updateSeniorProfile({ dnrStatus: true }, SENIOR_USER);
    }).toThrow(/Access Denied|Permission denied/i);
  });

  // --- Low-stock notification with authorized actor ---

  it('[RBAC] low-stock notification fires when authorized caregiver creates a near-threshold prescription', () => {
    const med = storageService.addMedication({
      ...newMedSpec,
      name: 'RBAC Low Stock Pill',
      remainingQuantity: 6,
      refillThreshold: 5
    }, AUTHORIZED_CAREGIVER);

    const logs = storageService.getTodayLogs();
    const log = logs.find(l => l.medicationId === med.id);
    expect(log).toBeDefined();

    storageService.recordDoseStatus(log!.id, 'taken', 'RBAC Tester');

    const updatedMed = storageService.getMedicationById(med.id);
    expect(updatedMed?.remainingQuantity).toBe(5);

    const notifications = storageService.getNotifications();
    const lowStockAlert = notifications.find(
      n => n.type === 'refill_alert' && n.message.includes('RBAC Low Stock Pill')
    );
    expect(lowStockAlert).toBeDefined();
  });
});

describe('Storage Service - Dynamic Adherence & Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  it('calculates adherence rate dynamically when doses transition between taken and missed', () => {
    // Initial seed: 2 taken, 0 missed -> 2 / 2 = 100% adherence
    const logs = storageService.getMedicationLogs();
    const resolved = logs.filter(l => l.status === 'taken' || l.status === 'missed');
    const initialRate = Math.round((resolved.filter(l => l.status === 'taken').length / resolved.length) * 100);
    expect(initialRate).toBe(100);

    // Mark 1 pending dose as missed -> 2 taken, 1 missed -> 2 / 3 = 67%
    const pending = logs.find(l => l.status === 'pending');
    storageService.recordDoseStatus(pending!.id, 'missed', 'Caregiver');

    const updatedLogs = storageService.getMedicationLogs();
    const updatedResolved = updatedLogs.filter(l => l.status === 'taken' || l.status === 'missed');
    const newRate = Math.round((updatedResolved.filter(l => l.status === 'taken').length / updatedResolved.length) * 100);
    expect(newRate).toBe(67);
  });

  it('handles empty medication logs safely without NaN or errors', () => {
    localStorage.setItem('eldercare_medication_logs', JSON.stringify([]));
    const emptyLogs = storageService.getMedicationLogs();
    expect(emptyLogs).toEqual([]);

    const resolvedLogs = emptyLogs.filter(l => l.status === 'taken' || l.status === 'missed');
    const safeRate = resolvedLogs.length > 0
      ? Math.round((resolvedLogs.filter(l => l.status === 'taken').length / resolvedLogs.length) * 100)
      : 100;

    expect(safeRate).toBe(100);
    expect(isNaN(safeRate)).toBe(false);
  });
});

describe('Storage Service - Appointments, Vitals & Emergency Protocol', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  it('creates, reads, and deletes doctor appointments', () => {
    const initialApts = storageService.getAppointments();
    const newApt = storageService.addAppointment({
      doctorName: 'Dr. Sarah Connor, MD',
      specialty: 'Neurology',
      clinicName: 'Brain & Spine Institute',
      date: '2026-12-01',
      time: '14:30',
      type: 'in-person',
      locationOrUrl: '100 Medical Plaza',
      preparationNotes: 'Bring previous MRI scans',
      status: 'scheduled'
    });

    expect(newApt.id).toBeDefined();
    expect(storageService.getAppointments().length).toBe(initialApts.length + 1);

    storageService.updateAppointment(newApt.id, { status: 'completed' });
    const updated = storageService.getAppointments().find(a => a.id === newApt.id);
    expect(updated?.status).toBe('completed');

    storageService.deleteAppointment(newApt.id);
    expect(storageService.getAppointments().find(a => a.id === newApt.id)).toBeUndefined();
  });

  it('records health vitals and maintains descending time order', () => {
    const newVital = storageService.addVital({
      date: '2026-11-15',
      time: '11:00',
      systolic: 124,
      diastolic: 82,
      heartRate: 75,
      bloodGlucose: 110,
      glucoseContext: 'Fasting',
      oxygenSaturation: 98,
      temperature: 98.6,
      weight: 145.5,
      recordedBy: 'David Miller, RN',
      notes: 'Test reading'
    });

    expect(newVital.id).toBeDefined();
    const vitals = storageService.getVitals();
    expect(vitals[0].id).toBe(newVital.id); // unshifted to top
    expect(vitals[0].systolic).toBe(124);
  });

  it('triggers and resolves emergency SOS incidents', () => {
    const incident = storageService.triggerSOS();
    expect(incident.id).toMatch(/^SOS-/);
    expect(incident.status).toBe('active');
    expect(incident.location.address).toBeDefined();
    expect(incident.notifiedContacts.length).toBeGreaterThan(0);

    const resolveResult = storageService.resolveSOS(incident.id, 'False alarm test');
    expect(resolveResult).toBe(true);

    const incidents = storageService.getSOSIncidents();
    const resolved = incidents.find(i => i.id === incident.id);
    expect(resolved?.status).toBe('resolved');
    expect(resolved?.resolutionNotes).toBe('False alarm test');
  });

  it('ensures only one primary emergency contact exists when isPrimary is updated', () => {
    const contacts = storageService.getEmergencyContacts();
    expect(contacts.length).toBeGreaterThan(1);

    const secondaryContact = contacts.find(c => !c.isPrimary);
    expect(secondaryContact).toBeDefined();

    storageService.updateEmergencyContact(secondaryContact!.id, { isPrimary: true });

    const updatedContacts = storageService.getEmergencyContacts();
    const primaries = updatedContacts.filter(c => c.isPrimary);
    expect(primaries.length).toBe(1);
    expect(primaries[0].id).toBe(secondaryContact!.id);
  });
});
