import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  ShieldAlert,
  Heart,
  AlertTriangle,
  Hospital,
  Phone,
  Pill,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export const MedicalIdView: React.FC = () => {
  const { seniorProfile, emergencyContacts, medications, openSOS } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Paramedic & Hospital Emergency Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Universal Medical ID Card
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized emergency clinical profile for first responders, attending physicians, and emergency rooms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-750 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Print Medical ID</span>
          </button>
          <button
            onClick={openSOS}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Emergency SOS
          </button>
        </div>
      </div>

      {/* Main Medical ID Card (High contrast printable container) */}
      <div className="p-6 sm:p-10 rounded-3xl bg-navy-900 border-2 border-teal-500/40 shadow-2xl space-y-8 print:bg-white print:text-black print:border-black">
        
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black text-2xl shrink-0">
              {seniorProfile.bloodType}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {seniorProfile.fullName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                DOB: <strong>{seniorProfile.dob}</strong> (Age {seniorProfile.age}) • Gender: {seniorProfile.gender}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              seniorProfile.dnrStatus
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {seniorProfile.dnrStatus ? 'DNR Active (Do Not Resuscitate)' : 'Full Code / CPR Authorized'}
            </span>
          </div>
        </div>

        {/* Critical Clinical Alerts (Allergies & Conditions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Severe Drug & Environmental Allergies</span>
            </div>
            <div className="space-y-1">
              {seniorProfile.allergies.map((allergy, i) => (
                <div key={i} className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{allergy}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-navy-850 border border-navy-750 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-extrabold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 text-teal-400" />
              <span>Chronic Diagnoses & Medical History</span>
            </div>
            <div className="space-y-1">
              {seniorProfile.chronicConditions.map((cond, i) => (
                <div key={i} className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Active Prescriptions Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-cyan-400" />
            <span>Current Active Prescriptions</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-navy-800 rounded-xl overflow-hidden">
              <thead className="bg-navy-850 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Medication</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Instructions</th>
                  <th className="p-3">Prescriber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {medications.map((m) => (
                  <tr key={m.id} className="hover:bg-navy-850/40">
                    <td className="p-3 font-bold text-white">{m.name}</td>
                    <td className="p-3 text-teal-300 font-semibold">{m.dosage}</td>
                    <td className="p-3 text-slate-300">{m.frequency}</td>
                    <td className="p-3 text-slate-400">{m.instructions}</td>
                    <td className="p-3 text-slate-400">{m.prescribingDoctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Emergency Contacts Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-400" />
            <span>Emergency Contacts & Proxies</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-sm">{contact.name}</strong>
                  {contact.isPrimary && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-slate-400 mt-0.5">{contact.relationship}</div>
                <div className="text-teal-300 font-mono font-bold mt-1.5">{contact.phone}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Healthcare Provider & Hospital */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy-800 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Attending Physician</span>
            <div className="text-sm font-bold text-white">{seniorProfile.primaryDoctor.name}</div>
            <div className="text-slate-400">{seniorProfile.primaryDoctor.clinic}</div>
            <div className="text-cyan-400 font-mono">{seniorProfile.primaryDoctor.phone}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Preferred Trauma Hospital</span>
            <div className="text-sm font-bold text-white">{seniorProfile.preferredHospital}</div>
            <div className="text-slate-400">{seniorProfile.address}</div>
          </div>
        </div>

      </div>

    </div>
  );
};
