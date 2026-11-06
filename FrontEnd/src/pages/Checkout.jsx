import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { DietaryBadge } from '../components/ui/Badge';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../context/TimeContext';
import pragatiLogo from '../assets/images/pragati-university-logo.jpg';
import confetti from 'canvas-confetti';
import {
  Clock,
  Calendar,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Sparkles,
  QrCode,
  FileText,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';

export const Checkout = () => {
  const { cartItems, subtotal, tax, grandTotal, clearCart, removeFromCart } = useCart();
  const { placeOrder } = useOrders();
  const { currentUser } = useAuth();
  const { getItemStatus, formattedDate, formattedTime } = useTime();
  const navigate = useNavigate();

  // Validate cart items
  const invalidCartItems = useMemo(() => {
    return cartItems.filter(item => {
      const st = getItemStatus(item);
      return !st.isOpen;
    });
  }, [cartItems, getItemStatus]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handlePay = (e) => {
    e.preventDefault();
    setValidationError('');

    if (cartItems.length === 0) {
      navigate('/menu');
      return;
    }

    // 1. Validate expired items
    if (invalidCartItems.length > 0) {
      setValidationError(`${invalidCartItems[0].name} ordering has closed based on current time. Please remove it from your tray.`);
      return;
    }

    setIsProcessing(true);

    // Simulated Razorpay payment flow
    setTimeout(() => {
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch (err) {}

      // Place order and deduct stock in single source of truth
      const newOrder = placeOrder({
        items: cartItems,
        subtotal,
        tax,
        totalAmount: grandTotal,
        pickupDate: "Today",
        userName: currentUser?.name || "Pragati University Member",
        userRegistrationId: currentUser?.registrationId || currentUser?.adminId || "23A91A0501",
        userRole: currentUser?.role || "STUDENT",
        paymentMethod: "Razorpay (Direct Online Cashless)"
      });

      clearCart();
      setIsProcessing(false);
      setConfirmedOrder(newOrder);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 pb-24">
        
        {/* Breadcrumb Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-[#94A3B8] mb-1">
            <Link to="/cart" className="hover:text-blue-600 dark:hover:text-[#3B82F6]">Cart</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-[#F8FAFC]">Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Checkout & Payment
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Complete your food reservation with secure Razorpay payment. Collect anytime once ready.
          </p>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError('')}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {invalidCartItems.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Ordering for {invalidCartItems.map(i => i.name).join(', ')} has closed. Please return to tray and remove them.
              </span>
            </div>
            <Link
              to="/cart"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 text-[11px]"
            >
              Go to Tray
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Date, Collection Policy & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Order Date & Food Collection Policy */}
            <div className="bg-white dark:bg-[#172033] rounded-3xl p-6 border border-slate-200 dark:border-[#334155] shadow-soft space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#334155]">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#1E293B] text-blue-600 dark:text-[#3B82F6] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-sm sm:text-base">Order Details & Food Collection</h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Orders are freshly prepared for today's campus operations</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#1E293B] border border-blue-200 dark:border-[#334155] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-[#3B82F6]" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wide block">Order Date</span>
                    <span className="text-sm font-black text-slate-900 dark:text-[#F8FAFC]">{formattedDate}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                  Today
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider block">
                    Flexible Food Collection Policy
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
                    Collect your order at the canteen anytime after the status changes to <strong>READY FOR PICKUP</strong>. Simply show your digital ticket or QR code at the canteen.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Payment Method: Razorpay */}
            <div className="bg-white dark:bg-[#172033] rounded-3xl p-6 border border-slate-200 dark:border-[#334155] shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#334155]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-[#1E293B] text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-sm sm:text-base">Payment Method</h3>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Direct online payment gateway via Razorpay</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0C2340] dark:bg-[#1E293B] text-white text-xs font-black border border-transparent dark:border-[#334155]">
                  <span>Razorpay</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
              </div>

              {/* Razorpay Information Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 space-y-2">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-950 dark:text-blue-200">
                      "Payments are processed securely through Razorpay and transferred directly to Pragati University Canteen Services account."
                    </p>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                      Zero in-app wallet balance or recharge needed. Supports instant UPI (PhonePe, Google Pay, Paytm, BHIM), RuPay/Visa/MasterCard, and Net Banking.
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported payment channels badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 dark:text-[#CBD5E1]">
                <span className="font-bold text-slate-400 dark:text-[#94A3B8] text-[11px]">Accepted:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1E293B] font-semibold border border-slate-200 dark:border-[#334155] text-[11px]">UPI / QR</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1E293B] font-semibold border border-slate-200 dark:border-[#334155] text-[11px]">RuPay / Debit</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1E293B] font-semibold border border-slate-200 dark:border-[#334155] text-[11px]">Credit Card</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1E293B] font-semibold border border-slate-200 dark:border-[#334155] text-[11px]">Net Banking</span>
              </div>
            </div>

          </div>

          {/* Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-[#334155] shadow-soft-lg p-6 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#334155]">
                <h3 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                  Order Summary
                </h3>
                <span className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8]">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </div>

              {/* Itemized Order List */}
              <div className="space-y-2 max-h-52 overflow-y-auto text-xs pr-1 divide-y divide-slate-100 dark:divide-[#334155]">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-2">
                      <DietaryBadge isVeg={item.isVeg} showText={false} />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-[#F8FAFC] block">{item.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Qty: {item.quantity} × ₹{item.price}</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-[#F8FAFC]">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Collection Rule Info */}
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-[#1E293B] border border-blue-200 dark:border-[#334155] text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#3B82F6] shrink-0" />
                <span className="text-slate-600 dark:text-[#CBD5E1] text-[11px]">Collect anytime once marked <strong>READY FOR PICKUP</strong></span>
              </div>

              {/* Price Calculation (Subtotal, GST, Total) */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#334155] space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
                  <span>Canteen GST (5%)</span>
                  <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">₹{tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-[#334155] flex items-baseline justify-between text-slate-900 dark:text-[#F8FAFC]">
                  <span className="text-base font-black">Total Amount</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-[#3B82F6]">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay ₹... Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing || cartItems.length === 0 || invalidCartItems.length > 0}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Authorizing via Razorpay...</span>
                ) : invalidCartItems.length > 0 ? (
                  <span>Remove Closed Items First</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{grandTotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pragati University • Direct Razorpay Settlement</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Order Confirmed Success Modal with Digital Ticket Link */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-emerald-400 shadow-md flex items-center justify-center mx-auto overflow-hidden">
              <img src={pragatiLogo} alt="Pragati University" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Payment Authorized via Razorpay
              </span>
              <h2 className="text-2xl font-black text-slate-900">Order Confirmed!</h2>
              <p className="text-xs text-slate-500">
                Your food reservation has been sent to the Pragati University canteen kitchen. Inventory updated automatically.
              </p>
            </div>

            {/* Order Confirmation Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-900">{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Token:</span>
                <span className="font-black text-blue-600 text-sm">{confirmedOrder.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collection:</span>
                <span className="font-bold text-emerald-700">Anytime once Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid (₹):</span>
                <span className="font-black text-emerald-600">₹{confirmedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold text-center">
              Collect your order at the canteen anytime after it is marked READY FOR PICKUP. Show this digital ticket or QR code.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to="/ticket"
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>View Digital Ticket</span>
              </Link>
              <Link
                to="/orders"
                className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition"
              >
                Track Orders
              </Link>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
