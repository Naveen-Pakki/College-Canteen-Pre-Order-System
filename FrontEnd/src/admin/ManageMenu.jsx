import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { DietaryBadge } from '../components/ui/Badge';
import { useOrders } from '../context/OrderContext';
import { useTime } from '../context/TimeContext';
import { FOOD_CATEGORIES } from '../data/mockData';
import {
  ChefHat,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Clock,
  Sparkles,
  Package
} from 'lucide-react';

export const ManageMenu = () => {
  const { menuItems, addMenuItem, editMenuItem, deleteMenuItem, toggleItemAvailability } = useOrders();
  const { getItemStatus } = useTime();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Lunch Pre-Orders',
    mealType: 'LUNCH',
    price: 90,
    stockQuantity: 50,
    isAllDay: false,
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    pickupStart: '12:00 PM',
    pickupEnd: '02:00 PM',
    description: '',
    isVeg: true,
    prepTime: '10 mins',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    addMenuItem(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      category: 'Lunch Pre-Orders',
      mealType: 'LUNCH',
      price: 90,
      stockQuantity: 50,
      isAllDay: false,
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      pickupStart: '12:00 PM',
      pickupEnd: '02:00 PM',
      description: '',
      isVeg: true,
      prepTime: '10 mins',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    editMenuItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-blue-600">Admin</Link>
          <span>/</span>
          <span className="text-slate-800">Menu Catalog</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-blue-600" />
              <span>Full Canteen Menu Catalog & Scheduling</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add new food dishes, edit prices in ₹, configure stock quantities, and set ordering deadlines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog dishes..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing <strong>{filteredItems.length}</strong> of {menuItems.length} items
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
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Diet</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const statusInfo = getItemStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 block">{item.name}</span>
                            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{item.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        <span>{item.category}</span>
                        {item.isAllDay && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-teal-100 text-teal-800">
                            ALL DAY
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <DietaryBadge isVeg={item.isVeg} />
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">₹{item.price}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {item.stockQuantity ?? 50} units
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {item.isAllDay ? 'All Day' : `${item.startTime || '9:00 AM'} - ${item.endTime || '12:00 PM'}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition ${
                            item.isAvailable !== false && (item.stockQuantity ?? 50) > 0
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {item.isAvailable !== false && (item.stockQuantity ?? 50) > 0 ? 'AVAILABLE' : 'SOLD OUT'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit dish"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Edit Modal (Prompt Rule 13 & 14) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Edit Food Dish: {editingItem.name}</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
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
                  <span className="text-[11px] text-teal-800">Available all day without time restriction</span>
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

              {!editingItem.isAllDay && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Start Time</label>
                    <input
                      type="text"
                      value={editingItem.startTime || '09:00 AM'}
                      onChange={(e) => setEditingItem({ ...editingItem, startTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Cutoff Time</label>
                    <input
                      type="text"
                      value={editingItem.endTime || '12:00 PM'}
                      onChange={(e) => setEditingItem({ ...editingItem, endTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {FOOD_CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Add New Menu Dish</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mutton Biryani or Veg Fried Rice"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price in ₹</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* All-Day checkbox */}
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-teal-950 block">Mark as "ALL DAY" Item</span>
                  <span className="text-[11px] text-teal-800">Available all day without time restrictions</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.isAllDay)}
                  onChange={(e) => setFormData({
                    ...formData,
                    isAllDay: e.target.checked,
                    mealType: e.target.checked ? 'ALL_DAY' : formData.mealType
                  })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {FOOD_CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
                >
                  Add to Menu
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

export default ManageMenu;
