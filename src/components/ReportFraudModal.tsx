import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Property } from '../types';

interface ReportFraudModalProps {
  property: Property | null;
  onClose: () => void;
  onSubmitReport: (data: {
    propertyId: string;
    reporterName: string;
    reporterContact: string;
    reason: 'broker_commission_demanded' | 'fake_photos' | 'wrong_price' | 'already_occupied' | 'other';
    details: string;
  }) => void;
}

export const ReportFraudModal: React.FC<ReportFraudModalProps> = ({
  property,
  onClose,
  onSubmitReport
}) => {
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [reason, setReason] = useState<'broker_commission_demanded' | 'fake_photos' | 'wrong_price' | 'already_occupied' | 'other'>('broker_commission_demanded');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    onSubmitReport({
      propertyId: property.id,
      reporterName: reporterName || 'Anonymous Student',
      reporterContact: reporterContact || 'Not specified',
      reason,
      details
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        id="modal-report-fraud"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white font-heading">
              Report Fraudulent Listing or Broker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Report Submitted</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Thank you for keeping St John's University student housing free of dishonest dalalis. Our admin team will investigate immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400">Reported Listing:</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">{property.title}</p>
              <p className="text-slate-500">Landlord listed: {property.landlordName}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="broker_commission_demanded">Broker (Dalali) demanding viewing or commission fee</option>
                <option value="fake_photos">Fake, misleading or copied photos</option>
                <option value="wrong_price">Price is different/higher when contacted</option>
                <option value="already_occupied">Room is already occupied / taken</option>
                <option value="other">Other suspicious or fraudulent activity</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Specific Details *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened: Did someone call asking for money? What phone number contacted you?"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student John"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="e.g. +255 7..."
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
              >
                Submit Student Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
