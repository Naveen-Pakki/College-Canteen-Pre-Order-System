import React from 'react';
import {
  UtensilsCrossed,
  Download,
  Printer,
  QrCode,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import pragatiLogo from '../../assets/images/pragati-university-logo.jpg';

export const OrderTicket = ({ order }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="printable-ticket" className="max-w-md mx-auto bg-white dark:bg-[#172033] rounded-3xl border border-slate-200/90 dark:border-[#334155] shadow-soft-xl overflow-hidden text-slate-800 dark:text-[#F8FAFC]">
      
      {/* College Institutional Header */}
      <div className="bg-[#0F172A] text-white p-6 text-center relative border-b border-slate-800">
        <div className="w-14 h-14 rounded-full bg-white p-1 flex items-center justify-center mx-auto mb-2.5 shadow-md overflow-hidden">
          <img
            src={pragatiLogo}
            alt="Pragati University"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-xl font-black tracking-tight">PRAGATI UNIVERSITY CANTEEN ORDER TICKET</h2>
        <p className="text-xs text-teal-400 font-semibold tracking-wide uppercase mt-0.5">
          Pragati University
        </p>
        <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-[10px] text-slate-300 font-mono">
          Surampalem, ADB Road, E.G. Dist.
        </span>
      </div>

      <div className="p-6 space-y-5">
        
        {/* Token Number Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-[#1E293B] dark:to-[#172033] border border-blue-200 dark:border-blue-900/60 text-center">
          <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block">Pickup Token Number</span>
          <div className="text-4xl font-black text-blue-900 dark:text-[#3B82F6] tracking-tight my-1">
            {order.tokenNumber || "TKT-42"}
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-[#F8FAFC] bg-white/80 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-blue-100 dark:border-[#334155] inline-block">
            Collect anytime once Ready
          </span>
        </div>

        {/* Order Details: Order ID, Registration ID, Order Date, Status */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold uppercase block">Order ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC] text-xs sm:text-sm">{order.id}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold uppercase block">Order Date</span>
            <span className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs sm:text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-[#3B82F6]" />
              {order.date || order.pickupDate || 'Today'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold uppercase block">College Member</span>
            <span className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate block">{order.userName}</span>
            <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-semibold">
              {order.userRegistrationId} ({order.userRole})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold uppercase block">Status</span>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {order.status}
            </span>
          </div>
        </div>

        {/* Food Items List */}
        <div>
          <span className="text-xs font-bold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider block mb-2">
            Reserved Food Items
          </span>
          <div className="divide-y divide-slate-100 dark:divide-[#334155] text-xs">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{item.name}</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] block">{item.quantity} × ₹{item.price}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-[#F8FAFC]">
                  ₹{(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Paid in ₹ */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#334155] space-y-1 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
            <span>Subtotal</span>
            <span>₹{(order.subtotal || order.totalAmount * 0.95).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
            <span>Canteen GST (5%)</span>
            <span>₹{(order.tax || order.totalAmount * 0.05).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 dark:text-[#F8FAFC] pt-2 border-t border-dashed border-slate-300 dark:border-[#334155]">
            <span>Total Paid (₹)</span>
            <span className="text-blue-600 dark:text-[#3B82F6] text-lg font-black">₹{order.totalAmount?.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 mt-2">
            <span className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Paid via Razorpay
            </span>
            <span className="font-mono text-[10px]">{order.razorpayPaymentId || 'pay_PU992148X'}</span>
          </div>
        </div>

        {/* Food Collection Rule Notice & QR Code */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-center space-y-2.5">
          <div className="inline-block p-3 bg-white rounded-2xl border border-slate-300 dark:border-[#334155] shadow-xs">
            <QrCode className="w-28 h-28 text-slate-900 mx-auto" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-900 dark:text-[#F8FAFC]">
              Collect your order anytime after it is marked READY FOR PICKUP. Show this digital ticket or QR code at the canteen.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
              Canteen staff will verify your order ticket and hand over your fresh meals.
            </p>
          </div>
        </div>

        {/* Print / Download Button */}
        <div className="pt-1 print:hidden flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download / Print Ticket</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default OrderTicket;
