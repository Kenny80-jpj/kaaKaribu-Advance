import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Footprints, 
  Clock, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  ArrowUpRight, 
  Phone, 
  Compass, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  GraduationCap
} from 'lucide-react';
import { Property } from '../types';

interface GoogleCampusMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onToggleFavorite?: (id: string) => void;
  favorites?: string[];
}

interface CampusLandmark {
  id: string;
  name: string;
  faculty: string;
  lat: number;
  lng: number;
  description: string;
  icon: string;
}

const SJUT_LANDMARKS: CampusLandmark[] = [
  {
    id: 'sjut-main-gate',
    name: 'SJUT Main Gate & Admin Block',
    faculty: 'Central University Administration',
    lat: -6.1738,
    lng: 35.7486,
    description: 'Main pedestrian & vehicle entrance, security post, and admissions pavilion.',
    icon: '🏛️'
  },
  {
    id: 'sjut-pharmacy',
    name: 'School of Pharmacy (SoP)',
    faculty: 'Faculty of Pharmacy',
    lat: -6.1732,
    lng: 35.7492,
    description: 'Pharmaceutical labs, lecture halls 1-4, and Dean of Pharmacy offices.',
    icon: '💊'
  },
  {
    id: 'sjut-nursing',
    name: 'Faculty of Nursing & Public Health',
    faculty: 'Health Sciences Complex',
    lat: -6.1744,
    lng: 35.7480,
    description: 'Clinical simulation labs, skills lab, and nursing auditorium.',
    icon: '🩺'
  },
  {
    id: 'sjut-business',
    name: 'Faculty of Commerce & Business Studies (FCBS)',
    faculty: 'Business & Economics Block',
    lat: -6.1729,
    lng: 35.7478,
    description: 'Lecture theatres, computer lab, accounting & marketing seminar rooms.',
    icon: '💼'
  },
  {
    id: 'sjut-library',
    name: 'St John’s Main University Library',
    faculty: 'Academic Resource Centre',
    lat: -6.1735,
    lng: 35.7483,
    description: '24hr silent study halls, electronic research catalogue, and WiFi zone.',
    icon: '📚'
  },
  {
    id: 'sjut-chapel',
    name: 'St Cyprian Chapel & Sports Field',
    faculty: 'Student Life & Recreation',
    lat: -6.1750,
    lng: 35.7502,
    description: 'Sunday chapel services, student fellowship, and sports running tracks.',
    icon: '⛪'
  }
];

export const GoogleCampusMap: React.FC<GoogleCampusMapProps> = ({
  properties,
  onSelectProperty,
  onToggleFavorite,
  favorites = []
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('sjut-main-gate');
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under100' | '100to180' | '180plus'>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [showDirections, setShowDirections] = useState(false);

  // Filtered properties
  const filteredProps = useMemo(() => {
    return properties.filter((p) => {
      if (zoneFilter !== 'All' && !p.location.toLowerCase().includes(zoneFilter.toLowerCase())) {
        return false;
      }
      if (priceFilter === 'under100' && p.monthlyRent >= 100000) return false;
      if (priceFilter === '100to180' && (p.monthlyRent < 100000 || p.monthlyRent > 180000)) return false;
      if (priceFilter === '180plus' && p.monthlyRent < 180000) return false;
      return true;
    });
  }, [properties, zoneFilter, priceFilter]);

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const activeLandmark = SJUT_LANDMARKS.find(l => l.id === selectedLandmarkId) || SJUT_LANDMARKS[0];

  // Coordinates for the map iframe
  const targetLat = activeProperty?.latitude || -6.1738;
  const targetLng = activeProperty?.longitude || 35.7486;

  // Real Google Maps embed URL
  // Uses Google Maps embed API url with output=embed and coordinates centered on St John's Dodoma
  const embedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&hl=en&z=16&t=${mapMode === 'satellite' ? 'k' : 'm'}&output=embed`;

  // External Google Maps directions URL for students
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${targetLat},${targetLng}&destination=${activeLandmark.lat},${activeLandmark.lng}&travelmode=walking`;

  // Calculate walking time and bajaji fare estimation
  const distanceKm = activeProperty?.distanceKm || 0.4;
  const walkingMinutes = Math.max(3, Math.round(distanceKm * 12.5));
  const bajajiFare = distanceKm < 0.8 ? 'Walkable (0 TZS)' : '1,000 - 1,500 TZS (Bajaji)';

  return (
    <div className="space-y-6">
      {/* Top Header & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 text-xs font-mono tracking-tight border border-stone-200 dark:border-stone-700">
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <span>ST JOHN’S UNIVERSITY OF TANZANIA • DODOMA URBAN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
            Interactive Google Campus Map & Housing Routes
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Explore verified student rooms around Kikuyu, Makulu, Chidachi, and Area C with live walking ETAs to each SJUT faculty building.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Map Mode Toggle */}
          <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-800 p-1 bg-stone-100/70 dark:bg-stone-900">
            <button
              onClick={() => setMapMode('roadmap')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mapMode === 'roadmap'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Road Map
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mapMode === 'satellite'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* External Google Maps Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-500 dark:text-amber-600" />
            <span>Open in Google Maps</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Campus Zones:</span>
          </span>
          {['All', 'Kikuyu', 'Makulu', 'Chidachi', 'Area C'].map((zone) => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                zoneFilter === zone
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
            Rent Range:
          </span>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono text-xs focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="under100">&lt; 100,000 TZS</option>
            <option value="100to180">100k - 180k TZS</option>
            <option value="180plus">180,000+ TZS</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Map Stage + Interactive Sync Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Embedded Google Map & Overlays (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Map Container */}
          <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-950 aspect-[16/10] sm:aspect-[16/11] shadow-md">
            
            {/* Real Google Map iframe */}
            <iframe
              title="Google Map St John's University of Tanzania"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={embedUrl}
              className="w-full h-full filter contrast-[1.02] opacity-95"
            />

            {/* Floating Top Coordinates & Status Tag */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/90 text-white backdrop-blur-md border border-stone-700/60 text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SJUT Dodoma (Lat: {targetLat.toFixed(4)}, Lng: {targetLng.toFixed(4)})</span>
            </div>

            {/* Floating Bottom Property Badge Overlay */}
            {activeProperty && (
              <div className="absolute bottom-3 left-3 right-3 z-10 p-3 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800">
                    <img 
                      src={activeProperty.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'} 
                      alt={activeProperty.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-semibold">
                        {activeProperty.location}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                        {activeProperty.distanceFromUniversity}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                      {activeProperty.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(activeProperty.monthlyRent)}
                  </span>
                  <button
                    onClick={() => onSelectProperty(activeProperty)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    View Room
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Walking Route & Distance Engine */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 font-mono">
                <Footprints className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span>Walking Route to SJUT Faculties</span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                Verified Campus Path
              </span>
            </div>

            {/* Select Target Faculty Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SJUT_LANDMARKS.slice(0, 3).map((landmark) => (
                <button
                  key={landmark.id}
                  onClick={() => setSelectedLandmarkId(landmark.id)}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    selectedLandmarkId === landmark.id
                      ? 'bg-white dark:bg-stone-800 border-stone-900 dark:border-stone-100 shadow-xs'
                      : 'bg-stone-100/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    <span>{landmark.icon}</span>
                    <span className="truncate">{landmark.name}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                    {landmark.faculty}
                  </p>
                </button>
              ))}
            </div>

            {/* Calculated Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] uppercase text-stone-500 block">Distance</span>
                <span className="text-sm font-bold text-stone-900 dark:text-white mt-0.5 block">
                  {distanceKm} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] uppercase text-stone-500 block">Walking ETA</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">
                  ~{walkingMinutes} mins
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] uppercase text-stone-500 block">Transport Cost</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                  {distanceKm < 0.8 ? '0 TZS' : '1k TZS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Listing Pins & Direct Landlord Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
              Available Rooms on Map ({filteredProps.length})
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              Click to pinpoint
            </span>
          </div>

          {/* Scrollable list of properties mapped */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredProps.map((prop) => {
              const isSelected = prop.id === activeProperty?.id;
              const formattedPrice = new Intl.NumberFormat('en-TZ', {
                style: 'currency',
                currency: 'TZS',
                maximumFractionDigits: 0
              }).format(prop.monthlyRent);

              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedPropertyId(prop.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-stone-800/95 border-amber-600 dark:border-amber-500 ring-1 ring-amber-600/30 shadow-sm'
                      : 'bg-white/70 dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 relative">
                      <img
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-amber-500 text-stone-950 font-mono text-[9px] font-bold">
                          ACTIVE
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          {prop.location} • {prop.distanceFromUniversity}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100">
                          {formattedPrice}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white truncate">
                        {prop.title}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                        <span>{prop.propertyType}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 truncate">
                          {prop.waterSupply}
                        </span>
                      </div>

                      {/* Micro actions */}
                      <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-800/60 mt-1">
                        <span className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                          Landlord: <strong className="text-stone-800 dark:text-stone-200">{prop.landlordName}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProperty(prop);
                          }}
                          className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Full Specs</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
