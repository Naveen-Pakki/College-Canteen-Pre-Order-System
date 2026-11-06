import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useOrders, ORDER_STATUS_FLOW } from '../context/OrderContext';
import {
  Layers,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  X,
  QrCode,
  ShieldCheck,
  ChefHat,
  PackageCheck,
  Check,
  User,
  ArrowRight
} from 'lucide-react';

export const ManageOrders = () => {
  const { orders, updateOrderStatus, advanceOrderStatus } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verifyingOrder, setVerifyingOrder] = useState(null); // Order object for ticket verification modal
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Status stats
  const totalOrdersCount = orders.length;
  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyCount = orders.filter(o => o.status === 'READY FOR PICKUP').length;
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

  const filteredOrders = orders.filter(o => {
    // Status filter
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    // Search query by Order ID or Registration ID or Name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mId = o.id.toLowerCase().includes(q);
      const mReg = o.userRegistrationId.toLowerCase().includes(q);
      const mUser = o.userName.toLowerCase().includes(q);
      const mToken = o.tokenNumber?.toLowerCase().includes(q);
      if (!mId && !mReg && !mUser && !mToken) return false;
    }
    return true;
  });

  const statusesList = ['ALL', 'CONFIRMED', 'PREPARING', 'READY FOR PICKUP', 'COMPLETED'];

  // Handle ticket verification and order handover
  const handleCompleteOrder = (orderId) => {
    updateOrderStatus(orderId, 'COMPLETED');
    setVerificationSuccess(true);
    setTimeout(() => {
      setVerificationSuccess(false);
      setVerifyingOrder(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-blue-600">Admin</Link>
          <span>/</span>
          <span className="text-slate-800">Orders Ledger</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-purple-600" />
              <span>Campus Orders Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify student/faculty digital tickets, advance workflow stages, and maintain canteen reservations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/chef-preparation"
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 transition"
            >
              <ChefHat className="w-4 h-4" />
              <span>Chef Prep Desk →</span>
            </Link>
          </div>
        </div>

        {/* Quick KPI Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-2xl border text-left transition ${
              statusFilter === 'ALL' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalOrdersCount}</div>
            <span className="text-[10px] text-purple-700 font-semibold">All reservations</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`p-4 rounded-2xl border text-left transition ${
              statusFilter === 'CONFIRMED' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Confirmed</span>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{confirmedCount}</div>
            <span className="text-[10px] text-blue-600 font-semibold">Queued for prep</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PREPARING')}
            className={`p-4 rounded-2xl border text-left transition ${
              statusFilter === 'PREPARING' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Preparing</span>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{preparingCount}</div>
            <span className="text-[10px] text-amber-600 font-semibold">In kitchen cooking</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('READY FOR PICKUP')}
            className={`p-4 rounded-2xl border text-left transition ${
              statusFilter === 'READY FOR PICKUP' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Ready for Pickup</span>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{readyCount}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">At pickup counter</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('COMPLETED')}
            className={`p-4 rounded-2xl border text-left transition ${
              statusFilter === 'COMPLETED' ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{completedCount}</div>
            <span className="text-[10px] text-slate-600 font-semibold">Verified &amp; delivered</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input by Order ID, Token, or Registration ID */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID (e.g. PU-2026-00101), Token (e.g. TKT-42), or Reg ID (e.g. 23A91A0501)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
            {statusesList.map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order &amp; Token</th>
                  <th className="py-3 px-4">College Member</th>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Food Items</th>
                  <th className="py-3 px-4">Order Placed At</th>
                  <th className="py-3 px-4">Amount (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Workflow Advance</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      No orders match the current filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                      
                      {/* Order ID & Token */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{ord.id}</div>
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                          {ord.tokenNumber}
                        </span>
                      </td>

                      {/* User Name & Role */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">
                        <div>{ord.userName}</div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          ord.userRole === 'FACULTY' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ord.userRole}
                        </span>
                      </td>

                      {/* Registration ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {ord.userRegistrationId}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-semibold text-slate-800 truncate block">
                          {ord.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </span>
                      </td>

                      {/* Order Placed At */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{ord.createdAt || ord.time || ord.date || "Today"}</span>
                        <span className="text-[10px] text-slate-500 block">Collect When Ready</span>
                      </td>

                      {/* Amount in ₹ */}
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{ord.totalAmount?.toFixed(2)}
                      </td>

                      {/* Current Status with Dropdown for Manual Override */}
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                            ord.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            ord.status === 'READY FOR PICKUP' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            ord.status === 'PREPARING' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY FOR PICKUP">READY FOR PICKUP</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>

                      {/* Quick 1-Click Workflow Advance Button */}
                      <td className="py-3.5 px-4">
                        {ord.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'PREPARING')}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 border border-amber-300 font-extrabold text-[11px] transition flex items-center gap-1 shadow-xs"
                            title="Start kitchen preparation"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Start Prep →</span>
                          </button>
                        )}
                        {ord.status === 'PREPARING' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'READY FOR PICKUP')}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-300 font-extrabold text-[11px] transition flex items-center gap-1 shadow-xs"
                            title="Mark ready for pickup"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Mark Ready →</span>
                          </button>
                        )}
                        {ord.status === 'READY FOR PICKUP' && (
                          <button
                            type="button"
                            onClick={() => setVerifyingOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] transition flex items-center gap-1 shadow-xs animate-pulse"
                            title="Verify digital ticket & hand over food"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Hand Over ✓</span>
                          </button>
                        )}
                        {ord.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Delivered
                          </span>
                        )}
                      </td>

                      {/* Ticket Verification Inspection Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setVerifyingOrder(ord)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition inline-flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Verify Ticket</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Ticket Verification Modal */}
        {verifyingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">Canteen Digital Ticket Verification</h3>
                    <p className="text-[11px] text-slate-400">Pragati University Canteen Counter Desk</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingOrder(null)}
                  className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 text-xs">
                
                {/* Token Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Presented Token Number</span>
                  <div className="text-4xl font-black text-blue-900 tracking-tight my-1">
                    {verifyingOrder.tokenNumber}
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white/80 px-3 py-0.5 rounded-full border border-blue-100 inline-block">
                    Collect anytime once Ready
                  </span>
                </div>

                {/* College Member & Order Details */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Student / Faculty</span>
                    <span className="font-bold text-slate-900 text-xs block">{verifyingOrder.userName}</span>
                    <span className="font-mono text-blue-700 font-bold text-[11px] block">{verifyingOrder.userRegistrationId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Order ID</span>
                    <span className="font-mono font-bold text-slate-900 text-xs block">{verifyingOrder.id}</span>
                    <span className="text-slate-500 text-[10px] block">Date: {verifyingOrder.date || 'Today'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Status</span>
                    <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Paid ₹{verifyingOrder.totalAmount?.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block mt-0.5 ${
                      verifyingOrder.status === 'COMPLETED' ? 'bg-slate-200 text-slate-800' :
                      verifyingOrder.status === 'READY FOR PICKUP' ? 'bg-emerald-100 text-emerald-800' :
                      verifyingOrder.status === 'PREPARING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {verifyingOrder.status}
                    </span>
                  </div>
                </div>

                {/* Reserved Food Items Checklist */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Food Items to Hand Over (Verify portions):
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200/80">
                    {verifyingOrder.items?.map((item, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900">{item.name}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handover Confirmation Success or CTA */}
                {verificationSuccess ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center text-emerald-900 font-extrabold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Order Verified &amp; Marked as COMPLETED!</span>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    {verifyingOrder.status !== 'COMPLETED' ? (
                      <button
                        type="button"
                        onClick={() => handleCompleteOrder(verifyingOrder.id)}
                        className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify QR Ticket &amp; Mark as COMPLETED</span>
                      </button>
                    ) : (
                      <div className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-center">
                        This order has already been verified and completed.
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ManageOrders;
