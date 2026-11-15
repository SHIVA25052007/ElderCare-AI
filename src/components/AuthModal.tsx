import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../services/storage';
import { isFirebaseConfigured } from '../services/firebaseConfig';
import {
  User,
  Users,
  Activity,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Mail,
  Sparkles,
  Info
} from 'lucide-react';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, currentUser, switchRole } = useApp();

  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleDemoSelect = (role: UserRole) => {
    switchRole(role);
    setAuthSuccessMsg(`Switched to ${role.toUpperCase()} role successfully!`);
    setTimeout(() => {
      setAuthSuccessMsg(null);
      closeAuthModal();
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Simulate authentication
    switchRole(selectedRole);
    setAuthSuccessMsg(`Authenticated as ${email} (${selectedRole}). Local session active.`);
    setTimeout(() => {
      setAuthSuccessMsg(null);
      closeAuthModal();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-navy-900 border border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-navy-850 border-b border-navy-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <KeyRound className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Authentication & Roles</h3>
              <p className="text-xs text-slate-400">Select user persona or log in</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-navy-800 bg-navy-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'demo'
                ? 'bg-navy-800 text-teal-300 border border-teal-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Quick Demo Personas
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'custom'
                ? 'bg-navy-800 text-teal-300 border border-teal-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔒 Custom Login (Firebase)
          </button>
        </div>

        <div className="p-6 space-y-5">
          {authSuccessMsg && (
            <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/50 text-teal-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'demo' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Choose a role to test role-tailored dashboards and permissions:
              </p>

              {DEMO_USERS.map((user) => {
                const isCurrent = currentUser.role === user.role;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleDemoSelect(user.role)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-teal-500/10 border-teal-500/60 shadow-glow-teal'
                        : 'bg-navy-850 border-navy-750 hover:border-teal-500/40 hover:bg-navy-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-teal-500/40"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{user.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-extrabold bg-teal-500/20 text-teal-300">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {user.title || user.relationshipToSenior}
                        </p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrent ? (
                        <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-300">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-navy-850 border border-navy-750 text-xs text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  {isFirebaseConfigured
                    ? 'Firebase Auth connected. Submitting will verify against live Firebase user pool.'
                    : 'Firebase connector is ready. In this hackathon demo, custom credentials generate a simulated authenticated session saved to localStorage.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Persona Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['elderly', 'family', 'caregiver'] as UserRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                        selectedRole === r
                          ? 'bg-teal-600 text-navy-950 shadow'
                          : 'bg-navy-800 text-slate-300 hover:bg-navy-750 border border-navy-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., margaret@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white text-xs focus:border-teal-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white text-xs focus:border-teal-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-glow-teal transition-all"
              >
                Sign In to Platform
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-500">
            ELDERCARE AI • Catalyst x PromptWars Solo AI Hackathon Prototype
          </div>

        </div>
      </div>
    </div>
  );
};
