import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ChefHat,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  UtensilsCrossed,
  Settings,
  Plus
} from 'lucide-react';

export const AdminDashboard = () => {
  const { orders, menuItems, advanceOrderStatus, updateOrderStatus } = useOrders();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Operational metrics (NO revenue or BI charts)
  const todaysOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'CONFIRMED').length;
  const preparingOrders = orders.filter(o => o.status === 'PREPARING').length;
  const readyOrders = orders.filter(o => o.status === 'READY FOR PICKUP').length;
  const availableItems = menuItems.filter(i => i.isAvailable !== false).length;
  const soldOutItems = menuItems.filter(i => i.isAvailable === false).length;

  const activeQueue = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 pb-24">
        
        {/* Admin Operational Banner */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-7 shadow-soft-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-400/30">
                  Pragati University Canteen Administration
                </span>
                <span className="text-xs text-slate-400 font-mono">Central Kitchen Controls</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">Canteen Operations Manager</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Managing daily food availability, kitchen chef prep queue, and break-time pickups.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              to="/admin/todays-food"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
            >
              <Calendar className="w-4 h-4" />
              <span>Configure Today's Food</span>
            </Link>
            <Link
              to="/admin/chef-preparation"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
            >
              <ChefHat className="w-4 h-4" />
              <span>Chef / Preparation</span>
            </Link>
          </div>
        </div>

        {/* 5 Simple Operational Cards (Strictly No Data Science / No Revenue Charts) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Today's Orders</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{todaysOrders}</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Total reservations</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Orders</span>
            <div className="text-3xl font-black text-amber-600 mt-2">{pendingOrders}</div>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Awaiting prep</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Preparing Orders</span>
            <div className="text-3xl font-black text-blue-600 mt-2">{preparingOrders}</div>
            <p className="text-[11px] text-blue-700 font-semibold mt-0.5">In kitchen wok/oven</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ready Orders</span>
            <div className="text-3xl font-black text-emerald-600 mt-2">{readyOrders}</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">At pickup counter</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Available Food Items</span>
            <div className="text-3xl font-black text-teal-600 mt-2">{availableItems}</div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{soldOutItems} items sold out</p>
          </div>

        </div>

        {/* 3 Main Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Today's Food Controls</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure what is available on the canteen menu today, change prices in ₹, set ordering deadlines, and toggle SOLD OUT status.
              </p>
            </div>
            <Link
              to="/admin/todays-food"
              className="py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-between transition"
            >
              <span>Manage Today's Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Chef / Preparation Desk</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Help the person preparing food know what needs to be cooked. Grouped into To Prepare, Preparing, and Ready for Pickup.
              </p>
            </div>
            <Link
              to="/admin/chef-preparation"
              className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-between transition"
            >
              <span>Open Chef Preparation View</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">All Orders Ledger</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Search orders by Order ID or Registration ID, filter by slot and status, and verify student/faculty digital tickets.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center justify-between transition"
            >
              <span>View All Orders ({orders.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Live Active Kitchen Queue Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-extrabold text-slate-900 text-base">Active Orders Queue ({activeQueue.length})</h3>
              </div>
              <p className="text-xs text-slate-500">Orders requiring kitchen preparation or pickup verification</p>
            </div>

            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Full Orders Table →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID & Token</th>
                  <th className="py-3 px-4">College Member</th>
                  <th className="py-3 px-4">Dishes</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Amount (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeQueue.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{ord.id}</span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                        {ord.tokenNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{ord.userName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{ord.userRegistrationId} ({ord.userRole})</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <span className="font-semibold text-slate-800 truncate block">
                        {ord.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{ord.createdAt || ord.time || ord.date || 'Today'}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">₹{ord.totalAmount?.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        ord.status === 'READY FOR PICKUP' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'PREPARING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ord.status !== 'COMPLETED' ? (
                        <button
                          type="button"
                          onClick={() => advanceOrderStatus(ord.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-extrabold text-[11px] transition inline-flex items-center gap-1"
                          title="Move to next preparation stage"
                        >
                          <RefreshCw className="w-3 h-3 text-teal-600" />
                          <span>Advance</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

