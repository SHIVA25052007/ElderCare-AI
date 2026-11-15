import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Heart,
  Droplets,
  Plus,
  Calendar,
  Clock,
  Printer,
  FileText,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const HealthVitalsView: React.FC = () => {
  const {
    vitals,
    addVital,
    seniorProfile,
    medications,
    currentUser
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [systolic, setSystolic] = useState<number>(122);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [glucose, setGlucose] = useState<number>(104);
  const [glucoseContext, setGlucoseContext] = useState<'Fasting' | 'Post-Meal' | 'Bedtime' | 'Random'>('Fasting');
  const [spO2, setSpO2] = useState<number>(98);
  const [temp, setTemp] = useState<number>(98.4);
  const [weight, setWeight] = useState<number>(146);
  const [notes, setNotes] = useState('');

  const latest = vitals[0];

  const handleSaveVital = (e: React.FormEvent) => {
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
      recordedBy: currentUser.name,
      notes
    });

    setShowModal(false);
    setNotes('');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Biometrics & Clinical Readings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Health Vitals Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Blood pressure, blood glucose, oxygen saturation (SpO2), heart rate, and physician summary export.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handlePrintSummary}
            className="px-4 py-2.5 rounded-2xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-750 font-bold text-xs flex items-center gap-2 transition-colors"
            title="Print or save as PDF for doctor visit"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Print Clinical Summary</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record New Vitals</span>
          </button>
        </div>
      </div>

      {/* 4 Cards: Vitals Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Blood Pressure</span>
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <Activity className="w-4 h-4 text-rose-400" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? `${latest.systolic}/${latest.diastolic}` : '120/80'}
            <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal (&lt; 130/85 mmHg)</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Resting Heart Rate</span>
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
              <Heart className="w-4 h-4 text-teal-400" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? latest.heartRate : 72}
            <span className="text-xs font-normal text-slate-400 ml-1">bpm</span>
          </div>
          <div className="text-xs text-teal-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal sinus rhythm (60-100)</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Blood Glucose</span>
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Droplets className="w-4 h-4 text-cyan-400" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {latest?.bloodGlucose || 104}
            <span className="text-xs font-normal text-slate-400 ml-1">mg/dL</span>
          </div>
          <div className="text-xs text-cyan-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{latest?.glucoseContext || 'Fasting'} target</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Blood Oxygen (SpO2)</span>
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <Activity className="w-4 h-4 text-blue-400" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {latest?.oxygenSaturation || 98}%
          </div>
          <div className="text-xs text-blue-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal (&gt; 95%)</span>
          </div>
        </div>
      </div>

      {/* Vitals History Log Table */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-navy-750 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Historical Vitals Record</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{vitals.length} logs recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Date & Time</th>
                <th className="pb-3 font-bold">BP (mmHg)</th>
                <th className="pb-3 font-bold">Pulse</th>
                <th className="pb-3 font-bold">Glucose</th>
                <th className="pb-3 font-bold">SpO2</th>
                <th className="pb-3 font-bold">Weight</th>
                <th className="pb-3 font-bold">Recorded By</th>
                <th className="pb-3 font-bold">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {vitals.map((v) => (
                <tr key={v.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3 font-bold text-white font-mono whitespace-nowrap">
                    {v.date} <span className="text-slate-400 text-[11px] font-normal">{v.time}</span>
                  </td>
                  <td className="py-3 font-bold text-slate-200">
                    <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-750">
                      {v.systolic}/{v.diastolic}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">
                    {v.heartRate} bpm
                  </td>
                  <td className="py-3 text-cyan-300">
                    {v.bloodGlucose ? `${v.bloodGlucose} mg/dL (${v.glucoseContext || 'Fasting'})` : '—'}
                  </td>
                  <td className="py-3 text-slate-300">
                    {v.oxygenSaturation}%
                  </td>
                  <td className="py-3 text-slate-300">
                    {v.weight ? `${v.weight} lbs` : '—'}
                  </td>
                  <td className="py-3 text-teal-300 font-medium">
                    {v.recordedBy}
                  </td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">
                    {v.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: RECORD VITALS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Log Patient Vitals</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
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
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={spO2}
                    onChange={(e) => setSpO2(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
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
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Context</label>
                  <select
                    value={glucoseContext}
                    onChange={(e) => setGlucoseContext(e.target.value as any)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  >
                    <option value="Fasting">Fasting</option>
                    <option value="Post-Meal">Post-Meal</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="Random">Random</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Body Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Patient seated comfortably 5 minutes before reading."
                  rows={2}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
