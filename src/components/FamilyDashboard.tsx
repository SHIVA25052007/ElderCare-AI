import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Pill,
  Calendar,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const FamilyDashboard: React.FC = () => {
  const {
    seniorProfile,
    medications,
    medicationLogs,
    todayLogs,
    careNotes,
    addCareNote,
    requestRefill,
    appointments,
    vitals,
    currentUser,
    setActiveTab,
    openSOS
  } = useApp();

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'general' | 'mood' | 'nutrition' | 'activity'>('general');
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Dynamic adherence calculation from actual medication logs
  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const missedCount = todayLogs.filter(l => l.status === 'missed').length;
  const totalScheduled = todayLogs.length;

  // Calculate actual compliance: ratio of taken to all resolved (taken + missed) doses
  // Safe handling for empty logs and zero scheduled doses
  const resolvedLogs = medicationLogs.filter(l => l.status === 'taken' || l.status === 'missed');
  const adherenceRate = resolvedLogs.length > 0
    ? Math.round((resolvedLogs.filter(l => l.status === 'taken').length / resolvedLogs.length) * 100)
    : (medicationLogs.length > 0
        ? Math.round((medicationLogs.filter(l => l.status === 'taken').length / medicationLogs.length) * 100)
        : 100);

  // Low stock medications
  const lowStockMeds = medications.filter(m => m.remainingQuantity <= m.refillThreshold);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    addCareNote({
      authorName: currentUser.name,
      authorRole: currentUser.relationshipToSenior || 'Family Member',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      priority: 'normal'
    });

    setNoteTitle('');
    setNoteContent('');
    setShowNoteForm(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Family Peace-of-Mind Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Family Portal • Authorized Health Proxy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Monitoring {seniorProfile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
              Real-time remote monitoring, medication compliance tracking, and direct care coordination with Nurse David Miller and attending physicians.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('care_circle')}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Care Circle Contacts</span>
            </button>
            <button
              onClick={openSOS}
              className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-navy-800">
          <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>7-Day Adherence</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {adherenceRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Target &gt; 85% (Excellent)</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Today's Doses</span>
              <Pill className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {takenCount} <span className="text-sm font-normal text-slate-400">/ {totalScheduled}</span>
            </div>
            <p className="text-[11px] text-teal-400 mt-1">
              {todayLogs.filter(l => l.status === 'pending').length} pending doses today
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Latest BP Reading</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {vitals[0]?.systolic}/{vitals[0]?.diastolic}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">Pulse {vitals[0]?.heartRate} bpm • Normal</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Refills Needed</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${lowStockMeds.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {lowStockMeds.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {lowStockMeds.length > 0 ? `${lowStockMeds[0].name} is low` : 'All prescriptions stocked'}
            </p>
          </div>
        </div>
      </div>

      {/* REFILL ALERT BANNER (If any low stock) */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Low Medication Alert: {lowStockMeds.map(m => `${m.name} (${m.remainingQuantity} pills left)`).join(', ')}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Prescribed by {lowStockMeds[0].prescribingDoctor}. Threshold of {lowStockMeds[0].refillThreshold} reached.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              requestRefill(lowStockMeds[0].id);
              alert(`Refill request queued for ${lowStockMeds[0].name}! Notification sent to pharmacy.`);
            }}
            disabled={lowStockMeds[0].refillRequested}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              lowStockMeds[0].refillRequested
                ? 'bg-navy-800 text-teal-400 border border-teal-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-navy-950 shadow-md'
            }`}
          >
            {lowStockMeds[0].refillRequested ? '✓ Refill Queued' : 'Request Pharmacy Refill'}
          </button>
        </div>
      )}

      {/* TWO COLUMNS: LIVE ACTIVITY LOG & FAMILY CARE NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time Senior Activity Feed */}
        <div className="p-6 rounded-3xl bg-navy-900 border border-navy-750 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Live Medication Activity Log</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Today's Schedule</span>
            </div>

            <div className="space-y-3">
              {todayLogs.map((log) => {
                const isTaken = log.status === 'taken';
                const isMissed = log.status === 'missed';

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between text-xs transition-colors ${
                      isTaken
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : isMissed
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-navy-850 border-navy-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{log.medicationName}</div>
                      <div className="text-slate-400 mt-0.5">
                        Time: {log.scheduledTime} ({log.timeOfDay})
                      </div>
                      {log.notes && (
                        <div className="text-teal-300 text-[11px] mt-1 italic">
                          "{log.notes}"
                        </div>
                      )}
                      {log.recordedAt && (
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          Logged by {log.recordedBy} at {new Date(log.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isTaken && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </span>
                      )}
                      {isMissed && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center gap-1 border border-amber-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missed
                        </span>
                      )}
                      {log.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-navy-800 text-slate-400 font-medium text-[11px] border border-navy-700">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-800 text-right">
            <button
              onClick={() => setActiveTab('medications')}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
            >
              <span>Manage Prescriptions</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Care Notes & Shift Handover Diary */}
        <div className="p-6 rounded-3xl bg-navy-900 border border-navy-750 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Family & Caregiver Diary</h3>
              </div>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-navy-950 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Note Submission Form */}
            {showNoteForm && (
              <form onSubmit={handleAddNote} className="mb-4 p-4 rounded-2xl bg-navy-850 border border-navy-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">New Family Check-In Note</span>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="bg-navy-900 text-xs text-slate-300 rounded px-2 py-1 border border-navy-700"
                  >
                    <option value="general">General</option>
                    <option value="nutrition">Nutrition & Meals</option>
                    <option value="activity">Mobility / Walk</option>
                    <option value="mood">Mood & Social</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Note Title (e.g. Afternoon Garden Walk, Brought Groceries)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />

                <textarea
                  placeholder="Details regarding Margaret's day, meals, symptoms, or caregiver instructions..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-navy-950 font-bold text-xs"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {careNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{note.title}</h4>
                    <span className="text-[10px] text-slate-400">{note.date} at {note.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-navy-800">
                    <span>By: <strong className="text-teal-300">{note.authorName}</strong> ({note.authorRole})</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-navy-800 text-[10px] text-slate-300">
                      {note.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
