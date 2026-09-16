import React from 'react';
import { Home, ShieldCheck, Heart, MapPin, Phone, MessageSquare, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onOpenSupabaseDocs: () => void;
  onNavigate: (view: string) => void;
  onOpenReportFraud: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSupabaseDocs, onNavigate, onOpenReportFraud }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Anti-broker Banner */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">
              KaaKaribu Zero-Dalali Student Protection Policy:
            </span>
            <span className="text-emerald-100 hidden md:inline">
              Never pay inspection fees or middleman commissions. All contacts link directly to verified property owners.
            </span>
          </div>
          <button
            onClick={onOpenReportFraud}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>Report Broker Fee Demand</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Kaa<span className="text-emerald-600 dark:text-emerald-400">Karibu</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated student rental network serving St John's University students, faculty, and residents in Dodoma. Direct connection, zero middleman broker fees.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>St John’s University of Tanzania (SJUT), Dodoma</span>
            </div>
          </div>

          {/* Col 2: Popular Campus Zones */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-heading">
              Walking Distance Zones
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-600 transition-colors">
                  Kikuyu (0.2 – 0.5 km)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-600 transition-colors">
                  Makulu Heights (0.5 – 1.0 km)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-600 transition-colors">
                  Chidachi Student Hub (0.4 – 0.8 km)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-600 transition-colors">
                  Area C Flats & Bedsitters (1.2 – 1.8 km)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-600 transition-colors">
                  Msalato / Town Transit (2.0+ km)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Student & Landlord Services */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-heading">
              Quick Portals
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-600 transition-colors">
                  Search Available Rooms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-600 transition-colors">
                  St John's Student Housing Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landlord-dashboard')} className="hover:text-emerald-600 transition-colors">
                  Landlord Registration & Verification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-emerald-600 transition-colors">
                  Admin Verification Console
                </button>
              </li>
              <li>
                <button onClick={onOpenSupabaseDocs} className="text-teal-600 dark:text-teal-400 hover:underline">
                  Supabase Database Schema & Setup
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Support */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-heading">
              Student Housing Hotline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Need assistance finding a room or encountering issues with a landlord?
            </p>
            <div className="space-y-2 text-sm">
              <a 
                href="tel:+255262390044" 
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-medium"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+255 26 239 0044</span>
              </a>
              <a 
                href="https://wa.me/255754123456?text=Hello%20KaaKaribu%20Student%20Support" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-medium"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                Built for SJUT Dodoma community
              </span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} KaaKaribu. Free and open student housing connection.</p>
          <div className="flex items-center gap-4">
            <button onClick={onOpenSupabaseDocs} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Supabase Backend
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Student Privacy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms of Tenancy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
