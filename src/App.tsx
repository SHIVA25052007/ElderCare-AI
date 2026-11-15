import React from 'react';
import { useApp } from './context/AppContext';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { SeniorDashboard } from './components/SeniorDashboard';
import { FamilyDashboard } from './components/FamilyDashboard';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { MedicationManagement } from './components/MedicationManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { HealthVitalsView } from './components/HealthVitalsView';
import { CareCircleView } from './components/CareCircleView';
import { MedicalIdView } from './components/MedicalIdView';
import { SOSModal } from './components/SOSModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AuthModal } from './components/AuthModal';
import {
  HeartPulse,
  Pill,
  Calendar,
  Activity,
  Users,
  ShieldAlert,
  Mic,
  FileText
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    openSOS,
    openVoiceAssistant
  } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'elderly') return <SeniorDashboard />;
        if (currentUser.role === 'family') return <FamilyDashboard />;
        if (currentUser.role === 'caregiver') return <CaregiverDashboard />;
        return <SeniorDashboard />;
      case 'medications':
        return <MedicationManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'vitals':
        return <HealthVitalsView />;
      case 'care_circle':
        return <CareCircleView />;
      case 'medical_id':
        return <MedicalIdView />;
      default:
        return <SeniorDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      {/* Demo Prototype Status Banner */}
      <DemoBanner />

      {/* Main Healthcare Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 lg:pb-12">
        {renderContent()}
      </main>

      {/* Mobile Sticky Action Dock for Senior Accessibility */}
      <aside aria-label="Mobile Navigation Dock" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-lg border-t border-navy-750 px-3 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[11px] font-bold ${
            activeTab === 'dashboard' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <HeartPulse className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[11px] font-bold ${
            activeTab === 'medications' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span>Pills</span>
        </button>

        {/* SOS Center Floating Button */}
        <button
          onClick={openSOS}
          className="flex flex-col items-center justify-center w-12 h-12 -mt-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-glow-red border border-rose-400/50 active:scale-95 transition-transform"
          title="Emergency SOS"
        >
          <ShieldAlert className="w-6 h-6" />
        </button>

        <button
          onClick={openVoiceAssistant}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-[11px] font-bold text-cyan-400"
          title="Voice Assistant"
        >
          <Mic className="w-5 h-5 animate-pulse" />
          <span>Voice</span>
        </button>

        <button
          onClick={() => setActiveTab('care_circle')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[11px] font-bold ${
            activeTab === 'care_circle' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Care</span>
        </button>
      </aside>

      {/* Floating System Modals */}
      <SOSModal />
      <VoiceAssistantModal />
      <AuthModal />
    </div>
  );
};

export default App;
