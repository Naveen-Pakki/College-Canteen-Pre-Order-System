import React from 'react';
import { useTime } from '../../context/TimeContext';
import { DietaryBadge } from '../ui/Badge';
import { Plus, Minus, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { getItemStatus } = useTime();
  const statusInfo = getItemStatus(item);

  const isInvalid = !statusInfo.isOpen;

  return (
    <div className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
      isInvalid 
        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-l-rose-500' 
        : 'bg-white dark:bg-[#172033] hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/60'
    }`}>
      
      {/* Thumbnail & Food Name */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <img
          src={item.image}
          alt={item.name}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-[#334155] ${
            isInvalid ? 'grayscale' : ''
          }`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <DietaryBadge isVeg={item.isVeg} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-[#10B981]">
              {item.category}
            </span>
            {isInvalid && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {statusInfo.status === 'SOLD_OUT' ? 'SOLD OUT' : 'ORDERING CLOSED'}
              </span>
            )}
          </div>

          <h4 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-sm sm:text-base truncate">
            {item.name}
          </h4>
          <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] block mt-0.5">
            ₹{item.price} each
          </span>

          {/* Warning notice if closed or sold out */}
          {isInvalid && (
            <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{statusInfo.message || 'Ordering is closed. Please remove to checkout.'}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stepper & Price Calculation */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-[#334155]">
        
        {/* Quantity Stepper */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#334155] rounded-lg transition"
            title="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-7 text-center text-xs font-black text-slate-900 dark:text-[#F8FAFC]">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, 1, item.stockQuantity ?? 50)}
            disabled={isInvalid || (item.stockQuantity && item.quantity >= item.stockQuantity)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#334155] rounded-lg transition disabled:opacity-40"
            title="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Item Total in ₹ */}
        <div className="text-right w-16 sm:w-20">
          <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold block">Total</span>
          <span className="font-black text-slate-900 dark:text-[#F8FAFC] text-sm sm:text-base">
            ₹{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-400 dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};

export default CartItem;
