import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Building2, 
  DollarSign, 
  MapPin, 
  Phone, 
  CreditCard, 
  Sparkles,
  Check
} from 'lucide-react';
import { Property, PropertyType, AvailabilityStatus, User } from '../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: Partial<Property>) => void;
  currentUser: User | null;
  editingProperty?: Property | null;
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
  'Area C',
  'Makulu',
  'Chidachi',
  'Msalato',
  'Town Centre',
  'Ng’ong’ona'
];

const AMENITY_OPTIONS = [
  'Water 24/7',
  'Inside Bathroom',
  'Luku Sub-Meter',
  'Security Fence & Gate',
  'Study Desk',
  'Ceiling Fan',
  'Gypsum Ceiling',
  'Tiled Floor',
  'WiFi Available',
  'Beds & Mattresses Included',
  'Night Guard',
  'Kitchenette',
  'Compound Caretaker'
];

// High quality curated presets for quick student room demonstration
const PRESET_IMAGES = [
  { label: 'Self-Contained Single', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Executive Bedsitter', url: 'https://images.unsplash.com/photo-1502005229762-ae1b460020e2?w=1000&auto=format&fit=crop&q=80' },
  { label: '1-Bedroom Flat', url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Shared Student Hostel', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Tiled Modern Room', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Campus Studio', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format&fit=crop&q=80' }
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  editingProperty
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyRent, setMonthlyRent] = useState<number | ''>(130000);
  const [location, setLocation] = useState('Kikuyu');
  const [neighborhood, setNeighborhood] = useState('Kikuyu Shuleni');
  const [distanceKm, setDistanceKm] = useState(0.4);
  const [propertyType, setPropertyType] = useState<PropertyType>('Self-Contained');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '+255 754 123 456');
  const [whatsAppNumber, setWhatsAppNumber] = useState(currentUser?.phone || '+255 754 123 456');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(currentUser?.mobileMoneyNumber || currentUser?.phone || '0754 123 456');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState(currentUser?.mobileMoneyProvider || 'M-Pesa');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');
  const [amenities, setAmenities] = useState<string[]>([
    'Water 24/7',
    'Inside Bathroom',
    'Luku Sub-Meter',
    'Security Fence & Gate'
  ]);
  const [waterSupply, setWaterSupply] = useState('24/7 Constant Reserve Tank');
  const [electricityType, setElectricityType] = useState('Individual Sub-meter (Luku)');

  useEffect(() => {
    if (editingProperty) {
      setTitle(editingProperty.title);
      setDescription(editingProperty.description);
      setMonthlyRent(editingProperty.monthlyRent);
      setLocation(editingProperty.location);
      setNeighborhood(editingProperty.neighborhood);
      setDistanceKm(editingProperty.distanceKm);
      setPropertyType(editingProperty.propertyType);
      setImages(editingProperty.images);
      setContactNumber(editingProperty.contactNumber);
      setWhatsAppNumber(editingProperty.whatsAppNumber);
      setMobileMoneyNumber(editingProperty.mobileMoneyNumber);
      setMobileMoneyProvider(editingProperty.mobileMoneyProvider);
      setAvailabilityStatus(editingProperty.availabilityStatus);
      setAmenities(editingProperty.amenities);
      setWaterSupply(editingProperty.waterSupply);
      setElectricityType(editingProperty.electricityType);
    } else {
      // Default reset
      setTitle('');
      setDescription('Well-maintained room located within convenient walking distance of St John\'s University. Clean environment with dependable water supply, private security gate, and student-friendly atmosphere.');
      setMonthlyRent(130000);
      setLocation('Kikuyu');
      setNeighborhood('Kikuyu Junction, 4 min walk to St John\'s Gate');
      setDistanceKm(0.4);
      setPropertyType('Self-Contained');
      setImages([PRESET_IMAGES[0].url]);
      setContactNumber(currentUser?.phone || '+255 754 123 456');
      setWhatsAppNumber(currentUser?.phone || '+255 754 123 456');
      setMobileMoneyNumber(currentUser?.mobileMoneyNumber || '0754 123 456');
      setMobileMoneyProvider('M-Pesa');
      setAvailabilityStatus('available');
      setAmenities(['Water 24/7', 'Inside Bathroom', 'Luku Sub-Meter', 'Security Fence & Gate']);
    }
  }, [editingProperty, currentUser, isOpen]);

  if (!isOpen) return null;

  // Image Upload handler (File Reader -> Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setImages((prev) => [...prev, String(loadEvt.target?.result)]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !monthlyRent) return;

    const walkingMin = Math.max(2, Math.round(distanceKm * 12));
    const distanceFromUniversity = `${distanceKm} km (${walkingMin} min walk)`;

    onSave({
      title,
      description,
      monthlyRent: Number(monthlyRent),
      currency: 'TZS',
      location,
      neighborhood,
      distanceKm: Number(distanceKm),
      distanceFromUniversity,
      propertyType,
      images: images.length > 0 ? images : [PRESET_IMAGES[0].url],
      contactNumber,
      whatsAppNumber,
      mobileMoneyNumber,
      mobileMoneyProvider,
      availabilityStatus,
      amenities,
      waterSupply,
      electricityType,
      landlordId: currentUser?.id || 'user-landlord-1',
      landlordName: currentUser?.name || 'Verified Landlord',
      landlordPhone: currentUser?.phone || contactNumber,
      landlordVerified: currentUser?.isApprovedLandlord ?? true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="modal-add-property"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                {editingProperty ? 'Edit Property Details' : 'Post New Student Rental'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct St John's campus listing • Zero broker fees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-grow">
          
          {/* Availability Status Selector (Green, Yellow, Red) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Room Availability Status:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                id="btn-status-available"
                onClick={() => setAvailabilityStatus('available')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  availabilityStatus === 'available'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span>Available (Green)</span>
              </button>

              <button
                type="button"
                id="btn-status-reserved"
                onClick={() => setAvailabilityStatus('reserved')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  availabilityStatus === 'reserved'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/20'
                    : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>Reserved (Yellow)</span>
              </button>

              <button
                type="button"
                id="btn-status-occupied"
                onClick={() => setAvailabilityStatus('occupied')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  availabilityStatus === 'occupied'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 ring-2 ring-rose-500/20'
                    : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>Occupied (Red)</span>
              </button>
            </div>
          </div>

          {/* Title & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Listing Title *
              </label>
              <input
                id="input-property-title"
                type="text"
                required
                placeholder="e.g. GreenView Student Hostels - Kikuyu Main Gate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Property Type *
              </label>
              <select
                id="select-property-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Rent, Location, Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Monthly Rent (TZS) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  TZS
                </span>
                <input
                  id="input-property-rent"
                  type="number"
                  required
                  min={20000}
                  step={5000}
                  placeholder="140000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Location Area *
              </label>
              <select
                id="select-property-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Distance from St John's</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{distanceKm} km</span>
              </label>
              <input
                id="input-distance-km"
                type="range"
                min={0.1}
                max={4.0}
                step={0.1}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2"
              />
              <p className="text-[11px] text-slate-400">
                Approx. {Math.round(distanceKm * 12)} mins walking to campus
              </p>
            </div>
          </div>

          {/* Neighborhood Specifics */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Neighborhood Landmark / Street
            </label>
            <input
              type="text"
              placeholder="e.g. Kikuyu Shuleni, near St John’s Sports Gate"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe room condition, rules, water reliability, study quietness..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Multiple Image Upload & Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Room Photos ({images.length} added)
              </label>
              <label className="cursor-pointer px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick preset room photos */}
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Or add high-resolution photo preset:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!images.includes(preset.url)) {
                        setImages((prev) => [...prev, preset.url]);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-500" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste an image web URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-grow px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddUrlImage}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-300 transition-colors"
              >
                Add URL
              </button>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={img} alt="Upload preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                No images added yet. Upload files or choose a preset above.
              </p>
            )}
          </div>

          {/* Contact Numbers & Payment Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Landlord Phone Number *
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+255 754 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                placeholder="+255 754 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Mobile Money Payment *</span>
                <span className="text-emerald-600 font-bold">{mobileMoneyProvider}</span>
              </label>
              <div className="flex gap-1.5">
                <select
                  value={mobileMoneyProvider}
                  onChange={(e) => setMobileMoneyProvider(e.target.value)}
                  className="w-28 px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Airtel Money">Airtel</option>
                  <option value="Tigo Pesa">Tigo</option>
                  <option value="HaloPesa">HaloPesa</option>
                </select>
                <input
                  type="text"
                  required
                  value={mobileMoneyNumber}
                  onChange={(e) => setMobileMoneyNumber(e.target.value)}
                  placeholder="0754 123 456"
                  className="flex-grow px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Water & Electricity details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Water Reliability
              </label>
              <input
                type="text"
                value={waterSupply}
                onChange={(e) => setWaterSupply(e.target.value)}
                placeholder="e.g. 24/7 Borehole + DUWASA Backup Tank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Electricity Billing
              </label>
              <input
                type="text"
                value={electricityType}
                onChange={(e) => setElectricityType(e.target.value)}
                placeholder="e.g. Sub-meter Luku (Pay for what you use)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Amenities Multi-select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Amenities Provided:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((item) => {
                const checked = amenities.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                      checked
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-property"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>{editingProperty ? 'Update Listing' : 'Publish Student Rental'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
