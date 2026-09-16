import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Users, 
  Building2, 
  Check, 
  Eye, 
  Phone, 
  MapPin, 
  Mail,
  Search,
  Filter
} from 'lucide-react';
import { Property, User, FraudReport } from '../types';

interface AdminDashboardViewProps {
  properties: Property[];
  users: User[];
  reports: FraudReport[];
  onApproveListing: (propertyId: string) => void;
  onRejectListing: (propertyId: string) => void;
  onApproveLandlord: (userId: string) => void;
  onDeleteProperty: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
  onResolveReport: (reportId: string, action: 'dismissed' | 'listing_removed') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  properties = [],
  users = [],
  reports = [],
  onApproveListing,
  onRejectListing,
  onApproveLandlord,
  onDeleteProperty,
  onSelectProperty,
  onResolveReport
}) => {
  const [activeTab, setActiveTab] = useState<'pending-listings' | 'landlords' | 'fraud-reports' | 'users'>('pending-listings');
  const [searchTerm, setSearchTerm] = useState('');

  const safeProperties = properties || [];
  const safeUsers = users || [];
  const safeReports = reports || [];

  const pendingListings = safeProperties.filter(p => p.approvalStatus === 'pending');
  const pendingLandlords = safeUsers.filter(u => u.role === 'landlord' && !u.isApprovedLandlord);
  const pendingReports = safeReports.filter(r => r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              St John’s University Student Housing Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            Admin Governance & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Verify landlords, audit student room listings, and eliminate broker scams
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Anti-Dalali Watchdog</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('pending-listings')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'pending-listings' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Pending Listings</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pendingListings.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
              Needs review
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-2">
            {pendingListings.length}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('landlords')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'landlords' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Landlord Reviews</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pendingLandlords.length > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>
              IDs to check
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-2">
            {pendingLandlords.length}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('fraud-reports')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'fraud-reports' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-rose-500 uppercase">Broker / Fraud Reports</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pendingReports.length > 0 ? 'bg-rose-100 text-rose-800 animate-bounce' : 'bg-slate-100 text-slate-600'}`}>
              Urgent
            </span>
          </div>
          <p className="text-3xl font-black text-rose-600 font-heading mt-2">
            {pendingReports.length}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('users')}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'users' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              Registered
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-2">
            {users.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending-listings')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'pending-listings'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Room Listings ({pendingListings.length})
        </button>

        <button
          onClick={() => setActiveTab('landlords')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'landlords'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approve Landlords ({pendingLandlords.length})
        </button>

        <button
          onClick={() => setActiveTab('fraud-reports')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'fraud-reports'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fraud & Broker Reports ({pendingReports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage All Users ({users.length})
        </button>
      </div>

      {/* TAB 1: PENDING LISTINGS */}
      {activeTab === 'pending-listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Listings Awaiting Approval
            </h2>
            <span className="text-xs text-slate-500">
              Verify images, price, and location before publishing to students
            </span>
          </div>

          {pendingListings.length > 0 ? (
            <div className="space-y-4">
              {pendingListings.map((property) => (
                <div
                  key={property.id}
                  id={`admin-pending-prop-${property.id}`}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => onSelectProperty(property)}>
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Pending Admin Review
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600">
                        {property.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          TZS {property.monthlyRent.toLocaleString()} /mo
                        </span>
                        <span>•</span>
                        <span>{property.location} ({property.distanceFromUniversity})</span>
                        <span>•</span>
                        <span>Landlord: {property.landlordName} ({property.contactNumber})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => onSelectProperty(property)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Preview
                    </button>
                    <button
                      id={`btn-approve-prop-${property.id}`}
                      onClick={() => onApproveListing(property.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Approve Listing
                    </button>
                    <button
                      id={`btn-reject-prop-${property.id}`}
                      onClick={() => onRejectListing(property.id)}
                      className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white">All Listings Reviewed</h3>
              <p className="text-xs text-slate-500">There are no room listings pending moderation.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LANDLORD VERIFICATIONS */}
      {activeTab === 'landlords' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Landlord Identity Verification
            </h2>
            <span className="text-xs text-slate-500">
              Approve genuine property owners to grant verified badge
            </span>
          </div>

          <div className="space-y-3">
            {users.filter(u => u.role === 'landlord').map((landlord) => (
              <div
                key={landlord.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={landlord.avatar}
                    alt={landlord.name}
                    className="w-12 h-12 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {landlord.name}
                      </h3>
                      {landlord.isApprovedLandlord ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {landlord.businessName || 'Independent Landlord'} • Phone: {landlord.phone} • {landlord.email}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Rent Pay: {landlord.mobileMoneyProvider} ({landlord.mobileMoneyNumber})
                    </p>
                  </div>
                </div>

                {!landlord.isApprovedLandlord && (
                  <button
                    id={`btn-approve-landlord-${landlord.id}`}
                    onClick={() => onApproveLandlord(landlord.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Approve Landlord
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FRAUD & BROKER REPORTS */}
      {activeTab === 'fraud-reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading text-rose-600">
                Fraud & Broker Complaints ({reports.length})
              </h2>
              <p className="text-xs text-slate-500">
                Reports from students about brokers demanding fees or fake listings
              </p>
            </div>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => {
                const reportedProp = properties.find(p => p.id === report.propertyId);

                return (
                  <div
                    key={report.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="uppercase tracking-wider">
                          Reason: {report.reason.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Reported on {new Date(report.createdAt).toLocaleDateString()} by {report.reporterName} ({report.reporterContact})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Reported Listing:</span>
                        <p className="font-bold text-slate-900 dark:text-white">{reportedProp?.title || 'Unknown Property'}</p>
                        <p className="text-slate-500">Landlord: {reportedProp?.landlordName} ({reportedProp?.contactNumber})</p>
                      </div>

                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl space-y-1 text-rose-900 dark:text-rose-200">
                        <span className="text-rose-500 text-[10px] uppercase font-bold">Student Complaint:</span>
                        <p className="font-medium">{report.details}</p>
                      </div>
                    </div>

                    {report.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => onResolveReport(report.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Dismiss (False Alarm)
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Take down this fraudulent listing immediately?')) {
                              onDeleteProperty(report.propertyId);
                              onResolveReport(report.id, 'listing_removed');
                            }
                          }}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Take Down Listing & Ban
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-xs font-bold text-slate-400">
                        Status: Resolved ({report.status})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white">No Open Fraud Reports</h3>
              <p className="text-xs text-slate-500">St John’s student listings are clean and scam-free.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Registered Platform Users ({users.length})
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Verified</th>
                    <th className="py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          u.role === 'landlord' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' :
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">{u.phone || '—'}</td>
                      <td className="py-3 px-4">
                        {u.role === 'landlord' ? (
                          u.isApprovedLandlord ? (
                            <span className="text-emerald-600 font-bold">Yes (Approved)</span>
                          ) : (
                            <span className="text-amber-600 font-bold">Pending</span>
                          )
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
