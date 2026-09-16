import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Building2, 
  DollarSign, 
  Footprints, 
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';
import { Property, FilterState, PropertyType, AvailabilityStatus } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { GoogleCampusMap } from '../components/GoogleCampusMap';

interface SearchViewProps {
  properties: Property[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onOpenReportFraud: (property: Property) => void;
  initialFilters?: Partial<FilterState>;
  onQuickChangeStatus?: (propertyId: string, status: AvailabilityStatus) => void;
  onOpenLandlordProfile?: (landlordId: string) => void;
  onStartInAppMessage?: (property: Property) => void;
  onNavigateView?: (view: string) => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Single Room',
  'Bedsitter',
  '1-Bedroom',
  '2-Bedroom',
  'Shared Hostel',
  'Self-Contained'
];

const LOCATIONS = [
  'Kikuyu',
  'Makulu',
  'Chidachi',
  'Area C',
  'Msalato',
  'Town Centre'
];

export const SearchView: React.FC<SearchViewProps> = ({
  properties,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  onOpenReportFraud,
  initialFilters,
  onQuickChangeStatus,
  onOpenLandlordProfile,
  onStartInAppMessage,
  onNavigateView
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [location, setLocation] = useState(initialFilters?.location || 'All');
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || 'All');
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 400000);
  const [maxDistance, setMaxDistance] = useState<number>(initialFilters?.maxDistance || 3.0);
  const [availability, setAvailability] = useState(initialFilters?.availability || 'All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'distance'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filter & Sort properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Approval check
      if (prop.approvalStatus !== 'approved') return false;

      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          prop.title.toLowerCase().includes(q) ||
          prop.description.toLowerCase().includes(q) ||
          prop.location.toLowerCase().includes(q) ||
          prop.neighborhood.toLowerCase().includes(q) ||
          prop.propertyType.toLowerCase().includes(q) ||
          prop.amenities.some(a => a.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Location
      if (location !== 'All' && prop.location.toLowerCase() !== location.toLowerCase()) {
        return false;
      }

      // Property Type
      if (propertyType !== 'All' && prop.propertyType.toLowerCase() !== propertyType.toLowerCase()) {
        return false;
      }

      // Price
      if (prop.monthlyRent > maxPrice) {
        return false;
      }

      // Distance
      if (prop.distanceKm > maxDistance) {
        return false;
      }

      // Availability Status
      if (availability !== 'All' && prop.availabilityStatus !== availability) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.monthlyRent - b.monthlyRent;
      if (sortBy === 'price-desc') return b.monthlyRent - a.monthlyRent;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      // Recommended: Available first, then featured
      if (a.availabilityStatus === 'available' && b.availabilityStatus !== 'available') return -1;
      if (b.availabilityStatus === 'available' && a.availabilityStatus !== 'available') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [properties, searchQuery, location, propertyType, maxPrice, maxDistance, availability, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setLocation('All');
    setPropertyType('All');
    setMaxPrice(400000);
    setMaxDistance(3.0);
    setAvailability('All');
    setSortBy('recommended');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    location !== 'All' || 
    propertyType !== 'All' || 
    maxPrice < 400000 || 
    maxDistance < 3.0 || 
    availability !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Student Rooms & Hostels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredProperties.length} verified listings around St John’s University
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: Grid vs Map */}
          <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-800 p-1 bg-stone-100/70 dark:bg-stone-900 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-600" />
              <span>Campus Map ({filteredProperties.length})</span>
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            id="btn-mobile-filter-open"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              id="select-search-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="recommended">Featured & Available</option>
              <option value="price-asc">Price: Lowest First</option>
              <option value="price-desc">Price: Highest First</option>
              <option value="distance">Distance: Closest to Campus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white font-heading">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Query Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Keyword
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. WiFi, Kikuyu, Bedsitter..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Availability Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Availability
            </label>
            <div className="space-y-1">
              {[
                { id: 'All', label: 'All Statuses' },
                { id: 'available', label: '🟢 Available Now' },
                { id: 'reserved', label: '🟡 Reserved' },
                { id: 'occupied', label: '🔴 Occupied' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAvailability(opt.id)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors ${
                    availability === opt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {availability === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Location Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Neighborhood
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="All">All Locations Around SJUT</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Room Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="All">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Max Rent</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                TZS {maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={70000}
              max={400000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>70k</span>
              <span>200k</span>
              <span>400k+</span>
            </div>
          </div>

          {/* Distance Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Max Distance</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {maxDistance} km
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={4.0}
              step={0.1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <p className="text-[10px] text-slate-400">
              Within ~{Math.round(maxDistance * 12)} mins walking distance
            </p>
          </div>

        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400">Active filters:</span>
              {location !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
                  Location: {location}
                  <button onClick={() => setLocation('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {propertyType !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-medium flex items-center gap-1">
                  Type: {propertyType}
                  <button onClick={() => setPropertyType('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {availability !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                  Status: {availability}
                  <button onClick={() => setAvailability('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {maxPrice < 400000 && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                  Max: TZS {maxPrice.toLocaleString()}
                  <button onClick={() => setMaxPrice(400000)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-rose-500 hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Display Mode: Map vs Grid */}
          {viewMode === 'map' ? (
            <div className="space-y-4">
              <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400 font-mono">
                  Interactive Google Map: Showing {filteredProperties.length} properties matching your filters
                </span>
                {onNavigateView && (
                  <button
                    onClick={() => onNavigateView('google-map')}
                    className="text-amber-700 dark:text-amber-400 font-semibold hover:underline"
                  >
                    Open Fullscreen Map →
                  </button>
                )}
              </div>
              <GoogleCampusMap
                properties={filteredProperties}
                onSelectProperty={onSelectProperty}
                onToggleFavorite={onToggleFavorite}
                favorites={favorites}
              />
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
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
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Properties Match Your Search Criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try expanding your price range, increasing maximum walking distance, or selecting "All Locations".
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white font-heading">
                  Filter Student Rooms
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile fields */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="All">All Locations Around SJUT</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Room Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="All">All Types</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Max Rent</span>
                    <span className="text-emerald-600">TZS {maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={70000}
                    max={400000}
                    step={10000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Max Distance</span>
                    <span className="text-emerald-600">{maxDistance} km</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={4.0}
                    step={0.1}
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Apply Filters ({filteredProperties.length} results)
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 text-xs text-slate-500 font-semibold"
              >
                Reset All
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
