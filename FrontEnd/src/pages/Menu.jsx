import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MenuCard } from '../components/menu/MenuCard';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useTime } from '../context/TimeContext';
import { FOOD_CATEGORIES } from '../data/mockData';
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  Flame,
  Coffee,
  UtensilsCrossed,
  Cake,
  Package
} from 'lucide-react';

export const Menu = () => {
  const { menuItems } = useOrders();
  const { itemCount, subtotal } = useCart();
  const { currentMealPhase, getItemStatus, schedules, formattedTime } = useTime();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const handleCategorySelect = (category) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Base filter for search and dietary preferences
  const filterList = (items) => {
    return items.filter((item) => {
      if (vegOnly && !item.isVeg) return false;
      if (availableOnly) {
        const st = getItemStatus(item);
        if (!st.isOpen) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchCat = item.category?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  };

  // Groupings by category
  const breakfastItems = useMemo(() => filterList(menuItems.filter(i => i.mealType === 'BREAKFAST' || i.category === 'Morning Tiffins')), [menuItems, vegOnly, availableOnly, searchQuery]);
  const lunchItems = useMemo(() => filterList(menuItems.filter(i => i.mealType === 'LUNCH' || i.category === 'Lunch Pre-Orders')), [menuItems, vegOnly, availableOnly, searchQuery]);
  const snackItems = useMemo(() => filterList(menuItems.filter(i => i.mealType === 'SNACKS' || i.category === 'Evening Snacks')), [menuItems, vegOnly, availableOnly, searchQuery]);
  const allDayItems = useMemo(() => filterList(menuItems.filter(i => i.isAllDay || i.mealType === 'ALL_DAY' || i.category === 'All-Day Items')), [menuItems, vegOnly, availableOnly, searchQuery]);
  const cakeItems = useMemo(() => filterList(menuItems.filter(i => i.mealType === 'CAKE' || i.category === 'Cakes / Special Orders')), [menuItems, vegOnly, availableOnly, searchQuery]);

  // Filtered list when a specific category tab is clicked
  const specificCategoryItems = useMemo(() => {
    if (activeCategory === 'All') return [];
    return filterList(menuItems.filter(i => i.category === activeCategory));
  }, [menuItems, activeCategory, vegOnly, availableOnly, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 pb-28">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/home" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Pragati University Canteen Menu</span>
        </div>

        {/* Deadlines & Guidelines Notice Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
            <Coffee className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-extrabold">Morning Tiffins</strong>
              <span className="text-[11px] text-amber-900 font-medium">{schedules.breakfast.start} – {schedules.breakfast.end}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-extrabold">Lunch Pre-Orders</strong>
              <span className="text-[11px] text-blue-900 font-medium">{schedules.lunch.start} – {schedules.lunch.end} (Pickup 12–2 PM)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 flex items-start gap-2.5">
            <UtensilsCrossed className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-extrabold">Evening Snacks</strong>
              <span className="text-[11px] text-teal-900 font-medium">{schedules.eveningSnacks.start} – {schedules.eveningSnacks.end}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-2.5">
            <Cake className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-extrabold">Celebration Cakes</strong>
              <span className="text-[11px] text-purple-900 font-medium">Book before {schedules.cake.end} (Pickup after 3 PM)</span>
            </div>
          </div>

        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white dark:bg-[#172033] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#334155] shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food (e.g. Chicken Biryani, Idli, Samosa, Meals, Ice Cream)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#F8FAFC]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Pure Veg & Available Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                  vegOnly
                    ? 'badge-pure-veg ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#111827]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#10B981]"></span>
                <span>Pure Veg</span>
              </button>

              <button
                type="button"
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  availableOnly
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#111827]'
                }`}
              >
                Available Right Now
              </button>
            </div>

          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {FOOD_CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition border cursor-pointer ${
                    active
                      ? 'bg-blue-600 dark:bg-[#3B82F6] text-white border-blue-600 dark:border-[#3B82F6] shadow-sm'
                      : 'bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct counter purchase notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[11px] font-medium leading-relaxed">
            <strong>Campus Counter Notice:</strong> "Didn't pre-order before the break deadline? You can still purchase available items directly at the canteen counter while hot batches last."
          </span>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: DYNAMIC TIME-ORGANIZED MENU (When 'All' is selected)     */}
        {/* Automatically organizes based on current time (Prompt Section 7) */}
        {/* ============================================================== */}
        {activeCategory === 'All' ? (
          <div className="space-y-10">

            {/* Phase 1: BREAKFAST ACTIVE */}
            {currentMealPhase.type === 'BREAKFAST' && (
              <>
                {/* 1. Morning Tiffins (Active) */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                          CURRENTLY SERVING
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                          Morning Tiffins (6:00 AM – 9:30 AM)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hot steamed idlis, ghee masala dosas, pooris, and filter coffee. Ordering closes at 9:30 AM.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 font-mono">
                      Closes at {schedules.breakfast.end}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {breakfastItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* 2. All-Day Items (Active) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                        All-Day Items & Packaged Snacks
                      </h2>
                      <p className="text-xs text-slate-500">
                        Ice creams, biscuit packets, cool drinks, and snacks available throughout the day.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-600">Available All Day</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {allDayItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* 3. Upcoming: Lunch Pre-Orders (Opens at 9:00 AM) */}
                <section className="space-y-4 opacity-80">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">UPCOMING TODAY</span>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                        Lunch Pre-Orders (Opens at 9:00 AM)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400 font-mono">Opens 9:00 AM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {lunchItems.slice(0, 4).map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>
              </>
            )}

            {/* Phase 2: LUNCH PRE-ORDERS ACTIVE (9:00 AM – 12:00 PM) */}
            {currentMealPhase.type === 'LUNCH' && (
              <>
                {/* 1. Lunch Pre-Orders (Active) */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-black uppercase">
                          PRE-ORDERS OPEN
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                          Lunch Pre-Orders (9:00 AM – 12:00 PM)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pre-order hot Andhra meals, Hyderabadi biryanis, and fried rice before 12:00 PM. Pickup: 12:00 PM – 2:00 PM.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 font-mono block">
                        Cutoff: {schedules.lunch.end}
                      </span>
                      <span className="text-[10px] text-teal-600 font-semibold">
                        Pickup: 12:00 PM – 2:00 PM
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {lunchItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* 2. All-Day Items (Active) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                        All-Day Items & Packaged Snacks
                      </h2>
                      <p className="text-xs text-slate-500">
                        Ice creams, biscuit packets, chips, and chilled cool drinks.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-600">Available All Day</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {allDayItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* 3. Celebration Cakes (Book before 1:00 PM) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black uppercase">
                          BOOK BEFORE 1:00 PM
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                          Celebration Cakes (Pickup After 3:00 PM)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500">Freshly baked campus birthday cakes. Prepared on demand.</p>
                    </div>
                    <span className="text-xs font-bold text-purple-700 font-mono">Cutoff: 1:00 PM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cakeItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* 4. Closed Breakfast Section (Prompt Rule 1: "After 9:30 AM: Do NOT allow new breakfast pre-orders") */}
                <section className="space-y-4 opacity-60">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                        CLOSED FOR TODAY
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-700 mt-1">
                        Morning Tiffins (Breakfast ordering is closed)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400 font-mono">Closed at 9:30 AM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {breakfastItems.slice(0, 4).map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>
              </>
            )}

            {/* Phase 3: LUNCH PICKUP ONLY (12:00 PM – 1:00 PM) */}
            {currentMealPhase.type === 'LUNCH_PICKUP' && (
              <>
                {/* Notice Card for Lunch Pickup */}
                <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-slate-900 dark:text-[#F8FAFC]">
                        Lunch Pickup Window Active (12:00 PM – 2:00 PM)
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Lunch pre-ordering is closed. Students and faculty with digital tickets can collect their orders at the canteen.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/orders"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition shrink-0 text-center"
                  >
                    View My Pickup Ticket
                  </Link>
                </div>

                {/* All-Day Items */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                        Available Now: All-Day Items
                      </h2>
                      <p className="text-xs text-slate-500">Ice creams, biscuit packets, and beverages.</p>
                    </div>
                    <span className="text-xs font-bold text-teal-600">Available All Day</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {allDayItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* Closed Lunch Items */}
                <section className="space-y-4 opacity-60">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                        PRE-ORDERS CLOSED
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-700 mt-1">
                        Lunch Items (Pre-ordering closed at 12:00 PM)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400 font-mono">Pickup until 2:00 PM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {lunchItems.slice(0, 4).map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>
              </>
            )}

            {/* Phase 4: EVENING SNACKS ACTIVE (1:00 PM – 3:30 PM) */}
            {currentMealPhase.type === 'SNACKS' && (
              <>
                {/* 1. Evening Snacks (Active) */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-teal-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-black uppercase">
                          CURRENTLY AVAILABLE
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                          Evening Snacks (1:00 PM – 3:30 PM)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hot crispy samosas, veg & egg puffs, mirchi bajji, cutlets, and tea. Closes at 3:30 PM.
                      </p>
                    </div>

                    <span className="text-xs font-bold text-teal-700 font-mono">
                      Closes at {schedules.eveningSnacks.end}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {snackItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* 2. All-Day Items (Active) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                        All-Day Items & Packaged Snacks
                      </h2>
                      <p className="text-xs text-slate-500">Ice creams, biscuit packets, and beverages.</p>
                    </div>
                    <span className="text-xs font-bold text-teal-600">Available All Day</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {allDayItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* Closed Lunch Items */}
                <section className="space-y-4 opacity-60">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                        PRE-ORDERS CLOSED
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-700 mt-1">
                        Lunch Pre-Orders (Closed for Today)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400 font-mono">Closed at 12:00 PM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {lunchItems.slice(0, 4).map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>
              </>
            )}

            {/* Phase 5: EVENING / POST-3:30 PM (All-Day Items & Cake Pickup) */}
            {currentMealPhase.type === 'ALL_DAY' && (
              <>
                {/* 1. All-Day Items (Active) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-black uppercase">
                          OPEN ALL DAY
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                          All-Day Items & Packaged Snacks
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ice creams, biscuit packets, chips, and chilled beverages available while counter stock lasts.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-600">In Stock</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {allDayItems.map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>

                {/* Notice for Cake Pickup */}
                <div className="p-4 rounded-3xl bg-purple-50 border border-purple-200 text-purple-950 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Cake className="w-5 h-5 text-purple-600 shrink-0" />
                    <span><strong>Cake Orders:</strong> Pre-ordered celebration cakes can be collected at the canteen once marked ready.</span>
                  </div>
                  <Link to="/orders" className="text-purple-700 font-bold hover:underline shrink-0">
                    View Ticket →
                  </Link>
                </div>

                {/* Closed Evening Snacks */}
                <section className="space-y-4 opacity-60">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                        SNACKS CLOSED
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-700 mt-1">
                        Evening Snacks (Ordering closed at 3:30 PM)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400 font-mono">Closed at 3:30 PM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {snackItems.slice(0, 4).map(item => <MenuCard key={item.id} item={item} />)}
                  </div>
                </section>
              </>
            )}

          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: SPECIFIC CATEGORY TAB VIEW                             */
          /* ============================================================== */
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{specificCategoryItems.length}</strong> items in <strong>{activeCategory}</strong>
              </span>
              <span className="text-teal-700 font-semibold font-mono">
                Current Time: {formattedTime}
              </span>
            </div>

            {specificCategoryItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-extrabold text-slate-900 text-base">No food items found</h3>
                <p className="text-xs text-slate-500">
                  No dishes match your active filter criteria. Try changing the category or clearing the search query.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setVegOnly(false);
                    setAvailableOnly(false);
                    handleCategorySelect('All');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Reset to All Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {specificCategoryItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Sticky Bottom Cart Bar (if items in cart) */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#334155] shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                {itemCount}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-semibold block">Total in Tray</span>
                <span className="text-lg font-black text-slate-900 dark:text-[#F8FAFC]">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/cart"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition active:scale-95"
            >
              <span>View Cart & Proceed</span>
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Menu;
