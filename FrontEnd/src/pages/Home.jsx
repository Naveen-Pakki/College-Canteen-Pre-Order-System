import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MenuCard } from '../components/menu/MenuCard';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../context/TimeContext';
import {
  Clock,
  QrCode,
  Calendar,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Home = () => {
  const { menuItems, orders } = useOrders();
  const { currentUser } = useAuth();
  const { currentMealPhase, schedules } = useTime();
  const navigate = useNavigate();

  // Find user's active order if any
  const activeOrder = orders.find(o => 
    o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY FOR PICKUP'
  );

  // Popular & today's available items
  const popularItems = menuItems.filter(i => i.isPopular && i.isAvailable !== false).slice(0, 4);
  const todaysAvailable = menuItems.filter(i => i.isAvailable !== false).slice(0, 8);

  const categories = [
    { name: "Morning Tiffins", icon: "🥞", time: `${schedules.breakfast.start} - ${schedules.breakfast.end}` },
    { name: "Lunch Pre-Orders", icon: "🍱", time: `Pre-order before ${schedules.lunch.end}` },
    { name: "Evening Snacks", icon: "🥟", time: `${schedules.eveningSnacks.start} - ${schedules.eveningSnacks.end}` },
    { name: "All-Day Items", icon: "🍨", time: "Available All Day" },
    { name: "Cakes / Special Orders", icon: "🎂", time: `Book before ${schedules.cake.end}` }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="flex-1 w-full space-y-6 py-6 pb-16">
        
        {/* Active Order Alert Card (if any) */}
        {activeOrder && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white rounded-3xl p-5 sm:p-6 shadow-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase">
                      Active Reserved Order
                    </span>
                    <span className="text-xs font-mono text-blue-100">Token #{activeOrder.tokenNumber}</span>
                  </div>
                  <h3 className="text-lg font-black mt-0.5">
                    Order Status: <span className="underline decoration-teal-300">{activeOrder.status}</span>
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Collect your order at the canteen anytime once marked READY FOR PICKUP.
                  </p>
                </div>
              </div>

              <Link
                to={`/ticket?id=${activeOrder.id}`}
                className="px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow transition flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
              >
                <span>View Digital Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Categories Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">Today's Schedule & Categories</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Live ordering windows for Pragati University members</p>
            </div>
            <Link to="/menu" className="text-xs font-bold text-blue-600 dark:text-[#3B82F6] hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1">
              <span>View Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="p-3.5 bg-white dark:bg-[#172033] rounded-2xl border border-slate-200/80 dark:border-[#334155] hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-soft transition text-center group flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-xs line-clamp-1">{cat.name}</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-[#94A3B8] block mt-1 line-clamp-1">
                  {cat.time}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Items Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-[#3B82F6] uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Student & Faculty Favorites</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                Popular Dishes Today
              </h2>
            </div>

            <Link
              to="/menu"
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-[#1E293B] text-blue-700 dark:text-[#3B82F6] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white font-bold text-xs transition"
            >
              Full Menu (₹) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Today's Available Food */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] text-slate-900 dark:text-white border border-slate-200 dark:border-[#334155] shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                  Live Canteen Kitchen Controls
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] mt-0.5">
                  Today's Freshly Prepared Menu
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Items update their available stock automatically. Sold out immediately when counter batches finish.
                </p>
              </div>

              <Link
                to="/menu"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 font-black text-xs transition self-start sm:self-auto shadow-sm"
              >
                Explore & Reserve Food →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-900 dark:text-[#F8FAFC]">
              {todaysAvailable.slice(0, 4).map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
