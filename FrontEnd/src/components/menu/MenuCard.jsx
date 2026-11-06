import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTime } from '../../context/TimeContext';
import { DietaryBadge } from '../ui/Badge';
import {
  Clock,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Info,
  Package
} from 'lucide-react';

export const MenuCard = ({ item }) => {
  const { addToCart, getItemCartQuantity } = useCart();
  const { getItemStatus } = useTime();

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Time & availability status
  const statusInfo = getItemStatus(item);

  // Dynamic available stock accounting for user's active cart selection (Prompt Rule 10)
  const inCartQty = getItemCartQuantity(item.id);
  const effectiveAvailableStock = Math.max(0, (item.stockQuantity ?? 50) - inCartQty);
  const isCurrentlySoldOut = statusInfo.isSoldOut || effectiveAvailableStock <= 0;

  // Can the user order this item right now?
  const isOrderable = statusInfo.isOpen && !isCurrentlySoldOut;

  const handleAdd = () => {
    if (!isOrderable || effectiveAvailableStock <= 0) return;
    const addCount = Math.min(quantity, effectiveAvailableStock);
    addToCart(item, addCount, item.stockQuantity ?? 50);
    setAddedAnimation(true);
    setQuantity(1);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className={`bg-white dark:bg-[#172033] rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group ${
      isOrderable
        ? 'border-slate-200/90 dark:border-[#334155] hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-soft-lg'
        : 'border-slate-200/80 dark:border-[#334155] bg-slate-50/70 dark:bg-[#111827]/80 opacity-85'
    }`}>
      
      {/* Top Image & Status Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-[#111827]">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isOrderable ? 'group-hover:scale-105' : 'grayscale'
          }`}
          loading="lazy"
        />

        {/* Dietary Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 flex items-center">
          <DietaryBadge isVeg={item.isVeg} />
        </div>

        {/* Dynamic Status Badge (OPEN, CLOSING SOON, PRE-ORDER CLOSED, SOLD OUT, ALL DAY) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {isCurrentlySoldOut ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              SOLD OUT
            </span>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${statusInfo.badgeClass}`}>
              {statusInfo.badge}
            </span>
          )}
        </div>

        {/* Timing Window & Pickup Banner */}
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 dark:bg-[#0B1120]/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[10px] font-semibold flex items-center justify-between border border-white/10">
          <span className="flex items-center gap-1 text-slate-200">
            <Clock className="w-3 h-3 text-amber-300" />
            {item.isAllDay ? 'All Day Availability' : `${item.startTime || '9:00 AM'} – ${item.endTime || '12:00 PM'}`}
          </span>
          {item.pickupStart && (
            <span className="text-teal-300 text-[9px] font-mono">
              Pickup: {item.pickupStart}
            </span>
          )}
        </div>
      </div>

      {/* Body Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-[#10B981]">
              {item.category}
            </span>

            {/* Live Available Quantity Indicator */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${
              effectiveAvailableStock > 10
                ? 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
                : effectiveAvailableStock > 0
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
            }`}>
              <Package className="w-3 h-3" />
              <span>Available: {effectiveAvailableStock}</span>
              {inCartQty > 0 && (
                <span className="text-blue-600 dark:text-blue-400">({inCartQty} in cart)</span>
              )}
            </div>
          </div>

          <h3 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>

          {/* Time notice / Warning line */}
          {statusInfo.message && (
            <p className={`text-[11px] font-semibold mt-1.5 ${
              statusInfo.isClosed
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : statusInfo.isClosingSoon
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 dark:text-[#94A3B8]'
            }`}>
              {statusInfo.message}
            </p>
          )}
        </div>

        {/* Price & Quantity Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between gap-2">
          
          <div>
            <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold block -mb-0.5">Price</span>
            <span className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              ₹{item.price}
            </span>
          </div>

          {isOrderable ? (
            <div className="flex items-center gap-2">
              {/* Stepper (bounded by remaining stock) */}
              <div className="flex items-center bg-slate-100 dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#334155] rounded-lg transition disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-[#F8FAFC]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(effectiveAvailableStock, quantity + 1))}
                  disabled={quantity >= effectiveAvailableStock}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#334155] rounded-lg transition disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAdd}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-sm text-white ${
                  addedAnimation
                    ? 'bg-emerald-600 dark:bg-[#10B981]'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-blue-600'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-right">
              {isCurrentlySoldOut ? (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 inline-block">
                  Sold Out
                </span>
              ) : statusInfo.isUpcoming ? (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 inline-block">
                  Opens at {item.startTime}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1] bg-slate-100 dark:bg-[#1E293B] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#334155] inline-block">
                  Ordering Closed
                </span>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MenuCard;
