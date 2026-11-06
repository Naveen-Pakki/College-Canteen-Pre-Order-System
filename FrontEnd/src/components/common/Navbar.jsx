import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CompactLiveClock } from './LiveTimeBar';
import { ThemeToggle } from './ThemeToggle';
import pragatiLogo from '../../assets/images/pragati-university-logo.jpg';
import {
  ShoppingBag,
  User,
  Menu as MenuIcon,
  X,
  Sparkles,
  LayoutDashboard,
  ChefHat,
  Layers,
  Settings,
  LogOut,
  Calendar,
  Clock,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Navigation for Student / Faculty (Shared same portal)
  const userNavLinks = [
    { name: 'Home', path: '/home' },
    { name: "Today's Menu", path: '/menu' },
    { name: 'My Cart', path: '/cart' },
    { name: 'My Orders', path: '/orders' },
    { name: 'Profile', path: '/profile' }
  ];

  // Navigation for Admin Portal (Manages both Menu and Chef/Prep)
  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: "Today's Food", path: '/admin/todays-food' },
    { name: 'Manage Menu', path: '/admin/menu' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Chef / Preparation', path: '/admin/chef-preparation' },
    { name: 'Settings', path: '/admin/settings' }
  ];

  const currentLinks = isAdmin ? adminNavLinks : userNavLinks;
  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#334155] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Pragati University Brand Logo */}
          <Link to={isAdmin ? "/admin/dashboard" : (currentUser ? "/home" : "/")} className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200/90 dark:border-[#334155] shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <img
                src={pragatiLogo}
                alt="Pragati University"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="font-black text-lg sm:text-xl tracking-tight whitespace-nowrap">
              <span className="text-[#0F172A] dark:text-[#F8FAFC]">Pragati </span>
              <span className="text-[#059669] dark:text-[#10B981]">University</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-1">
              {currentLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isActive(link.path)
                      ? (isAdmin ? 'text-teal-700 dark:text-[#10B981] bg-teal-50 dark:bg-[#1E293B] font-bold' : 'text-blue-600 dark:text-[#3B82F6] bg-blue-50/80 dark:bg-[#1E293B] font-bold')
                      : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#1E293B]/60'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button (Light / Dark with circular reveal) */}
            <ThemeToggle />

            {/* Cart tray button for Student / Faculty */}
            {!isAdmin && currentUser && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-slate-700 dark:text-[#CBD5E1] hover:text-blue-600 dark:hover:text-[#3B82F6] hover:bg-blue-50 dark:hover:bg-[#1E293B] transition border border-transparent hover:border-blue-100 dark:hover:border-[#334155]"
                title="My Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Logged in User Greeting Badge */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition text-left"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${isAdmin ? 'bg-teal-600' : 'bg-blue-600'}`}>
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                        Welcome, {currentUser.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        currentUser.role === 'STUDENT' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' :
                        currentUser.role === 'FACULTY' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300' : 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-mono block -mt-0.5">
                      {currentUser.registrationId || currentUser.adminId}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#172033] rounded-2xl shadow-xl border border-slate-100 dark:border-[#334155] p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-[#334155] mb-1">
                      <p className="text-xs font-black text-slate-900 dark:text-[#F8FAFC]">{currentUser.name}</p>
                      <p className="text-[10px] font-mono text-blue-600 dark:text-[#3B82F6]">
                        {currentUser.registrationId || currentUser.adminId}
                      </p>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase mt-0.5 block">
                        Role: {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-[#64748B] block mt-0.5">
                        Pragati University
                      </span>
                    </div>

                    {!isAdmin ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl transition"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl transition"
                        >
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>My Orders & Tickets</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/admin/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Canteen Settings</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100 dark:border-[#334155]" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Compact Live Clock strip immediately below the navbar line, aligned to the top-right */}
      {currentUser && (
        <div className="border-t border-slate-100 dark:border-[#334155] bg-white/70 dark:bg-[#0B1120]/70 py-1.5 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-7xl mx-auto flex justify-end">
            <CompactLiveClock />
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && currentUser && (
        <div className="lg:hidden border-t border-slate-100 dark:border-[#334155] bg-white dark:bg-[#111827] px-4 pt-3 pb-6 space-y-1 shadow-xl">
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-bold ${
                isActive(link.path)
                  ? (isAdmin ? 'text-teal-700 dark:text-[#10B981] bg-teal-50 dark:bg-[#1E293B]' : 'text-blue-600 dark:text-[#3B82F6] bg-blue-50 dark:bg-[#1E293B]')
                  : 'text-slate-700 dark:text-[#CBD5E1]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleSignOut();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            Sign Out
          </button>
        </div>
      )}

    </header>
  );
};

export default Navbar;
