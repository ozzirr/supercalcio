"use client";

import { create } from "zustand";
import type { PlayerDefinition } from "@/types/player";
import type { Playstyle, LineupSlot } from "@/types/squad";
import type { MatchRecord, TeamStance, TeamCommand } from "@/types/match";
import { STARTER_PLAYERS } from "@/content/players";
import { supabase } from "@/lib/supabase/client";

type GameState = {
  // Roster & squad
  availablePlayers: PlayerDefinition[];
  lineup: LineupSlot[];
  playstyle: Playstyle;

  // Match
  currentMatch: MatchRecord | null;
  matchInProgress: boolean;
  stance: TeamStance;
  command: TeamCommand;

  // User
  user: any | null;
  xp: number;
  currency: number;
  purchasedItems: string[];
  teamName: string;
  username: string;
  badgeId: string;
  availablePlayers: PlayerDefinition[];
  ownedPlayers: any[]; // User's roster with levels and bonuses
  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  claimStarterPack: () => Promise<any[]>;
  resetRoster: () => Promise<void>;
  buyPack: (packType: "starter" | "premium") => Promise<any[]>;

  // Actions
  setLineup: (lineup: LineupSlot[]) => void;
  addToLineup: (playerId: string, position: number) => void;
  removeFromLineup: (position: number) => void;
  swapLineupSlots: (posA: number, posB: number) => void;
  clearLineup: () => void;
  autoFillLineup: () => void;
  setPlaystyle: (playstyle: Playstyle) => void;
  setStance: (stance: TeamStance) => void;
  setCommand: (command: TeamCommand) => void;
  setMatchResult: (match: MatchRecord) => void;
  clearMatch: () => void;
  setMatchInProgress: (inProgress: boolean) => void;
  addRewards: (xp: number, currency: number) => void;
  buyItem: (itemId: string, cost: number) => boolean;
  buyPlayer: (playerId: string, cost: number) => Promise<boolean>;
  sellPlayer: (playerId: string, refundAmount: number) => Promise<boolean>;
  upgradePlayer: (playerId: string, stat: string, cost: number) => Promise<boolean>;
  updateProfile: (updates: { teamName?: string; badgeId?: string; username?: string }) => Promise<void>;
  initializeUser: () => void;
  logout: () => void;
  saveSquad: () => Promise<void>;
};

export const useGameStore = create<GameState>((set, get) => ({
  availablePlayers: [],
  lineup: [],
  playstyle: "possession_control",

  currentMatch: null,
  matchInProgress: false,
  stance: "balanced",
  command: "none",

  user: null,
  xp: 0,
  currency: 100,
  purchasedItems: [],
  teamName: "SC Squad",
  username: "Manager",
  badgeId: "badge_lightning",
  ownedPlayers: [],
  isProfileModalOpen: false,
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),

  setLineup: (lineup) => set({ lineup }),

  addToLineup: (playerId, position) =>
    set((state) => {
      const filtered = state.lineup.filter((s) => s.position !== position && s.playerId !== playerId);
      return { lineup: [...filtered, { position, playerId }] };
    }),

  removeFromLineup: (position) =>
    set((state) => ({
      lineup: state.lineup.filter((s) => s.position !== position),
    })),

  swapLineupSlots: (posA, posB) =>
    set((state) => {
      const slotA = state.lineup.find((s) => s.position === posA);
      const slotB = state.lineup.find((s) => s.position === posB);
      if (!slotA && !slotB) return state;
      const rest = state.lineup.filter((s) => s.position !== posA && s.position !== posB);
      const swapped: LineupSlot[] = [];
      if (slotA) swapped.push({ position: posB, playerId: slotA.playerId });
      if (slotB) swapped.push({ position: posA, playerId: slotB.playerId });
      return { lineup: [...rest, ...swapped] };
    }),

  clearLineup: () => set({ lineup: [] }),

  autoFillLineup: () =>
    set((state) => {
      const players = state.availablePlayers;
      const gk = players.find((p) => p.roleTags.includes("goalkeeper"));
      const def = players.find((p) => p.roleTags.includes("defender"));
      const mid = players.find((p) => p.roleTags.includes("midfielder"));
      const atks = players.filter((p) => p.roleTags.includes("attacker"));
      const hyb = players.find((p) => p.roleTags.includes("hybrid"));
      const picks = [gk, def, mid, atks[0], atks[1] ?? hyb].filter(Boolean) as PlayerDefinition[];
      return {
        lineup: picks.slice(0, 5).map((p, i) => ({ position: i, playerId: p.id })),
      };
    }),

  setPlaystyle: (playstyle) => set({ playstyle }),
  setStance: (stance) => set({ stance }),
  setCommand: (command) => set({ command }),

  setMatchResult: (match) => set({ currentMatch: match, matchInProgress: false }),
  clearMatch: () => set({ currentMatch: null, stance: "balanced", command: "none" }),
  setMatchInProgress: (inProgress) => set({ matchInProgress: inProgress }),

  addRewards: (xp, currency) =>
    set((state) => {
      const newXp = state.xp + xp;
      const newCurrency = state.currency + currency;
      
      // Attempt to sync to supabase if user exists
      if (state.user && supabase) {
        supabase.from('profiles').update({ xp: newXp, currency: newCurrency }).eq('id', state.user.id).then();
      }

      return { xp: newXp, currency: newCurrency };
    }),

  buyItem: (itemId, cost) => {
    const state = get();
    if (state.currency < cost || state.purchasedItems.includes(itemId)) return false;
    
    const newItems = [...state.purchasedItems, itemId];
    const newCurrency = state.currency - cost;

    set({ currency: newCurrency, purchasedItems: newItems });

    if (state.user && supabase) {
      supabase.from('profiles').update({ 
        currency: newCurrency, 
        purchased_items: newItems 
      }).eq('id', state.user.id).then();
    }
    return true;
  },

  buyPlayer: async (playerId, cost) => {
    const state = get();
    if (state.currency < cost || !state.user) return false;

    const { error } = await supabase.from('user_players').insert({
      user_id: state.user.id,
      player_id: playerId
    });

    if (error) return false;

    const newCurrency = state.currency - cost;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);
    
    // Refresh owned players
    const { data } = await supabase.from('user_players').select('*').eq('user_id', state.user.id);
    if (data) {
      set({ ownedPlayers: data });
      const ownedDefs = STARTER_PLAYERS.filter(p => data.some((up: any) => up.player_id === p.id));
      set({ availablePlayers: ownedDefs });
    }

    return true;
  },

  sellPlayer: async (playerId, refundAmount) => {
    const state = get();
    if (!state.user) return false;

    // Remove from starting lineup if they are in it
    if (state.lineup.some(l => l.playerId === playerId)) {
      set({ lineup: state.lineup.filter(l => l.playerId !== playerId) });
      state.saveSquad();
    }

    const { error } = await supabase.from('user_players').delete().eq('user_id', state.user.id).eq('player_id', playerId);
    
    if (error) return false;

    const newCurrency = state.currency + refundAmount;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);
    
    // Refresh owned players
    const { data } = await supabase.from('user_players').select('*').eq('user_id', state.user.id);
    if (data) {
      set({ ownedPlayers: data });
      const ownedDefs = STARTER_PLAYERS.filter(p => data.some((up: any) => up.player_id === p.id));
      set({ availablePlayers: ownedDefs });
    }

    return true;
  },

  upgradePlayer: async (playerId, stat, cost) => {
    const state = get();
    if (state.currency < cost || !state.user) return false;

    const playerRecord = state.ownedPlayers.find(p => p.player_id === playerId);
    if (!playerRecord) return false;

    const currentBonus = playerRecord.stats_bonus || {};
    const newBonus = { ...currentBonus, [stat]: (currentBonus[stat] || 0) + 1 };

    const { error } = await supabase.from('user_players').update({
      stats_bonus: newBonus
    }).eq('user_id', state.user.id).eq('player_id', playerId);

    if (error) return false;

    const newCurrency = state.currency - cost;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);

    // Refresh owned players
    const { data } = await supabase.from('user_players').select('*').eq('user_id', state.user.id);
    if (data) {
      set({ ownedPlayers: data });
      const ownedDefs = STARTER_PLAYERS.filter(p => data.some((up: any) => up.player_id === p.id));
      set({ availablePlayers: ownedDefs });
    }

    return true;
  },

  updateProfile: async (updates) => {
    const state = get();
    if (!state.user || !supabase) return;

    const dbUpdates: any = {};
    if (updates.teamName) dbUpdates.team_name = updates.teamName;
    if (updates.badgeId) dbUpdates.badge_id = updates.badgeId;
    if (updates.username) dbUpdates.username = updates.username;

    set({ ...updates });
    await supabase.from('profiles').update(dbUpdates).eq('id', state.user.id);
  },

  initializeUser: () => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }: { data: { session: { user: any } | null } }) => {
      if (data.session?.user) {
        set({ user: data.session.user });
        supabase.from('profiles').select('*').eq('id', data.session.user.id).single().then(async ({ data: profile }: { data: any }) => {
          if (profile) {
            set({ 
              xp: profile.xp, 
              currency: profile.currency,
              teamName: profile.team_name || "SC Squad",
              username: profile.username || "Manager",
              badgeId: profile.badge_id || "badge_lightning",
              purchasedItems: profile.purchased_items || []
            });
          } else if (data.session?.user) {
            // Fallback for existing users without a profile
            const { data: newUserProfile } = await supabase.from('profiles').insert({
              id: data.session.user.id,
              username: data.session.user.email?.split('@')[0] || "manager",
              team_name: "Squad " + data.session.user.id.substring(0, 4)
            }).select().single();
            
            if (newUserProfile) {
              set({ 
                teamName: newUserProfile.team_name,
                currency: newUserProfile.currency,
                xp: newUserProfile.xp
              });
            } else {
              console.error("Failed to create profile:", insertError);
            }
          }
        });
        supabase.from('squads').select('*').eq('user_id', data.session.user.id).single().then(({ data: squad }: { data: any }) => {
          if (squad && squad.lineup) set({ lineup: squad.lineup, playstyle: squad.playstyle as Playstyle });
        });
        // 3. User Players (Collectibles)
        supabase.from('user_players').select('*').eq('user_id', data.session.user.id).then(async ({ data: players, error }: { data: any, error: any }) => {
          if (error) {
            console.error("DEBUG: Error fetching players:", JSON.stringify(error, null, 2));
            // If it's a 404 or table missing, we still want to try to allow them to claim
            set({ ownedPlayers: [], availablePlayers: [] });
            return;
          }

          if (players && players.length > 0) {
            set({ ownedPlayers: players });
            const ownedDefs = STARTER_PLAYERS.filter(p => players.some((up: any) => up.player_id === p.id));
            set({ availablePlayers: ownedDefs });
          } else {
            // Roster empty - Let UI handle showing the button
            set({ ownedPlayers: [], availablePlayers: [] });
            console.log("DEBUG: Roster empty. Waiting for user to claim.");
          }
        });
      }
    });

    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      set({ user: session?.user || null });
    });
  },

  claimStarterPack: async () => {
    const state = get();
    // Prevent double claim if roster already has players
    if (state.ownedPlayers.length > 0) {
      console.warn("DEBUG: Starter Pack already claimed.");
      return [];
    }
    
    console.log("DEBUG: Attempting to claim Starter Pack for user:", state.user?.id);
    
    if (!state.user || !supabase) {
      console.warn("DEBUG: Claim aborted. User or Supabase missing.");
      return [];
    }

    try {
      const allGKs = STARTER_PLAYERS.filter(p => p.roleTags.includes('goalkeeper'));
      const others = STARTER_PLAYERS.filter(p => !p.roleTags.includes('goalkeeper'));

      if (allGKs.length === 0 || others.length < 6) {
        throw new Error("Roster data incomplete. Cannot generate pack.");
      }

      // 1 GK + 6 Others = 7 total
      const randomGK = allGKs[Math.floor(Math.random() * allGKs.length)];
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
      const pack = [randomGK, ...shuffledOthers.slice(0, 6)];

      console.log("DEBUG: Generating pack with IDs:", pack.map(p => p.id));

      const inserts = pack.map(p => ({
        user_id: state.user.id,
        player_id: p.id,
        level: 1
      }));

      const { error } = await supabase.from('user_players').upsert(inserts, { onConflict: 'user_id,player_id' });
      
      if (error) {
        console.error("DEBUG: Upsert error:", error);
        throw error;
      }

      console.log("DEBUG: Upsert success. Fetching new roster...");

      const { data: newPlayers, error: fetchError } = await supabase.from('user_players').select('*').eq('user_id', state.user.id);
      
      if (fetchError) throw fetchError;

      if (newPlayers) {
        set({ ownedPlayers: newPlayers });
        const ownedDefs = STARTER_PLAYERS.filter(p => newPlayers.some((up: any) => up.player_id === p.id));
        set({ availablePlayers: ownedDefs });
        console.log("DEBUG: Roster updated successfully. Players owned:", ownedDefs.length);
        return pack;
      }
      return [];
    } catch (err: any) {
      console.error("CRITICAL: Failed to claim starter pack:", err.message);
      alert("Errore nel riscatto: " + (err.message || "Problema di connessione"));
      return [];
    }
  },

  resetRoster: async () => {
    const state = get();
    if (!state.user || !supabase) return;
    
    console.log("DEBUG: Resetting roster for user:", state.user.id);
    
    // Clear DB
    await supabase.from('user_players').delete().eq('user_id', state.user.id);
    await supabase.from('squads').delete().eq('user_id', state.user.id);
    
    // Reset State
    set({ 
      ownedPlayers: [], 
      availablePlayers: [], 
      lineup: [] 
    });
  },

  buyPack: async (packType) => {
    const state = get();
    const cost = packType === 'starter' ? 500 : 1500;
    if (state.currency < cost || !state.user) return [];

    // Filter out players already owned
    const ownedIds = state.ownedPlayers.map(p => p.player_id);
    const pool = STARTER_PLAYERS.filter(p => !ownedIds.includes(p.id));

    if (pool.length === 0) return [];

    // For premium pack, maybe pick higher tier?
    let selectionPool = pool;
    if (packType === 'premium') {
      const elite = pool.filter(p => p.tier === 'gold' || p.tier === 'legendary');
      if (elite.length > 0) selectionPool = elite;
    }

    const picked = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    
    const { error } = await supabase.from('user_players').insert({
      user_id: state.user.id,
      player_id: picked.id
    });

    if (error) return [];

    const newCurrency = state.currency - cost;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);

    // Refresh
    const { data: newPlayers } = await supabase.from('user_players').select('*').eq('user_id', state.user.id);
    if (newPlayers) {
      set({ ownedPlayers: newPlayers });
      const ownedDefs = STARTER_PLAYERS.filter(p => newPlayers.some((up: any) => up.player_id === p.id));
      set({ availablePlayers: ownedDefs });
    }

    return [picked];
  },

  saveSquad: async () => {
    const state = get();
    if (!state.user || state.lineup.length !== 5 || !supabase) return;
    await supabase.from('squads').upsert({
       user_id: state.user.id,
       playstyle: state.playstyle,
       lineup: state.lineup
    }, { onConflict: 'user_id' });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
    window.location.href = "/login";
  }
}));
