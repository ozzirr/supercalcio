"use client";

import { create } from "zustand";
import { SHOP_ITEMS } from "@/content/shop";
import type { PlayerDefinition } from "@/types/player";
import type { Playstyle, LineupSlot } from "@/types/squad";
import type { MatchRecord, TeamStance, TeamCommand, MatchEvent } from "@/types/match";
import { STARTER_PLAYERS } from "@/content/players";
import { supabase } from "@/lib/supabase/client";

type GameState = {
  // Roster & squad
  availablePlayers: PlayerDefinition[];
  lineup: LineupSlot[];
  playstyle: Playstyle;

  // Match
  currentMatch: MatchRecord | null;
  // Match State (Global for PiP)
  matchInProgress: boolean;
  matchFinished: boolean;
  matchTick: number;
  matchScore: { home: number; away: number };
  matchEvents: MatchEvent[];
  matchEngine: any | null;
  matchInterval: NodeJS.Timeout | null;
  opponentInfo: { name: string; badge: string; playstyle: string; roster?: PlayerDefinition[] } | null;
  matchRosters: { home: PlayerDefinition[]; away: PlayerDefinition[] } | null;
  
  // HUD states
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
  equippedStadium: string;
  equippedKit: string;
  ownedPlayers: any[]; // User's roster with levels and bonuses
  energyAmount: number;
  lastEnergyUpdate: string;
  currentStreak: number;
  lastLoginDate: string;
  hasUnclaimedDailyReward: boolean;
  isProfileModalOpen: boolean;
  isMuted: boolean;
  ultimateReady: boolean;
  engineReady: boolean;
  setProfileModalOpen: (open: boolean) => void;
  setMuted: (muted: boolean) => void;
  setUltimateReady: (ready: boolean) => void;
  setEngineReady: (ready: boolean) => void;
  activateUltimate: () => void;
  claimStarterPack: () => Promise<any[]>;
  resetRoster: () => Promise<void>;
  buyPack: (packType: "starter" | "premium") => Promise<any[]>;

  // Global Match Lifecycle
  startGlobalMatch: (engine: any, opponent: { name: string; badge: string; playstyle: string; roster?: PlayerDefinition[] }) => void;
  tickGlobalMatch: () => void;
  stopGlobalMatch: () => void;
  finishMatchAndSave: () => Promise<void>;

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
  clearMatchState: () => void;
  equipItem: (itemId: string) => Promise<void>;
  syncRoster: () => Promise<void>;
  refreshEnergy: () => void;
  consumeEnergy: () => Promise<boolean>;
  checkDailyReward: () => void;
  claimDailyReward: () => Promise<any>;
  substituteInMatch: (oldPlayerId: string, newPlayerId: string) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  availablePlayers: [],
  lineup: [],
  playstyle: "possession_control",

  currentMatch: null,
  matchInProgress: false,
  matchFinished: false,
  matchTick: 0,
  matchScore: { home: 0, away: 0 },
  matchEvents: [],
  matchEngine: null,
  matchInterval: null,
  opponentInfo: null,
  matchRosters: null,
  
  stance: "balanced",
  command: "none",

  user: null,
  xp: 0,
  currency: 100,
  purchasedItems: [],
  teamName: "SC Squad",
  username: "Manager",
  badgeId: "badge_lightning",
  equippedStadium: "stadium_default",
  equippedKit: "kit_default",
  ownedPlayers: [],
  energyAmount: 3,
  lastEnergyUpdate: new Date().toISOString(),
  currentStreak: 1,
  lastLoginDate: new Date().toISOString(),
  hasUnclaimedDailyReward: false,
  isProfileModalOpen: false,
  isMuted: false,
  ultimateReady: false,
  engineReady: false,
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  setMuted: (muted) => set({ isMuted: muted }),
  setUltimateReady: (ready) => set({ ultimateReady: ready }),
  setEngineReady: (ready) => set({ engineReady: ready }),
  activateUltimate: () => {
    const { ultimateReady } = get();
    if (!ultimateReady) return;
    
    // Emit event to Phaser
    import("@/game/EventBus").then(({ EventBus }) => {
      EventBus.emit("activate-ultimate");
    });
    
    set({ ultimateReady: false });
  },

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
    
    const itemData = SHOP_ITEMS.find(i => i.id === itemId);
    const newItems = [...state.purchasedItems, itemId];
    const newCurrency = state.currency - cost;

    const updates: any = { currency: newCurrency, purchasedItems: newItems };
    
    // Auto-equip if stadium, kit, or badge
    if (itemData?.category === "stadium") {
      updates.equippedStadium = itemId;
    } else if (itemData?.category === "kit") {
      updates.equippedKit = itemId;
    } else if (itemData?.category === "badge") {
      updates.badgeId = itemId;
    }

    set(updates);

    if (state.user && supabase) {
      const dbUpdates: any = { 
        currency: newCurrency, 
        purchased_items: newItems 
      };
      if (itemData?.category === "stadium") {
        dbUpdates.equipped_stadium = itemId;
      } else if (itemData?.category === "kit") {
        dbUpdates.equipped_kit = itemId;
      } else if (itemData?.category === "badge") {
        dbUpdates.badge_id = itemId;
      }
      supabase.from('profiles').update(dbUpdates).eq('id', state.user.id).then();
    }
    return true;
  },

  buyPlayer: async (playerId, cost) => {
    const state = get();
    if (state.currency < cost || !state.user) return false;

    const { error } = await supabase.from('user_players').upsert({
      user_id: state.user.id,
      player_id: playerId
    }, { onConflict: 'user_id,player_id' });

    if (error) {
      console.error("DEBUG: buyPlayer upsert error:", error);
      return false;
    }

    const newCurrency = state.currency - cost;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);
    
    await get().syncRoster();
    return true;
  },

  sellPlayer: async (playerId, refundAmount) => {
    const state = get();
    if (!state.user) return false;

    // VALIDATION: Ensure player is still owned locally before proceeding
    if (!state.ownedPlayers.some(p => p.player_id === playerId)) {
      console.warn(`Sell aborted: Player ${playerId} not in roster.`);
      return false;
    }

    // Remove from starting lineup if they are in it
    if (state.lineup.some(l => l.playerId === playerId)) {
      set({ lineup: state.lineup.filter(l => l.playerId !== playerId) });
      state.saveSquad();
    }

    const { data: deleted, error } = await supabase.from('user_players').delete().eq('user_id', state.user.id).eq('player_id', playerId).select();
    
    if (error || !deleted || deleted.length === 0) {
      console.error("Delete failed or no rows matched:", error);
      return false;
    }

    const newCurrency = state.currency + refundAmount;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);
    
    await get().syncRoster();
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

    await get().syncRoster();
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
              equippedStadium: profile.equipped_stadium || "stadium_default",
              equippedKit: profile.equipped_kit || "kit_default",
              purchasedItems: profile.purchased_items || [],
              energyAmount: profile.energy_amount ?? 3,
              lastEnergyUpdate: profile.last_energy_update || new Date().toISOString(),
              currentStreak: profile.current_streak ?? 1,
              lastLoginDate: profile.last_login_date || new Date().toISOString(),
            });
            // Immediately refresh energy logic and check daily login
            get().refreshEnergy();
            get().checkDailyReward();
            // Immediately sync roster after loading profile currency/items
            get().syncRoster();
          } else if (data.session?.user) {
            // Fallback for existing users without a profile
            const { data: newUserProfile, error: insertError } = await supabase.from('profiles').insert({
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
        
        get().syncRoster();
      }
    });

    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const user = session?.user || null;
      set({ user });
      if (user) get().syncRoster();
    });
  },

  syncRoster: async () => {
    const { user } = get();
    if (!user || !supabase) return;

    try {
      const { data: players, error } = await supabase.from('user_players').select('*').eq('user_id', user.id);
      
      if (error) throw error;

      if (players) {
        set({ ownedPlayers: players });
        const ownedDefs = STARTER_PLAYERS.filter(p => players.some((up: any) => up.player_id === p.id));
        set({ availablePlayers: ownedDefs });
        console.log("DEBUG: Roster synced. Total players:", ownedDefs.length);
      }
    } catch (err) {
      console.error("CRITICAL: Roster sync failed:", err);
    }
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
        console.error("DEBUG: Upsert starter pack error:", error);
        throw error;
      }

      await get().syncRoster();
      return pack;
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
    const { data: deletedPlayers } = await supabase.from('user_players').delete().eq('user_id', state.user.id).select();
    await supabase.from('squads').delete().eq('user_id', state.user.id);
    
    if (!deletedPlayers || deletedPlayers.length === 0) {
      console.warn("Reset Roster: No players were deleted (roster might already be empty).");
    }

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
    
    const { error } = await supabase.from('user_players').upsert({
      user_id: state.user.id,
      player_id: picked.id
    }, { onConflict: 'user_id,player_id' });

    if (error) {
       console.error("DEBUG: buyPack upsert error:", error);
       return [];
    }

    const newCurrency = state.currency - cost;
    set({ currency: newCurrency });
    await supabase.from('profiles').update({ currency: newCurrency }).eq('id', state.user.id);

    await get().syncRoster();
    return [picked];
  },

  startGlobalMatch: (engine, opponent) => {
    const { matchInterval } = get();
    if (matchInterval) clearInterval(matchInterval);

    const interval = setInterval(() => {
      get().tickGlobalMatch();
    }, 500);

    set({
      matchEngine: engine,
      matchInterval: interval,
      matchInProgress: true,
      matchFinished: false,
      matchTick: 0,
      matchScore: { home: 0, away: 0 },
      matchEvents: [],
      opponentInfo: opponent,
      matchRosters: null, // Will be set by the page that starts it
      stance: "balanced",
      command: "none"
    });
  },

  tickGlobalMatch: () => {
    const { matchEngine, matchTick, matchEvents } = get();
    if (!matchEngine) return;

    const newEvents = matchEngine.tick();
    const state = matchEngine.getState();

    if (newEvents.length > 0) {
      import("@/game/EventBus").then(({ EventBus }) => {
        newEvents.forEach((e: MatchEvent) => EventBus.emit("match-event", e));
      });
      set({ matchEvents: [...matchEvents, ...newEvents] });
    }

    set({
      matchTick: state.tick,
      matchScore: { home: state.homeScore, away: state.awayScore }
    });

    if (state.phase === "finished") {
      import("@/game/EventBus").then(({ EventBus }) => {
        EventBus.emit("match-finished");
      });
      set({ matchFinished: true });
      get().stopGlobalMatch();
    }
  },

  stopGlobalMatch: () => {
    const { matchInterval } = get();
    if (matchInterval) clearInterval(matchInterval);
    set({ matchInterval: null });
  },

  finishMatchAndSave: async () => {
    const { matchEngine, matchScore, opponentInfo, user, addRewards, stopGlobalMatch } = get();
    if (!matchEngine || !user || !supabase) return;

    stopGlobalMatch();
    const matchOutcome = matchEngine.getResult();

    // Save to DB
    await supabase.from('matches').insert({
      home_user_id: user.id,
      away_user_id: null, // Currently only against bots
      home_score: matchScore.home,
      away_score: matchScore.away,
      winner_id: matchOutcome.result.outcome === "win" ? user.id : null,
      match_data: {
        timeline: matchEngine.getTimeline(),
        playerStats: matchOutcome.playerStats,
        home_name: get().teamName,
        home_badge: get().badgeId,
        away_name: opponentInfo?.name || "AI BOTS",
        away_badge: opponentInfo?.badge || "badge_lightning"
      }
    });

    // Update store with final result record if needed (using existing setMatchResult or similar)
    // But for simplicity, we just trigger rewards and let results page handle the rest
    addRewards(50, 25);
    
    set({ 
       matchInProgress: false,
       matchFinished: true, // Keep it true for results display until cleared
       currentMatch: {
          id: crypto.randomUUID(),
          userId: user.id,
          squadId: "squad_1",
          opponentSeed: 0,
          result: matchOutcome.result,
          playerStats: matchOutcome.playerStats,
          rewards: { xp: 50, currency: 25 },
          timeline: matchEngine.getTimeline(),
          createdAt: new Date().toISOString(),
       }
    });
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
  },
  
  equipItem: async (itemId) => {
    const state = get();
    if (!state.user || !supabase || !state.purchasedItems.includes(itemId)) return;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const updates: any = {};
    const dbUpdates: any = {};

    if (item.category === "stadium") {
      updates.equippedStadium = itemId;
      dbUpdates.equipped_stadium = itemId;
    } else if (item.category === "kit") {
      updates.equippedKit = itemId;
      dbUpdates.equipped_kit = itemId;
    } else if (item.category === "badge") {
      updates.badgeId = itemId;
      dbUpdates.badge_id = itemId;
    } else {
      return; // Upgrades and packs can't be "equipped"
    }

    set(updates);
    await supabase.from('profiles').update(dbUpdates).eq('id', state.user.id);
  },
  
  clearMatchState: () => {
    const { matchInterval } = get();
    if (matchInterval) clearInterval(matchInterval);
    
    set({
      matchInProgress: false,
      matchFinished: false,
      matchTick: 0,
      matchScore: { home: 0, away: 0 },
      matchEvents: [],
      matchEngine: null,
      matchInterval: null,
      opponentInfo: null,
      engineReady: false
    });
  },

  refreshEnergy: () => {
    const state = get();
    if (state.energyAmount >= 3) return;

    const now = new Date().getTime();
    const lastUpdate = new Date(state.lastEnergyUpdate).getTime();
    const SEVEN_HOURS = 7 * 60 * 60 * 1000;
    
    const diff = now - lastUpdate;
    if (diff >= SEVEN_HOURS) {
      const recovered = Math.floor(diff / SEVEN_HOURS);
      const newEnergy = Math.min(3, state.energyAmount + recovered);
      
      let newUpdateTime = state.lastEnergyUpdate;
      if (newEnergy < 3) {
        newUpdateTime = new Date(lastUpdate + recovered * SEVEN_HOURS).toISOString();
      } else {
        newUpdateTime = new Date().toISOString();
      }

      set({ energyAmount: newEnergy, lastEnergyUpdate: newUpdateTime });
      
      if (state.user && supabase) {
        supabase.from('profiles').update({ 
          energy_amount: newEnergy, 
          last_energy_update: newUpdateTime 
        }).eq('id', state.user.id).then();
      }
    }
  },

  consumeEnergy: async () => {
    const state = get();
    get().refreshEnergy(); // Ensure it's up to date
    
    const freshState = get();
    if (freshState.energyAmount <= 0) return false;

    const newEnergy = freshState.energyAmount - 1;
    // If it was full, start the timer from NOW
    const newUpdateTime = freshState.energyAmount === 3 ? new Date().toISOString() : freshState.lastEnergyUpdate;

    set({ energyAmount: newEnergy, lastEnergyUpdate: newUpdateTime });

    if (freshState.user && supabase) {
      await supabase.from('profiles').update({
        energy_amount: newEnergy,
        last_energy_update: newUpdateTime
      }).eq('id', freshState.user.id);
    }
    return true;
  },

  checkDailyReward: () => {
    const state = get();
    // Compare dates (ignore time)
    const lastLogin = new Date(state.lastLoginDate);
    const now = new Date();
    
    // Set time to 00:00:00 to compare strictly by day
    lastLogin.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      // User hasn't claimed today
      let newStreak = state.currentStreak;
      if (diffDays > 1) {
        // Missed a day
        newStreak = 1;
      } else {
        // Next consecutive day
        if (state.currentStreak >= 7) {
          newStreak = 1; // reset after 7 days
        } else {
          newStreak = state.currentStreak + 1;
        }
      }
      set({ hasUnclaimedDailyReward: true, currentStreak: newStreak });
    }
  },

  claimDailyReward: async () => {
    const state = get();
    if (!state.hasUnclaimedDailyReward || !state.user || !supabase) return null;

    let rewardText = "";
    let packReward = null;
    let extraCurrency = 0;

    switch (state.currentStreak) {
      case 1: extraCurrency = 100; rewardText = "100 CR"; break;
      case 2: extraCurrency = 300; rewardText = "300 CR"; break;
      case 3: 
        const starterPacks = await get().buyPack('starter'); 
        packReward = starterPacks[0] || null;
        rewardText = "Pacchetto Giocatore";
        break;
      case 4: extraCurrency = 500; rewardText = "500 CR"; break;
      case 5: extraCurrency = 1000; rewardText = "1.000 CR"; break;
      case 6: extraCurrency = 2000; rewardText = "2.000 CR"; break;
      case 7: 
        const premiumPacks = await get().buyPack('premium');
        packReward = premiumPacks[0] || null;
        rewardText = "Pacchetto Leggendario";
        break;
      default: extraCurrency = 100; rewardText = "100 CR"; break;
    }

    // Wait, buyPack deducts currency! We need to refund it if it was a reward.
    if (state.currentStreak === 3) extraCurrency += 500; // refund starter pack cost
    if (state.currentStreak === 7) extraCurrency += 1500; // refund premium pack cost

    if (extraCurrency > 0) {
      get().addRewards(0, extraCurrency); // addRewards syncs to DB
    }

    const todayStr = new Date().toISOString();
    set({ 
      hasUnclaimedDailyReward: false, 
      lastLoginDate: todayStr
    });

    await supabase.from('profiles').update({
      current_streak: state.currentStreak,
      last_login_date: todayStr
    }).eq('id', state.user.id);

    return { type: packReward ? 'pack' : 'currency', text: rewardText, player: packReward };
  },

  substituteInMatch: (oldPlayerId, newPlayerId) => {
    const { matchEngine, lineup, availablePlayers } = get();
    if (!matchEngine) return;

    const newPlayer = availablePlayers.find(p => p.id === newPlayerId);
    if (!newPlayer) return;

    // 1. Update Match Engine
    matchEngine.substitute("home", oldPlayerId, newPlayer);

    // 2. Update Local Lineup
    const newLineup = lineup.map(slot => 
      slot.playerId === oldPlayerId ? { ...slot, playerId: newPlayerId } : slot
    );
    set({ lineup: newLineup });

    // 3. Emit event for Phaser
    import("@/game/EventBus").then(({ EventBus }) => {
      EventBus.emit("substitution", { oldPlayerId, newPlayerId });
    });
  }
}));
