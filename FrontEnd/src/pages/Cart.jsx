import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartItem } from '../components/cart/CartItem';
import { useCart } from '../context/CartContext';
import { useTime } from '../context/TimeContext';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Info
} from 'lucide-react';

export const Cart = () => {
  const {
    cartItems,
    itemCount,
    subtotal,
    tax,
    grandTotal,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  const { getItemStatus } = useTime();
  const navigate = useNavigate();

  // Evaluate validity of every item in cart against current time & stock (Prompt Rule 17)
  const validationResults = useMemo(() => {
    const expiredItems = [];
    cartItems.forEach(item => {
      const st = getItemStatus(item);
      if (!st.isOpen) {
        expiredItems.push({
          ...item,
          reason: st.message || 'Ordering is closed.'
        });
      }
    });
    return {
      hasInvalidItems: expiredItems.length > 0,
      invalidItems: expiredItems
    };
  }, [cartItems, getItemStatus]);

  const handleRemoveAllInvalid = () => {
    validationResults.invalidItems.forEach(it => {
      removeFromCart(it.id);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-[#94A3B8]">
          <Link to="/menu" className="hover:text-blue-600 dark:hover:text-[#3B82F6]">Menu</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-[#F8FAFC]">My Cart</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-[#334155] gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-3">
              <span>My Food Tray</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </span>
            </h1>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-1.5 px-3 hover:bg-rose-50 rounded-xl transition self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Validation Warning Alert (Prompt Rule 17: "Do not allow checkout with expired items") */}
        {validationResults.hasInvalidItems && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-sm text-rose-900 dark:text-rose-200">
                  Ordering Closed For Some Items In Your Tray
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                  The ordering window for {validationResults.invalidItems.map(i => i.name).join(', ')} has closed based on current time schedule. Please remove them to proceed with checkout.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveAllInvalid}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shrink-0 transition"
            >
              Remove Ineligible Items
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Your cart is currently empty</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Browse today's available Pragati University canteen menu and reserve your meal before break time.
            </p>
            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Explore Today's Menu</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Items & Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Items Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-[#334155] shadow-soft divide-y divide-slate-100 dark:divide-[#334155] overflow-hidden">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Informational reservation notice */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Pragati University Pre-Order Guarantee</span>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5">
                    Your reserved food will be freshly prepared and boxed. Collect anytime once marked ready, flashing your digital ticket at the canteen with zero queue delay.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Column (5 cols) */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-[#334155] shadow-soft-lg p-6 space-y-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight pb-3 border-b border-slate-100 dark:border-[#334155]">
                  Order Summary
                </h3>

                {/* Subtotal, GST, Total Amount */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
                    <span>Canteen GST (5%)</span>
                    <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-[#334155] flex items-baseline justify-between text-slate-900 dark:text-[#F8FAFC]">
                    <div>
                      <span className="text-base font-black block">Total Amount</span>
                      <span className="text-[10px] text-slate-400 dark:text-[#94A3B8]">All prices in Indian Rupees (₹)</span>
                    </div>
                    <span className="text-2xl font-black text-blue-600 dark:text-[#3B82F6]">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout Button (Disabled if invalid items exist) */}
                <button
                  type="button"
                  disabled={validationResults.hasInvalidItems}
                  onClick={() => navigate('/checkout')}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98 ${
                    validationResults.hasInvalidItems
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                  }`}
                >
                  <span>{validationResults.hasInvalidItems ? 'Remove Closed Items to Checkout' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <Link
                    to="/menu"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                  >
                    + Add more items
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Cart;
