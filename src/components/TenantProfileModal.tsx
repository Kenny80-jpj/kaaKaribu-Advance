import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  GraduationCap, 
  Phone, 
  MessageSquare, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/seedData';

interface TenantProfileModalProps {
  tenant?: User | null;
  tenantId?: string | null;
  onClose: () => void;
  onStartMessage?: (tenant: User) => void;
  onContactTenant?: (tenant: User) => void;
}

export const TenantProfileModal: React.FC<TenantProfileModalProps> = ({
  tenant: initialTenant,
  tenantId,
  onClose,
  onStartMessage,
  onContactTenant
}) => {
  const [tenant, setTenant] = useState<User | null>(() => {
    if (initialTenant) return initialTenant;
    if (tenantId) {
      return INITIAL_USERS.find(u => u.id === tenantId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialTenant) {
      setTenant(initialTenant);
    } else if (tenantId) {
      const found = INITIAL_USERS.find(u => u.id === tenantId);
      if (found) setTenant(found);

      fetch(`/api/users/${tenantId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) setTenant(data);
        })
        .catch(() => null);
    }
  }, [initialTenant, tenantId]);

  if (!tenant) return null;

  const handleMessage = () => {
    if (onContactTenant) {
      onContactTenant(tenant);
    } else if (onStartMessage) {
      onStartMessage(tenant);
    }
    onClose();
  };

  const contactMethods = tenant.preferredContactMethods || ['whatsapp', 'in_app', 'call'];
  const habits = tenant.lifestyleHabits || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="tenant-profile-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-teal-700 via-emerald-700 to-emerald-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 pt-2">
            <img
              src={tenant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={tenant.name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-heading">
                  {tenant.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  SJUT Student
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{tenant.courseOfStudy || 'Undergraduate Student'} • {tenant.yearOfStudy || 'Year 2'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Bio */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Student Bio & Housing Needs
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
              {tenant.bio || 'St John’s University student searching for direct, peaceful room accommodation near campus.'}
            </div>
          </div>

          {/* Preferred Contact Methods */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Preferred Contact Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {contactMethods.map((method) => {
                let label = 'WhatsApp';
                let icon = <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
                if (method === 'call') {
                  label = 'Direct Phone Call';
                  icon = <Phone className="w-3.5 h-3.5 text-blue-600" />;
                } else if (method === 'sms') {
                  label = 'SMS';
                  icon = <MessageSquare className="w-3.5 h-3.5 text-amber-600" />;
                } else if (method === 'email') {
                  label = 'Email';
                  icon = <Mail className="w-3.5 h-3.5 text-indigo-600" />;
                } else if (method === 'in_app') {
                  label = 'In-App Message';
                  icon = <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
                }

                return (
                  <span
                    key={method}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                  >
                    {icon}
                    <span>{label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Lifestyle / Habits */}
          {habits.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Study Habits & Roommate Lifestyle
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {habits.map((habit, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium text-[11px] border border-emerald-200/50 dark:border-emerald-900/40"
                  >
                    ✓ {habit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{tenant.phone || '+255 754 990 123'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-900 dark:text-white">{tenant.email}</span>
            </div>
            {tenant.emergencyContact && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="text-slate-900 dark:text-white font-medium">{tenant.emergencyContact}</span>
              </div>
            )}
          </div>

          {/* Message action */}
          {(onStartMessage || onContactTenant) && (
            <button
              type="button"
              onClick={handleMessage}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message to {tenant.name}</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
