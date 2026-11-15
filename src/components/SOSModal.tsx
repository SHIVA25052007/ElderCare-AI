import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Phone,
  MapPin,
  AlertTriangle,
  X,
  CheckCircle2,
  Heart,
  Volume2,
  UserCheck,
  FileText
} from 'lucide-react';
import { audioService } from '../services/audioService';

export const SOSModal: React.FC = () => {
  const {
    isSOSOpen,
    closeSOS,
    activeSOSIncident,
    triggerSOS,
    resolveSOS,
    seniorProfile,
    emergencyContacts
  } = useApp();

  const [countdown, setCountdown] = useState<number>(5);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [resolutionNote, setResolutionNote] = useState<string>('Assistance received, situation stable.');
  const [showResolveForm, setShowResolveForm] = useState<boolean>(false);

  // When modal opens, start 5-second countdown if not already triggered
  useEffect(() => {
    if (isSOSOpen && !activeSOSIncident) {
      setCountdown(5);
      setIsCountingDown(true);
      setShowResolveForm(false);
    } else if (activeSOSIncident) {
      setIsCountingDown(false);
    }
  }, [isSOSOpen, activeSOSIncident]);

  // Countdown timer effect
  useEffect(() => {
    if (!isSOSOpen || !isCountingDown) return;

    if (countdown > 0) {
      audioService.playCountdownTick(1 + (5 - countdown) * 0.15);
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsCountingDown(false);
      triggerSOS();
    }
  }, [countdown, isCountingDown, isSOSOpen, triggerSOS]);

  if (!isSOSOpen) return null;

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    closeSOS();
  };

  const handleImmediateTrigger = () => {
    setIsCountingDown(false);
    triggerSOS();
  };

  const handleResolveIncident = () => {
    if (activeSOSIncident) {
      resolveSOS(activeSOSIncident.id, resolutionNote);
    }
    closeSOS();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-navy-900 border-2 border-rose-500 rounded-3xl shadow-glow-red overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-navy-900 p-5 sm:p-6 border-b border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                EMERGENCY SOS SYSTEM
              </h2>
              <p className="text-xs sm:text-sm text-rose-200 font-medium">
                Rapid Caregiver & Emergency Responder Protocol
              </p>
            </div>
          </div>
          
          <button
            onClick={closeSOS}
            className="p-2 text-rose-300 hover:text-white rounded-xl hover:bg-rose-800/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          
          {/* STAGE 1: COUNTDOWN SAFETY SCREEN */}
          {isCountingDown && (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-rose-600/20 border-4 border-rose-500 text-rose-400 font-black text-6xl shadow-glow-red animate-pulse">
                {countdown}
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  Broadcasting Emergency Alert in {countdown} seconds...
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  If this was pressed by mistake, tap Cancel below. Otherwise, alert notifications will be dispatched to all configured emergency contacts.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleCancelCountdown}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg transition-all shadow-md active:scale-95"
                >
                  CANCEL (I AM OKAY)
                </button>
                <button
                  onClick={handleImmediateTrigger}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg transition-all shadow-glow-red active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-5 h-5" />
                  SEND NOW (SKIP WAIT)
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: ACTIVE SOS INCIDENT SCREEN */}
          {!isCountingDown && activeSOSIncident && (
            <div className="space-y-6">
              
              {/* Important Simulation Disclaimer Banner */}
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-rose-200">
                  <strong className="text-white block font-bold text-sm mb-0.5">
                    SIMULATED EMERGENCY DISPATCH ACTIVE (Incident #{activeSOSIncident.id})
                  </strong>
                  This is a hackathon prototype demonstration. Local notifications and contact logs have been simulated. 
                  In a real life-threatening emergency, <strong>always call 911 or 112 directly.</strong>
                </div>
              </div>

              {/* Senior Location & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-navy-800/80 border border-navy-750 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Senior Location</div>
                    <div className="text-sm font-bold text-white mt-0.5">{seniorProfile.address}</div>
                    <div className="text-[11px] text-teal-400 font-mono mt-1">
                      GPS: {activeSOSIncident.location.lat.toFixed(4)}° N, {Math.abs(activeSOSIncident.location.lng).toFixed(4)}° W
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-navy-800/80 border border-navy-750 flex items-start gap-3">
                  <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Patient Profile</div>
                    <div className="text-sm font-bold text-white mt-0.5">{seniorProfile.fullName} ({seniorProfile.age} yo)</div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Hospital: {seniorProfile.preferredHospital.split('(')[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts Contacted Feed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span>Emergency Care Circle Alert Status</span>
                  <span className="text-teal-400 font-normal normal-case">Simulated Dispatch Feed</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {emergencyContacts.map((contact, idx) => (
                    <div
                      key={contact.id}
                      className="p-3 rounded-xl bg-navy-850 border border-navy-750 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{contact.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({contact.relationship})</span>
                          </div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {contact.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-teal-300 bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/30 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Alert Queued</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Medical ID Card for First Responders */}
              <div className="p-4 rounded-2xl bg-navy-850 border border-teal-500/30 space-y-3">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Paramedic & First Responder Quick Card</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750">
                    <span className="text-slate-400 block text-[10px]">Blood Group</span>
                    <strong className="text-white text-sm">{seniorProfile.bloodType}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750">
                    <span className="text-slate-400 block text-[10px]">DNR Order</span>
                    <strong className="text-emerald-400 text-sm">Full Code (No DNR)</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 col-span-2">
                    <span className="text-slate-400 block text-[10px]">Critical Allergies</span>
                    <strong className="text-rose-300 text-xs">{seniorProfile.allergies.join(', ')}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-navy-900/60 p-2.5 rounded-lg border border-navy-750">
                  <strong className="text-slate-200">Conditions: </strong>
                  {seniorProfile.chronicConditions.join(' • ')}
                </div>
              </div>

              {/* Resolution / Stand Down Options */}
              {!showResolveForm ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowResolveForm(true)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-navy-950 font-extrabold text-sm transition-all shadow-glow-teal flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-navy-950" />
                    <span>Resolve / Stand Down SOS</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-navy-800 border border-navy-700 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Incident Resolution Note (Logged to audit trail)
                  </label>
                  <input
                    type="text"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="e.g., Caregiver arrived, false alarm, assisted to bed"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-xs focus:border-teal-400 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowResolveForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResolveIncident}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-navy-950 font-bold text-xs"
                    >
                      Confirm Resolution
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
