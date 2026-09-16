import React from 'react';
import { 
  MapPin, 
  Footprints, 
  Heart, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Eye, 
  Zap, 
  Droplet,
  ExternalLink,
  Star,
  Sparkles
} from 'lucide-react';
import { Property, AvailabilityStatus } from '../types';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
  onOpenReportFraud?: (property: Property) => void;
  isLandlordOwner?: boolean;
  onQuickChangeStatus?: (propertyId: string, status: AvailabilityStatus) => void;
  onOpenLandlordProfile?: (landlordId: string) => void;
  onStartMessage?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite,
  onToggleFavorite,
  onSelectProperty,
  onOpenReportFraud,
  isLandlordOwner = false,
  onQuickChangeStatus,
  onOpenLandlordProfile,
  onStartMessage
}) => {
  // Format currency
  const formattedRent = new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0
  }).format(property.monthlyRent);

  // Availability badge styling
  const getAvailabilityBadge = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Reserved
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Occupied
          </span>
        );
    }
  };

  const cleanWhatsAppNumber = (property.whatsAppNumber || (property as any).whatsappNumber || (property as any).contactNumber || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${property.landlordName}, I found your listing "${property.title}" on KaaKaribu (St John's Student Housing). Is it still available for viewing?`
  )}`;

  const propertyImages = property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'];
  const propertyAmenities = property.amenities || [];

  return (
    <div 
      id={`property-card-${property.id}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={propertyImages[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
          onClick={() => onSelectProperty(property)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <div>{getAvailabilityBadge(property.availabilityStatus)}</div>

          {/* Favorite Heart Button */}
          <button
            id={`btn-fav-${property.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              isFavorite 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' 
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Distance from St John's University Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>{property.distanceFromUniversity}</span>
          </div>
        </div>

        {/* Property Type Pill */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Price & Rating Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {formattedRent}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/month</span>
            </div>

            {/* Star Rating Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-900/50">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{property.averageRating || 4.8}</span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                ({property.reviewsCount || 3})
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
            {property.neighborhood && (
              <span className="truncate text-slate-400">• {property.neighborhood}</span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProperty(property)}
            className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-1 cursor-pointer transition-colors"
            title={property.title}
          >
            {property.title}
          </h3>

          {/* Description snippet */}
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          {/* Amenities Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {propertyAmenities.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {amenity}
              </span>
            ))}
            {propertyAmenities.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium text-slate-400">
                +{propertyAmenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Bottom Landlord Info & Direct Contact */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Landlord Name & Verification (Clickable to Landlord Profile) */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <button
              type="button"
              onClick={() => onOpenLandlordProfile && onOpenLandlordProfile(property.landlordId)}
              className="flex items-center gap-2 text-left group/landlord hover:opacity-80 transition-opacity"
              title="View Landlord Profile & Experience"
            >
              <img
                src={property.landlordAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={property.landlordName}
                className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover/landlord:text-emerald-600 dark:group-hover/landlord:text-emerald-400 truncate max-w-[130px]">
                {property.landlordName}
              </span>
              {property.landlordVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" title="Verified Landlord ID" />
              )}
            </button>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Eye className="w-3 h-3" />
              <span>{property.viewCount} views</span>
            </div>
          </div>

          {/* Landlord Quick Status Controls if owner */}
          {isLandlordOwner && onQuickChangeStatus ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Status Change:</p>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => onQuickChangeStatus(property.id, 'available')}
                  className={`py-1 rounded font-medium text-center transition-colors ${
                    property.availabilityStatus === 'available'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => onQuickChangeStatus(property.id, 'reserved')}
                  className={`py-1 rounded font-medium text-center transition-colors ${
                    property.availabilityStatus === 'reserved'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                  }`}
                >
                  Reserved
                </button>
                <button
                  type="button"
                  onClick={() => onQuickChangeStatus(property.id, 'occupied')}
                  className={`py-1 rounded font-medium text-center transition-colors ${
                    property.availabilityStatus === 'occupied'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
                  }`}
                >
                  Occupied
                </button>
              </div>
            </div>
          ) : (
            /* Tenant Direct Contact Actions: In-App Message, WhatsApp & Call */
            <div className="grid grid-cols-3 gap-1.5">
              {onStartMessage && (
                <button
                  type="button"
                  onClick={() => onStartMessage(property)}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="Direct in-app messaging"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              )}

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-semibold transition-colors ${
                  !onStartMessage ? 'col-span-1' : ''
                }`}
                title="Chat directly on WhatsApp"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${property.contactNumber}`}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                title={`Call ${property.contactNumber}`}
              >
                <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Call</span>
              </a>
            </div>
          )}

          {/* View Details button */}
          <button
            onClick={() => onSelectProperty(property)}
            className="w-full mt-2 py-1.5 text-center text-xs font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors"
          >
            <span>View Details & Reviews</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};

