import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Star, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Building2, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Award,
  Sparkles,
  Home
} from 'lucide-react';
import { User, Property, Review } from '../types';
import { INITIAL_USERS, INITIAL_PROPERTIES, INITIAL_REVIEWS } from '../data/seedData';

interface LandlordProfileModalProps {
  landlord?: User | null;
  landlordId?: string | null;
  landlordProperties?: Property[];
  reviews?: Review[];
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
  onStartInAppMessage?: (landlord: User, property?: Property) => void;
  onContactLandlord?: (property: Property) => void;
  currentUser?: User | null;
}

export const LandlordProfileModal: React.FC<LandlordProfileModalProps> = ({
  landlord: initialLandlord,
  landlordId,
  landlordProperties: propProperties,
  reviews: propReviews,
  onClose,
  onSelectProperty,
  onStartInAppMessage,
  onContactLandlord,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'reviews'>('overview');
  const [landlord, setLandlord] = useState<User | null>(() => {
    if (initialLandlord) return initialLandlord;
    if (landlordId) {
      return INITIAL_USERS.find(u => u.id === landlordId) || null;
    }
    return null;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    if (propProperties && Array.isArray(propProperties) && propProperties.length > 0) {
      return propProperties;
    }
    const targetId = initialLandlord?.id || landlordId;
    if (targetId) {
      return INITIAL_PROPERTIES.filter(p => p.landlordId === targetId);
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (propReviews && Array.isArray(propReviews) && propReviews.length > 0) {
      return propReviews;
    }
    const targetId = initialLandlord?.id || landlordId;
    if (targetId) {
      return INITIAL_REVIEWS.filter(r => r.landlordId === targetId);
    }
    return [];
  });

  // Sync landlord if prop changes
  useEffect(() => {
    if (initialLandlord) {
      setLandlord(initialLandlord);
    } else if (landlordId) {
      const found = INITIAL_USERS.find(u => u.id === landlordId);
      if (found) setLandlord(found);

      // Also try fetching from API
      fetch(`/api/users/${landlordId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) setLandlord(data);
        })
        .catch(() => null);
    }
  }, [initialLandlord, landlordId]);

  // Sync properties
  useEffect(() => {
    if (propProperties && Array.isArray(propProperties)) {
      setProperties(propProperties);
    } else {
      const targetId = landlord?.id || landlordId;
      if (targetId) {
        fetch(`/api/properties?landlordId=${targetId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setProperties(data);
          })
          .catch(() => null);
      }
    }
  }, [propProperties, landlord?.id, landlordId]);

  // Sync reviews
  useEffect(() => {
    if (propReviews && Array.isArray(propReviews)) {
      setReviews(propReviews);
    } else {
      const targetId = landlord?.id || landlordId;
      if (targetId) {
        fetch(`/api/reviews?landlordId=${targetId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setReviews(data);
          })
          .catch(() => null);
      }
    }
  }, [propReviews, landlord?.id, landlordId]);

  if (!landlord) return null;

  const landlordPropertiesList = properties || [];
  const reviewsList = reviews || [];

  // Filter reviews for this landlord
  const landlordReviews = reviewsList.filter(r => r.landlordId === landlord.id);
  const avgRating = landlordReviews.length > 0 
    ? (landlordReviews.reduce((acc, r) => acc + r.rating, 0) / landlordReviews.length).toFixed(1)
    : (landlord.rating ? landlord.rating.toFixed(1) : '4.9');
  
  const totalReviews = landlordReviews.length > 0 ? landlordReviews.length : (landlord.reviewsCount || 8);

  const cleanWhatsAppNumber = (landlord.officialWhatsapp || landlord.phone || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${landlord.name}, I am contacting you through KaaKaribu regarding student housing around St John's University.`
  )}`;

  const handleMessageClick = () => {
    const firstProp = landlordPropertiesList[0];
    if (onStartInAppMessage) {
      onStartInAppMessage(landlord, firstProp);
    } else if (onContactLandlord && firstProp) {
      onContactLandlord(firstProp);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="landlord-profile-modal"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
            <img
              src={landlord.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={landlord.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black font-heading tracking-tight">
                  {landlord.name}
                </h2>
                {landlord.isApprovedLandlord && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Verified SJUT Landlord
                  </span>
                )}
              </div>
              <p className="text-emerald-100 text-sm font-medium">
                {landlord.businessName || 'Student Housing Provider'}
              </p>
              
              {/* Rating Pill */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="font-bold text-white text-sm">{avgRating}</span>
                  <span className="text-emerald-200">({totalReviews} student reviews)</span>
                </div>
                <div className="text-emerald-200">
                  <span>{landlord.yearsOfExperience || 8}+ Years Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Host Overview & Trust
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Properties ({landlordPropertiesList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Student Reviews ({landlordReviews.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Experience Bio */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 font-heading">
                  About Landlord & Track Record
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {landlord.experienceBio || landlord.bio || `${landlord.name} manages safe, dependable student accommodations around St John's University in Dodoma. Direct landlord communication guaranteed with no broker commissions.`}
                </div>
              </div>

              {/* Key Credentials Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Units Managed</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-heading">
                    {landlord.totalUnitsManaged || (landlordPropertiesList.length > 0 ? landlordPropertiesList.length : 12)}
                  </div>
                  <span className="text-[10px] text-slate-400">Student rooms</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Response Speed</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-1">
                    {landlord.responsivenessRate || 'Within 15 mins'}
                  </div>
                  <span className="text-[10px] text-slate-400">High responsiveness</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Experience</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-heading">
                    {landlord.yearsOfExperience || 8}+ Yrs
                  </div>
                  <span className="text-[10px] text-slate-400">Around SJUT campus</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-purple-600 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Mobile Money</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-1">
                    {landlord.mobileMoneyProvider || 'M-Pesa'}
                  </div>
                  <span className="text-[10px] text-slate-400">Official receipt</span>
                </div>
              </div>

              {/* Physical Office Address / Compound Location */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Office or Primary Property Location
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {landlord.officeAddress || 'Kikuyu / Area C near St John’s University Campus, Dodoma'}
                  </p>
                </div>
              </div>

              {/* Landlord House Rules & Standards */}
              {landlord.landlordRules && (landlord.landlordRules || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 font-heading">
                    Property Standards & House Guidelines
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(landlord.landlordRules || []).map((rule, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Communication Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleMessageClick}
                  className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send In-App Message</span>
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto py-3 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={`tel:${landlord.officialPhone || landlord.phone || '+255754000000'}`}
                  className="w-full sm:w-auto py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Landlord</span>
                </a>
              </div>

            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing all active and occupied properties managed by {landlord.name}
                </p>
                <span className="text-xs font-bold text-emerald-600">
                  {landlordPropertiesList.length} Properties
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {landlordPropertiesList.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => {
                      onSelectProperty(property);
                      onClose();
                    }}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 cursor-pointer transition-all flex gap-3 bg-white dark:bg-slate-800/40 hover:shadow-md"
                  >
                    <img
                      src={(property.images && property.images[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'}
                      alt={property.title}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            property.availabilityStatus === 'available'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : property.availabilityStatus === 'reserved'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {(property.availabilityStatus || 'available').toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            {((property.monthlyRent || 0) / 1000).toFixed(0)}k/mo
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">
                          {property.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {property.location} • {property.distanceFromUniversity}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {property.averageRating || 4.9}
                        </span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5 hover:underline">
                          View details <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verified Student Rating Score
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Ratings left by verified St John’s University tenants
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-black text-emerald-600 font-heading">
                    {avgRating}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span>{landlordReviews.length} total reviews</span>
                  </div>
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-3">
                {landlordReviews.length > 0 ? (
                  landlordReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.tenantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={rev.tenantName}
                            className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {rev.tenantName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {rev.tenantCourse || 'SJUT Student'} • {rev.stayPeriod || 'Resident'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{rev.comment}"
                      </p>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>Property: {rev.propertyTitle}</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Landlord reply */}
                      {rev.landlordReply && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border-l-2 border-emerald-500 text-xs space-y-1">
                          <p className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                            Response from Landlord:
                          </p>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                            {rev.landlordReply.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No student reviews yet for this landlord.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
