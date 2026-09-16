export type UserRole = 'tenant' | 'landlord' | 'admin';

export type AvailabilityStatus = 'available' | 'reserved' | 'occupied';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export type PropertyType = 
  | 'Single Room'
  | 'Bedsitter'
  | '1-Bedroom'
  | '2-Bedroom'
  | 'Shared Hostel'
  | 'Self-Contained';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isApprovedLandlord?: boolean;
  businessName?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'HaloPesa';
  idNumber?: string;
  // Tenant Profile specifics
  bio?: string;
  preferredContactMethods?: ('whatsapp' | 'call' | 'sms' | 'email' | 'in_app')[];
  courseOfStudy?: string;
  yearOfStudy?: string;
  lifestyleHabits?: string[];
  emergencyContact?: string;
  // Landlord Profile specifics
  experienceBio?: string;
  officialPhone?: string;
  officialWhatsapp?: string;
  officeAddress?: string;
  yearsOfExperience?: number;
  totalUnitsManaged?: number;
  responsivenessRate?: string;
  landlordRules?: string[];
  // Stats
  rating?: number;
  reviewsCount?: number;
  occupiedPropertyIds?: string[];
  interactedPropertyIds?: string[];
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  monthlyRent: number; // in TZS
  currency: string;
  location: string; // e.g. "Kikuyu", "Area C", "Makulu", "Chidachi"
  neighborhood?: string;
  distanceFromUniversity: string; // e.g. "0.3 km (4 min walk)"
  distanceKm: number; // For filtering
  latitude?: number; // Dodoma coordinates
  longitude?: number;
  propertyType: PropertyType;
  images: string[];
  contactNumber: string;
  whatsAppNumber: string;
  whatsappNumber?: string;
  mobileMoneyNumber: string;
  mobileMoneyProvider: string;
  availabilityStatus: AvailabilityStatus;
  approvalStatus: ApprovalStatus;
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  landlordAvatar?: string;
  landlordVerified: boolean;
  amenities: string[];
  isFeatured?: boolean;
  viewCount: number;
  waterSupply: string;
  electricityType: string;
  // Ratings & Occupancy
  averageRating?: number;
  reviewsCount?: number;
  occupiedByTenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCategoryRatings {
  cleanliness: number;
  accuracy: number;
  waterAndPower: number;
  landlordResponsiveness: number;
}

export interface Review {
  id: string;
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar?: string;
  tenantCourse?: string;
  rating: number; // 1 to 5
  comment: string;
  categoryRatings?: ReviewCategoryRatings;
  stayPeriod?: string; // e.g. "Resident 2025/2026"
  isVerifiedTenant: boolean;
  landlordReply?: {
    comment: string;
    repliedAt: string;
  };
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  propertyPrice?: number;
  propertyLocation?: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar?: string;
  landlordId: string;
  landlordName: string;
  landlordAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountTenant: number;
  unreadCountLandlord: number;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface FraudReport {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  reporterName: string;
  reporterContact: string;
  reason: 'broker_commission_demanded' | 'fake_photos' | 'wrong_price' | 'already_occupied' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed' | 'investigated';
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  maxDistance: number;
  propertyType: string;
  availability: string;
  location: string;
  sortBy: 'price-asc' | 'price-desc' | 'distance' | 'newest';
}

export interface PlatformStats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  totalLandlords: number;
  approvedLandlords: number;
  totalTenants: number;
  totalFraudReports: number;
  estimatedBrokerFeesSaved: number; // TZS saved
}
