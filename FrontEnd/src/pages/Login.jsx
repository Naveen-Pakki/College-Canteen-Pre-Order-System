import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import pragatiLogo from '../assets/images/pragati-university-logo.jpg';
import {
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  Users,
  Building2,
  Mail,
  Phone,
  X,
  Sparkles
} from 'lucide-react';

export const Login = () => {
  // Exactly TWO options: 'user' (Student / Faculty) OR 'admin' (Canteen Management)
  const [selectedPortal, setSelectedPortal] = useState('user'); // 'user' | 'admin'

  // Input states
  const [registrationId, setRegistrationId] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const { loginStudentOrFaculty, loginAdmin, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handlePortalSwitch = (portal) => {
    setSelectedPortal(portal);
    setErrorMsg('');
    setPassword('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedPortal === 'user') {
      const result = loginStudentOrFaculty(registrationId, password);
      if (result.success) {
        navigate('/home');
      } else {
        setErrorMsg(result.message);
      }
    } else {
      const result = loginAdmin(adminId, password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(result.message);
      }
    }
  };

  // Instant 1-Click Evaluation Handler
  const handleQuickEvaluation = (roleType) => {
    if (roleType === 'student') {
      setRegistrationId('23A91A0501');
      setPassword('student123');
      demoLogin('student');
      navigate('/home');
    } else if (roleType === 'faculty') {
      setRegistrationId('FAC1024');
      setPassword('faculty123');
      demoLogin('faculty');
      navigate('/home');
    } else if (roleType === 'admin') {
      setAdminId('ADMIN001');
      setPassword('admin123');
      demoLogin('admin');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      
      {/* 5. Restored Original Institutional Top Navbar Branding */}
      <header 
        className="w-full border-b transition-colors duration-200 shadow-xs"
        style={{ 
          backgroundColor: 'var(--bg-header)', 
          borderColor: 'var(--border-color)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Pragati University Canteen Branding */}
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden border"
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <img
                src={pragatiLogo}
                alt="Pragati University Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="font-black text-base sm:text-lg tracking-tight leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Pragati University Canteen
                </span>
                <span 
                  className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    color: 'var(--accent-blue)', 
                    borderColor: 'var(--border-color)' 
                  }}
                >
                  PU Campus
                </span>
              </div>
              <p 
                className="text-xs font-semibold tracking-wide leading-tight mt-0.5"
                style={{ color: 'var(--accent-green)' }}
              >
                Pragati University • Surampalem
              </p>
            </div>
          </div>

          {/* Right: Green Status Indicator & Theme Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div 
              className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Campus Food Reservation Active</span>
            </div>

            {/* Theme Toggle (Sun / Moon with Diagonal Curtain Reveal) */}
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* Main Single-Column Centered Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col items-center justify-center">
        
        {/* 2. Main Heading at the Top */}
        <div className="text-center w-full max-w-4xl mx-auto space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-tight lg:whitespace-nowrap">
            <span style={{ color: 'var(--text-primary)' }}>Reserve Early. </span>
            <span style={{ color: 'var(--accent-blue)' }}>Skip the Queue.</span>
          </h1>

          {/* 3. Tagline Under the Main Heading */}
          <p 
            className="text-sm sm:text-base md:text-lg font-medium max-w-3xl mx-auto leading-relaxed px-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Order your food before the break and collect it from the{' '}
            <span className="font-bold" style={{ color: 'var(--accent-blue)' }}>
              Pragati University canteen
            </span>{' '}
            without waiting in long queues.
          </p>
        </div>

        {/* 4. Centered Sign-In Card (approx 480–520px width) */}
        <div className="w-full max-w-[500px] mx-auto">
          <div 
            className="rounded-3xl p-5 sm:p-7 border shadow-xl transition-all duration-200 space-y-4 sm:space-y-4.5"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            
            {/* Exactly TWO Login Options: Student / Faculty vs Admin */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Option 1: Student / Faculty (University Members) */}
              <button
                type="button"
                onClick={() => handlePortalSwitch('user')}
                className="p-3.5 sm:p-4 rounded-2xl border text-left transition relative cursor-pointer"
                style={{
                  backgroundColor: selectedPortal === 'user' ? 'var(--bg-secondary)' : 'transparent',
                  borderColor: selectedPortal === 'user' ? 'var(--accent-blue)' : 'var(--border-color)',
                  boxShadow: selectedPortal === 'user' ? '0 0 0 2px var(--accent-blue)' : 'none'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: selectedPortal === 'user' ? 'var(--accent-blue)' : 'var(--bg-input)',
                      color: selectedPortal === 'user' ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  {selectedPortal === 'user' && (
                    <span 
                      className="w-2 h-2 rounded-full ml-auto animate-pulse"
                      style={{ backgroundColor: 'var(--accent-blue)' }}
                    />
                  )}
                </div>
                <h3 
                  className="font-extrabold text-xs sm:text-sm leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Student / Faculty
                </h3>
                <p 
                  className="text-[10px] font-semibold mt-0.5 leading-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  University Members
                </p>
              </button>

              {/* Option 2: Admin (Canteen Desk) */}
              <button
                type="button"
                onClick={() => handlePortalSwitch('admin')}
                className="p-3.5 sm:p-4 rounded-2xl border text-left transition relative cursor-pointer"
                style={{
                  backgroundColor: selectedPortal === 'admin' ? 'var(--bg-secondary)' : 'transparent',
                  borderColor: selectedPortal === 'admin' ? 'var(--accent-green)' : 'var(--border-color)',
                  boxShadow: selectedPortal === 'admin' ? '0 0 0 2px var(--accent-green)' : 'none'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: selectedPortal === 'admin' ? 'var(--accent-green)' : 'var(--bg-input)',
                      color: selectedPortal === 'admin' ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  {selectedPortal === 'admin' && (
                    <span 
                      className="w-2 h-2 rounded-full ml-auto animate-pulse"
                      style={{ backgroundColor: 'var(--accent-green)' }}
                    />
                  )}
                </div>
                <h3 
                  className="font-extrabold text-xs sm:text-sm leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Admin
                </h3>
                <p 
                  className="text-[10px] font-semibold mt-0.5 leading-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Canteen Desk
                </p>
              </button>

            </div>

            {/* 7. Restored Instant 1-Click Evaluation Shortcuts */}
            <div 
              className="p-3.5 rounded-2xl border space-y-2 transition-colors duration-200"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                <span 
                  className="font-black text-[11px] uppercase tracking-wide"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Instant 1-Click Evaluation
                </span>
              </div>

              {selectedPortal === 'user' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickEvaluation('student')}
                    className="w-full py-2 px-2.5 rounded-xl text-white font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-97"
                    style={{ backgroundColor: 'var(--accent-blue)' }}
                  >
                    <span>Sign in as Student (23A91A0501)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickEvaluation('faculty')}
                    className="w-full py-2 px-2.5 rounded-xl font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-97 border"
                    style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>Sign in as Faculty (FAC1024)</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickEvaluation('admin')}
                  className="w-full py-2 px-2.5 rounded-xl text-white font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-97"
                  style={{ backgroundColor: 'var(--accent-green)' }}
                >
                  <span>Sign in as Admin (ADMIN001)</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div 
                className="p-3 rounded-xl border text-xs font-semibold"
                style={{ 
                  backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                  borderColor: 'rgba(220, 38, 38, 0.3)',
                  color: '#DC2626'
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Manual Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Field 1: Registration ID or Admin ID */}
              <div>
                <label 
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedPortal === 'user' ? 'Pragati University Registration ID' : 'Admin ID'}
                </label>
                <div className="relative">
                  <BadgeCheck 
                    className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  {selectedPortal === 'user' ? (
                    <input
                      type="text"
                      value={registrationId}
                      onChange={(e) => setRegistrationId(e.target.value)}
                      placeholder="e.g. 23A91A0501 or FAC1024"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl uppercase font-mono border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--bg-input)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. ADMIN001"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl uppercase font-mono border focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--bg-input)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      required
                    />
                  )}
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs font-bold hover:underline cursor-pointer"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock 
                    className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)' 
                    }}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Remember Me on this device
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                style={{
                  backgroundColor: selectedPortal === 'admin' ? 'var(--accent-green)' : 'var(--accent-blue)'
                }}
              >
                <span>
                  {selectedPortal === 'user' ? 'Sign In to University Portal' : 'Sign In to Admin Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Institutional Registration Policy Notice */}
            <div 
              className="pt-2 border-t text-center"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <p 
                className="text-[11px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Pragati University Institutional Access Only. No public signup.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Institutional Footer */}
      <footer 
        className="w-full py-4 sm:py-5 border-t text-xs text-center transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--bg-header)', 
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <img src={pragatiLogo} alt="Pragati University" className="w-5 h-5 object-contain" />
            <span>© {new Date().getFullYear()} Pragati University, Surampalem. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Prices in Indian Rupees (₹)</span>
            <span>•</span>
            <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>
              PU Canteen Food Pre-Order &amp; Reservation Platform
            </span>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="rounded-3xl max-w-md w-full p-6 space-y-4 border shadow-2xl relative"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl cursor-pointer hover:opacity-80 transition"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div 
              className="flex items-center gap-3 pb-3 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div 
                className="w-10 h-10 rounded-full border p-0.5 flex items-center justify-center shrink-0 overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border-color)' 
                }}
              >
                <img src={pragatiLogo} alt="Pragati University" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 
                  className="font-black text-base"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Password Assistance
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Pragati University Administrative &amp; Canteen Desk
                </p>
              </div>
            </div>

            <div 
              className="space-y-3 text-xs leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              <p>
                Student and Faculty credentials are pre-registered by Pragati University. For password resets:
              </p>

              <div 
                className="p-3.5 rounded-2xl border space-y-2"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)' 
                }}
              >
                <div 
                  className="flex items-center gap-2 font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Building2 className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <span>University Administrative Block:</span>
                </div>
                <p 
                  className="text-[11px] pl-6"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Administrative Block, Ground Floor, Surampalem Campus.
                </p>

                <div 
                  className="flex items-center gap-2 font-bold pt-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Mail className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <span>Canteen In-charge Email:</span>
                </div>
                <p 
                  className="text-[11px] font-mono pl-6 font-semibold"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  canteen.admin@pragati.edu.in
                </p>

                <div 
                  className="flex items-center gap-2 font-bold pt-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Phone className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <span>Campus Helpline:</span>
                </div>
                <p 
                  className="text-[11px] font-mono pl-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  +91 98480 22334
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full py-3 rounded-xl text-white font-bold text-xs transition cursor-pointer"
                style={{ backgroundColor: 'var(--accent-blue)' }}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
