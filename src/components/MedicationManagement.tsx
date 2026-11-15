import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Medication, TimeOfDay, DoseStatus } from '../types';
import {
  Pill,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const MedicationManagement: React.FC = () => {
  const {
    medications,
    todayLogs,
    addMedication,
    updateMedication,
    deleteMedication,
    recordDose,
    requestRefill
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTime, setFilterTime] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay[]>(['Morning']);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [instructions, setInstructions] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('Dr. Robert Hayes, MD');
  const [pillColor, setPillColor] = useState('White');
  const [pillShape, setPillShape] = useState('Round tablet');
  const [totalQuantity, setTotalQuantity] = useState(60);
  const [remainingQuantity, setRemainingQuantity] = useState(60);
  const [refillThreshold, setRefillThreshold] = useState(14);
  const [foodRequirement, setFoodRequirement] = useState<'Take with food' | 'Take before meal' | 'Take on empty stomach' | 'No food restrictions'>('Take with food');

  const openAddModal = () => {
    setEditingMedId(null);
    setName('');
    setGenericName('');
    setDosage('');
    setFrequency('Once daily');
    setTimeOfDay(['Morning']);
    setScheduleTime('08:00');
    setInstructions('Take with a full glass of water.');
    setPrescribingDoctor('Dr. Robert Hayes, MD');
    setPillColor('White');
    setPillShape('Round tablet');
    setTotalQuantity(60);
    setRemainingQuantity(60);
    setRefillThreshold(14);
    setFoodRequirement('Take with food');
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMedId(med.id);
    setName(med.name);
    setGenericName(med.genericName || '');
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setTimeOfDay(med.timeOfDay);
    setScheduleTime(med.scheduleTimes[0] || '08:00');
    setInstructions(med.instructions);
    setPrescribingDoctor(med.prescribingDoctor);
    setPillColor(med.pillColor);
    setPillShape(med.pillShape);
    setTotalQuantity(med.totalQuantity);
    setRemainingQuantity(med.remainingQuantity);
    setRefillThreshold(med.refillThreshold);
    setFoodRequirement(med.foodRequirement || 'No food restrictions');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    if (editingMedId) {
      updateMedication(editingMedId, {
        name,
        genericName,
        dosage,
        frequency,
        timeOfDay,
        scheduleTimes: [scheduleTime],
        instructions,
        prescribingDoctor,
        pillColor,
        pillShape,
        totalQuantity: Number(totalQuantity),
        remainingQuantity: Number(remainingQuantity),
        refillThreshold: Number(refillThreshold),
        foodRequirement
      });
    } else {
      addMedication({
        name,
        genericName,
        dosage,
        frequency,
        timeOfDay,
        scheduleTimes: [scheduleTime],
        instructions,
        prescribingDoctor,
        pillColor,
        pillShape,
        totalQuantity: Number(totalQuantity),
        remainingQuantity: Number(remainingQuantity),
        refillThreshold: Number(refillThreshold),
        refillRequested: false,
        status: 'active',
        foodRequirement
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, medName: string) => {
    if (window.confirm(`Are you sure you want to discontinue and remove ${medName}?`)) {
      deleteMedication(id);
    }
  };

  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.prescribingDoctor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterTime === 'all' || m.timeOfDay.includes(filterTime as TimeOfDay);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Pill className="w-4 h-4" />
            <span>Medication Administration & Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Prescription Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full medication CRUD, daily schedules, dose tracking, and automatic refill threshold warnings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-glow-teal flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search medications by name, generic, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'Morning', 'Afternoon', 'Evening', 'Night', 'As Needed'].map((time) => (
            <button
              key={time}
              onClick={() => setFilterTime(time)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterTime === time
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                  : 'bg-navy-900 text-slate-400 border border-navy-750 hover:text-white'
              }`}
            >
              {time === 'all' ? 'All Times' : time}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMeds.map((med) => {
          const isLowStock = med.remainingQuantity <= med.refillThreshold;
          const todayLog = todayLogs.find(l => l.medicationId === med.id);

          return (
            <div
              key={med.id}
              className={`rounded-3xl bg-navy-900 border p-5 sm:p-6 shadow-md transition-all flex flex-col justify-between ${
                isLowStock ? 'border-amber-500/50' : 'border-navy-750 hover:border-teal-500/30'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base sm:text-lg text-white">
                        {med.name}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                        {med.dosage}
                      </span>
                    </div>
                    {med.genericName && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generic: {med.genericName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(med)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-navy-800 transition-colors"
                      title="Edit Medication"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id, med.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-navy-800 transition-colors"
                      title="Discontinue Medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pill Visual Badge & Doctor */}
                <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-navy-850 text-slate-300 border border-navy-750 flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
                    {med.pillColor} • {med.pillShape}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-navy-850 text-slate-300 border border-navy-750">
                    {med.frequency}
                  </span>
                </div>

                {/* Times & Food instructions */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-navy-850/60 p-3 rounded-2xl border border-navy-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Time: <strong>{med.scheduleTimes.join(', ')}</strong> ({med.timeOfDay.join(', ')})</span>
                  </div>
                  {med.foodRequirement && (
                    <div className="text-teal-300 text-[11px] font-medium">
                      🍽️ {med.foodRequirement}
                    </div>
                  )}
                  {med.instructions && (
                    <div className="text-slate-400 text-[11px] italic mt-1">
                      "{med.instructions}"
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-navy-800">
                    Rx: {med.prescribingDoctor}
                  </div>
                </div>

                {/* Pill Inventory & Refill Alert */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Remaining Supply</span>
                    <span className={`font-bold ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>
                      {med.remainingQuantity} / {med.totalQuantity} pills
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (med.remainingQuantity / med.totalQuantity) * 100)}%` }}
                      className={`h-full rounded-full ${isLowStock ? 'bg-amber-400' : 'bg-teal-500'}`}
                    />
                  </div>
                  {isLowStock && (
                    <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                      <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Low stock alert
                      </span>
                      <button
                        onClick={() => {
                          requestRefill(med.id);
                          alert(`Refill requested for ${med.name}. Notification sent to pharmacy.`);
                        }}
                        disabled={med.refillRequested}
                        className="text-[11px] font-bold text-amber-300 hover:text-white underline"
                      >
                        {med.refillRequested ? '✓ Refill Requested' : 'Order Refill'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Dose Tracking Action */}
              <div className="pt-3 border-t border-navy-800">
                {todayLog ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Today's Dose:</span>
                      {todayLog.status === 'taken' ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </span>
                      ) : todayLog.status === 'missed' ? (
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Missed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-cyan-300">
                          Due at {todayLog.scheduledTime}
                        </span>
                      )}
                    </div>

                    {todayLog.status !== 'taken' && (
                      <button
                        onClick={() => recordDose(todayLog.id, 'taken')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Taken</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic text-center">
                    No scheduled doses remaining today
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT MEDICATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-navy-900 border border-teal-500/40 rounded-3xl p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-400" />
                <span>{editingMedId ? 'Edit Prescription' : 'Add New Prescription'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Medication Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Metformin HCl, Lisinopril"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Generic / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Glucophage"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g., 500 mg, 10 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g., Twice daily, Once daily"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Food Requirement</label>
                  <select
                    value={foodRequirement}
                    onChange={(e) => setFoodRequirement(e.target.value as any)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Take with food">Take with food</option>
                    <option value="Take before meal">Take before meal</option>
                    <option value="Take on empty stomach">Take on empty stomach</option>
                    <option value="No food restrictions">No food restrictions</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Prescribing Doctor</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Robert Hayes, MD"
                    value={prescribingDoctor}
                    onChange={(e) => setPrescribingDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pill Color</label>
                  <input
                    type="text"
                    placeholder="e.g., White, Peach, Yellow"
                    value={pillColor}
                    onChange={(e) => setPillColor(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pill Shape</label>
                  <input
                    type="text"
                    placeholder="e.g., Round tablet, Oval"
                    value={pillShape}
                    onChange={(e) => setPillShape(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Remaining Supply</label>
                  <input
                    type="number"
                    value={remainingQuantity}
                    onChange={(e) => setRemainingQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Administration Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g., Take with morning meal, avoid salt substitutes, do not crush."
                  rows={2}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-navy-950 font-extrabold text-xs shadow-glow-teal"
                >
                  {editingMedId ? 'Save Changes' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
