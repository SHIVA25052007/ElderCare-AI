import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  SeniorProfile,
  Medication,
  MedicationLog,
  Appointment,
  VitalSign,
  CareNote,
  EmergencyContact,
  NotificationItem,
  SOSIncident,
  UserRole,
  DoseStatus
} from '../types';
import { storageService, DATA_CHANGED_EVENT } from '../services/storage';
import { audioService } from '../services/audioService';

export type NavigationTab = 'dashboard' | 'medications' | 'appointments' | 'vitals' | 'care_circle' | 'medical_id';
export type FontSize = 'normal' | 'large' | 'xlarge';

interface AppContextType {
  currentUser: UserProfile;
  seniorProfile: SeniorProfile;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Data State
  medications: Medication[];
  medicationLogs: MedicationLog[];
  todayLogs: MedicationLog[];
  appointments: Appointment[];
  vitals: VitalSign[];
  careNotes: CareNote[];
  emergencyContacts: EmergencyContact[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  
  // Accessibility
  accessibility: {
    fontSize: FontSize;
    highContrast: boolean;
    soundEnabled: boolean;
  };
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  toggleSound: () => void;

  // Modals & Panels
  isSOSOpen: boolean;
  openSOS: () => void;
  closeSOS: () => void;
  activeSOSIncident: SOSIncident | null;
  triggerSOS: () => SOSIncident;
  resolveSOS: (incidentId: string, notes: string) => void;

  isVoiceAssistantOpen: boolean;
  openVoiceAssistant: () => void;
  closeVoiceAssistant: () => void;

  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // Actions
  switchRole: (role: UserRole) => void;
  recordDose: (logId: string, status: DoseStatus, notes?: string) => void;
  addMedication: (med: Omit<Medication, 'id'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  requestRefill: (id: string) => void;

  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addVital: (vital: Omit<VitalSign, 'id'>) => VitalSign;
  addCareNote: (note: Omit<CareNote, 'id'>) => CareNote;

  updateSeniorProfile: (profile: Partial<SeniorProfile>) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => EmergencyContact;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  resetAllDemoData: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());
  const [seniorProfile, setSeniorProfile] = useState<SeniorProfile>(storageService.getSeniorProfile());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [medications, setMedications] = useState<Medication[]>(storageService.getMedications());
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>(storageService.getMedicationLogs());
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>(storageService.getTodayLogs());
  const [appointments, setAppointments] = useState<Appointment[]>(storageService.getAppointments());
  const [vitals, setVitals] = useState<VitalSign[]>(storageService.getVitals());
  const [careNotes, setCareNotes] = useState<CareNote[]>(storageService.getCareNotes());
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(storageService.getEmergencyContacts());
  const [notifications, setNotifications] = useState<NotificationItem[]>(storageService.getNotifications());

  const [accessibility, setAccessibilityState] = useState(storageService.getAccessibilitySettings());

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [activeSOSIncident, setActiveSOSIncident] = useState<SOSIncident | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshData = useCallback(() => {
    setCurrentUser(storageService.getCurrentUser());
    setSeniorProfile(storageService.getSeniorProfile());
    setMedications(storageService.getMedications());
    setMedicationLogs(storageService.getMedicationLogs());
    setTodayLogs(storageService.getTodayLogs());
    setAppointments(storageService.getAppointments());
    setVitals(storageService.getVitals());
    setCareNotes(storageService.getCareNotes());
    setEmergencyContacts(storageService.getEmergencyContacts());
    setNotifications(storageService.getNotifications());
    setAccessibilityState(storageService.getAccessibilitySettings());
  }, []);

  // Subscribe to storage update events
  useEffect(() => {
    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener(DATA_CHANGED_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, handleStorageChange);
    };
  }, [refreshData]);

  // Synchronize audio service setting with accessibility setting
  useEffect(() => {
    audioService.setSoundEnabled(accessibility.soundEnabled);
  }, [accessibility.soundEnabled]);

  const setFontSize = (size: FontSize) => {
    const updated = { ...accessibility, fontSize: size };
    setAccessibilityState(updated);
    storageService.saveAccessibilitySettings(updated);
  };

  const toggleHighContrast = () => {
    const updated = { ...accessibility, highContrast: !accessibility.highContrast };
    setAccessibilityState(updated);
    storageService.saveAccessibilitySettings(updated);
  };

  const toggleSound = () => {
    const updated = { ...accessibility, soundEnabled: !accessibility.soundEnabled };
    setAccessibilityState(updated);
    storageService.saveAccessibilitySettings(updated);
  };

  const switchRole = (role: UserRole) => {
    const newUser = storageService.switchRole(role);
    setCurrentUser(newUser);
    audioService.playReminderTone();
  };

  const recordDose = (logId: string, status: DoseStatus, notes?: string) => {
    const recordedBy = `${currentUser.name} (${currentUser.role})`;
    storageService.recordDoseStatus(logId, status, recordedBy, notes);
    if (status === 'taken') {
      audioService.playSuccessChime();
    } else if (status === 'missed') {
      audioService.playWarningTone();
    }
    refreshData();
  };

  const addMed = (med: Omit<Medication, 'id'>) => {
    const newMed = storageService.addMedication(med);
    audioService.playReminderTone();
    refreshData();
    return newMed;
  };

  const updateMed = (id: string, updates: Partial<Medication>) => {
    storageService.updateMedication(id, updates);
    refreshData();
  };

  const deleteMed = (id: string) => {
    storageService.deleteMedication(id);
    refreshData();
  };

  const reqRefill = (id: string) => {
    storageService.requestRefill(id);
    audioService.playReminderTone();
    refreshData();
  };

  const addApt = (apt: Omit<Appointment, 'id'>) => {
    const newApt = storageService.addAppointment(apt);
    audioService.playReminderTone();
    refreshData();
    return newApt;
  };

  const updateApt = (id: string, updates: Partial<Appointment>) => {
    storageService.updateAppointment(id, updates);
    refreshData();
  };

  const deleteApt = (id: string) => {
    storageService.deleteAppointment(id);
    refreshData();
  };

  const addVit = (vital: Omit<VitalSign, 'id'>) => {
    const newVital = storageService.addVital(vital);
    audioService.playReminderTone();
    refreshData();
    return newVital;
  };

  const addNote = (note: Omit<CareNote, 'id'>) => {
    const newNote = storageService.addCareNote(note);
    audioService.playReminderTone();
    refreshData();
    return newNote;
  };

  const updateProfile = (profile: Partial<SeniorProfile>) => {
    storageService.updateSeniorProfile(profile);
    refreshData();
  };

  const addEC = (contact: Omit<EmergencyContact, 'id'>) => {
    const newC = storageService.addEmergencyContact(contact);
    refreshData();
    return newC;
  };

  const updateEC = (id: string, updates: Partial<EmergencyContact>) => {
    storageService.updateEmergencyContact(id, updates);
    refreshData();
  };

  const deleteEC = (id: string) => {
    storageService.deleteEmergencyContact(id);
    refreshData();
  };

  const triggerSOS = () => {
    const incident = storageService.triggerSOS();
    setActiveSOSIncident(incident);
    audioService.playEmergencyAlert();
    refreshData();
    return incident;
  };

  const resolveSOS = (incidentId: string, notes: string) => {
    storageService.resolveSOS(incidentId, notes);
    setActiveSOSIncident(null);
    refreshData();
  };

  const markNotifRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    refreshData();
  };

  const markAllNotifsRead = () => {
    storageService.markAllNotificationsAsRead();
    refreshData();
  };

  const clearNotifs = () => {
    storageService.clearAllNotifications();
    refreshData();
  };

  const resetAllDemo = () => {
    storageService.resetAllDemoData();
    refreshData();
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        seniorProfile,
        activeTab,
        setActiveTab,
        medications,
        medicationLogs,
        todayLogs,
        appointments,
        vitals,
        careNotes,
        emergencyContacts,
        notifications,
        unreadNotificationCount,
        accessibility,
        setFontSize,
        toggleHighContrast,
        toggleSound,
        isSOSOpen,
        openSOS: () => setIsSOSOpen(true),
        closeSOS: () => setIsSOSOpen(false),
        activeSOSIncident,
        triggerSOS,
        resolveSOS,
        isVoiceAssistantOpen,
        openVoiceAssistant: () => setIsVoiceAssistantOpen(true),
        closeVoiceAssistant: () => setIsVoiceAssistantOpen(false),
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        switchRole,
        recordDose,
        addMedication: addMed,
        updateMedication: updateMed,
        deleteMedication: deleteMed,
        requestRefill: reqRefill,
        addAppointment: addApt,
        updateAppointment: updateApt,
        deleteAppointment: deleteApt,
        addVital: addVit,
        addCareNote: addNote,
        updateSeniorProfile: updateProfile,
        addEmergencyContact: addEC,
        updateEmergencyContact: updateEC,
        deleteEmergencyContact: deleteEC,
        markNotificationRead: markNotifRead,
        markAllNotificationsRead: markAllNotifsRead,
        clearAllNotifications: clearNotifs,
        resetAllDemoData: resetAllDemo,
        refreshData
      }}
    >
      <div
        className={`min-h-screen text-slate-100 font-sans transition-colors duration-200 ${
          accessibility.highContrast ? 'contrast-125 bg-black' : 'bg-navy-950'
        } ${
          accessibility.fontSize === 'xlarge'
            ? 'text-lg'
            : accessibility.fontSize === 'large'
            ? 'text-base'
            : 'text-sm'
        }`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
