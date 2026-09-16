import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Footprints, 
  Heart, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Droplet, 
  CreditCard, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Star,
  Sparkles,
  ExternalLink,
  Send
} from 'lucide-react';
import { Property, AvailabilityStatus, User, Review } from '../types';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
  onOpenReportFraud: (property: Property) => void;
  isLandlordOwner?: boolean;
  onQuickChangeStatus?: (propertyId: string, status: AvailabilityStatus) => void;
  currentUser?: User | null;
  onOpenLandlordProfile?: (landlordId: string) => void;
  onOpenAddReview?: (property: Property) => void;
  onStartInAppMessage?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenReportFraud,
  isLandlordOwner = false,
  onQuickChangeStatus,
  currentUser,
  onOpenLandlordProfile,
  onOpenAddReview,
  onStartInAppMessage
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');

  // Fetch reviews for this property
  useEffect(() => {
    if (!property?.id) return;
    setLoadingReviews(true);
    fetch(`/api/reviews?propertyId=${property.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (data && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
        setLoadingReviews(false);
      })
      .catch((err) => {
        console.error('Failed to load reviews', err);
        setLoadingReviews(false);
      });
  }, [property?.id]);

  if (!property) return null;

  const propertyImages = property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'];

  const formattedRent = new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0
  }).format(property.monthlyRent);

  const cleanWhatsAppNumber = (property.whatsAppNumber || (property as any).whatsappNumber || (property as any).contactNumber || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${property.landlordName}, I saw your listing "${property.title}" on KaaKaribu (St John's Student Housing). I am a student looking for a room. Is it available for an in-person viewing?`
  )}`;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyComment.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: replyComment.trim() })
      });
      const data = await res.json();
      if (data.review) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? data.review : r)));
        setReplyingReviewId(null);
        setReplyComment('');
      }
    } catch (err) {
      console.error('Error submitting reply', err);
    }
  };

  const avgRating = property.averageRating || (
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '4.8'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="property-detail-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {property.propertyType}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ID: {property.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share listing link"
            >
              {copiedLink ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            </button>

            {/* Favorite */}
            <button
              onClick={() => onToggleFavorite(property.id)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite 
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-500' 
                  : 'text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Close */}
            <button
              id="btn-close-property-detail"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          
          {/* Main Photo Gallery */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={propertyImages[activeImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Navigation Arrows if multiple photos */}
            {propertyImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-transform active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-transform active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-mono backdrop-blur-md">
              {activeImageIdx + 1} / {propertyImages.length}
            </div>

            {/* Distance Overlay */}
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-lg">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span>{property.distanceFromUniversity}</span>
              </span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {propertyImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {propertyImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-16 sm:w-24 sm:h-18 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIdx === idx 
                      ? 'border-emerald-600 scale-105 shadow-md' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title, Location & Price Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  {property.location} ({property.neighborhood})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Footprints className="w-4 h-4 text-emerald-500" />
                  {property.distanceFromUniversity} to St John’s Campus
                </span>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{avgRating}</span>
                  <span className="text-amber-600/80 dark:text-amber-400/80 font-normal">
                    ({reviews.length > 0 ? reviews.length : property.reviewsCount || 3} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                {property.title}
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 md:text-right min-w-[220px]">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Monthly Rent (Direct)
              </p>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-0.5">
                {formattedRent}
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1 font-medium">
                0% Broker Commission • Pay Landlord Direct
              </p>
            </div>
          </div>

          {/* Landlord Quick Status Toggle if Owner */}
          {isLandlordOwner && onQuickChangeStatus && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Landlord Control: Update Room Availability
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onQuickChangeStatus(property.id, 'available')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    property.availabilityStatus === 'available'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-emerald-50'
                  }`}
                >
                  🟢 Available
                </button>
                <button
                  type="button"
                  onClick={() => onQuickChangeStatus(property.id, 'reserved')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    property.availabilityStatus === 'reserved'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-amber-50'
                  }`}
                >
                  🟡 Reserved
                </button>
                <button
                  type="button"
                  onClick={() => onQuickChangeStatus(property.id, 'occupied')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    property.availabilityStatus === 'occupied'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-rose-50'
                  }`}
                >
                  🔴 Occupied
                </button>
              </div>
            </div>
          )}

          {/* Description & Amenities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Details & Description */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-2">
                  Property Description
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Utility Specifications */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-3">
                  Key Utilities & Setup
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <Droplet className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Water Supply</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{property.waterSupply}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Electricity / Power</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{property.electricityType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-3">
                  Included Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.amenities.map((amenity, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Proximity Notice */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>St John's Student Walking Route</span>
                </div>
                <p>
                  This property is located in {property.location}, approximately {property.distanceFromUniversity}. Perfect for students walking to class, library, and laboratory sessions without commuting cost.
                </p>
              </div>

              {/* Verified Student Reviews Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span>Student Reviews & Ratings ({reviews.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ratings from real St John's tenants who finalized rental or occupied this room
                    </p>
                  </div>

                  {onOpenAddReview && (
                    <button
                      type="button"
                      onClick={() => onOpenAddReview(property)}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Write Review & Rate</span>
                    </button>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {loadingReviews ? (
                    <div className="p-6 text-center text-xs text-slate-400">Loading student reviews...</div>
                  ) : reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2.5 text-xs"
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
                              <p className="font-bold text-slate-900 dark:text-white">
                                {rev.tenantName}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {rev.tenantCourse || 'SJUT Student'} • {rev.stayPeriod || 'Resident'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Category ratings pills */}
                        {rev.categoryRatings && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Cleanliness: {rev.categoryRatings.cleanliness}/5
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Water & Power: {rev.categoryRatings.waterAndPower}/5
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Landlord: {rev.categoryRatings.landlordResponsiveness}/5
                            </span>
                          </div>
                        )}

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                          "{rev.comment}"
                        </p>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Occupant Review
                          </span>
                          <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Landlord Reply Box */}
                        {rev.landlordReply ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-l-2 border-emerald-500 text-xs space-y-1">
                            <p className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                              Response from Landlord:
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                              {rev.landlordReply.comment}
                            </p>
                          </div>
                        ) : isLandlordOwner ? (
                          <div className="pt-1">
                            {replyingReviewId === rev.id ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={replyComment}
                                  onChange={(e) => setReplyComment(e.target.value)}
                                  placeholder="Write a polite response to this student review..."
                                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingReviewId(null)}
                                    className="px-2 py-1 text-slate-500"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReplySubmit(rev.id)}
                                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs"
                                  >
                                    Post Reply
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReplyingReviewId(rev.id)}
                                className="text-[11px] font-bold text-emerald-600 hover:underline"
                              >
                                Reply as Landlord
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                      No reviews posted yet for this listing. Be the first verified tenant to share your experience!
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right 1 Col: Landlord Verification & Direct Contact Card */}
            <div className="space-y-5">
              
              {/* Landlord Contact Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-emerald-500/30 shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={property.landlordAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={property.landlordName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 cursor-pointer"
                    referrerPolicy="no-referrer"
                    onClick={() => onOpenLandlordProfile && onOpenLandlordProfile(property.landlordId)}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 
                        onClick={() => onOpenLandlordProfile && onOpenLandlordProfile(property.landlordId)}
                        className="font-bold text-slate-900 dark:text-white font-heading cursor-pointer hover:text-emerald-600 transition-colors"
                      >
                        {property.landlordName}
                      </h4>
                      {property.landlordVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified Landlord ID on File" />
                      )}
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {property.landlordVerified ? 'Verified Property Owner' : 'Registered Landlord'}
                    </p>
                    {onOpenLandlordProfile && (
                      <button
                        type="button"
                        onClick={() => onOpenLandlordProfile(property.landlordId)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>View Landlord Profile & Reviews</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-2">
                  {/* In-App Messaging Button */}
                  {onStartInAppMessage && (
                    <button
                      type="button"
                      onClick={() => onStartInAppMessage(property)}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Landlord In-App</span>
                    </button>
                  )}

                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${property.contactNumber}`}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call: {property.contactNumber}</span>
                  </a>
                </div>

                {/* Mobile Money Official Number */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      Official Payment Number:
                    </span>
                    <span className="font-bold text-emerald-600">{property.mobileMoneyProvider}</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                    {property.mobileMoneyNumber}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Name on payment must match <strong>{property.landlordName}</strong>
                  </p>
                </div>

                {/* Safety Warning */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Student Safety Checklist:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] leading-tight text-amber-700 dark:text-amber-400">
                    <li>Always inspect room in person before sending deposit</li>
                    <li>Verify water pressure & key locks during daylight</li>
                    <li>Report any dalali who demands viewing fees</li>
                  </ul>
                </div>

                {/* Report Fraud Button */}
                <button
                  id="btn-report-fraud-modal"
                  onClick={() => onOpenReportFraud(property)}
                  className="w-full py-2 text-center text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Fraudulent Listing or Broker</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
