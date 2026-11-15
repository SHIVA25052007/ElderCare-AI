import React, { useState, useRef, useEffect } from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import {
  HeartPulse,
  Pill,
  Calendar,
  Activity,
  Users,
  ShieldAlert,
  Mic,
  Bell,
  Volume2,
  VolumeX,
  Type,
  Eye,
  LogOut,
  ChevronDown,
  UserCheck,
  FileText
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    accessibility,
    setFontSize,
    toggleHighContrast,
    toggleSound,
    openSOS,
    openVoiceAssistant,
    openAuthModal,
    unreadNotificationCount,
    switchRole
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <HeartPulse className="w-5 h-5 text-teal-400" /> },
    { id: 'medications', label: 'Medications', icon: <Pill className="w-5 h-5 text-cyan-400" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5 text-blue-400" /> },
    { id: 'vitals', label: 'Vitals & Health', icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { id: 'care_circle', label: 'Care Circle', icon: <Users className="w-5 h-5 text-purple-400" /> },
    { id: 'medical_id', label: 'Medical ID', icon: <FileText className="w-5 h-5 text-amber-400" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-750 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-glow-teal group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-navy-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                    ELDER<span className="text-teal-400">CARE</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                  Safe Elderly Care & Medication System
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-navy-800 text-teal-300 shadow-sm border border-teal-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Accessibility + Voice + SOS + Notifications + User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Senior Accessibility Controls Toolbar */}
            <div className="flex items-center bg-navy-850 border border-navy-750 rounded-lg p-1">
              {/* Font Size Toggle */}
              <div className="flex items-center">
                <button
                  onClick={() => {
                    const next = accessibility.fontSize === 'normal' ? 'large' : accessibility.fontSize === 'large' ? 'xlarge' : 'normal';
                    setFontSize(next);
                  }}
                  className="px-2 py-1.5 text-xs font-bold text-slate-300 hover:text-teal-300 rounded hover:bg-navy-750 transition-colors flex items-center gap-1"
                  title={`Current font size: ${accessibility.fontSize}. Click to change.`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono uppercase">
                    {accessibility.fontSize === 'normal' ? 'A' : accessibility.fontSize === 'large' ? 'A+' : 'A++'}
                  </span>
                </button>
              </div>

              {/* High Contrast Mode */}
              <button
                onClick={toggleHighContrast}
                className={`p-1.5 rounded transition-colors ${
                  accessibility.highContrast ? 'text-teal-300 bg-teal-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle High Contrast Mode"
                aria-label="Toggle High Contrast Mode"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Sound Cues Toggle */}
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded transition-colors ${
                  accessibility.soundEnabled ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={accessibility.soundEnabled ? 'Sound cues enabled' : 'Sound cues muted'}
                aria-label="Toggle Sound Cues"
              >
                {accessibility.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Voice Assistant Trigger */}
            <button
              onClick={openVoiceAssistant}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-navy-950 font-bold rounded-lg shadow-glow-teal hover:scale-105 active:scale-95 transition-all"
              title="Open Voice Assistant (Speech AI)"
              aria-label="Open Voice Assistant"
            >
              <Mic className="w-5 h-5 text-navy-950 animate-pulse" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider font-extrabold">Voice</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={openSOS}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg shadow-glow-red hover:scale-105 active:scale-95 transition-all border border-rose-400/50"
              title="Emergency SOS Protocol"
              aria-label="Trigger Emergency SOS"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <ShieldAlert className="w-5 h-5" />
              <span className="text-sm font-black tracking-wider uppercase">SOS</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-750 transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-navy-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-navy-900 shadow">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
              )}
            </div>

            {/* Role & Profile Switcher Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-750 transition-colors"
                aria-label="User Account Menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-teal-500/50"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {currentUser.role === 'elderly' ? 'Senior Mode' : currentUser.role === 'family' ? 'Family Monitor' : 'Clinical Care'}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-navy-900 border border-navy-750 rounded-xl shadow-2xl p-2 z-50">
                  <div className="p-3 border-b border-navy-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-teal-400 font-medium">{currentUser.email}</p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">{currentUser.title || currentUser.relationshipToSenior}</p>
                  </div>

                  <div className="p-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                      Switch Role View
                    </p>
                    
                    <button
                      onClick={() => {
                        switchRole('elderly');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentUser.role === 'elderly' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-300 hover:bg-navy-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-400" />
                        <span>Elderly User (Margaret Vance)</span>
                      </div>
                      {currentUser.role === 'elderly' && <span className="text-teal-400 text-xs">●</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchRole('family');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentUser.role === 'family' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-navy-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>Family Member (Sarah Vance)</span>
                      </div>
                      {currentUser.role === 'family' && <span className="text-cyan-400 text-xs">●</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchRole('caregiver');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentUser.role === 'caregiver' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-navy-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span>Caregiver (David Miller RN)</span>
                      </div>
                      {currentUser.role === 'caregiver' && <span className="text-blue-400 text-xs">●</span>}
                    </button>
                  </div>

                  <div className="border-t border-navy-800 pt-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Switch Credentials / Demo Login</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-2 border-t border-navy-800 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-navy-800 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
