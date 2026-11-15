import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Heart,
  Pill,
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { VitalSign } from '../types';

export const CaregiverDashboard: React.FC = () => {
  const {
    seniorProfile,
    medications,
    todayLogs,
    recordDose,
    vitals,
    addVital,
    addCareNote,
    currentUser,
    setActiveTab,
    openSOS
  } = useApp();

  const [showVitalModal, setShowVitalModal] = useState(false);
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [glucose, setGlucose] = useState<number>(105);
  const [glucoseContext, setGlucoseContext] = useState<'Fasting' | 'Post-Meal' | 'Bedtime' | 'Random'>('Fasting');
  const [spO2, setSpO2] = useState<number>(98);
  const [temp, setTemp] = useState<number>(98.6);
  const [weight, setWeight] = useState<number>(146);
  const [vitalNotes, setVitalNotes] = useState<string>('');

  const [showShiftNoteModal, setShowShiftNoteModal] = useState(false);
  const [shiftNoteTitle, setShiftNoteTitle] = useState('');
  const [shiftNoteContent, setShiftNoteContent] = useState('');

  const latestVital = vitals[0];

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    addVital({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      bloodGlucose: Number(glucose),
      glucoseContext,
      oxygenSaturation: Number(spO2),
      temperature: Number(temp),
      weight: Number(weight),
      recordedBy: `${currentUser.name} (${currentUser.title || 'Nurse'})`,
      notes: vitalNotes
    });

    setShowVitalModal(false);
    setVitalNotes('');
  };

  const handleSaveShiftNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftNoteTitle || !shiftNoteContent) return;

    addCareNote({
      authorName: currentUser.name,
      authorRole: currentUser.title || 'Caregiver',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: shiftNoteTitle,
      content: shiftNoteContent,
      category: 'clinical',
      priority: 'normal'
    });

    setShiftNoteTitle('');
    setShiftNoteContent('');
    setShowShiftNoteModal(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Clinical Caregiver Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-blue-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <span>Clinical Caregiver Console • {currentUser.title || 'RN Nurse'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Patient Care: {seniorProfile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Age {seniorProfile.age} • Blood Type: {seniorProfile.bloodType} • Primary: {seniorProfile.primaryDoctor.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowVitalModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-navy-950 font-extrabold text-xs flex items-center gap-2 shadow-glow-teal transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Vitals</span>
            </button>
            <button
              onClick={() => setShowShiftNoteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Shift Note</span>
            </button>
            <button
              onClick={openSOS}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
            >
              SOS Dispatch
            </button>
          </div>
        </div>

        {/* Clinical Vitals Quick Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-navy-800">
          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Blood Pressure</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {latestVital ? `${latestVital.systolic}/${latestVital.diastolic}` : '120/80'}
              <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
            </div>
            <p className="text-[10px] text-teal-400 mt-0.5">Normotensive Target</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Heart Rate</span>
              <Heart className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {latestVital ? latestVital.heartRate : 72}
              <span className="text-xs font-normal text-slate-400 ml-1">bpm</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Regular rhythm</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Blood Glucose</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {latestVital?.bloodGlucose || 104}
              <span className="text-xs font-normal text-slate-400 ml-1">mg/dL</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-0.5">{latestVital?.glucoseContext || 'Fasting'} (Well controlled)</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-750">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Oxygen (SpO2)</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {latestVital?.oxygenSaturation || 98}%
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Ambient room air</p>
          </div>
        </div>
      </div>

      {/* MEDICATION ADMINISTRATION ROSTER */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-bold text-white">Medication Administration Record (MAR)</h3>
          </div>
          <span className="text-xs text-slate-400">Today's Scheduled Rounds</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Scheduled</th>
                <th className="pb-3 font-bold">Medication & Dosage</th>
                <th className="pb-3 font-bold">Pill Details</th>
                <th className="pb-3 font-bold">Instructions</th>
                <th className="pb-3 font-bold">Current Status</th>
                <th className="pb-3 font-bold text-right">Nurse Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {todayLogs.map((log) => {
                const med = medications.find(m => m.id === log.medicationId);
                const isTaken = log.status === 'taken';

                return (
                  <tr key={log.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-200">
                      {log.scheduledTime} ({log.timeOfDay})
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-white text-sm">{log.medicationName}</div>
                      <div className="text-slate-400 text-[11px]">{med?.prescribingDoctor}</div>
                    </td>
                    <td className="py-3 text-slate-300">
                      {med?.pillColor} {med?.pillShape}
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs">
                      {med?.instructions || 'Standard oral administration'}
                    </td>
                    <td className="py-3">
                      {isTaken ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                          ✓ Administered
                        </span>
                      ) : log.status === 'missed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                          Missed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-navy-800 text-slate-400 font-medium text-[11px] border border-navy-700">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isTaken && (
                          <button
                            onClick={() => recordDose(log.id, 'taken')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                          >
                            Administer
                          </button>
                        )}
                        {log.status === 'pending' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for missed dose:');
                              if (reason) recordDose(log.id, 'missed', reason);
                            }}
                            className="px-2 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-400 hover:text-amber-400 text-xs border border-navy-700 transition-colors"
                          >
                            Mark Missed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LOG VITALS */}
      {showVitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-navy-900 border border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" />
                <span>Log Clinical Vital Signs</span>
              </h3>
              <button
                onClick={() => setShowVitalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    value={spO2}
                    onChange={(e) => setSpO2(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Glucose Context</label>
                  <select
                    value={glucoseContext}
                    onChange={(e) => setGlucoseContext(e.target.value as any)}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                  >
                    <option value="Fasting">Fasting</option>
                    <option value="Post-Meal">Post-Meal</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="Random">Random</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Clinical Observation Notes</label>
                <textarea
                  value={vitalNotes}
                  onChange={(e) => setVitalNotes(e.target.value)}
                  placeholder="Patient posture, pain score, mobility observation..."
                  rows={2}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVitalModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-navy-950 font-bold rounded-xl"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHIFT NOTE */}
      {showShiftNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-navy-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Submit Clinical Shift Note</span>
              </h3>
              <button
                onClick={() => setShowShiftNoteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShiftNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Note Title</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Shift Handover, Wound & Mobility Review"
                  value={shiftNoteTitle}
                  onChange={(e) => setShiftNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Clinical Details</label>
                <textarea
                  placeholder="Clinical assessment, patient responsiveness, hydration, therapy progress..."
                  value={shiftNoteContent}
                  onChange={(e) => setShiftNoteContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShiftNoteModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Publish Shift Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
