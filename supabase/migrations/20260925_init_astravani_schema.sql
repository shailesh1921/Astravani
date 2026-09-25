-- ========================================================================
-- AstraVani Tier-1 Production Schema (Supabase / PostgreSQL)
-- Multi-Provider Auth, User Profiles, Saved Family Kundlis,
-- Double-Entry Cloud Wallet, Transactions, and Consultation History
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER MASTER TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_uid UUID UNIQUE, -- Foreign key to auth.users if using Supabase Auth
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')) DEFAULT 'Male',
    dob DATE,
    tob TIME WITHOUT TIME ZONE,
    pob VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    marital_status VARCHAR(50) DEFAULT 'Single',
    occupation VARCHAR(100),
    preferred_language VARCHAR(50) DEFAULT 'Hindi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for blisteringly fast phone and email lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. SAVED KUNDLIS (Multiple Family Members per Account)
CREATE TABLE IF NOT EXISTS public.saved_kundlis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    relation VARCHAR(50) NOT NULL CHECK (relation IN ('Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Friend', 'Other')),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE NOT NULL,
    tob TIME WITHOUT TIME ZONE NOT NULL,
    pob VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_kundlis_user_id ON public.saved_kundlis(user_id);

-- 3. CLOUD WALLET TABLE (One per User)
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    balance_inr NUMERIC(12, 2) NOT NULL DEFAULT 100.00,
    bonus_inr NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
    locked_in_consultation_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. IMMUTABLE TRANSACTION LEDGER
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    bonus_credit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_credited NUMERIC(12, 2) NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('cashfree', 'razorpay', 'upi', 'upi_gpay', 'upi_phonepe', 'upi_paytm', 'card', 'netbanking')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('success', 'failed', 'processing', 'refunded')),
    receipt_id VARCHAR(100) NOT NULL,
    utr_number VARCHAR(100),
    payment_gateway_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_utr ON public.transactions(utr_number);

-- 5. CONSULTATION SESSIONS ARCHIVE
CREATE TABLE IF NOT EXISTS public.consultation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    astrologer_id VARCHAR(100) NOT NULL,
    astrologer_name VARCHAR(150) NOT NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('chat', 'call')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    amount_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL CHECK (status IN ('ongoing', 'completed', 'cancelled')),
    topic VARCHAR(100),
    intake_data JSONB,
    remedies_notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user_id ON public.consultation_sessions(user_id);

-- 6. CHAT TRANSCRIPTS TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.consultation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender VARCHAR(30) NOT NULL CHECK (sender IN ('user', 'astrologer', 'system')),
    text TEXT NOT NULL,
    is_chart_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- ========================================================================
-- AUTOMATIC WALLET PROVISIONING TRIGGER (On New User Signup)
-- ========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance_inr, bonus_inr)
    VALUES (NEW.id, 100.00, 50.00);

    -- Auto-create self Kundli profile if DOB is provided
    IF NEW.dob IS NOT NULL THEN
        INSERT INTO public.saved_kundlis (user_id, name, relation, gender, dob, tob, pob)
        VALUES (NEW.id, NEW.full_name, 'Self', NEW.gender, NEW.dob, COALESCE(NEW.tob, '12:00:00'::TIME), COALESCE(NEW.pob, 'New Delhi, India'));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_kundlis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own records (when connected with Supabase auth)
CREATE POLICY "Users can view and edit own profile" 
    ON public.users FOR ALL 
    USING (auth.uid() = auth_uid);

CREATE POLICY "Users can manage own saved kundlis" 
    ON public.saved_kundlis FOR ALL 
    USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view own wallet" 
    ON public.wallets FOR SELECT 
    USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view own consultation sessions" 
    ON public.consultation_sessions FOR ALL 
    USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view own chat messages" 
    ON public.chat_messages FOR ALL 
    USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()));
