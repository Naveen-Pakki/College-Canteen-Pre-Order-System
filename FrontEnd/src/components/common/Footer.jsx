import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Clock, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import pragatiLogo from '../../assets/images/pragati-university-logo.jpg';

export const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Col 1: Pragati University Canteen Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                <img
                  src={pragatiLogo}
                  alt="Pragati University"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-black text-base text-white tracking-tight">
                  Pragati University Canteen
                </span>
                <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                  Pragati University
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              "Reserve Early. Skip the Queue. Reduce Food Waste." <br />
              Smart food pre-order and reservation platform for Pragati University students and faculty members.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-teal-300">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Direct Razorpay Cashless Payments</span>
            </div>
          </div>

          {/* Col 2: Institutional Timing Guidelines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Kitchen Schedule & Deadlines
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Morning Tiffins:</strong>
                  <p className="text-slate-400 text-[11px]">8:00 AM – 10:30 AM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Lunch Pre-Order:</strong>
                  <p className="text-amber-300 text-[11px] font-semibold">Strictly Before 11:00 AM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Celebration Cakes:</strong>
                  <p className="text-amber-300 text-[11px] font-semibold">Order Before 10:00 AM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Location & Administration Desk */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Campus Contact Desk
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  Pragati University<br />
                  ADB Road, Surampalem, Near Peddapuram, East Godavari Dist.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-300 font-mono text-[11px]">canteen.admin@pragati.edu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-300 font-mono text-[11px]">+91 98480 22334</span>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[10px] text-slate-400">
                "Didn't pre-order? You can purchase available items directly at the canteen."
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Pragati University Canteen Services. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-500">All Prices in Indian Rupees (₹)</span>
            <span>•</span>
            <span className="text-teal-400 font-semibold">Razorpay Direct Settlement</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

