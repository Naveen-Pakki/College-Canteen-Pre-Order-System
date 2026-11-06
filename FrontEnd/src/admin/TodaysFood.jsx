import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { DietaryBadge } from '../components/ui/Badge';
import { useOrders } from '../context/OrderContext';
import { useTime } from '../context/TimeContext';
import { FOOD_CATEGORIES } from '../data/mockData';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  X,
  Save,
  RotateCcw,
  UtensilsCrossed,
  Package,
  Layers
} from 'lucide-react';

export const TodaysFood = () => {
  const {
    menuItems,
    addMenuItem,
    editMenuItem,
    updateItemStock,
    deleteMenuItem,
    toggleItemAvailability,
    resetDailyStock
  } = useOrders();

  const { getItemStatus, formattedDate, formattedTime } = useTime();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item State for Quick Add
  const [newFood, setNewFood] = useState({
    name: '',
    category: 'Lunch Pre-Orders',
    mealType: 'LUNCH',
    price: 120,
    stockQuantity: 50,
    isAllDay: false,
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    pickupStart: '12:00 PM',
    pickupEnd: '02:00 PM',
    description: '',
    isVeg: false,
    prepTime: '10 mins',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  });

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    editMenuItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (!newFood.name || !newFood.price) return;
    addMenuItem(newFood);
    setIsAddModalOpen(false);
    setNewFood({
      name: '',
      category: 'Lunch Pre-Orders',
      mealType: 'LUNCH',
      price: 120,
      stockQuantity: 50,
      isAllDay: false,
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      pickupStart: '12:00 PM',
      pickupEnd: '02:00 PM',
      description: '',
      isVeg: false,
      prepTime: '10 mins',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    });
  };

  const handleDailyReset = () => {
    if (window.confirm("Are you sure you want to reset today's menu availability and stock back to defaults?")) {
      resetDailyStock();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-blue-600">Admin</Link>
          <span>/</span>
          <span className="text-slate-800">Today's Food Controls</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-7 h-7 text-teal-600" />
              <span>Today's Available Food & Live Stock</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control daily food availability, adjust live quantities, set ordering & pickup times, and toggle All-Day items.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Daily Reset Button (Prompt Rule 19) */}
            <button
              type="button"
              onClick={handleDailyReset}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5 transition"
              title="Reset inventory to initial default numbers"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Daily Stock Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-500/25 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Today's Dish</span>
            </button>
          </div>
        </div>

        {resetSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Today's menu schedule and stock quantities have been successfully reset to defaults!</span>
          </div>
        )}

        {/* Toolbar & Category Filters */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Total Today's Menu: <strong>{menuItems.length}</strong> Dishes
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Today's Food Cards Grid with Live Stock and Scheduling Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const statusInfo = getItemStatus(item);
            const isAvail = item.isAvailable !== false && (item.stockQuantity ?? 50) > 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-5 shadow-soft flex flex-col justify-between transition-all ${
                  isAvail ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DietaryBadge isVeg={item.isVeg} showText={false} />
                          <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-[#10B981]">
                            {item.category}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusInfo.badgeClass}`}>
                          {statusInfo.badge}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base font-black text-slate-900">
                          ₹{item.price}
                        </span>

                        {/* ALL DAY badge (Prompt Rule 14) */}
                        {item.isAllDay && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-black border border-teal-200">
                            ALL DAY
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Quantity Controls (Prompt Rule 9, 10, 13) */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Quantity</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {item.stockQuantity ?? 50} units
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateItemStock(item.id, Math.max(0, (item.stockQuantity ?? 50) - 5))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-black text-xs text-slate-700 flex items-center justify-center transition"
                        title="-5 units"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItemStock(item.id, (item.stockQuantity ?? 50) + 5)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-black text-xs text-slate-700 flex items-center justify-center transition"
                        title="+5 units"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Ordering & Pickup Times */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Ordering:
                      </span>
                      <span className="font-extrabold text-slate-800">
                        {item.isAllDay ? 'All Day' : `${item.startTime || '9:00 AM'} – ${item.endTime || '12:00 PM'}`}
                      </span>
                    </div>

                    {item.pickupStart && (
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Pickup Window:</span>
                        <span className="font-bold text-teal-700">
                          {item.pickupStart} – {item.pickupEnd || '2:00 PM'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons: [Edit] [Sold Out / In Stock] [Remove] */}
                <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                      item.isAvailable !== false && (item.stockQuantity ?? 50) > 0
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    <span>{item.isAvailable !== false && (item.stockQuantity ?? 50) > 0 ? 'Mark Sold' : 'Enable'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMenuItem(item.id)}
                    className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Edit Food Modal (Prompt Rule 13: Configure schedule, quantity, all-day flag) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Configure Food Dish: {editingItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price in ₹</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    value={editingItem.stockQuantity ?? 50}
                    onChange={(e) => setEditingItem({ ...editingItem, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              {/* All-Day Items Toggle (Prompt Rule 14) */}
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-teal-950 block">Mark as "ALL DAY" Item</span>
                  <span className="text-[11px] text-teal-800">Ignores breakfast/lunch/snack time restrictions.</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingItem.isAllDay)}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    isAllDay: e.target.checked,
                    mealType: e.target.checked ? 'ALL_DAY' : editingItem.mealType
                  })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </div>

              {/* Timing Schedule */}
              {!editingItem.isAllDay && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-black text-slate-900 block text-xs">Ordering & Pickup Schedule</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Ordering Start Time</label>
                      <input
                        type="text"
                        value={editingItem.startTime || '09:00 AM'}
                        onChange={(e) => setEditingItem({ ...editingItem, startTime: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Ordering Cutoff Time</label>
                      <input
                        type="text"
                        value={editingItem.endTime || '12:00 PM'}
                        onChange={(e) => setEditingItem({ ...editingItem, endTime: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Pickup Start</label>
                      <input
                        type="text"
                        value={editingItem.pickupStart || '12:00 PM'}
                        onChange={(e) => setEditingItem({ ...editingItem, pickupStart: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Pickup End</label>
                      <input
                        type="text"
                        value={editingItem.pickupEnd || '02:00 PM'}
                        onChange={(e) => setEditingItem({ ...editingItem, pickupEnd: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Add Today's New Dish</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  placeholder="e.g. Special Chicken 65"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newFood.category}
                    onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {FOOD_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price in ₹</label>
                  <input
                    type="number"
                    value={newFood.price}
                    onChange={(e) => setNewFood({ ...newFood, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    value={newFood.stockQuantity}
                    onChange={(e) => setNewFood({ ...newFood, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dietary</label>
                  <select
                    value={newFood.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setNewFood({ ...newFood, isVeg: e.target.value === 'veg' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="nonveg">Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* All-Day checkbox */}
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-teal-950 block">Mark as "ALL DAY" Item</span>
                  <span className="text-[11px] text-teal-800">Available all day without time restriction</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(newFood.isAllDay)}
                  onChange={(e) => setNewFood({
                    ...newFood,
                    isAllDay: e.target.checked,
                    mealType: e.target.checked ? 'ALL_DAY' : newFood.mealType
                  })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Ingredients and culinary description..."
                  value={newFood.description}
                  onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Dish to Menu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TodaysFood;
