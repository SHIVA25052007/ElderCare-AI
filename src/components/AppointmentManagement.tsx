import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment, AppointmentType, AppointmentStatus } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  Video,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Download,
  AlertCircle
} from 'lucide-react';

export const AppointmentManagement: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    seniorProfile
  } = useApp();

  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAptId, setEditingAptId] = useState<string | null>(null);

  // Form fields
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState<AppointmentType>('in-person');
  const [locationOrUrl, setLocationOrUrl] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [companionName, setCompanionName] = useState('Sarah Vance (Daughter)');
  const [phone, setPhone] = useState('(555) 901-2345');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');

  const openAddModal = () => {
    setEditingAptId(null);
    setDoctorName('');
    setSpecialty('Geriatric Internal Medicine');
    setClinicName('St. Jude Health & Wellness Pavilion');
    setDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setTime('10:30');
    setType('in-person');
    setLocationOrUrl('450 Medical Arts Blvd, Suite 304');
    setPreparationNotes('Bring current medication bottles and reading glasses.');
    setCompanionName('Sarah Vance (Daughter)');
    setPhone('(555) 901-2345');
    setStatus('scheduled');
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingAptId(apt.id);
    setDoctorName(apt.doctorName);
    setSpecialty(apt.specialty);
    setClinicName(apt.clinicName);
    setDate(apt.date);
    setTime(apt.time);
    setType(apt.type);
    setLocationOrUrl(apt.locationOrUrl);
    setPreparationNotes(apt.preparationNotes);
    setCompanionName(apt.companionName || '');
    setPhone(apt.phone || '');
    setStatus(apt.status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !date || !time) return;

    if (editingAptId) {
      updateAppointment(editingAptId, {
        doctorName,
        specialty,
        clinicName,
        date,
        time,
        type,
        locationOrUrl,
        preparationNotes,
        companionName,
        phone,
        status
      });
    } else {
      addAppointment({
        doctorName,
        specialty,
        clinicName,
        date,
        time,
        type,
        locationOrUrl,
        preparationNotes,
        companionName,
        phone,
        status
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel the appointment with ${name}?`)) {
      deleteAppointment(id);
    }
  };

  const downloadCalendarFile = (apt: Appointment) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ElderCare AI//Medical Appointments//EN
BEGIN:VEVENT
SUMMARY:Doctor Visit: ${apt.doctorName} (${apt.specialty})
DESCRIPTION:Patient: ${seniorProfile.fullName}\\nClinic: ${apt.clinicName}\\nNotes: ${apt.preparationNotes}\\nPhone: ${apt.phone}
LOCATION:${apt.locationOrUrl}
DTSTART:${apt.date.replace(/-/g, '')}T${apt.time.replace(':', '')}00
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointment-${apt.doctorName.toLowerCase().replace(/[^a-z]/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const filteredApts = appointments.filter((apt) => {
    if (filter === 'upcoming') {
      return apt.date >= todayStr && apt.status === 'scheduled';
    } else if (filter === 'past') {
      return apt.date < todayStr || apt.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Healthcare Coordination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Doctor Appointments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage upcoming consultations, telehealth room links, companion drivers, and calendar sync.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-glow-blue flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-800 pb-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'upcoming'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({appointments.filter(a => a.date >= todayStr && a.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'past'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Past & Completed ({appointments.filter(a => a.date < todayStr || a.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Appointments ({appointments.length})
        </button>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredApts.map((apt) => {
          const isTelehealth = apt.type === 'telehealth';
          const isCompleted = apt.status === 'completed';

          return (
            <div
              key={apt.id}
              className={`rounded-3xl bg-navy-900 border p-5 sm:p-6 shadow-md transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'border-navy-800 opacity-80'
                  : 'border-navy-750 hover:border-blue-500/40'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isTelehealth ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {isTelehealth ? <Video className="w-5 h-5 text-cyan-400" /> : <MapPin className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white">
                        {apt.doctorName}
                      </h3>
                      <p className="text-xs text-blue-400 font-semibold">{apt.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(apt)}
                      className="p-1.5 text-slate-400 hover:text-blue-300 rounded-lg hover:bg-navy-800 transition-colors"
                      title="Edit Appointment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(apt.id, apt.doctorName)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-navy-800 transition-colors"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Date & Location Details */}
                <div className="p-3.5 rounded-2xl bg-navy-850/70 border border-navy-800 space-y-2 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      {apt.date} at {apt.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isTelehealth ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {apt.type}
                    </span>
                  </div>

                  <div className="text-slate-300">
                    <strong className="text-white">{apt.clinicName}</strong>
                    <div className="text-slate-400 text-[11px] truncate mt-0.5">
                      {apt.locationOrUrl}
                    </div>
                  </div>

                  {apt.companionName && (
                    <div className="text-[11px] text-teal-300 font-medium pt-1 border-t border-navy-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Companion: {apt.companionName}</span>
                    </div>
                  )}

                  {apt.preparationNotes && (
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-navy-800">
                      Note: "{apt.preparationNotes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-navy-800">
                <button
                  onClick={() => downloadCalendarFile(apt)}
                  className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-navy-750 transition-colors"
                  title="Add to Google / Apple Calendar"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Calendar .ics</span>
                </button>

                {isTelehealth && apt.status === 'scheduled' ? (
                  <a
                    href={apt.locationOrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-navy-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Video Call</span>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      updateAppointment(apt.id, {
                        status: apt.status === 'completed' ? 'scheduled' : 'completed'
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      apt.status === 'completed'
                        ? 'bg-navy-800 text-slate-400'
                        : 'bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30'
                    }`}
                  >
                    {apt.status === 'completed' ? 'Mark Incomplete' : '✓ Mark Completed'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT APPOINTMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-navy-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>{editingAptId ? 'Edit Doctor Appointment' : 'Book New Doctor Appointment'}</span>
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
                  <label className="block font-bold text-slate-300 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Robert Hayes, MD"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Medical Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology, Endocrinology, Optometry"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Consultation Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AppointmentType)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="in-person">In-Person Visit</option>
                    <option value="telehealth">Telehealth (Video Call)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Clinic / Hospital Name</label>
                <input
                  type="text"
                  placeholder="e.g., St. Jude Health & Wellness Pavilion"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {type === 'telehealth' ? 'Video Telehealth Link / Room URL' : 'Clinic Physical Address'}
                </label>
                <input
                  type="text"
                  placeholder={type === 'telehealth' ? 'https://telehealth.provider.org/room/...' : '450 Medical Arts Blvd, Springfield, IL'}
                  value={locationOrUrl}
                  onChange={(e) => setLocationOrUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Accompanying Companion / Driver</label>
                  <input
                    type="text"
                    placeholder="e.g., Sarah Vance (Daughter)"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Clinic Phone</label>
                  <input
                    type="text"
                    placeholder="(555) 901-2345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Preparation & Checklist Notes</label>
                <textarea
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  placeholder="e.g., Fast 8 hours prior, bring glucometer log, bring reading glasses."
                  rows={2}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-white focus:outline-none focus:border-blue-400"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-glow-blue"
                >
                  {editingAptId ? 'Save Changes' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
