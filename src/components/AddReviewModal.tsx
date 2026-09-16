import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Droplet,
  Zap,
  Clock,
  Sparkle
} from 'lucide-react';
import { Property, User, ReviewCategoryRatings } from '../types';

interface AddReviewModalProps {
  property: Property | null;
  currentUser: User | null;
  onClose: () => void;
  onSubmitReview?: (reviewData: {
    propertyId: string;
    landlordId: string;
    tenantId: string;
    tenantName: string;
    tenantAvatar?: string;
    tenantCourse?: string;
    rating: number;
    comment: string;
    categoryRatings: ReviewCategoryRatings;
    stayPeriod: string;
  }) => Promise<void>;
  onReviewSubmitted?: (newReview: any) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  property,
  currentUser,
  onClose,
  onSubmitReview,
  onReviewSubmitted
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [waterAndPower, setWaterAndPower] = useState<number>(5);
  const [landlordResponsiveness, setLandlordResponsiveness] = useState<number>(5);
  const [stayPeriod, setStayPeriod] = useState<string>('Resident 2025/2026 Academic Year');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!property || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 10) {
      setError('Please provide at least a brief comment (10+ characters) describing your experience for future students.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const reviewPayload = {
        propertyId: property.id,
        landlordId: property.landlordId,
        tenantId: currentUser.id,
        tenantName: currentUser.name,
        tenantAvatar: currentUser.avatar,
        tenantCourse: currentUser.courseOfStudy || 'SJUT Student',
        rating: overallRating,
        comment: comment.trim(),
        categoryRatings: {
          cleanliness,
          accuracy,
          waterAndPower,
          landlordResponsiveness
        },
        stayPeriod
      };

      if (onSubmitReview) {
        await onSubmitReview(reviewPayload);
      } else {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewPayload)
        });
        const saved = await res.json();
        if (onReviewSubmitted) {
          onReviewSubmitted(saved);
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 1: return 'Disappointing';
      case 2: return 'Below Expectations';
      case 3: return 'Average / Acceptable';
      case 4: return 'Very Good / Recommend';
      case 5: return 'Outstanding / High Quality';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="add-review-modal"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Rate & Review Property
              </h3>
              <p className="text-[11px] text-slate-500">
                Help fellow St John’s students find verified quality housing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Property Context Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                {property.title}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                Landlord: {property.landlordName} • {property.location}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Tenant Review
                </span>
              </div>
            </div>
          </div>

          {/* Main 5 Star Rating */}
          <div className="text-center space-y-2 py-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Overall Student Experience Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transform hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || overallRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {getRatingLabel(hoverRating || overallRating)} ({hoverRating || overallRating}/5)
            </p>
          </div>

          {/* Category Breakdown (1-5 stars each) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Detailed Amenities & Living Criteria:
            </p>

            {/* Cleanliness */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Cleanliness & Hygiene
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setCleanliness(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= cleanliness ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Water & Power */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
                Water & Electricity Reliability
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setWaterAndPower(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= waterAndPower ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Landlord Responsiveness */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                Landlord Responsiveness & Respect
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setLandlordResponsiveness(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= landlordResponsiveness ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Accuracy */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Photos & Price Accuracy
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setAccuracy(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= accuracy ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stay Period */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              When did you stay here or interact with this property?
            </label>
            <select
              value={stayPeriod}
              onChange={(e) => setStayPeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Resident 2025/2026 Academic Year">Resident 2025/2026 Academic Year</option>
              <option value="Resident Semester 1 & 2">Resident Semester 1 & 2</option>
              <option value="Occupied Room 2024/2025">Occupied Room 2024/2025</option>
              <option value="In-Person Inspection & Viewing Completed">In-Person Inspection & Viewing Completed</option>
              <option value="Rental Agreement Finalized">Rental Agreement Finalized</option>
            </select>
          </div>

          {/* Written Comment */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Your Detailed Review & Advice for Students:</span>
              <span className="text-[10px] text-slate-400 font-normal">Min 10 characters</span>
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share honest feedback about the water flow, Luku electricity sub-meter, noise levels, security gate, and how landlord handles repairs..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Verified Notice */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p>
              Your review will appear with a <strong>Verified SJUT Tenant</strong> badge so fellow university students know it comes from a real resident without broker bias.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              {isSubmitting ? (
                <span>Submitting Review...</span>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-white" />
                  <span>Publish Student Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
