import React, { useState } from 'react';
import { 
  Heart, 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Calculator, 
  ShieldCheck, 
  Trash2, 
  ExternalLink,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  Camera,
  CheckCircle2,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Property, User as UserType, AvailabilityStatus } from '../types';
import { PropertyCard } from '../components/PropertyCard';

interface TenantDashboardViewProps {
  currentUser: UserType | null;
  favoriteProperties: Property[];
  onToggleFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onNavigateSearch: () => void;
  onOpenReportFraud: (property: Property) => void;
  onQuickChangeStatus?: (propertyId: string, status: AvailabilityStatus) => void;
  onUpdateProfile?: (updatedData: Partial<UserType>) => Promise<void>;
  onOpenMessages?: () => void;
  onOpenLandlordProfile?: (landlordId: string) => void;
}

export const TenantDashboardView: React.FC<TenantDashboardViewProps> = ({
  currentUser,
  favoriteProperties = [],
  onToggleFavorite,
  onSelectProperty,
  onNavigateSearch,
  onOpenReportFraud,
  onQuickChangeStatus,
  onUpdateProfile,
  onOpenMessages,
  onOpenLandlordProfile
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'profile' | 'budget'>('favorites');

  // Profile Edit State
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [courseOfStudy, setCourseOfStudy] = useState(currentUser?.courseOfStudy || '');
  const [yearOfStudy, setYearOfStudy] = useState(currentUser?.yearOfStudy || 'Year 2');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [preferredContactMethods, setPreferredContactMethods] = useState<string[]>(
    currentUser?.preferredContactMethods || ['whatsapp', 'in_app']
  );
  const [lifestyleHabits, setLifestyleHabits] = useState<string[]>(
    currentUser?.lifestyleHabits || ['Quiet Study Hours', 'Clean & Organized', 'Early Riser']
  );
  const [habitInput, setHabitInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Student Monthly Budget Calculator State
  const [stipendAmount, setStipendAmount] = useState<number>(350000); // e.g. HESLB / Parent stipend
  const [targetRent, setTargetRent] = useState<number>(130000);
  const [utilitiesBudget, setUtilitiesBudget] = useState<number>(25000);
  const [foodDaily, setFoodDaily] = useState<number>(5000);

  const monthlyFood = foodDaily * 30;
  const totalExpenses = targetRent + utilitiesBudget + monthlyFood;
  const remainingStipend = stipendAmount - totalExpenses;

  const toggleContactMethod = (method: string) => {
    setPreferredContactMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleAddHabit = () => {
    if (!habitInput.trim()) return;
    if (!lifestyleHabits.includes(habitInput.trim())) {
      setLifestyleHabits([...lifestyleHabits, habitInput.trim()]);
    }
    setHabitInput('');
  };

  const handleRemoveHabit = (habitToRemove: string) => {
    setLifestyleHabits(lifestyleHabits.filter((h) => h !== habitToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg(false);
    try {
      await onUpdateProfile({
        name: name.trim(),
        avatar: avatar.trim(),
        bio: bio.trim(),
        courseOfStudy: courseOfStudy.trim(),
        yearOfStudy,
        phone: phone.trim(),
        preferredContactMethods,
        lifestyleHabits
      });
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to update tenant profile', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'Tenant'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                {currentUser?.name || 'Student Tenant'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                SJUT Verified Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser?.courseOfStudy || 'Bachelor Degree'} • {currentUser?.yearOfStudy || 'Year 2'}</span>
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
              <span>In-App Messages</span>
            </button>
          )}

          <button
            onClick={onNavigateSearch}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Find Rooms Around SJUT</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Saved Rooms ({favoriteProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Tenant Profile & Contact Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'budget'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Student Budget Calculator</span>
        </button>
      </div>

      {/* Tab 1: Saved Favorite Properties */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Saved Rooms Around St John's
            </h2>
            <span className="text-xs text-slate-500">
              Direct landlord access • No broker commission
            </span>
          </div>

          {(favoriteProperties || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProperty={onSelectProperty}
                  onOpenReportFraud={onOpenReportFraud}
                  onQuickChangeStatus={onQuickChangeStatus}
                  onOpenLandlordProfile={onOpenLandlordProfile}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                You haven't saved any rooms yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap the heart icon on any property in Kikuyu, Area C, or Makulu to save and compare them here.
              </p>
              <button
                onClick={onNavigateSearch}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Browse Available Rooms
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tenant Profile Section */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Student Tenant Profile & Contact Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Customize your public profile, preferred contact methods, and lifestyle habits to make renting seamless with landlords.
            </p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tenant profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-medium">
            
            {/* Avatar & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Profile Picture URL
                </label>
                <div className="flex gap-2 items-center">
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Degree / Course of Study at SJUT
                </label>
                <input
                  type="text"
                  value={courseOfStudy}
                  onChange={(e) => setCourseOfStudy(e.target.value)}
                  placeholder="e.g. BSc Nursing, BBA, BEd"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Year of Study
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="Year 1 (Freshman)">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3 (Final Year)">Year 3 (Final Year)</option>
                  <option value="Year 4+ (Medical/Specialized)">Year 4+ (Medical/Specialized)</option>
                  <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                </select>
              </div>
            </div>

            {/* Short Bio */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">
                Student Bio & Room Search Preferences
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself to landlords: your schedule, hygiene standards, whether you need a quiet room for exam prep..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
              />
            </div>

            {/* Contact Information & Preferred Methods */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 754 123 456"
                  className="w-full sm:w-80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                  Preferred Contact Methods (How landlords should reach you)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> },
                    { id: 'in_app', label: 'KaaKaribu In-App Message', icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" /> },
                    { id: 'call', label: 'Direct Phone Call', icon: <Phone className="w-3.5 h-3.5 text-blue-600" /> },
                    { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> },
                    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-indigo-600" /> }
                  ].map((method) => {
                    const isSelected = preferredContactMethods.includes(method.id);
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => toggleContactMethod(method.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {method.icon}
                        <span>{method.label}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Lifestyle & Study Habits */}
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">
                Study Habits & Roommate Lifestyle Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {lifestyleHabits.map((habit) => (
                  <span
                    key={habit}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <span>{habit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHabit(habit)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={habitInput}
                  onChange={(e) => setHabitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHabit();
                    }
                  }}
                  placeholder="e.g. Non-smoker, Quiet Study, Vegan"
                  className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddHabit}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                {isSavingProfile ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Tenant Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Student Rent & Stipend Planner */}
      {activeTab === 'budget' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Calculator className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Student Monthly Housing Budget Planner
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate your semester allowance vs monthly rent and Luku electric costs before committing to a lease.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400">Total Monthly Income/Stipend (TZS)</label>
              <input
                type="number"
                step={10000}
                value={stipendAmount}
                onChange={(e) => setStipendAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400">Monthly Room Rent (TZS)</label>
              <input
                type="number"
                step={5000}
                value={targetRent}
                onChange={(e) => setTargetRent(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400">Utilities (Luku & Water TZS)</label>
              <input
                type="number"
                step={2000}
                value={utilitiesBudget}
                onChange={(e) => setUtilitiesBudget(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400">Daily Food & Transport (TZS)</label>
              <input
                type="number"
                step={500}
                value={foodDaily}
                onChange={(e) => setFoodDaily(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>
          </div>

          {/* Output metrics */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Total Monthly Cost</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
                TZS {totalExpenses.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Rent % of Stipend</p>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">
                {stipendAmount > 0 ? Math.round((targetRent / stipendAmount) * 100) : 0}%
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Remaining Pocket Money</p>
              <p className={`text-lg font-extrabold font-heading mt-0.5 ${remainingStipend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                TZS {remainingStipend.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
