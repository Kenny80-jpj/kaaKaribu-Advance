import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  Server, 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  Terminal, 
  Rocket, 
  CheckCircle2 
} from 'lucide-react';

interface SupabaseDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDocsModal: React.FC<SupabaseDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'api' | 'setup' | 'deploy'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- ==============================================================================
-- KaaKaribu - St John's Student Housing Database Schema (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'reserved', 'occupied');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'tenant' NOT NULL,
  phone TEXT,
  avatar TEXT,
  is_approved_landlord BOOLEAN DEFAULT FALSE,
  business_name TEXT,
  mobile_money_number TEXT,
  mobile_money_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Properties Table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_rent NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TZS' NOT NULL,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  distance_from_university TEXT NOT NULL,
  distance_km NUMERIC(4, 2) NOT NULL,
  property_type TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  contact_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  mobile_money_number TEXT NOT NULL,
  mobile_money_provider TEXT DEFAULT 'M-Pesa' NOT NULL,
  availability_status availability_status DEFAULT 'available' NOT NULL,
  approval_status approval_status DEFAULT 'pending' NOT NULL,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  water_supply TEXT DEFAULT '24/7 Running Water',
  electricity_type TEXT DEFAULT 'Luku Sub-meter',
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Favorites Table
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, property_id)
);

-- 5. Fraud Reports Table
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_contact TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Approved properties are viewable by everyone" ON public.properties FOR SELECT 
  USING (approval_status = 'approved' OR auth.uid() = landlord_id);
CREATE POLICY "Landlords can insert properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="modal-supabase-docs"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Supabase Integration & Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PostgreSQL schema, REST endpoints & production deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Database Schema (SQL)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'api'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. REST API Routes
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Supabase Setup
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'deploy'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Deployment Instructions
          </button>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-grow font-sans text-sm">
          
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">PostgreSQL & Supabase SQL Schema</h3>
                  <p className="text-xs text-slate-500">Run this script in your Supabase SQL Editor to create tables & RLS policies.</p>
                </div>
                <button
                  onClick={copySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 max-h-96 leading-relaxed">
                {sqlSchemaSnippet}
              </pre>

              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300">
                <strong>Note:</strong> The full version of this schema is also saved in the root file <code>/supabase-schema.sql</code>.
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Backend Express REST API Endpoints</h3>
              <div className="space-y-2 text-xs font-mono">
                
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold mr-2">GET</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/properties</span>
                  </div>
                  <span className="text-slate-500 font-sans">Filter by search, price, distance, type, availability</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold mr-2">GET</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/properties/:id</span>
                  </div>
                  <span className="text-slate-500 font-sans">Fetch property details & increment view count</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 font-bold mr-2">POST</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/properties</span>
                  </div>
                  <span className="text-slate-500 font-sans">Landlord creates listing with multiple photos</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold mr-2">PUT</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/properties/:id</span>
                  </div>
                  <span className="text-slate-500 font-sans">Update details or toggle status (Available/Reserved/Occupied)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 font-bold mr-2">DELETE</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/properties/:id</span>
                  </div>
                  <span className="text-slate-500 font-sans">Delete property or take down fraudulent listing</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 font-bold mr-2">POST</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/favorites/toggle</span>
                  </div>
                  <span className="text-slate-500 font-sans">Save or remove property from tenant favorites</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 font-bold mr-2">ADMIN</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/admin/pending-listings & /approve-listing/:id</span>
                  </div>
                  <span className="text-slate-500 font-sans">Approve newly submitted landlord listings</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 font-bold mr-2">REPORT</span>
                    <span className="text-slate-800 dark:text-slate-200">/api/reports</span>
                  </div>
                  <span className="text-slate-500 font-sans">Students report brokers claiming commission or fake posts</span>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Connecting Your Real Supabase Project</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                KaaKaribu operates with a seamless dual-storage architecture: it works out of the box with the built-in database, and immediately connects to Supabase when you plug in your credentials.
              </p>

              <ol className="list-decimal list-inside space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <strong>Create a Supabase Project:</strong> Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-600 underline">supabase.com</a> and click "New Project". Choose the Frankfurt or closest region.
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <strong>Run Schema in SQL Editor:</strong> Copy the SQL from Tab 1 above and paste it into the <em>SQL Editor</em> tab in your Supabase dashboard. Click "Run".
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <strong>Add Environment Variables:</strong> Set your project keys in your <code>.env</code> file:
                  <pre className="mt-2 p-2 bg-slate-950 text-slate-200 rounded font-mono">
VITE_SUPABASE_URL="https://yourproject.supabase.co"&#10;VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."
                  </pre>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Full-Stack Production Deployment</h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Rocket className="w-4 h-4 text-emerald-500" />
                    <span>Option A: Google Cloud Run / Container</span>
                  </div>
                  <p>The application already has production bundling configured in <code>package.json</code>:</p>
                  <pre className="p-2 bg-slate-950 text-slate-200 rounded font-mono text-[11px]">
npm run build && npm start
                  </pre>
                  <p>Builds the client into <code>dist/</code> and bundles <code>server.ts</code> into <code>dist/server.cjs</code> for fast, zero-dependency Node execution.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Rocket className="w-4 h-4 text-teal-500" />
                    <span>Option B: Vercel or Netlify</span>
                  </div>
                  <p>Deploy the frontend directly to Vercel and connect with Supabase Edge Functions or the Node serverless adapter.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
