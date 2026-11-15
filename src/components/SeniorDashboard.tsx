import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Pill,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldAlert,
  Mic,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Sparkles,
  PhoneCall,
  Video,
  ChevronRight,
  Info
} from 'lucide-react';
import { TimeOfDay } from '../types';

export const SeniorDashboard: React.FC = () => {
  const {
    seniorProfile,
    todayLogs,
    recordDose,
    appointments,
    openSOS,
    openVoiceAssistant,
    setActiveTab,
    addCareNote,
    medications
  } = useApp();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(false);

  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const totalCount = todayLogs.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  const timeBuckets: { label: TimeOfDay; title: string; icon: string }[] = [
    { label: 'Morning', title: 'Morning Pills (Breakfast)', icon: '🌅' },
    { label: 'Afternoon', title: 'Afternoon Pills (Lunch)', icon: '☀️' },
    { label: 'Evening', title: 'Evening Pills (Dinner)', icon: '🌆' },
    { label: 'Night', title: 'Night Pills (Bedtime)', icon: '🌙' },
  ];

  const nextAppointment = appointments
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const handleMoodCheckin = (mood: string) => {
    setSelectedMood(mood);
    setMoodSubmitted(true);
    addCareNote({
      authorName: seniorProfile.preferredName,
      authorRole: 'Senior (Self-Report)',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Daily Mood Check-in: ${mood}`,
      content: `${seniorProfile.preferredName} reported feeling "${mood}" today via the daily check-in prompt.`,
      category: 'mood',
      priority: mood === 'In Pain / Unwell' ? 'important' : 'normal'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Friendly Senior Greeting Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-teal-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Good Morning, {seniorProfile.preferredName}!</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Here is your health plan for today
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-xl">
              You've taken <strong>{takenCount} of {totalCount}</strong> scheduled doses. 
              {takenCount === totalCount ? ' All done for today! Excellent job.' : ' Follow the schedule below with your meals.'}
            </p>
          </div>

          {/* Quick Voice & SOS Triggers */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={openVoiceAssistant}
              className="flex-1 sm:flex-none px-6 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 font-black text-base shadow-glow-teal transition-all flex items-center justify-center gap-2.5 active:scale-95"
            >
              <Mic className="w-6 h-6 text-navy-950" />
              <span>Ask Voice AI</span>
            </button>

            <button
              onClick={openSOS}
              className="flex-1 sm:flex-none px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-glow-red transition-all flex items-center justify-center gap-2.5 active:scale-95 border border-rose-400/40"
            >
              <ShieldAlert className="w-6 h-6" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-navy-800">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300">Today's Medication Completion</span>
            <span className="text-teal-300 font-extrabold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-3.5 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* TODAY'S ACCESSIBLE PILL BOX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Pill className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Today's Pill Box</h2>
              <p className="text-xs text-slate-400">Tap Taken as soon as you swallow each pill</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('medications')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>All Prescriptions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timeBuckets.map((bucket) => {
            const bucketLogs = todayLogs.filter(l => l.timeOfDay === bucket.label);
            if (bucketLogs.length === 0) return null;

            return (
              <div
                key={bucket.label}
                className="rounded-3xl bg-navy-900 border border-navy-750 p-5 sm:p-6 shadow-md hover:border-teal-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{bucket.icon}</span>
                      <h3 className="text-lg font-extrabold text-white">{bucket.title}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 border border-navy-700">
                      {bucketLogs.filter(l => l.status === 'taken').length}/{bucketLogs.length} Taken
                    </span>
                  </div>

                  <div className="space-y-3">
                    {bucketLogs.map((log) => {
                      const medDetails = medications.find(m => m.id === log.medicationId);
                      const isTaken = log.status === 'taken';
                      const isMissed = log.status === 'missed';

                      return (
                        <div
                          key={log.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isTaken
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                              : isMissed
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-navy-850 border-navy-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-base text-white">
                                  {log.medicationName}
                                </span>
                                {medDetails?.pillColor && (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-navy-750 text-slate-300 border border-navy-700">
                                    {medDetails.pillColor} {medDetails.pillShape}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Scheduled at <strong>{log.scheduledTime}</strong></span>
                                {medDetails?.foodRequirement && (
                                  <span className="text-teal-300 font-medium">• {medDetails.foodRequirement}</span>
                                )}
                              </p>

                              {medDetails?.instructions && (
                                <p className="text-xs text-slate-400 mt-1 italic">
                                  "{medDetails.instructions}"
                                </p>
                              )}

                              {isTaken && (
                                <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Taken at {new Date(log.recordedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                              )}

                              {isMissed && (
                                <p className="text-xs text-amber-400 font-bold mt-2 flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Marked as missed</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Big Accessible Action Buttons for Senior */}
                          {!isTaken && (
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-navy-750">
                              <button
                                onClick={() => recordDose(log.id, 'taken')}
                                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                              >
                                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                                <span>TAKE PILL</span>
                              </button>

                              <button
                                onClick={() => {
                                  const reason = prompt('Reason for skipping dose (optional):', 'Feeling nauseous');
                                  recordDose(log.id, 'missed', reason || undefined);
                                }}
                                className="py-3 px-4 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-400 hover:text-amber-300 font-bold text-xs sm:text-sm border border-navy-700 transition-colors"
                              >
                                Missed / Skip
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK MOOD & HOW ARE YOU FEELING CHECK-IN */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>How are you feeling right now, {seniorProfile.preferredName}?</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Your answer is saved to your care log so your family and nurse know you are doing well.
        </p>

        {moodSubmitted ? (
          <div className="mt-4 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <span>Thank you! Your check-in "{selectedMood}" was shared with Sarah and Nurse David.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Feeling Great 😊', desc: 'Energetic & comfortable' },
              { label: 'Feeling Good 🙂', desc: 'Doing fine today' },
              { label: 'A Bit Tired 🥱', desc: 'Resting today' },
              { label: 'In Pain / Unwell 🩺', desc: 'Need check-in' }
            ].map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodCheckin(m.label)}
                className="p-4 rounded-2xl bg-navy-850 hover:bg-navy-800 border border-navy-700 hover:border-teal-500/40 text-left transition-all active:scale-95 group"
              >
                <div className="font-extrabold text-sm text-white group-hover:text-teal-300">
                  {m.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING DOCTOR APPOINTMENT PREVIEW */}
      {nextAppointment && (
        <div className="p-6 rounded-3xl bg-navy-900 border border-navy-750 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30 shrink-0">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Next Medical Appointment
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {nextAppointment.doctorName} • {nextAppointment.specialty}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Date: <strong>{nextAppointment.date}</strong> at <strong>{nextAppointment.time}</strong> ({nextAppointment.clinicName})
              </p>
              {nextAppointment.companionName && (
                <p className="text-xs text-teal-400 font-medium mt-0.5">
                  Companion: {nextAppointment.companionName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {nextAppointment.type === 'telehealth' ? (
              <a
                href={nextAppointment.locationOrUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Join Telehealth Call</span>
              </a>
            ) : (
              <button
                onClick={() => setActiveTab('appointments')}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>View Details</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
