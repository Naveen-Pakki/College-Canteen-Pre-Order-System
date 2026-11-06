import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useOrders } from '../context/OrderContext';
import { useTime } from '../context/TimeContext';
import {
  Settings,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  Save,
  RotateCcw,
  Info,
  UtensilsCrossed,
  Coffee,
  Cake
} from 'lucide-react';

export const AdminSettings = () => {
  const { canteenSettings, updateSettings } = useOrders();
  const { schedules, updateSchedule, resetScheduleToDefault } = useTime();

  // Local state for all time schedules (Prompt Rule 20)
  const [bStart, setBStart] = useState(schedules.breakfast.start);
  const [bEnd, setBEnd] = useState(schedules.breakfast.end);

  const [lStart, setLStart] = useState(schedules.lunch.start);
  const [lEnd, setLEnd] = useState(schedules.lunch.end);
  const [lPickupStart, setLPickupStart] = useState(schedules.lunch.pickupStart);
  const [lPickupEnd, setLPickupEnd] = useState(schedules.lunch.pickupEnd);

  const [sStart, setSStart] = useState(schedules.eveningSnacks.start);
  const [sEnd, setSEnd] = useState(schedules.eveningSnacks.end);

  const [cCutoff, setCCutoff] = useState(schedules.cake.end);
  const [cPickup, setCPickup] = useState(schedules.cake.pickupStart);

  const [allowDirectCounterSales, setAllowDirectCounterSales] = useState(canteenSettings.allowDirectCounterSales ?? true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();

    // Update time scheduling engine (Prompt Rule 20: Make timings configurable by Admin)
    updateSchedule({
      breakfast: { ...schedules.breakfast, start: bStart, end: bEnd },
      lunch: { ...schedules.lunch, start: lStart, end: lEnd, pickupStart: lPickupStart, pickupEnd: lPickupEnd },
      eveningSnacks: { ...schedules.eveningSnacks, start: sStart, end: sEnd },
      cake: { ...schedules.cake, end: cCutoff, pickupStart: cPickup }
    });

    updateSettings({
      allowDirectCounterSales
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    resetScheduleToDefault();
    setBStart('06:00 AM');
    setBEnd('09:30 AM');
    setLStart('09:00 AM');
    setLEnd('12:00 PM');
    setLPickupStart('12:00 PM');
    setLPickupEnd('02:00 PM');
    setSStart('01:00 PM');
    setSEnd('03:30 PM');
    setCCutoff('01:00 PM');
    setCPickup('03:00 PM');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-blue-600">Admin</Link>
          <span>/</span>
          <span className="text-slate-800">Canteen Operational Timings</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-7 h-7 text-slate-700" />
              <span>Canteen Schedule & Timings Configuration</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize meal ordering deadlines, pickup windows, and campus policies. Changes take effect across all user menus immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Reset Default Timings</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Canteen operational timings updated and applied live across the entire system!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Morning Tiffins (6:00 AM – 9:30 AM) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Coffee className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Morning Tiffins Schedule (Breakfast)
                </h3>
                <p className="text-[11px] text-slate-500">Idli, Dosa, Puri, Upma, Pongal, Tea, Coffee</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ordering Start Time</label>
                <input
                  type="text"
                  value={bStart}
                  onChange={(e) => setBStart(e.target.value)}
                  placeholder="e.g. 06:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ordering Cutoff Time</label>
                <input
                  type="text"
                  value={bEnd}
                  onChange={(e) => setBEnd(e.target.value)}
                  placeholder="e.g. 09:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lunch Pre-Orders & Pickup Window */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Lunch Pre-Orders & Pickup Schedule
                </h3>
                <p className="text-[11px] text-slate-500">Meals, Dum Biryanis, Fried Rice, Noodles</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lunch Pre-Order Start</label>
                <input
                  type="text"
                  value={lStart}
                  onChange={(e) => setLStart(e.target.value)}
                  placeholder="e.g. 09:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lunch Pre-Order Cutoff (Deadline)</label>
                <input
                  type="text"
                  value={lEnd}
                  onChange={(e) => setLEnd(e.target.value)}
                  placeholder="e.g. 12:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lunch Pickup Window Start</label>
                <input
                  type="text"
                  value={lPickupStart}
                  onChange={(e) => setLPickupStart(e.target.value)}
                  placeholder="e.g. 12:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lunch Pickup Window End</label>
                <input
                  type="text"
                  value={lPickupEnd}
                  onChange={(e) => setLPickupEnd(e.target.value)}
                  placeholder="e.g. 02:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Evening Snacks & Celebration Cakes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UtensilsCrossed className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Evening Snacks & Cake Booking Schedules
                </h3>
                <p className="text-[11px] text-slate-500">Samosas, Puffs, Bajjis, Cutlets, Celebration Cakes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Evening Snacks Start</label>
                <input
                  type="text"
                  value={sStart}
                  onChange={(e) => setSStart(e.target.value)}
                  placeholder="e.g. 01:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evening Snacks Cutoff</label>
                <input
                  type="text"
                  value={sEnd}
                  onChange={(e) => setSEnd(e.target.value)}
                  placeholder="e.g. 03:30 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cake Booking Cutoff Time</label>
                <input
                  type="text"
                  value={cCutoff}
                  onChange={(e) => setCCutoff(e.target.value)}
                  placeholder="e.g. 01:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cake Pickup Availability Time</label>
                <input
                  type="text"
                  value={cPickup}
                  onChange={(e) => setCPickup(e.target.value)}
                  placeholder="e.g. 03:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: General Campus Canteen Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Campus Location & Settlement Details
              </h3>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong>Campus:</strong> Pragati University</p>
              <p><strong>Address:</strong> ADB Road, Surampalem, Near Peddapuram, East Godavari Dist.</p>
              <p><strong>Payment Gateway:</strong> Razorpay Direct Settlement (Zero Stored Balance)</p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={allowDirectCounterSales}
                  onChange={(e) => setAllowDirectCounterSales(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <span className="font-bold text-slate-800">
                  Enable Direct Counter Purchase Notice on Home & Menu pages
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply All Timings</span>
            </button>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
};

export default AdminSettings;
