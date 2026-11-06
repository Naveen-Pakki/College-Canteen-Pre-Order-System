import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useOrders, ORDER_STATUS_FLOW } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  MapPin,
  QrCode,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  ChefHat,
  PackageCheck,
  Check
} from 'lucide-react';

export const Orders = () => {
  const { orders } = useOrders();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('track'); // 'track' | 'history'
  const [selectedOrderId, setSelectedOrderId] = useState(queryOrderId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  // Filter orders for the logged-in student or faculty member
  const userOrders = orders.filter(o => 
    !currentUser?.registrationId || o.userRegistrationId === currentUser?.registrationId
  );

  // Active order for tracking timeline
  const activeOrder = 
    (selectedOrderId ? userOrders.find(o => o.id === selectedOrderId) : null) ||
    userOrders.find(o => o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY FOR PICKUP') ||
    userOrders[0];

  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(activeOrder?.status || 'CONFIRMED');

  const filteredOrders = userOrders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mId = o.id.toLowerCase().includes(q);
      const mToken = o.tokenNumber?.toLowerCase().includes(q);
      const mItem = o.items?.some(i => i.name.toLowerCase().includes(q));
      if (!mId && !mToken && !mItem) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-[#334155] gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-[#94A3B8] mb-1">
              <Link to="/home" className="hover:text-blue-600 dark:hover:text-[#3B82F6]">Home</Link>
              <span>/</span>
              <span className="text-slate-800 dark:text-[#F8FAFC]">My Orders & Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Order Tracking & Order History
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Live status progression and digital tickets for Pragati University canteen food reservations.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-[#1E293B] p-1 rounded-2xl border border-slate-200 dark:border-[#334155] text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'track' ? 'bg-white dark:bg-[#172033] text-blue-600 dark:text-[#3B82F6] shadow-xs' : 'text-slate-600 dark:text-[#CBD5E1]'
              }`}
            >
              Order Timeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'history' ? 'bg-white dark:bg-[#172033] text-blue-600 dark:text-[#3B82F6] shadow-xs' : 'text-slate-600 dark:text-[#CBD5E1]'
              }`}
            >
              Order History ({userOrders.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Order Tracking Timeline */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            {activeOrder ? (
              <div className="space-y-4">
                
                {/* Multi-Order Selector Pills (if user has placed more than one order) */}
                {userOrders.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 font-bold shrink-0">Switch Order:</span>
                    {userOrders.map((ord) => {
                      const isSelected = activeOrder.id === ord.id;
                      return (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => setSelectedOrderId(ord.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#1E293B]/80'
                          }`}
                        >
                          <span className="font-mono">{ord.tokenNumber}</span>
                          <span>•</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#334155] text-slate-700 dark:text-[#CBD5E1]'
                          }`}>
                            {ord.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="bg-white dark:bg-[#172033] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#334155] shadow-soft-lg space-y-8">
                  
                  {/* Active Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-[#334155] gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
                          Pickup Token #{activeOrder.tokenNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          activeOrder.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                          activeOrder.status === 'READY FOR PICKUP' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' :
                          activeOrder.status === 'PREPARING' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {activeOrder.status}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] mt-1">
                        {activeOrder.id}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-[#CBD5E1] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-[#3B82F6]" />
                          Date: <strong>{activeOrder.date || activeOrder.pickupDate || 'Today'}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-700 dark:text-[#CBD5E1] font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-[#10B981]" />
                          Token: <strong>{activeOrder.tokenNumber}</strong>
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/ticket?id=${activeOrder.id}`)}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm shadow-blue-500/20"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Digital Ticket</span>
                      </button>
                    </div>
                  </div>

                  {/* 4-Stage Timeline: CONFIRMED -> PREPARING -> READY FOR PICKUP -> COMPLETED */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                        Preparation Timeline
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                        Status synchronized live with Admin Desk
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {ORDER_STATUS_FLOW.map((stage, idx) => {
                        const isPast = currentStatusIndex > idx;
                        const isCurrent = currentStatusIndex === idx;

                        return (
                          <div
                            key={stage}
                            className={`p-4 rounded-2xl border text-center space-y-2 transition relative ${
                              isCurrent
                                ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : isPast
                                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : 'border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#1E293B]/40 opacity-60'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-black transition ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                : isPast
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-[#334155] text-slate-500 dark:text-[#94A3B8]'
                            }`}>
                              {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                            </div>
                            <div>
                              <h4 className={`font-extrabold text-xs sm:text-sm ${
                                isCurrent ? 'text-blue-600 dark:text-[#3B82F6] font-black' : isPast ? 'text-emerald-600 dark:text-[#10B981]' : 'text-slate-600 dark:text-[#CBD5E1]'
                              }`}>
                                {stage}
                              </h4>
                              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block mt-0.5 leading-tight">
                                {stage === 'CONFIRMED' && 'Payment verified & order confirmed by Admin'}
                                {stage === 'PREPARING' && 'Chef is cooking hot fresh meal in kitchen'}
                                {stage === 'READY FOR PICKUP' && 'Food boxed & ready at canteen'}
                                {stage === 'COMPLETED' && 'QR ticket verified & food delivered'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Live Status Message Box (Read-Only) */}
                    <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                      activeOrder.status === 'READY FOR PICKUP'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : activeOrder.status === 'PREPARING'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : activeOrder.status === 'COMPLETED'
                        ? 'bg-slate-100 dark:bg-[#1E293B] border-slate-300 dark:border-[#334155] text-slate-800 dark:text-[#F8FAFC]'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    }`}>
                      <div className="shrink-0 mt-0.5">
                        {activeOrder.status === 'READY FOR PICKUP' ? (
                          <PackageCheck className="w-5 h-5 text-emerald-600" />
                        ) : activeOrder.status === 'PREPARING' ? (
                          <ChefHat className="w-5 h-5 text-amber-600 animate-bounce" />
                        ) : activeOrder.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <span className="font-extrabold uppercase text-[11px] block">
                          Current Progress: {activeOrder.status}
                        </span>
                        <p className="text-xs leading-relaxed">
                          {activeOrder.status === 'CONFIRMED' && (
                            'Your food reservation has been confirmed and queued. Kitchen chef will begin preparation shortly.'
                          )}
                          {activeOrder.status === 'PREPARING' && (
                            'The canteen chef is actively preparing your fresh food right now. Once ready, status will update to READY FOR PICKUP.'
                          )}
                          {activeOrder.status === 'READY FOR PICKUP' && (
                            'Your food is ready! You can collect your order at the canteen whenever convenient.'
                          )}
                          {activeOrder.status === 'COMPLETED' && (
                            'This order has been verified and handed over. Thank you for dining with Pragati University Canteen!'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Confirmation & Reserved Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-[#334155]">
                    
                    {/* Payment Confirmation Details */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider block">
                        Payment Confirmation
                      </span>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-[#94A3B8]">Payment Status:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Confirmed Paid
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-[#94A3B8]">Payment Gateway:</span>
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{activeOrder.paymentMethod || 'Razorpay (Online)'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-[#94A3B8]">Razorpay Payment ID:</span>
                          <span className="font-mono text-slate-900 dark:text-[#F8FAFC] font-bold">{activeOrder.razorpayPaymentId || 'pay_PU992148X'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-[#94A3B8]">College Member ID:</span>
                          <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">{activeOrder.userRegistrationId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reserved Items in this order */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider block">
                        Reserved Food Items ({activeOrder.items?.length || 0})
                      </span>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs divide-y divide-slate-200/80 dark:divide-[#334155]">
                        {activeOrder.items?.map((item, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{item.name}</span>
                              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Quantity: {item.quantity}</span>
                            </div>
                            <span className="font-black text-slate-900 dark:text-[#F8FAFC]">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-2.5 flex justify-between font-black text-slate-900 dark:text-[#F8FAFC] text-sm">
                          <span>Total Paid</span>
                          <span className="text-blue-600 dark:text-[#3B82F6] text-base">₹{activeOrder.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#172033] rounded-3xl p-12 text-center border border-slate-200 dark:border-[#334155] max-w-md mx-auto space-y-3">
                <Clock className="w-10 h-10 text-slate-400 dark:text-[#94A3B8] mx-auto" />
                <h3 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-base">No Active Orders</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  You do not have any orders currently being prepared by the canteen chef.
                </p>
                <Link
                  to="/menu"
                  className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  Order Food Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-[#334155] shadow-soft overflow-hidden space-y-4 p-5 sm:p-6">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID, Token, or Dish..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#64748B] rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['ALL', 'CONFIRMED', 'PREPARING', 'READY FOR PICKUP', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B]/80'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#334155] bg-slate-50/70 dark:bg-[#1E293B] text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID &amp; Token</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Amount (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-[#94A3B8]">
                        No orders match the selected search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/50 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC] block">{ord.id}</span>
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 inline-block mt-0.5">
                            {ord.tokenNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-[#CBD5E1]">{ord.date}</td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC] truncate block">
                            {ord.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-[#CBD5E1]">{ord.createdAt || ord.time || ord.date}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-[#F8FAFC]">₹{ord.totalAmount?.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ord.status === 'COMPLETED' ? 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] border border-slate-300 dark:border-[#334155]' :
                            ord.status === 'READY FOR PICKUP' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                            ord.status === 'PREPARING' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 
                            'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                              setSelectedOrderId(ord.id);
                              setActiveTab('track');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] font-bold text-xs rounded-xl transition"
                            title="Track Timeline"
                          >
                            Track
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/ticket?id=${ord.id}`)}
                            className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl transition"
                          >
                            Ticket
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      </main>

      <Footer />
    </div>
  );
};

export default Orders;
