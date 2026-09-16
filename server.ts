import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROPERTIES, INITIAL_USERS, INITIAL_FRAUD_REPORTS, INITIAL_REVIEWS, INITIAL_THREADS, INITIAL_MESSAGES } from './src/data/seedData.js';
import { Property, User, FraudReport, Favorite, PlatformStats, Review, MessageThread, Message } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-Memory Data Store (seeded with St John's University listings)
let users: User[] = [...INITIAL_USERS];
let properties: Property[] = [...INITIAL_PROPERTIES];
let favorites: Favorite[] = [
  { id: 'fav-1', userId: 'user-tenant-1', propertyId: 'prop-1', createdAt: '2026-02-15T12:00:00Z' },
  { id: 'fav-2', userId: 'user-tenant-1', propertyId: 'prop-4', createdAt: '2026-02-16T14:00:00Z' }
];
let reports: FraudReport[] = [...INITIAL_FRAUD_REPORTS];
let reviews: Review[] = [...INITIAL_REVIEWS];
let threads: MessageThread[] = [...INITIAL_THREADS];
let messages: Message[] = [...INITIAL_MESSAGES];

// Compute initial ratings on properties
properties.forEach(p => {
  const propReviews = reviews.filter(r => r.propertyId === p.id);
  if (propReviews.length > 0) {
    const sum = propReviews.reduce((acc, r) => acc + r.rating, 0);
    p.averageRating = Number((sum / propReviews.length).toFixed(1));
    p.reviewsCount = propReviews.length;
  } else {
    p.averageRating = p.averageRating || 4.8;
    p.reviewsCount = p.reviewsCount || 3;
  }
});

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'KaaKaribu',
    time: new Date().toISOString(),
    totalProperties: properties.length,
    usersCount: users.length
  });
});

// ------------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.json({ user: existingUser });
  }

  // If user doesn't exist, create demo account
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    role: role || 'tenant',
    phone: '+255 700 000 000',
    createdAt: new Date().toISOString(),
    isApprovedLandlord: role === 'landlord' ? false : undefined
  };
  users.push(newUser);
  res.json({ user: newUser });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, role, phone, businessName, mobileMoneyNumber, mobileMoneyProvider, idNumber } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Email, name and role are required' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: role as 'tenant' | 'landlord' | 'admin',
    phone: phone || '+255 754 000 000',
    createdAt: new Date().toISOString(),
    isApprovedLandlord: role === 'landlord' ? false : undefined, // Landlords start pending admin verification
    businessName: businessName || (role === 'landlord' ? `${name} Rentals` : undefined),
    mobileMoneyNumber: mobileMoneyNumber || phone,
    mobileMoneyProvider: mobileMoneyProvider || 'M-Pesa',
    idNumber: idNumber || undefined
  };

  users.push(newUser);
  res.status(201).json({ user: newUser });
});

app.get('/api/auth/users', (req, res) => {
  res.json(users);
});

app.get('/api/auth/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/auth/users/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[index] = { ...users[index], ...req.body };
  
  // Also synchronize landlord properties if landlord name/avatar/phone changed
  if (users[index].role === 'landlord') {
    properties.forEach(p => {
      if (p.landlordId === id) {
        if (users[index].name) p.landlordName = users[index].name;
        if (users[index].phone) p.landlordPhone = users[index].phone;
        if (users[index].avatar) p.landlordAvatar = users[index].avatar;
      }
    });
  }

  res.json({ user: users[index] });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[index] = { ...users[index], ...req.body };
  res.json({ user: users[index] });
});

// ------------------------------------------
// PROPERTIES ROUTES
// ------------------------------------------
app.get('/api/properties', (req, res) => {
  const {
    search,
    minPrice,
    maxPrice,
    maxDistance,
    propertyType,
    availability,
    location,
    landlordId,
    includePending,
    sortBy
  } = req.query;

  let filtered = [...properties];

  // Admin or landlord view might see pending properties
  if (includePending !== 'true' && !landlordId) {
    filtered = filtered.filter(p => p.approvalStatus === 'approved');
  }

  if (landlordId) {
    filtered = filtered.filter(p => p.landlordId === landlordId);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) ||
      p.amenities.some(a => a.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.monthlyRent >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.monthlyRent <= Number(maxPrice));
  }

  if (maxDistance) {
    filtered = filtered.filter(p => p.distanceKm <= Number(maxDistance));
  }

  if (propertyType && propertyType !== 'All') {
    filtered = filtered.filter(p => p.propertyType.toLowerCase() === String(propertyType).toLowerCase());
  }

  if (availability && availability !== 'All') {
    filtered = filtered.filter(p => p.availabilityStatus.toLowerCase() === String(availability).toLowerCase());
  }

  if (location && location !== 'All') {
    filtered = filtered.filter(p => p.location.toLowerCase() === String(location).toLowerCase());
  }

  // Sorting
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.monthlyRent - b.monthlyRent);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.monthlyRent - a.monthlyRent);
  } else if (sortBy === 'distance') {
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    // Newest / Featured first
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  res.json(filtered);
});

app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const prop = properties.find(p => p.id === id);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Increment view counter
  prop.viewCount = (prop.viewCount || 0) + 1;

  res.json(prop);
});

app.post('/api/properties', (req, res) => {
  const body = req.body;
  if (!body.title || !body.monthlyRent || !body.location || !body.landlordId) {
    return res.status(400).json({ error: 'Missing required property fields' });
  }

  const landlord = users.find(u => u.id === body.landlordId);
  const isApproved = landlord?.isApprovedLandlord ?? false;

  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    title: body.title,
    description: body.description || '',
    monthlyRent: Number(body.monthlyRent),
    currency: body.currency || 'TZS',
    location: body.location,
    neighborhood: body.neighborhood || body.location,
    distanceFromUniversity: body.distanceFromUniversity || `${body.distanceKm || 0.5} km from St John's`,
    distanceKm: Number(body.distanceKm) || 0.5,
    propertyType: body.propertyType || 'Single Room',
    images: Array.isArray(body.images) && body.images.length > 0 
      ? body.images 
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80'],
    contactNumber: body.contactNumber || landlord?.phone || '+255 754 000 000',
    whatsAppNumber: body.whatsAppNumber || body.contactNumber || landlord?.phone || '+255754000000',
    mobileMoneyNumber: body.mobileMoneyNumber || landlord?.mobileMoneyNumber || body.contactNumber,
    mobileMoneyProvider: body.mobileMoneyProvider || landlord?.mobileMoneyProvider || 'M-Pesa',
    availabilityStatus: body.availabilityStatus || 'available',
    // If landlord is already verified, listing is auto-approved, else pending
    approvalStatus: isApproved ? 'approved' : 'pending',
    landlordId: body.landlordId,
    landlordName: body.landlordName || landlord?.name || 'Verified Landlord',
    landlordPhone: body.landlordPhone || landlord?.phone || body.contactNumber,
    landlordAvatar: landlord?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    landlordVerified: isApproved,
    amenities: Array.isArray(body.amenities) ? body.amenities : ['Water 24/7', 'Inside Bathroom'],
    waterSupply: body.waterSupply || '24/7 Tap Water',
    electricityType: body.electricityType || 'Individual Sub-meter (Luku)',
    isFeatured: Boolean(body.isFeatured),
    viewCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  properties.unshift(newProperty);
  res.status(201).json(newProperty);
});

app.put('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const index = properties.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Property not found' });
  }

  properties[index] = {
    ...properties[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json(properties[index]);
});

app.delete('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = properties.length;
  properties = properties.filter(p => p.id !== id);
  if (properties.length === initialLength) {
    return res.status(404).json({ error: 'Property not found' });
  }
  // Also clean up favorites
  favorites = favorites.filter(f => f.propertyId !== id);
  res.json({ success: true, message: 'Property removed successfully' });
});

// ------------------------------------------
// FAVORITES ROUTES
// ------------------------------------------
app.get('/api/favorites', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const userFavs = favorites.filter(f => f.userId === userId);
  const favProperties = userFavs
    .map(f => properties.find(p => p.id === f.propertyId))
    .filter(Boolean) as Property[];

  res.json(favProperties);
});

app.post('/api/favorites/toggle', (req, res) => {
  const { userId, propertyId } = req.body;
  if (!userId || !propertyId) {
    return res.status(400).json({ error: 'userId and propertyId are required' });
  }

  const index = favorites.findIndex(f => f.userId === userId && f.propertyId === propertyId);
  if (index > -1) {
    favorites.splice(index, 1);
    res.json({ isFavorite: false, message: 'Removed from favorites' });
  } else {
    favorites.push({
      id: `fav-${Date.now()}`,
      userId,
      propertyId,
      createdAt: new Date().toISOString()
    });
    res.json({ isFavorite: true, message: 'Added to favorites' });
  }
});

// ------------------------------------------
// ADMIN CONSOLE ROUTES
// ------------------------------------------
app.get('/api/admin/stats', (req, res) => {
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.approvalStatus === 'approved').length;
  const pendingProperties = properties.filter(p => p.approvalStatus === 'pending').length;
  const landlords = users.filter(u => u.role === 'landlord');
  const totalLandlords = landlords.length;
  const approvedLandlords = landlords.filter(l => l.isApprovedLandlord).length;
  const totalTenants = users.filter(u => u.role === 'tenant').length;
  const totalFraudReports = reports.filter(r => r.status === 'pending').length;

  // Average broker fee in Dodoma/St John's is 1 month rent or 50,000 - 150,000 TZS per student
  // We compute total direct rentals * average saved fee
  const estimatedBrokerFeesSaved = activeProperties * 120000;

  const stats: PlatformStats = {
    totalProperties,
    activeProperties,
    pendingProperties,
    totalLandlords,
    approvedLandlords,
    totalTenants,
    totalFraudReports,
    estimatedBrokerFeesSaved
  };

  res.json(stats);
});

app.get('/api/admin/pending-listings', (req, res) => {
  const pending = properties.filter(p => p.approvalStatus === 'pending');
  res.json(pending);
});

app.post('/api/admin/approve-listing/:id', (req, res) => {
  const { id } = req.params;
  const prop = properties.find(p => p.id === id);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }

  prop.approvalStatus = 'approved';
  prop.updatedAt = new Date().toISOString();
  res.json({ success: true, property: prop });
});

app.post('/api/admin/reject-listing/:id', (req, res) => {
  const { id } = req.params;
  const prop = properties.find(p => p.id === id);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }

  prop.approvalStatus = 'rejected';
  prop.updatedAt = new Date().toISOString();
  res.json({ success: true, property: prop });
});

app.get('/api/admin/landlords', (req, res) => {
  const landlords = users.filter(u => u.role === 'landlord').map(l => {
    const listingCount = properties.filter(p => p.landlordId === l.id).length;
    return { ...l, listingCount };
  });
  res.json(landlords);
});

app.post('/api/admin/approve-landlord/:id', (req, res) => {
  const { id } = req.params;
  const landlord = users.find(u => u.id === id && u.role === 'landlord');
  if (!landlord) {
    return res.status(404).json({ error: 'Landlord not found' });
  }

  landlord.isApprovedLandlord = true;
  // Also update landlord verification status across their properties
  properties.forEach(p => {
    if (p.landlordId === id) {
      p.landlordVerified = true;
      if (p.approvalStatus === 'pending') {
        p.approvalStatus = 'approved';
      }
    }
  });

  res.json({ success: true, landlord });
});

app.post('/api/admin/toggle-landlord-approval/:id', (req, res) => {
  const { id } = req.params;
  const landlord = users.find(u => u.id === id && u.role === 'landlord');
  if (!landlord) {
    return res.status(404).json({ error: 'Landlord not found' });
  }

  landlord.isApprovedLandlord = !landlord.isApprovedLandlord;
  properties.forEach(p => {
    if (p.landlordId === id) {
      p.landlordVerified = landlord.isApprovedLandlord ?? false;
    }
  });

  res.json({ success: true, landlord });
});

app.get('/api/admin/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/admin/resolve-report/:id', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'dismiss' | 'remove_property'
  const rep = reports.find(r => r.id === id);
  if (!rep) {
    return res.status(404).json({ error: 'Report not found' });
  }

  rep.status = 'resolved';

  if (action === 'remove_property') {
    properties = properties.filter(p => p.id !== rep.propertyId);
  }

  res.json({ success: true, report: rep });
});

// ------------------------------------------
// FRAUD REPORTING & CONTACT ROUTES
// ------------------------------------------
app.post('/api/reports', (req, res) => {
  const { propertyId, reporterName, reporterContact, reason, details } = req.body;
  if (!propertyId || !reason || !details) {
    return res.status(400).json({ error: 'propertyId, reason, and details are required' });
  }

  const prop = properties.find(p => p.id === propertyId);

  const newReport: FraudReport = {
    id: `rep-${Date.now()}`,
    propertyId,
    propertyTitle: prop?.title || 'Unknown Property',
    reporterName: reporterName || 'Anonymous Student',
    reporterContact: reporterContact || 'Not provided',
    reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  reports.unshift(newReport);
  res.status(201).json({ success: true, report: newReport });
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  // Log message received
  console.log(`[Contact Form Received] From: ${name} (${email}) - ${subject}: ${message}`);
  res.json({ success: true, message: 'Thank you! The St John’s Housing Desk team will reach out to you shortly.' });
});

// ------------------------------------------
// REVIEWS & RATINGS ROUTES
// ------------------------------------------
app.get('/api/reviews', (req, res) => {
  const { propertyId, landlordId, tenantId } = req.query;
  let filtered = [...reviews];

  if (propertyId) {
    filtered = filtered.filter(r => r.propertyId === propertyId);
  }
  if (landlordId) {
    filtered = filtered.filter(r => r.landlordId === landlordId);
  }
  if (tenantId) {
    filtered = filtered.filter(r => r.tenantId === tenantId);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filtered);
});

app.post('/api/reviews', (req, res) => {
  const { 
    propertyId, 
    landlordId, 
    tenantId, 
    tenantName, 
    tenantAvatar, 
    tenantCourse,
    rating, 
    comment, 
    categoryRatings, 
    stayPeriod 
  } = req.body;

  if (!propertyId || !rating || !comment || !tenantId) {
    return res.status(400).json({ error: 'propertyId, rating, comment, and tenantId are required' });
  }

  const prop = properties.find(p => p.id === propertyId);
  const landlord = users.find(u => u.id === (landlordId || prop?.landlordId));

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    propertyId,
    propertyTitle: prop?.title || 'Student Accommodation',
    landlordId: landlord?.id || prop?.landlordId || 'unknown-landlord',
    landlordName: landlord?.name || prop?.landlordName || 'Verified Landlord',
    tenantId,
    tenantName: tenantName || 'Verified Tenant',
    tenantAvatar: tenantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tenantCourse: tenantCourse || 'St John\'s University Student',
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment,
    categoryRatings: categoryRatings || {
      cleanliness: Number(rating),
      accuracy: Number(rating),
      waterAndPower: Number(rating),
      landlordResponsiveness: Number(rating)
    },
    stayPeriod: stayPeriod || 'Resident 2025/2026',
    isVerifiedTenant: true,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);

  // Recalculate Property Rating
  if (prop) {
    const propReviews = reviews.filter(r => r.propertyId === prop.id);
    const sum = propReviews.reduce((acc, r) => acc + r.rating, 0);
    prop.averageRating = Number((sum / propReviews.length).toFixed(1));
    prop.reviewsCount = propReviews.length;
  }

  // Recalculate Landlord Rating
  if (landlord) {
    const landlordReviews = reviews.filter(r => r.landlordId === landlord.id);
    const sum = landlordReviews.reduce((acc, r) => acc + r.rating, 0);
    landlord.rating = Number((sum / landlordReviews.length).toFixed(1));
    landlord.reviewsCount = landlordReviews.length;
  }

  // Record tenant interaction
  const tenant = users.find(u => u.id === tenantId);
  if (tenant) {
    if (!tenant.interactedPropertyIds) tenant.interactedPropertyIds = [];
    if (!tenant.interactedPropertyIds.includes(propertyId)) {
      tenant.interactedPropertyIds.push(propertyId);
    }
  }

  res.status(201).json({ success: true, review: newReview, property: prop });
});

app.post('/api/reviews/:id/reply', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const review = reviews.find(r => r.id === id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.landlordReply = {
    comment,
    repliedAt: new Date().toISOString()
  };

  res.json({ success: true, review });
});

// ------------------------------------------
// IN-APP MESSAGING ROUTES
// ------------------------------------------
app.get('/api/messages/threads', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const userThreads = threads.filter(t => t.tenantId === userId || t.landlordId === userId);
  // Sort latest updated first
  userThreads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json(userThreads);
});

app.get('/api/messages/threads/:threadId', (req, res) => {
  const { threadId } = req.params;
  const thread = threads.find(t => t.id === threadId);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  const threadMessages = messages
    .filter(m => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({ thread, messages: threadMessages });
});

app.post('/api/messages/threads', (req, res) => {
  const { propertyId, tenantId, landlordId, initialMessage } = req.body;
  if (!propertyId || !tenantId || !landlordId) {
    return res.status(400).json({ error: 'propertyId, tenantId, and landlordId are required' });
  }

  // Check if thread already exists
  let thread = threads.find(t => t.propertyId === propertyId && t.tenantId === tenantId && t.landlordId === landlordId);

  const prop = properties.find(p => p.id === propertyId);
  const tenant = users.find(u => u.id === tenantId);
  const landlord = users.find(u => u.id === landlordId);

  if (!thread) {
    thread = {
      id: `thread-${Date.now()}`,
      propertyId,
      propertyTitle: prop?.title || 'Student Accommodation',
      propertyImage: prop?.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      propertyPrice: prop?.monthlyRent || 0,
      propertyLocation: prop?.location || 'Dodoma',
      tenantId,
      tenantName: tenant?.name || 'Student Tenant',
      tenantAvatar: tenant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      landlordId,
      landlordName: landlord?.name || prop?.landlordName || 'Verified Landlord',
      landlordAvatar: landlord?.avatar || prop?.landlordAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastMessage: initialMessage || 'Started conversation',
      lastMessageTime: new Date().toISOString(),
      unreadCountTenant: 0,
      unreadCountLandlord: initialMessage ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    threads.unshift(thread);
  }

  // If initial message provided, append message
  let createdMessage: Message | null = null;
  if (initialMessage) {
    createdMessage = {
      id: `msg-${Date.now()}`,
      threadId: thread.id,
      senderId: tenantId,
      senderName: tenant?.name || 'Student Tenant',
      senderRole: 'tenant',
      receiverId: landlordId,
      receiverName: landlord?.name || 'Verified Landlord',
      content: initialMessage,
      read: false,
      createdAt: new Date().toISOString()
    };
    messages.push(createdMessage);
    thread.lastMessage = initialMessage;
    thread.lastMessageTime = createdMessage.createdAt;
    thread.updatedAt = createdMessage.createdAt;
    thread.unreadCountLandlord += 1;
  }

  // Also record that this tenant interacted with this property
  if (tenant) {
    if (!tenant.interactedPropertyIds) tenant.interactedPropertyIds = [];
    if (!tenant.interactedPropertyIds.includes(propertyId)) {
      tenant.interactedPropertyIds.push(propertyId);
    }
  }

  res.status(201).json({ thread, message: createdMessage });
});

app.post('/api/messages', (req, res) => {
  const { threadId, senderId, senderRole, content } = req.body;
  if (!threadId || !senderId || !content) {
    return res.status(400).json({ error: 'threadId, senderId, and content are required' });
  }

  const thread = threads.find(t => t.id === threadId);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  const sender = users.find(u => u.id === senderId);
  const isTenantSender = thread.tenantId === senderId;
  const receiverId = isTenantSender ? thread.landlordId : thread.tenantId;
  const receiverName = isTenantSender ? thread.landlordName : thread.tenantName;

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    threadId,
    senderId,
    senderName: sender?.name || (isTenantSender ? thread.tenantName : thread.landlordName),
    senderRole: (senderRole || (isTenantSender ? 'tenant' : 'landlord')) as 'tenant' | 'landlord',
    receiverId,
    receiverName,
    content,
    read: false,
    createdAt: new Date().toISOString()
  };

  messages.push(newMsg);

  // Update thread summary
  thread.lastMessage = content;
  thread.lastMessageTime = newMsg.createdAt;
  thread.updatedAt = newMsg.createdAt;

  if (isTenantSender) {
    thread.unreadCountLandlord += 1;
  } else {
    thread.unreadCountTenant += 1;
  }

  res.status(201).json({ success: true, message: newMsg, thread });
});

app.put('/api/messages/threads/:threadId/read', (req, res) => {
  const { threadId } = req.params;
  const { userId } = req.body;

  const thread = threads.find(t => t.id === threadId);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  if (userId) {
    if (thread.tenantId === userId) {
      thread.unreadCountTenant = 0;
    } else if (thread.landlordId === userId) {
      thread.unreadCountLandlord = 0;
    }
  }

  // Mark all messages addressed to userId as read
  messages.forEach(m => {
    if (m.threadId === threadId && m.receiverId === userId) {
      m.read = true;
    }
  });

  res.json({ success: true, thread });
});

// ------------------------------------------
// AI HOUSING ASSISTANT (Gemini 3.8 Flash)
// ------------------------------------------
app.post('/api/ai/housing-assistant', async (req, res) => {
  const { prompt, history = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Active verified properties for context
  const activeProps = properties
    .filter(p => p.approvalStatus === 'approved')
    .map(p => ({
      id: p.id,
      title: p.title,
      location: p.location,
      distance: p.distanceFromUniversity,
      distanceKm: p.distanceKm,
      rentTZS: p.monthlyRent,
      type: p.propertyType,
      water: p.waterSupply,
      power: p.electricityType,
      landlord: p.landlordName,
      status: p.availabilityStatus,
      amenities: p.amenities.slice(0, 4).join(', ')
    }));

  const systemInstruction = `You are "Rafiki AI", the official St John's University of Tanzania (SJUT) Student Housing & Rental Assistant on the KaaKaribu platform in Dodoma.
Your design persona is like Claude & Grok: intelligent, concise, warm, highly structured, objective, and deeply helpful.

You specialize in:
1. Matching students with real verified rooms near SJUT campus (Kikuyu, Makulu, Chidachi, Area C).
2. Campus walking distances from SJUT faculty buildings (Faculty of Nursing & Public Health, School of Pharmacy, Faculty of Commerce & Business, St Cyprian Theological College, Library).
3. Dodoma student living budgets: Luku electricity costs (usually 10,000 - 15,000 TZS/month), water tank availability (borehole/DUWASA), bajaji fares (1,000 - 1,500 TZS from Area C to SJUT).
4. Anti-Dalali Fraud Prevention: Alert students NEVER to pay "viewing fees" (hela ya kuona nyumba / 10,000 - 20,000 TZS) or send advance money before seeing the room and meeting the verified landlord.
5. Drafting WhatsApp messages to landlords in polite, respectful Kiswahili or English.

CURRENT VERIFIED LISTINGS IN DATABASE:
${JSON.stringify(activeProps, null, 2)}

FORMATTING GUIDELINES:
- When you recommend or discuss specific rooms from the database above, cite them with the exact tag format: [ROOM:id] (for example: [ROOM:prop-1] or [ROOM:prop-4]). The frontend will render interactive cards for these tags!
- Provide clear bullet points, accurate currency formatted in TZS, and realistic walking times to SJUT main gate.
- You can converse fluently in English, Swahili, or a natural blend of both as commonly spoken by Dodoma university students.`;

  // Try calling Gemini if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const contents: any[] = [];
      // Append past history if provided
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item.role && item.content) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.content) }]
            });
          }
        }
      }
      // Add current prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          temperature: 0.7,
        }
      });

      const replyText = response.text || '';
      return res.json({
        reply: replyText,
        source: 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local heuristic response:', err);
    }
  }

  // Intelligent local fallback responding to common student queries
  const lower = prompt.toLowerCase();
  let fallbackReply = '';

  if (lower.includes('scam') || lower.includes('dalali') || lower.includes('viewing fee') || lower.includes('hela ya kuona') || lower.includes('deposit')) {
    fallbackReply = `### 🛡️ Rafiki AI Fraud & Dalali Shield Check

**Verdict: High Caution Recommended**

In Dodoma around St John's University, demanding an upfront "viewing fee" (*hela ya mguu* au *hela ya kuona nyumba*, typically 10,000 – 20,000 TZS) before even unlocking the gate is the #1 telltale sign of an unregistered broker (dalali) or outright scammer.

**Crucial Rules on KaaKaribu:**
1. **0% Viewing Fee**: Verified landlords on KaaKaribu never charge to inspect an available room.
2. **Never Send Advance M-Pesa/Airtel Money**: Never send rent deposit until you have physically inspected the room, checked the water tap, tested the Luku sub-meter, and verified the landlord's national ID or title deed.
3. **Report Immediately**: If someone contacted you asking for money beforehand, use our "Report Fraud" button to flag their phone number.

All listings on KaaKaribu are registered directly with verified property owners like **Mzee Rashidi Mwambene** [ROOM:prop-1] and **Mama Grace Kilonzo** [ROOM:prop-4].`;
  } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('luku') || lower.includes('water') || lower.includes('ghama') || lower.includes('living')) {
    fallbackReply = `### 📊 Monthly Student Living Budget Estimator (SJUT / Dodoma)

Here is a realistic breakdown for an undergraduate student living off-campus near St John's:

| Category | Average Range (TZS) | Practical Notes |
| :--- | :--- | :--- |
| **Room Rent** | 90,000 - 150,000 | From shared hostels to self-contained single rooms |
| **Luku Electricity** | 10,000 - 15,000 | Sub-meter units; laptop + phone + fan use modest units |
| **DUWASA Water** | 5,000 - 10,000 | Included for free in borehole compounds like [ROOM:prop-1] |
| **Meals / Food** | 150,000 - 220,000 | Campus cafeteria or local mamalishe in Kikuyu (3k - 5k/day) |
| **Campus Bodaboda** | 0 - 30,000 | Kikuyu is 0 TZS (walkable); Area C is ~1,000 TZS/trip |
| **Total Estimated** | **255,000 - 425,000 TZS** | Depending on lifestyle & room sharing |

**Money-Saving Tip:**
Choosing a place with 24/7 borehole water and walking distance in Kikuyu ([ROOM:prop-1] or [ROOM:prop-5]) saves you up to **45,000 TZS each month** on transport and water cans!`;
  } else if (lower.includes('draft') || lower.includes('message') || lower.includes('swahili') || lower.includes('whatsapp') || lower.includes('inquiry')) {
    fallbackReply = `### 💬 Polite WhatsApp Inquiry Template

Here is a formal, polite Swahili message you can copy and send directly to the landlord:

\`\`\`
Habari za mchana {Jina la Mwenye Nyumba},

Mimi naitwa {Jina Lako}, mwanafunzi wa mwaka wa {Mwaka} kitivo cha {Kitivo/Kozi} St John’s University of Tanzania (SJUT).

Nimeona tangazo lako la chumba "{Jina la Chumba}" kupitia mtandao wa wanafunzi wa KaaKaribu. Ningependa kuuliza kama bado chumba hiki kipo wazi kwa ajili ya kupangisha, na kama inawezekana kupanga siku na muda wa kuja kukitazama?

Nashukuru sana kwa muda wako.
Simu yangu: {Namba Yako}
\`\`\`

**English Alternative:**
\`\`\`
Hello {Landlord Name},

My name is {Your Name}, a student at St John’s University (SJUT). I came across your listing for "{Property Title}" on KaaKaribu. Is this room currently available for an in-person viewing this week?

Thank you for your time.
\`\`\`

You can contact **Mzee Mwambene** directly regarding [ROOM:prop-1] or **Mama Grace** regarding [ROOM:prop-4]!`;
  } else {
    fallbackReply = `### 🎓 Rafiki AI Student Housing Recommendations

Based on your interest and current verified listings around **St John's University of Tanzania (SJUT)**, here are the best matches:

1. **Best for Proximity (3-4 mins walk from Main Gate):**
   [ROOM:prop-1]
   - **Rent:** 140,000 TZS / month
   - **Zone:** Kikuyu Shuleni (0.3 km)
   - **Highlights:** Self-contained, private bathroom, 24/7 borehole reserve tank, sub-meter Luku. Perfect for students with early classes in Pharmacy or Nursing.

2. **Best for Value & Shared Community:**
   [ROOM:prop-4]
   - **Rent:** 90,000 TZS / month
   - **Zone:** Chidachi Road (0.5 km)
   - **Highlights:** Dedicated study desks, daily cleaned washrooms, solar backup lighting, free filtered drinking water.

3. **Best for Quiet & Space (Area C):**
   [ROOM:prop-2]
   - **Rent:** 190,000 TZS / month
   - **Zone:** Area C Corner (1.2 km, ~12 min walk or 4 min bajaji)
   - **Highlights:** Executive bedsitter with kitchenette, paved compound, and security guard.

*Would you like me to calculate your total monthly budget, draft a WhatsApp inquiry, or check distance from a specific faculty building?*`;
  }

  return res.json({
    reply: fallbackReply,
    source: 'local-knowledge-base',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// VITE & STATIC FILE SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KaaKaribu] Server running on http://localhost:${PORT}`);
  });
}

startServer();
