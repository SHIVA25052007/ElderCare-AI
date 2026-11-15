import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyContact } from '../types';
import {
  Users,
  Phone,
  Mail,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  FileText,
  Hospital,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';

export const CareCircleView: React.FC = () => {
  const {
    emergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    seniorProfile,
    updateSeniorProfile,
    openSOS
  } = useApp();

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notifyPriority, setNotifyPriority] = useState(1);

  // Medical ID State
  const [isEditingMedicalId, setIsEditingMedicalId] = useState(false);
  const [bloodType, setBloodType] = useState(seniorProfile.bloodType);
  const [allergiesText, setAllergiesText] = useState(seniorProfile.allergies.join(', '));
  const [conditionsText, setConditionsText] = useState(seniorProfile.chronicConditions.join(', '));
  const [hospital, setHospital] = useState(seniorProfile.preferredHospital);
  const [address, setAddress] = useState(seniorProfile.address);
  const [dnrStatus, setDnrStatus] = useState(seniorProfile.dnrStatus);

  const openAddContactModal = () => {
    setEditingContactId(null);
    setName('');
    setRelationship('Family Member');
    setPhone('');
    setAltPhone('');
    setEmail('');
    setIsPrimary(false);
    setNotifyPriority(emergencyContacts.length + 1);
    setIsContactModalOpen(true);
  };

  const openEditContactModal = (contact: EmergencyContact) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setAltPhone(contact.altPhone || '');
    setEmail(contact.email || '');
    setIsPrimary(contact.isPrimary);
    setNotifyPriority(contact.notifyPriority);
    setIsContactModalOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingContactId) {
      updateEmergencyContact(editingContactId, {
        name,
        relationship,
        phone,
        altPhone,
        email,
        isPrimary,
        notifyPriority: Number(notifyPriority)
      });
    } else {
      addEmergencyContact({
        name,
        relationship,
        phone,
        altPhone,
        email,
        isPrimary,
        notifyPriority: Number(notifyPriority)
      });
    }

    setIsContactModalOpen(false);
  };

  const handleDeleteContact = (id: string, contactName: string) => {
    if (window.confirm(`Are you sure you want to remove ${contactName} from the emergency care circle?`)) {
      deleteEmergencyContact(id);
    }
  };

  const handleSaveMedicalId = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeniorProfile({
      bloodType,
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
      preferredHospital: hospital,
      address,
      dnrStatus
    });
    setIsEditingMedicalId(false);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Care Network & Medical ID</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Care Circle & Emergency Protocol
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configured emergency contacts, priority escalation tree, and paramedic Medical ID card.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddContactModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Emergency Contact</span>
          </button>
          <button
            onClick={openSOS}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Test SOS Protocol
          </button>
        </div>
      </div>

      {/* EMERGENCY CONTACTS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Phone className="w-5 h-5 text-teal-400" />
          <span>Configured Emergency Contacts (Escalation Order)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts
            .sort((a, b) => a.notifyPriority - b.notifyPriority)
            .map((contact) => (
              <div
                key={contact.id}
                className={`p-5 rounded-3xl bg-navy-900 border transition-all flex flex-col justify-between ${
                  contact.isPrimary ? 'border-teal-500/50 shadow-glow-teal' : 'border-navy-750 hover:border-navy-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30">
                        #{contact.notifyPriority}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-white">{contact.name}</h3>
                          {contact.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold uppercase flex items-center gap-1 border border-teal-500/30">
                              <Star className="w-3 h-3 fill-teal-400 text-teal-400" /> Primary Proxy
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{contact.relationship}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditContactModal(contact)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-navy-800 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 mt-3 pt-3 border-t border-navy-800">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <a href={`tel:${contact.phone}`} className="hover:underline font-mono font-bold text-white">
                        {contact.phone}
                      </a>
                      {contact.altPhone && (
                        <span className="text-slate-500 text-[11px]">(Alt: {contact.altPhone})</span>
                      )}
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-400">{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Simulated SMS & Automated Call Queued on SOS
                  </span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-3 py-1 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30 font-bold transition-colors"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SENIOR MEDICAL ID CARD & EMERGENCY DETAILS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-teal-500/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Paramedic & First Responder Card</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Senior Medical ID: {seniorProfile.fullName}
            </h2>
            <p className="text-xs text-slate-400">
              Critical medical data displayed automatically during Emergency SOS activation.
            </p>
          </div>

          <button
            onClick={() => setIsEditingMedicalId(!isEditingMedicalId)}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditingMedicalId ? 'Cancel Editing' : 'Edit Medical ID'}</span>
          </button>
        </div>

        {isEditingMedicalId ? (
          <form onSubmit={handleSaveMedicalId} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Blood Type</label>
                <input
                  type="text"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Critical Allergies (comma-separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                placeholder="Penicillin, Sulfa drugs, Latex"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Chronic Medical Conditions (comma-separated)</label>
              <input
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                placeholder="Type 2 Diabetes, Mild Hypertension, Osteoarthritis"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Preferred Hospital</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dnrStatus}
                    onChange={(e) => setDnrStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 bg-navy-850 border-navy-700"
                  />
                  <span className="font-bold text-slate-200 text-xs">Do Not Resuscitate (DNR) Order on file</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingMedicalId(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-navy-950 font-extrabold text-xs shadow-glow-teal"
              >
                Save Medical ID
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-800">
              <span className="text-slate-400 block text-[11px] mb-1">Blood Type</span>
              <strong className="text-white text-lg font-black">{seniorProfile.bloodType}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-800">
              <span className="text-slate-400 block text-[11px] mb-1">Resuscitation Status</span>
              <strong className={`text-base font-bold ${seniorProfile.dnrStatus ? 'text-amber-400' : 'text-emerald-400'}`}>
                {seniorProfile.dnrStatus ? 'DNR Active' : 'Full Code (No DNR)'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-800 sm:col-span-2">
              <span className="text-slate-400 block text-[11px] mb-1">Critical Drug Allergies</span>
              <strong className="text-rose-300 text-sm">
                {seniorProfile.allergies.join(' • ')}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-800 sm:col-span-2">
              <span className="text-slate-400 block text-[11px] mb-1">Chronic Conditions</span>
              <strong className="text-slate-200 text-sm">
                {seniorProfile.chronicConditions.join(' • ')}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-800 sm:col-span-2">
              <span className="text-slate-400 block text-[11px] mb-1">Preferred Trauma Center</span>
              <strong className="text-cyan-300 text-sm">
                {seniorProfile.preferredHospital}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT EMERGENCY CONTACT */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-navy-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-400" />
                <span>{editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</span>
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Sarah Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g., Daughter, Visiting Nurse, Son"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Alt Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="(555) 234-5679"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah.vance@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Notification Priority Order</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={notifyPriority}
                    onChange={(e) => setNotifyPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="primaryProxy"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-navy-850 border-navy-700"
                />
                <label htmlFor="primaryProxy" className="font-bold text-slate-200 cursor-pointer">
                  Designate as Primary Healthcare Proxy (First Contact on SOS)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md"
                >
                  {editingContactId ? 'Save Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
