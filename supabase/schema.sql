-- Supabase Schema for Supercalcio Multiplayer

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  team_name text DEFAULT 'SC Squad',
  badge_id text DEFAULT 'badge_lightning',
  xp integer DEFAULT 0,
  currency integer DEFAULT 100,
  purchased_items text[] DEFAULT '{}',
  matches_played_today integer DEFAULT 0,
  last_match_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, team_name)
  VALUES (new.id, new.email, 'Squad ' || substring(new.id::text from 1 for 4));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Squads
CREATE TABLE public.squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  playstyle text NOT NULL DEFAULT 'balanced',
  lineup jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Matches
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_user_id uuid REFERENCES public.profiles(id),
  away_user_id uuid REFERENCES public.profiles(id),
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  winner_id uuid REFERENCES public.profiles(id),
  match_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public squads are viewable by everyone." ON public.squads FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own squad." ON public.squads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own squad." ON public.squads FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Matches are viewable by everyone." ON public.matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert matches." ON public.matches FOR INSERT WITH CHECK (auth.uid() = home_user_id);
