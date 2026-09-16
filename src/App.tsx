import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { AddPropertyModal } from './components/AddPropertyModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseDocsModal } from './components/SupabaseDocsModal';
import { ReportFraudModal } from './components/ReportFraudModal';
import { LandlordProfileModal } from './components/LandlordProfileModal';
import { TenantProfileModal } from './components/TenantProfileModal';
import { AddReviewModal } from './components/AddReviewModal';
import { MessagesModal } from './components/MessagesModal';
import { GoogleCampusMap } from './components/GoogleCampusMap';
import { HousingAIAssistant } from './components/HousingAIAssistant';
import { Sparkles, MapPin, X } from 'lucide-react';

import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { TenantDashboardView } from './views/TenantDashboardView';
import { LandlordDashboardView } from './views/LandlordDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { ContactView } from './views/ContactView';

import { Property, User, UserRole, FilterState, AvailabilityStatus, FraudReport } from './types';
import { SEED_PROPERTIES, SEED_USERS, SEED_REPORTS } from './data/seedData';

export default function App() {
  // Navigation & User State
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(SEED_USERS[0]); // Default to Amani Mushi (Student Tenant)
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [properties, setProperties] = useState<Property[]>(SEED_PROPERTIES);
  const [reports, setReports] = useState<FraudReport[]>(SEED_REPORTS);
  const [favorites, setFavorites] = useState<string[]>(['prop-1', 'prop-3']);
  const [searchFilters, setSearchFilters] = useState<Partial<FilterState>>({});

  // Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Base Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRoleTarget, setAuthRoleTarget] = useState<UserRole>('tenant');
  const [isSupabaseDocsOpen, setIsSupabaseDocsOpen] = useState(false);
  const [reportingProperty, setReportingProperty] = useState<Property | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Profile, Review & Messaging Modals
  const [viewingLandlordId, setViewingLandlordId] = useState<string | null>(null);
  const [viewingTenantId, setViewingTenantId] = useState<string | null>(null);
  const [reviewingProperty, setReviewingProperty] = useState<Property | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeMessageRecipient, setActiveMessageRecipient] = useState<{
    id: string;
    name: string;
    avatar: string;
    role: string;
  } | null>(null);
  const [activeMessageProperty, setActiveMessageProperty] = useState<Property | null>(null);
  const [isFloatingAIOpen, setIsFloatingAIOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch initial data from server if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, meRes, reportsRes, usersRes] = await Promise.all([
          fetch('/api/properties').catch(() => null),
          fetch('/api/auth/me').catch(() => null),
          fetch('/api/reports').catch(() => null),
          fetch('/api/users').catch(() => null)
        ]);

        if (propsRes && propsRes.ok) {
          const propsData = await propsRes.json();
          if (Array.isArray(propsData) && propsData.length > 0) {
            setProperties(propsData);
          }
        }

        if (meRes && meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setCurrentUser(meData.user);
          }
        }

        if (reportsRes && reportsRes.ok) {
          const repData = await reportsRes.json();
          if (Array.isArray(repData) && repData.length > 0) {
            setReports(repData);
          }
        }

        if (usersRes && usersRes.ok) {
          const uData = await usersRes.json();
          if (Array.isArray(uData) && uData.length > 0) {
            setUsers(uData);
          }
        }
      } catch (err) {
        console.warn('Using seeded state fallback:', err);
      }
    };

    fetchData();
  }, []);

  // Quick switch persona for evaluation
  const handleSwitchDemoUser = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast(`Switched persona to ${role.toUpperCase()}: ${found.name}`);
      if (role === 'tenant' && currentView === 'landlord-dashboard') {
        setCurrentView('tenant-dashboard');
      } else if (role === 'landlord' && currentView === 'tenant-dashboard') {
        setCurrentView('landlord-dashboard');
      } else if (role === 'admin') {
        setCurrentView('admin-dashboard');
      }
    }
  };

  // Favorites Toggle
  const handleToggleFavorite = async (propertyId: string) => {
    const isFav = favorites.includes(propertyId);
    const newFavorites = isFav 
      ? favorites.filter(id => id !== propertyId) 
      : [...favorites, propertyId];
    
    setFavorites(newFavorites);
    showToast(isFav ? 'Removed from favorites' : 'Saved to your favorites ❤️');

    // Notify backend
    try {
      await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'demo-student-1',
          propertyId
        })
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Open property detail modal & increment view count
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    // Optimistically bump view count
    setProperties(prev => prev.map(p => p.id === property.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p));
    fetch(`/api/properties/${property.id}`).catch(() => {});
  };

  // Navigate to Search with filters
  const handleNavigateSearch = (filters?: Partial<FilterState>) => {
    if (filters) {
      setSearchFilters(filters);
    }
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Add/Edit Property
  const handleOpenAddProperty = (propertyToEditParam?: Property) => {
    if (!currentUser || currentUser.role !== 'landlord') {
      showToast('Please sign in or switch to Landlord account to list rooms');
      setAuthRoleTarget('landlord');
      setIsAuthOpen(true);
      return;
    }
    setPropertyToEdit(propertyToEditParam);
    setIsAddPropertyOpen(true);
  };

  // Save new or edited property
  const handleSaveProperty = async (propertyData: Partial<Property>) => {
    if (propertyToEdit) {
      // Edit
      const updated: Property = {
        ...propertyToEdit,
        ...propertyData,
        id: propertyToEdit.id
      } as Property;

      setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('Property updated successfully!');

      try {
        await fetch(`/api/properties/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propertyData)
        });
      } catch (e) {}

    } else {
      // Create new
      const newProp: Property = {
        ...propertyData,
        id: `prop-${Date.now()}`,
        landlordId: currentUser?.id || 'landlord-1',
        landlordName: currentUser?.name || 'Verified Landlord',
        contactNumber: propertyData.contactNumber || currentUser?.phone || '+255 754 000 000',
        whatsappNumber: propertyData.whatsappNumber || currentUser?.phone || '+255 754 000 000',
        mobileMoneyNumber: propertyData.mobileMoneyNumber || currentUser?.mobileMoneyNumber || '0754000000',
        mobileMoneyProvider: propertyData.mobileMoneyProvider || currentUser?.mobileMoneyProvider || 'M-Pesa',
        approvalStatus: 'pending', // Awaits admin approval
        availabilityStatus: propertyData.availabilityStatus || 'available',
        viewCount: 0,
        createdAt: new Date().toISOString()
      } as Property;

      setProperties(prev => [newProp, ...prev]);
      showToast('Property submitted for admin review!');

      try {
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProp)
        });
      } catch (e) {}
    }

    setIsAddPropertyOpen(false);
    setPropertyToEdit(undefined);
  };

  // Quick Change Status (Available / Reserved / Occupied)
  const handleQuickChangeStatus = async (propertyId: string, status: AvailabilityStatus) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, availabilityStatus: status } : p));
    showToast(`Listing status marked as ${status.toUpperCase()}`);

    try {
      await fetch(`/api/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {}
  };

  // Delete Property
  const handleDeleteProperty = async (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }
    showToast('Listing removed successfully');

    try {
      await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  };

  // Admin Approve Listing
  const handleApproveListing = async (propertyId: string) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, approvalStatus: 'approved' } : p));
    showToast('Listing approved and published to students!');

    try {
      await fetch(`/api/admin/approve-listing/${propertyId}`, { method: 'PUT' });
    } catch (e) {}
  };

  // Admin Reject Listing
  const handleRejectListing = async (propertyId: string) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, approvalStatus: 'rejected' } : p));
    showToast('Listing rejected');
  };

  // Admin Approve Landlord
  const handleApproveLandlord = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApprovedLandlord: true } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, isApprovedLandlord: true } : null);
    }
    showToast('Landlord verified successfully!');

    try {
      await fetch(`/api/admin/approve-landlord/${userId}`, { method: 'PUT' });
    } catch (e) {}
  };

  // Fraud Report submission
  const handleSubmitFraudReport = async (reportData: any) => {
    const foundProp = properties.find(p => p.id === reportData.propertyId);
    const newReport: FraudReport = {
      id: `report-${Date.now()}`,
      propertyId: reportData.propertyId,
      propertyTitle: foundProp?.title || 'Reported Property Listing',
      reporterName: reportData.reporterName,
      reporterContact: reportData.reporterContact,
      reason: reportData.reason,
      details: reportData.details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);
    showToast('Broker/Fraud report filed for admin review');

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
    } catch (e) {}
  };

  // Admin resolve report
  const handleResolveReport = (reportId: string, action: 'dismissed' | 'listing_removed') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'dismissed' ? 'dismissed' : 'investigated' } : r));
    showToast(action === 'dismissed' ? 'Report marked as dismissed' : 'Listing taken down and reported resolved');
  };

  // Generic update user profile (works for Tenant and Landlord)
  const handleUpdateUserProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    showToast('Profile updated successfully');

    try {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...updatedData })
      });
    } catch (e) {
      console.error('Failed to sync profile', e);
    }
  };

  // Landlord profile view trigger
  const handleOpenLandlordProfile = (landlordId: string) => {
    setViewingLandlordId(landlordId);
  };

  // Tenant profile view trigger
  const handleOpenTenantProfile = (tenantId: string) => {
    setViewingTenantId(tenantId);
  };

  // In-app messaging trigger from property or landlord
  const handleStartInAppMessage = (property: Property) => {
    if (!currentUser) {
      showToast('Please sign in to message landlords directly');
      setAuthRoleTarget('tenant');
      setIsAuthOpen(true);
      return;
    }
    setActiveMessageRecipient({
      id: property.landlordId,
      name: property.landlordName,
      avatar: property.landlordAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'landlord'
    });
    setActiveMessageProperty(property);
    setIsMessagesOpen(true);
  };

  // Add review modal trigger
  const handleOpenAddReview = (property: Property) => {
    if (!currentUser) {
      showToast('Please sign in as a student to write a verified review');
      setAuthRoleTarget('tenant');
      setIsAuthOpen(true);
      return;
    }
    setReviewingProperty(property);
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    showToast('Signed out of account');
  };

  // Pending counts for admin badge
  const pendingCount = (properties || []).filter(p => p.approvalStatus === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="app-toast-message"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAuth={(role) => {
          setAuthRoleTarget(role || 'tenant');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAddProperty={() => handleOpenAddProperty()}
        onOpenSupabaseDocs={() => setIsSupabaseDocsOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favoritesCount={favorites.length}
        onSwitchDemoUser={handleSwitchDemoUser}
        pendingCount={pendingCount}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomeView
            properties={properties}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={handleSelectProperty}
            onNavigateSearch={handleNavigateSearch}
            onOpenAddProperty={() => handleOpenAddProperty()}
            onOpenReportFraud={(p) => setReportingProperty(p || properties[0])}
            onQuickChangeStatus={handleQuickChangeStatus}
            onOpenLandlordProfile={handleOpenLandlordProfile}
            onStartInAppMessage={handleStartInAppMessage}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            properties={properties}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={handleSelectProperty}
            onOpenReportFraud={(p) => setReportingProperty(p)}
            initialFilters={searchFilters}
            onQuickChangeStatus={handleQuickChangeStatus}
            onOpenLandlordProfile={handleOpenLandlordProfile}
            onStartInAppMessage={handleStartInAppMessage}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === 'tenant-dashboard' && (
          <TenantDashboardView
            currentUser={currentUser}
            favoriteProperties={properties.filter(p => favorites.includes(p.id))}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={handleSelectProperty}
            onNavigateSearch={() => setCurrentView('search')}
            onOpenReportFraud={(p) => setReportingProperty(p)}
            onQuickChangeStatus={handleQuickChangeStatus}
            onUpdateProfile={handleUpdateUserProfile}
            onOpenMessages={() => setIsMessagesOpen(true)}
            onOpenLandlordProfile={handleOpenLandlordProfile}
          />
        )}

        {currentView === 'landlord-dashboard' && (
          <LandlordDashboardView
            currentUser={currentUser}
            myProperties={properties.filter(p => p.landlordId === currentUser?.id || currentUser?.role === 'landlord')}
            onOpenAddProperty={handleOpenAddProperty}
            onDeleteProperty={handleDeleteProperty}
            onSelectProperty={handleSelectProperty}
            onQuickChangeStatus={handleQuickChangeStatus}
            onUpdateProfile={handleUpdateUserProfile}
            onOpenMessages={() => setIsMessagesOpen(true)}
            onOpenPublicProfile={handleOpenLandlordProfile}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardView
            properties={properties}
            users={users}
            reports={reports}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
            onApproveLandlord={handleApproveLandlord}
            onDeleteProperty={handleDeleteProperty}
            onSelectProperty={handleSelectProperty}
            onResolveReport={handleResolveReport}
          />
        )}

        {currentView === 'contact' && (
          <ContactView />
        )}

        {currentView === 'google-map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <GoogleCampusMap
              properties={properties.filter(p => p.approvalStatus === 'approved')}
              onSelectProperty={handleSelectProperty}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />
          </div>
        )}

        {currentView === 'ai-assistant' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <HousingAIAssistant
              properties={properties.filter(p => p.approvalStatus === 'approved')}
              currentUser={currentUser}
              onSelectProperty={handleSelectProperty}
              onNavigateSearch={handleNavigateSearch}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenSupabaseDocs={() => setIsSupabaseDocsOpen(true)}
        onOpenReportFraud={() => setReportingProperty(properties[0])}
        onNavigateSearch={handleNavigateSearch}
        setCurrentView={setCurrentView}
      />

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenReportFraud={(p) => setReportingProperty(p)}
        isLandlordOwner={selectedProperty?.landlordId === currentUser?.id}
        onQuickChangeStatus={handleQuickChangeStatus}
        currentUser={currentUser}
        onOpenLandlordProfile={handleOpenLandlordProfile}
        onOpenAddReview={handleOpenAddReview}
        onStartInAppMessage={handleStartInAppMessage}
      />

      {/* Add / Edit Property Modal */}
      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => {
          setIsAddPropertyOpen(false);
          setPropertyToEdit(undefined);
        }}
        onSave={handleSaveProperty}
        propertyToEdit={propertyToEdit}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
          if (user.role === 'tenant') setCurrentView('tenant-dashboard');
          else if (user.role === 'landlord') setCurrentView('landlord-dashboard');
          else if (user.role === 'admin') setCurrentView('admin-dashboard');
        }}
        initialRole={authRoleTarget}
      />

      {/* Supabase Documentation & Deployment Modal */}
      <SupabaseDocsModal
        isOpen={isSupabaseDocsOpen}
        onClose={() => setIsSupabaseDocsOpen(false)}
      />

      {/* Anti-Fraud / Broker Report Modal */}
      <ReportFraudModal
        property={reportingProperty}
        onClose={() => setReportingProperty(null)}
        onSubmitReport={handleSubmitFraudReport}
      />

      {/* Landlord Public Profile Modal */}
      {viewingLandlordId && (
        <LandlordProfileModal
          landlordId={viewingLandlordId}
          onClose={() => setViewingLandlordId(null)}
          onSelectProperty={(p) => {
            setViewingLandlordId(null);
            handleSelectProperty(p);
          }}
          onContactLandlord={(property) => {
            setViewingLandlordId(null);
            handleStartInAppMessage(property);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Tenant Public Profile Modal */}
      {viewingTenantId && (
        <TenantProfileModal
          tenantId={viewingTenantId}
          onClose={() => setViewingTenantId(null)}
          onContactTenant={(tenant) => {
            setViewingTenantId(null);
            setActiveMessageRecipient({
              id: tenant.id,
              name: tenant.name,
              avatar: tenant.avatar,
              role: 'tenant'
            });
            setIsMessagesOpen(true);
          }}
        />
      )}

      {/* Add Rating & Review Modal */}
      {reviewingProperty && (
        <AddReviewModal
          property={reviewingProperty}
          currentUser={currentUser}
          onClose={() => setReviewingProperty(null)}
          onReviewSubmitted={(newReview) => {
            showToast('Thank you! Your verified student review was published');
            setReviewingProperty(null);
          }}
        />
      )}

      {/* In-App Messaging Modal */}
      {isMessagesOpen && (
        <MessagesModal
          isOpen={isMessagesOpen}
          onClose={() => {
            setIsMessagesOpen(false);
            setActiveMessageRecipient(null);
            setActiveMessageProperty(null);
          }}
          currentUser={currentUser}
          initialRecipient={activeMessageRecipient}
          initialProperty={activeMessageProperty}
          onSelectProperty={(propertyId) => {
            const found = properties.find(p => p.id === propertyId);
            if (found) {
              setIsMessagesOpen(false);
              handleSelectProperty(found);
            }
          }}
          onOpenLandlordProfile={(landlordId) => {
            setIsMessagesOpen(false);
            handleOpenLandlordProfile(landlordId);
          }}
          onOpenTenantProfile={(tenantId) => {
            setIsMessagesOpen(false);
            handleOpenTenantProfile(tenantId);
          }}
        />
      )}

      {/* Floating Rafiki AI Copilot Button (Claude / Grok Styled Pill) */}
      {currentView !== 'ai-assistant' && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsFloatingAIOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-semibold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all border border-stone-700/40 dark:border-stone-300/40 group"
          >
            <div className="w-6 h-6 rounded-full bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center font-serif text-xs font-bold">
              R
            </div>
            <span>Ask Rafiki AI</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 dark:text-amber-700 text-[10px] font-mono">
              3.8 Flash
            </span>
          </button>
        </div>
      )}

      {/* Floating Copilot Modal Drawer */}
      {isFloatingAIOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FAF9F6] dark:bg-[#0C0A09] border border-stone-200 dark:border-stone-800 shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-serif font-bold text-sm">
                  R
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                    Rafiki AI Housing Copilot
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    Direct St John's Student Rental Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsFloatingAIOpen(false);
                    setCurrentView('ai-assistant');
                  }}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline px-2 py-1"
                >
                  Expand Fullscreen
                </button>
                <button
                  onClick={() => setIsFloatingAIOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <HousingAIAssistant
              properties={properties.filter(p => p.approvalStatus === 'approved')}
              currentUser={currentUser}
              onSelectProperty={(prop) => {
                setIsFloatingAIOpen(false);
                handleSelectProperty(prop);
              }}
              onNavigateSearch={(filters) => {
                setIsFloatingAIOpen(false);
                handleNavigateSearch(filters);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
