-- ==============================================================================
-- KaaKaribu - St John's Student Housing Database Schema (Supabase / PostgreSQL)
-- Direct landlord-to-student housing discovery platform without broker fees
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'reserved', 'occupied');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_reason AS ENUM (
  'broker_commission_demanded',
  'fake_photos',
  'wrong_price',
  'already_occupied',
  'other'
);
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
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
  id_number TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
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
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Favorites Table (Tenant Saved Properties)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, property_id)
);

-- 5. Fraud Reports Table (Student Anti-Broker Hotline)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_contact TEXT NOT NULL,
  reason report_reason NOT NULL,
  details TEXT NOT NULL,
  status report_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Indexes for Fast Campus Housing Search
CREATE INDEX IF NOT EXISTS idx_properties_distance ON public.properties(distance_km);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON public.properties(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(availability_status, approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON public.properties(landlord_id);

-- 7. Automated Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Properties Policies
CREATE POLICY "Approved properties are viewable by everyone" 
  ON public.properties FOR SELECT 
  USING (approval_status = 'approved' OR auth.uid() = landlord_id);

CREATE POLICY "Approved Landlords can insert properties" 
  ON public.properties FOR INSERT 
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own properties" 
  ON public.properties FOR UPDATE 
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own properties" 
  ON public.properties FOR DELETE 
  USING (auth.uid() = landlord_id);

-- Favorites Policies
CREATE POLICY "Tenants can view own favorites" 
  ON public.favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Tenants can add favorites" 
  ON public.favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tenants can delete own favorites" 
  ON public.favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Anyone can submit a fraud report" 
  ON public.reports FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Only admins can view reports" 
  ON public.reports FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
