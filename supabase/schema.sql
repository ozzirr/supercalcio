-- Supabase Schema for Supercalcio Multiplayer

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  xp integer DEFAULT 0,
  currency integer DEFAULT 100,
  matches_played_today integer DEFAULT 0,
  last_match_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Squads
CREATE TABLE public.squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  playstyle text NOT NULL DEFAULT 'balanced',
  -- Store lineup as JSON array: [{ playerId: "blaze", position: 0 }, ...]
  lineup jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id) -- One active squad per user for MVP
);

-- 3. Matches
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_user_id uuid REFERENCES public.profiles(id),
  away_user_id uuid REFERENCES public.profiles(id),
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  winner_id uuid REFERENCES public.profiles(id),
  -- Store the Match Engine final timeline/stats
  match_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS (Row Level Security) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for matchmaking logic to find opponents)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public squads are viewable by everyone." ON public.squads FOR SELECT USING (true);

-- Allow users to only update their own data
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own squad." ON public.squads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own squad." ON public.squads FOR UPDATE USING (auth.uid() = user_id);

-- Matches can be read by anyone, but inserted only if you are playing it
CREATE POLICY "Matches are viewable by everyone." ON public.matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert matches." ON public.matches FOR INSERT WITH CHECK (auth.uid() = home_user_id);
