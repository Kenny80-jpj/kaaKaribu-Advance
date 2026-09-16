import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Phone, 
  CreditCard, 
  MapPin, 
  Footprints,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Star,
  ExternalLink,
  Camera,
  User as UserIcon
} from 'lucide-react';
import { Property, User, AvailabilityStatus } from '../types';

interface LandlordDashboardViewProps {
  currentUser: User | null;
  myProperties: Property[];
  onOpenAddProperty: (propertyToEdit?: Property) => void;
  onDeleteProperty: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onQuickChangeStatus: (propertyId: string, status: AvailabilityStatus) => void;
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onOpenMessages?: () => void;
  onOpenPublicProfile?: (landlordId: string) => void;
}

export const LandlordDashboardView: React.FC<LandlordDashboardViewProps> = ({
  currentUser,
  myProperties = [],
  onOpenAddProperty,
  onDeleteProperty,
  onSelectProperty,
  onQuickChangeStatus,
  onUpdateProfile,
  onOpenMessages,
  onOpenPublicProfile
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [businessName, setBusinessName] = useState(currentUser?.businessName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [experienceBio, setExperienceBio] = useState(currentUser?.experienceBio || currentUser?.bio || '');
  const [yearsExperience, setYearsExperience] = useState(currentUser?.yearsExperience || 5);
  const [officeAddress, setOfficeAddress] = useState(currentUser?.officeAddress || 'Near St John’s Main Gate, Kikuyu, Dodoma');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(currentUser?.mobileMoneyNumber || '');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'HaloPesa'>(
    currentUser?.mobileMoneyProvider || 'M-Pesa'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const safeProperties = myProperties || [];
  const availableCount = safeProperties.filter(p => p.availabilityStatus === 'available').length;
  const reservedCount = safeProperties.filter(p => p.availabilityStatus === 'reserved').length;
  const occupiedCount = safeProperties.filter(p => p.availabilityStatus === 'occupied').length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      avatar,
      businessName,
      phone,
      bio: experienceBio,
      experienceBio,
      yearsExperience,
      officeAddress,
      mobileMoneyNumber,
      mobileMoneyProvider
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setEditingProfile(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Landlord Top Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'Landlord'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md cursor-pointer"
            referrerPolicy="no-referrer"
            onClick={() => onOpenPublicProfile && onOpenPublicProfile(currentUser?.id || '')}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                {currentUser?.name || 'Landlord Account'}
              </h1>
              {currentUser?.isApprovedLandlord ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Landlord
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser?.businessName || 'Student Housing Provider'} • Phone: {currentUser?.phone || '+255 754 000 000'} • {currentUser?.yearsExperience || 5}+ Years Hosting SJUT Students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenMessages && (
            <button
              onClick={onOpenMessages}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Tenant Inquiries</span>
            </button>
          )}

          {onOpenPublicProfile && (
            <button
              onClick={() => onOpenPublicProfile(currentUser?.id || '')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public Profile & Reviews</span>
            </button>
          )}

          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            {editingProfile ? 'Close Settings' : 'Edit Landlord Details'}
          </button>

          <button
            id="btn-landlord-add-property"
            onClick={() => onOpenAddProperty()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Drawer / Form */}
      {editingProfile && (
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-600" />
              <span>Landlord Profile, Experience & Official Contact Details</span>
            </h3>
            <span className="text-xs text-slate-500">Visible to students across your listings</span>
          </div>

          {savedNotice && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Landlord profile saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Business / Company Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Mwambene Student Hostels"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Profile Picture URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Years Hosting Students</label>
              <input
                type="number"
                min={1}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Office / Physical Address</label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="e.g. Kikuyu, Near St John's Main Gate"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
              Experience Bio & Housing Rules for St John's Students
            </label>
            <textarea
              rows={3}
              value={experienceBio}
              onChange={(e) => setExperienceBio(e.target.value)}
              placeholder="Detail your property management experience, maintenance response turnaround time, backup water tanks, security guard hours..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 leading-relaxed"
            />
          </div>

          <div className="text-xs">
            <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">Official Mobile Money Account</label>
            <div className="flex gap-2 max-w-md">
              <select
                value={mobileMoneyProvider}
                onChange={(e) => setMobileMoneyProvider(e.target.value as any)}
                className="w-32 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Tigo Pesa">Tigo Pesa</option>
                <option value="HaloPesa">HaloPesa</option>
              </select>
              <input
                type="text"
                value={mobileMoneyNumber}
                onChange={(e) => setMobileMoneyNumber(e.target.value)}
                placeholder="e.g. 0754 123 456"
                className="flex-grow p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingProfile(false)}
              className="px-4 py-2 text-xs text-slate-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md"
            >
              Save Landlord Profile
            </button>
          </div>
        </form>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-1">
            {safeProperties.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Properties managed</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-950 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available Now
          </p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1">
            {availableCount}
          </p>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-1">Students can view & book</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-950 shadow-sm">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Reserved
          </p>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 font-heading mt-1">
            {reservedCount}
          </p>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-1">Inspection in progress</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950 shadow-sm">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Occupied
          </p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 font-heading mt-1">
            {occupiedCount}
          </p>
          <p className="text-[11px] text-rose-800/80 dark:text-rose-400 mt-1">Rent active & reviewable</p>
        </div>
      </div>

      {/* Property Listings Management Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
            Manage Room Availability & Details
          </h2>
          <span className="text-xs text-slate-500">
            Use 1-click status buttons to instantly update student search
          </span>
        </div>

        {myProperties.length > 0 ? (
          <div className="space-y-4">
            {myProperties.map((property) => (
              <div 
                key={property.id}
                id={`landlord-row-${property.id}`}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all"
              >
                {/* Image & Main Info */}
                <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => onSelectProperty(property)}>
                  <img
                    src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=80'}
                    alt={property.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {property.propertyType}
                      </span>
                      {property.approvalStatus === 'pending' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Awaiting Admin Approval
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{property.averageRating || '4.8'}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-emerald-600 transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        TZS {property.monthlyRent.toLocaleString()} /mo
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {property.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5 text-slate-400" />
                        {property.distanceFromUniversity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher (Green, Yellow, Red) */}
                <div className="w-full lg:w-auto p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                    Current Status:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => onQuickChangeStatus(property.id, 'available')}
                      className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                        property.availabilityStatus === 'available'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      🟢 Available
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickChangeStatus(property.id, 'reserved')}
                      className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                        property.availabilityStatus === 'reserved'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      🟡 Reserved
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickChangeStatus(property.id, 'occupied')}
                      className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                        property.availabilityStatus === 'occupied'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50'
                      }`}
                    >
                      🔴 Occupied
                    </button>
                  </div>
                </div>

                {/* Edit / Delete / View buttons */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Property Page"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-edit-property-${property.id}`}
                    onClick={() => onOpenAddProperty(property)}
                    className="p-2 text-slate-500 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Edit Property"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-property-${property.id}`}
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
                        onDeleteProperty(property.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No Listings Posted Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post your available rooms around St John's campus to connect with verified students directly.
            </p>
            <button
              onClick={() => onOpenAddProperty()}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Post Your First Student Room
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
