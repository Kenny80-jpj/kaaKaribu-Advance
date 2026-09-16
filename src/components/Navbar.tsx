import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  PlusCircle, 
  ShieldCheck, 
  User as UserIcon, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  LogOut, 
  Database, 
  PhoneCall, 
  Building2,
  ChevronDown,
  MessageSquare,
  MapPin,
  Sparkles,
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuth: (role?: UserRole) => void;
  onLogout: () => void;
  onOpenAddProperty: () => void;
  onOpenSupabaseDocs: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  favoritesCount: number;
  onSwitchDemoUser: (role: UserRole) => void;
  pendingCount?: number;
  onOpenMessages?: () => void;
  unreadMessagesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  setCurrentView,
  onOpenAuth,
  onLogout,
  onOpenAddProperty,
  onOpenSupabaseDocs,
  darkMode,
  setDarkMode,
  favoritesCount,
  onSwitchDemoUser,
  pendingCount = 0,
  onOpenMessages,
  unreadMessagesCount = 2
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleNav = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* 1. Top Context & Verification Ticker (Claude/Grok High-Craft Strip) */}
      <div className="w-full bg-stone-900 dark:bg-black text-stone-300 py-1.5 px-4 sm:px-8 border-b border-stone-800 text-[11px] font-mono tracking-tight flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ST JOHN’S UNIVERSITY OF TANZANIA</span>
          </div>
          <span className="text-stone-600 hidden md:inline">/</span>
          <span className="text-stone-400 truncate hidden md:inline">
            Direct Landlord Network • 0% Dalali Viewing Fees Guaranteed
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-stone-400">
            <span className="text-stone-500">Campus Zones:</span>
            <button onClick={() => handleNav('google-map')} className="hover:text-amber-400 transition-colors">
              Kikuyu
            </button>
            <span>•</span>
            <button onClick={() => handleNav('google-map')} className="hover:text-amber-400 transition-colors">
              Makulu
            </button>
            <span>•</span>
            <button onClick={() => handleNav('google-map')} className="hover:text-amber-400 transition-colors">
              Chidachi
            </button>
            <span>•</span>
            <button onClick={() => handleNav('google-map')} className="hover:text-amber-400 transition-colors">
              Area C
            </button>
          </div>

          <button
            onClick={onOpenSupabaseDocs}
            className="text-stone-400 hover:text-white transition-colors flex items-center gap-1 border-l border-stone-800 pl-3 ml-1"
          >
            <Database className="w-3 h-3 text-amber-500" />
            <span className="hidden lg:inline">System Architecture</span>
          </button>
        </div>
      </div>

      {/* 2. Main High-Craft Navigation Bar */}
      <div className="w-full bg-[#FAF9F6]/95 dark:bg-[#0C0A09]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/90 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Brand Logo (Claude Editorial Style) */}
            <div 
              id="brand-logo"
              onClick={() => handleNav('home')} 
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-serif font-bold text-xl shadow-xs group-hover:bg-amber-600 dark:group-hover:bg-amber-500 dark:group-hover:text-white transition-colors">
                K
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif leading-none">
                    Kaa<span className="text-amber-700 dark:text-amber-500 italic">Karibu</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold tracking-wider bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded">
                    SJUT
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 tracking-wider uppercase mt-0.5">
                  Direct Student Housing
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links (Segmented & Detailed) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-medium">
              <button
                id="nav-home"
                onClick={() => handleNav('home')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  currentView === 'home'
                    ? 'text-stone-900 dark:text-white bg-stone-200/70 dark:bg-stone-800/90 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                Explore
              </button>

              <button
                id="nav-search"
                onClick={() => handleNav('search')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'search'
                    ? 'text-stone-900 dark:text-white bg-stone-200/70 dark:bg-stone-800/90 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-stone-500" />
                <span>Find Rooms</span>
              </button>

              {/* Google Campus Map Tab */}
              <button
                id="nav-google-map"
                onClick={() => handleNav('google-map')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'google-map'
                    ? 'text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 font-semibold border border-amber-300 dark:border-amber-800'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span>Google Map</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold">
                  CAMPUS
                </span>
              </button>

              {/* Rafiki AI Assistant Tab */}
              <button
                id="nav-ai-assistant"
                onClick={() => handleNav('ai-assistant')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'ai-assistant'
                    ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-stone-800 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>Rafiki AI</span>
                <span className="px-1.5 py-0.2 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-[10px] font-mono font-bold">
                  3.8 FLASH
                </span>
              </button>

              {currentUser?.role === 'tenant' && (
                <button
                  id="nav-tenant-dashboard"
                  onClick={() => handleNav('tenant-dashboard')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentView === 'tenant-dashboard'
                      ? 'text-stone-900 dark:text-white bg-stone-200/70 dark:bg-stone-800/90 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                  <span>Saved ({favoritesCount})</span>
                </button>
              )}

              {currentUser?.role === 'landlord' && (
                <button
                  id="nav-landlord-dashboard"
                  onClick={() => handleNav('landlord-dashboard')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentView === 'landlord-dashboard'
                      ? 'text-stone-900 dark:text-white bg-stone-200/70 dark:bg-stone-800/90 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>My Properties</span>
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <button
                  id="nav-admin-dashboard"
                  onClick={() => handleNav('admin-dashboard')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentView === 'admin-dashboard'
                      ? 'text-stone-900 dark:text-white bg-stone-200/70 dark:bg-stone-800/90 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Console</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              <button
                id="nav-contact"
                onClick={() => handleNav('contact')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'contact'
                    ? 'text-stone-900 dark:text-white bg-stone-200/70 dark:bg-stone-800/90 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <span>SJUT Desk</span>
              </button>
            </nav>

            {/* Right Action Suite (Claude/Grok Clean Bar) */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Messages Drawer Trigger */}
              {onOpenMessages && (
                <button
                  onClick={onOpenMessages}
                  title="In-App Landlord & Student Messages"
                  className="relative p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors border border-stone-200/60 dark:border-stone-800"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              )}

              {/* Theme Toggle (Sun/Moon) */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
                className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors border border-stone-200/60 dark:border-stone-800"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
              </button>

              {/* Role / Persona Quick Switcher */}
              <div className="relative">
                <button
                  onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-700 transition-colors shadow-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline text-stone-500 font-mono text-[10px] uppercase">
                    Role:
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-white capitalize">
                    {currentUser?.role || 'Guest'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {demoDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-500">
                      Switch Active Persona
                    </div>

                    <button
                      onClick={() => {
                        onSwitchDemoUser('tenant');
                        setDemoDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors ${
                        currentUser?.role === 'tenant' ? 'font-bold text-amber-700 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-stone-400" />
                        <div>
                          <p className="font-semibold">Student Tenant</p>
                          <p className="text-[11px] text-stone-400 font-normal">Emmanuel (Pharmacy 2nd Yr)</p>
                        </div>
                      </div>
                      {currentUser?.role === 'tenant' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => {
                        onSwitchDemoUser('landlord');
                        setDemoDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors ${
                        currentUser?.role === 'landlord' ? 'font-bold text-amber-700 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-stone-400" />
                        <div>
                          <p className="font-semibold">Verified Landlord</p>
                          <p className="text-[11px] text-stone-400 font-normal">Mzee Rashidi (Kikuyu)</p>
                        </div>
                      </div>
                      {currentUser?.role === 'landlord' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => {
                        onSwitchDemoUser('admin');
                        setDemoDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors ${
                        currentUser?.role === 'admin' ? 'font-bold text-amber-700 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-stone-400" />
                        <div>
                          <p className="font-semibold">SJUT Housing Officer</p>
                          <p className="text-[11px] text-stone-400 font-normal">Dean of Students Desk</p>
                        </div>
                      </div>
                      {currentUser?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Primary Call to Action Button */}
              {currentUser?.role === 'landlord' ? (
                <button
                  id="btn-list-property"
                  onClick={onOpenAddProperty}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ List a Room</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNav('search')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs"
                >
                  <span>Browse Rooms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Mobile menu hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`p-2.5 rounded-lg text-left text-xs font-semibold ${
                currentView === 'home' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              Explore Rooms
            </button>
            <button
              onClick={() => handleNav('search')}
              className={`p-2.5 rounded-lg text-left text-xs font-semibold ${
                currentView === 'search' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              Find Rooms
            </button>
            <button
              onClick={() => handleNav('google-map')}
              className={`p-2.5 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 ${
                currentView === 'google-map' ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Map</span>
            </button>
            <button
              onClick={() => handleNav('ai-assistant')}
              className={`p-2.5 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 ${
                currentView === 'ai-assistant' ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rafiki AI</span>
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
            {currentUser?.role === 'tenant' && (
              <button
                onClick={() => handleNav('tenant-dashboard')}
                className="w-full p-2 text-left text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center justify-between"
              >
                <span>My Saved Favorites</span>
                <span className="font-mono font-bold text-amber-600">({favoritesCount})</span>
              </button>
            )}

            {currentUser?.role === 'landlord' && (
              <button
                onClick={() => handleNav('landlord-dashboard')}
                className="w-full p-2 text-left text-xs font-medium text-stone-700 dark:text-stone-300"
              >
                My Listed Properties
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin-dashboard')}
                className="w-full p-2 text-left text-xs font-medium text-stone-700 dark:text-stone-300"
              >
                Admin Review Console ({pendingCount})
              </button>
            )}

            <button
              onClick={() => handleNav('contact')}
              className="w-full p-2 text-left text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              SJUT Student Support Desk
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
