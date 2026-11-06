import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  BadgeCheck,
  Phone,
  Building2,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Save,
  ArrowRight
} from 'lucide-react';

export const Profile = () => {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || 'Sai Vardhan');
  const [email, setEmail] = useState(currentUser?.email || '23a91a0501@pragati.ac.in');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98480 22334');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const displayId = currentUser?.registrationId || currentUser?.adminId || '23A91A0501';
  const roleDisplay = currentUser?.role || 'STUDENT';

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name, email, phone, department });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Profile Card Banner */}
        <div className="bg-white dark:bg-[#172033] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#334155] shadow-soft flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md border-4 border-slate-100 dark:border-[#1E293B]">
            {name.charAt(0)}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                roleDisplay === 'FACULTY'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}>
                {roleDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
              Registration ID: <span className="font-mono font-bold text-slate-800 dark:text-[#F8FAFC]">{displayId}</span> • Pragati University
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-center sm:text-right w-full sm:w-auto">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-[#94A3B8] block font-bold">Institution</span>
            <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">Pragati University, Surampalem</span>
            <span className="text-[10px] text-teal-600 dark:text-[#10B981] block font-semibold mt-0.5">Razorpay Direct Active</span>
          </div>
        </div>

        {/* Profile Form (Unified for Student & Faculty) */}
        <div className="bg-white dark:bg-[#172033] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#334155] shadow-soft space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Personal & Campus Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Official Pragati University membership details</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] text-xs font-bold font-mono">
              Role: {roleDisplay}
            </span>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Registration ID (Read-only)</label>
                <input
                  type="text"
                  value={displayId}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-[#172033] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#334155] shadow-soft space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] pb-3 border-b border-slate-100 dark:border-[#334155]">
            Account Security & Password
          </h2>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Profile;
