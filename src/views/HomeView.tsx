import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Footprints, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  Building2, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Zap,
  PhoneCall,
  Compass,
  ArrowUpRight,
  Shield,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Property, FilterState, AvailabilityStatus } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { GoogleCampusMap } from '../components/GoogleCampusMap';

interface HomeViewProps {
  properties: Property[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onNavigateSearch: (filters?: Partial<FilterState>) => void;
  onOpenAddProperty: () => void;
  onOpenReportFraud: (property?: Property) => void;
  onQuickChangeStatus?: (propertyId: string, status: AvailabilityStatus) => void;
  onOpenLandlordProfile?: (landlordId: string) => void;
  onStartInAppMessage?: (property: Property) => void;
  onNavigateView?: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  properties,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  onNavigateSearch,
  onOpenAddProperty,
  onOpenReportFraud,
  onQuickChangeStatus,
  onOpenLandlordProfile,
  onStartInAppMessage,
  onNavigateView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedMaxBudget, setSelectedMaxBudget] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState<number | ''>('');
  const [homeDisplayMode, setHomeDisplayMode] = useState<'grid' | 'map'>('grid');

  const featuredProperties = properties
    .filter((p) => p.approvalStatus === 'approved')
    .slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateSearch({
      searchQuery: searchTerm,
      location: selectedLocation,
      maxPrice: selectedMaxBudget === '' ? 500000 : selectedMaxBudget,
      propertyType: selectedType,
      maxDistance: selectedDistance === '' ? 5 : selectedDistance
    });
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section (Claude Editorial & Grok Telemetry Aesthetic) */}
      <section className="relative pt-6 sm:pt-14 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Header Typography Block */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 text-xs font-mono tracking-tight">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ST JOHN’S UNIVERSITY OF TANZANIA • KAAKARIBU DIRECT HOUSING</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 dark:text-stone-100 tracking-tight font-serif leading-[1.15]">
              Direct student rooms near SJUT.{' '}
              <span className="italic text-amber-700 dark:text-amber-500">Zero middleman fees.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-sans">
              Connect directly via verified WhatsApp with true property owners across Kikuyu, Makulu, Chidachi, and Area C. Verified water tanks, sub-meters, and walking ETAs to all faculty buildings.
            </p>
          </div>

          {/* Grok-Style Telemetry & Metrics Ribbon */}
          <div className="mt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs text-center">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-stone-500 block text-[11px] uppercase tracking-wider">Broker Commission</span>
              <span className="text-xl font-bold text-amber-700 dark:text-amber-500 mt-0.5 block">0% Dalali</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-stone-500 block text-[11px] uppercase tracking-wider">Walking Distance</span>
              <span className="text-xl font-bold text-stone-900 dark:text-white mt-0.5 block">300m – 1.8km</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-stone-500 block text-[11px] uppercase tracking-wider">Direct Landlords</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">100% Direct</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-stone-500 block text-[11px] uppercase tracking-wider">AI Assistant</span>
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">Gemini 3.8</span>
            </div>
          </div>

          {/* Search Command Card */}
          <div className="mt-6 max-w-4xl mx-auto bg-white dark:bg-stone-900/90 rounded-2xl p-4 sm:p-6 shadow-lg border border-stone-200/80 dark:border-stone-800">
            <form onSubmit={handleHeroSearch} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* 1. Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Campus Zone</span>
                  </label>
                  <select
                    id="search-hero-location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="All">All Zones Around SJUT</option>
                    <option value="Kikuyu">Kikuyu (0.2 - 0.5 km)</option>
                    <option value="Makulu">Makulu (0.5 - 1.0 km)</option>
                    <option value="Chidachi">Chidachi (0.4 - 0.8 km)</option>
                    <option value="Area C">Area C (1.2 - 1.8 km)</option>
                    <option value="Town Centre">Town Centre</option>
                  </select>
                </div>

                {/* 2. Room Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Property Type</span>
                  </label>
                  <select
                    id="search-hero-type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="All">Any Property Type</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Bedsitter">Executive Bedsitter</option>
                    <option value="Self-Contained">Self-Contained Room</option>
                    <option value="Shared Hostel">Shared Student Hostel</option>
                    <option value="1-Bedroom">1-Bedroom Flat</option>
                    <option value="2-Bedroom">2-Bedroom Suite</option>
                  </select>
                </div>

                {/* 3. Distance */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-amber-600" />
                    <span>Max Distance</span>
                  </label>
                  <select
                    id="search-hero-distance"
                    value={selectedDistance}
                    onChange={(e) => setSelectedDistance(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="">Any Distance</option>
                    <option value="0.5">Within 500m (5 min walk)</option>
                    <option value="1.0">Within 1 km (10 min walk)</option>
                    <option value="1.5">Within 1.5 km</option>
                    <option value="3.0">Within 3 km</option>
                  </select>
                </div>

                {/* 4. Budget */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-stone-500" />
                    <span>Budget (TZS)</span>
                  </label>
                  <select
                    id="search-hero-budget"
                    value={selectedMaxBudget}
                    onChange={(e) => setSelectedMaxBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="">Any Budget</option>
                    <option value="100000">&lt; TZS 100,000</option>
                    <option value="150000">&lt; TZS 150,000</option>
                    <option value="200000">&lt; TZS 200,000</option>
                    <option value="300000">&lt; TZS 300,000</option>
                  </select>
                </div>

              </div>

              {/* Bottom Search Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-grow w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-hero-search-text"
                    type="text"
                    placeholder="Search amenities, tiles, borehole water, sub-meter Luku..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-600 font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="btn-hero-search-submit"
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs sm:text-sm font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Rooms</span>
                  </button>

                  {onNavigateView && (
                    <button
                      type="button"
                      onClick={() => onNavigateView('google-map')}
                      className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Google Map</span>
                    </button>
                  )}
                </div>
              </div>

            </form>

            {/* Quick Filter Tag Pills & Direct Links */}
            <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-stone-400 font-mono text-[11px] uppercase">Fast Filters:</span>
                <button
                  onClick={() => onNavigateSearch({ maxDistance: 0.5 })}
                  className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  🚶 &lt; 500m Walk
                </button>
                <button
                  onClick={() => onNavigateSearch({ maxPrice: 100000 })}
                  className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  💰 Under 100k TZS
                </button>
                <button
                  onClick={() => onNavigateSearch({ propertyType: 'Self-Contained' })}
                  className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  🚿 Self-Contained
                </button>
                <button
                  onClick={() => onNavigateSearch({ location: 'Kikuyu' })}
                  className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  📍 Kikuyu Gate
                </button>
              </div>

              {onNavigateView && (
                <button
                  onClick={() => onNavigateView('ai-assistant')}
                  className="text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Consult Rafiki AI Assistant</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Mode Selector: Grid View vs Interactive Google Campus Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-stone-200/80 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>St John's Student Living Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif mt-1">
              Verified Rooms Around Campus
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-800 p-1 bg-stone-100/70 dark:bg-stone-900 text-xs">
              <button
                onClick={() => setHomeDisplayMode('grid')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  homeDisplayMode === 'grid'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Grid Showcase
              </button>
              <button
                onClick={() => setHomeDisplayMode('map')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1 ${
                  homeDisplayMode === 'map'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <MapPin className="w-3 h-3 text-amber-600" />
                <span>Google Map</span>
              </button>
            </div>

            <button
              onClick={() => onNavigateSearch()}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors ml-2"
            >
              <span>View All {properties.length} Rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Render either the Grid or the Google Campus Map */}
        {homeDisplayMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProperty={onSelectProperty}
                onOpenReportFraud={onOpenReportFraud}
                onQuickChangeStatus={onQuickChangeStatus}
                onOpenLandlordProfile={onOpenLandlordProfile}
                onStartInAppMessage={onStartInAppMessage}
              />
            ))}
          </div>
        ) : (
          <GoogleCampusMap
            properties={properties.filter(p => p.approvalStatus === 'approved')}
            onSelectProperty={onSelectProperty}
            onToggleFavorite={onToggleFavorite}
            favorites={favorites}
          />
        )}
      </section>

      {/* 3. Anti-Dalali Student Protection Manifesto (Editorial Box) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-stone-900 dark:bg-stone-950 text-stone-100 border border-stone-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ANTI-BROKER FRAUD SHIELD</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-normal font-serif leading-tight text-white">
              Why KaaKaribu Saves St John’s Students Up To TZS 150,000 Every Semester
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans">
              In Dodoma, unregistered middleman brokers ("Dalalis") demand upfront viewing fees (*hela ya mguu*) and take an entire month’s rent from students. KaaKaribu connects university students directly to property owners at no cost.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
                <span className="font-mono text-amber-400 font-bold text-xs">01</span>
                <h4 className="font-bold text-sm text-white mt-1">Direct Landlord WhatsApp</h4>
                <p className="text-xs text-stone-400 mt-1 font-sans">
                  One-tap WhatsApp inquiry directly with verified property owners. No middlemen.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
                <span className="font-mono text-amber-400 font-bold text-xs">02</span>
                <h4 className="font-bold text-sm text-white mt-1">Precise Walking Routes</h4>
                <p className="text-xs text-stone-400 mt-1 font-sans">
                  Accurate walking times to Nursing, Pharmacy, Business blocks, and the Main Library.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
                <span className="font-mono text-amber-400 font-bold text-xs">03</span>
                <h4 className="font-bold text-sm text-white mt-1">Luku & Water Transparency</h4>
                <p className="text-xs text-stone-400 mt-1 font-sans">
                  Know whether the room has a private sub-meter and 24/7 borehole water backup before visiting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Campus Neighborhood Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif">
            Student Living Zones Around St John's
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Choose where to live based on class proximity, quiet study atmosphere, and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => onNavigateSearch({ location: 'Kikuyu' })}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-600 dark:hover:border-amber-500 cursor-pointer transition-all hover:shadow-md group"
          >
            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">0.2 - 0.5 km</span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              Kikuyu
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Adjacent to St John's main gate. Vibrant student mamalishe, grocery stalls, and 4-minute walks.
            </p>
          </div>

          <div 
            onClick={() => onNavigateSearch({ location: 'Makulu' })}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-600 dark:hover:border-amber-500 cursor-pointer transition-all hover:shadow-md group"
          >
            <span className="text-[11px] font-mono font-bold text-stone-500">0.5 - 1.0 km</span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              Makulu Heights
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Spacious modern flats, quiet study atmosphere, close to the university sports grounds.
            </p>
          </div>

          <div 
            onClick={() => onNavigateSearch({ location: 'Chidachi' })}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-600 dark:hover:border-amber-500 cursor-pointer transition-all hover:shadow-md group"
          >
            <span className="text-[11px] font-mono font-bold text-emerald-600">0.4 - 0.8 km</span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              Chidachi
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Budget-friendly shared student hostels, 6-minute walk, popular with first & second-year undergraduates.
            </p>
          </div>

          <div 
            onClick={() => onNavigateSearch({ location: 'Area C' })}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-600 dark:hover:border-amber-500 cursor-pointer transition-all hover:shadow-md group"
          >
            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">1.2 - 1.8 km</span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              Area C
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Executive bedsitters & 2-bedroom flats with dedicated security, paved yards, and fast bajaji transit.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Landlord Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-serif">
              Are you a Landlord near St John's University?
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl font-sans">
              Fill your empty student rooms fast without dealing with middleman brokers. Keep 100% of your rent payments and receive inquiries directly on WhatsApp.
            </p>
          </div>

          <button
            id="btn-home-landlord-cta"
            onClick={onOpenAddProperty}
            className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs sm:text-sm font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white whitespace-nowrap transition-all shadow-xs"
          >
            + Post Your Room Free
          </button>
        </div>
      </section>

    </div>
  );
};
