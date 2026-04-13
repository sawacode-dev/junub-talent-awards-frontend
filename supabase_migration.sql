-- SUPABASE MIGRATION SCRIPT
-- Generated for project: lslgavkqxhivoofrvfxy (Voting system2.0)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES

-- Admin Emails table
CREATE TABLE IF NOT EXISTS public.admin_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    bio TEXT,
    vote_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(category_id, name)
);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_start TIMESTAMP WITH TIME ZONE,
    election_end TIMESTAMP WITH TIME ZONE,
    is_paused BOOLEAN DEFAULT false,
    public_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. FUNCTIONS

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = (SELECT auth.users.email FROM auth.users WHERE auth.users.id = auth.uid())
  );
END;
$function$;

-- Cast vote function (Atomic and Validated)
CREATE OR REPLACE FUNCTION public.cast_vote(p_candidate_id uuid, p_category_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_last_vote TIMESTAMPTZ;
  v_result JSON;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check 24-hour cooldown
  SELECT voted_at INTO v_last_vote
  FROM public.votes
  WHERE user_id = v_user_id AND category_id = p_category_id
  ORDER BY voted_at DESC
  LIMIT 1;

  IF v_last_vote IS NOT NULL AND v_last_vote > now() - INTERVAL '24 hours' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You already voted in this category today',
      'next_vote_at', (v_last_vote + INTERVAL '24 hours')::TEXT
    );
  END IF;

  -- Insert the vote
  INSERT INTO public.votes (user_id, candidate_id, category_id)
  VALUES (v_user_id, p_candidate_id, p_category_id);

  -- Increment candidate vote count
  UPDATE public.candidates
  SET vote_count = vote_count + 1
  WHERE id = p_candidate_id;

  RETURN json_build_object('success', true);
END;
$function$;

-- 4. RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (is_admin());

-- Candidates policies
CREATE POLICY "candidates_select" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admins can insert candidates" ON public.candidates FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update candidates" ON public.candidates FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete candidates" ON public.candidates FOR DELETE USING (is_admin());

-- Votes policies
CREATE POLICY "votes_select" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "votes_insert" ON public.votes FOR INSERT TO authenticated 
WITH CHECK (
    (auth.uid() = user_id) AND 
    (NOT (EXISTS ( 
        SELECT 1 FROM public.votes v 
        WHERE v.user_id = auth.uid() 
        AND v.category_id = votes.category_id 
        AND v.voted_at > (now() - INTERVAL '24 hours')
    )))
);

-- Admin Emails policies
CREATE POLICY "Admins can view admin_emails" ON public.admin_emails FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert admin_emails" ON public.admin_emails FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can delete admin_emails" ON public.admin_emails FOR DELETE USING (is_admin());

-- Settings policies
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING (is_admin());

-- 5. STORAGE BUCKETS

-- Create 'candidates' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidates', 'candidates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'candidates' bucket
CREATE POLICY "Public candidates select" ON storage.objects FOR SELECT 
USING (bucket_id = 'candidates');

CREATE POLICY "Admin candidates insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'candidates' AND is_admin());

CREATE POLICY "Admin candidates update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'candidates' AND is_admin());

CREATE POLICY "Admin candidates delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'candidates' AND is_admin());
