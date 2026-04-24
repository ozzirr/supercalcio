"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { STARTER_PLAYERS } from "@/content/players";

const REWARDS = [
  { day: 1, type: "currency", amount: 100, icon: "🪙" },
  { day: 2, type: "currency", amount: 300, icon: "🪙" },
  { day: 3, type: "pack", name: "Pacchetto Bronzo", icon: "🎴", special: true },
  { day: 4, type: "currency", amount: 500, icon: "🪙" },
  { day: 5, type: "currency", amount: 1000, icon: "🪙" },
  { day: 6, type: "currency", amount: 2000, icon: "🪙" },
  { day: 7, type: "pack", name: "Pacchetto Leggenda", icon: "🌟", special: true },
];

export function DailyLoginModal() {
  const { hasUnclaimedDailyReward, currentStreak, claimDailyReward } = useGameStore();
  const [isClaiming, setIsClaiming] = useState(false);
  const [rewardResult, setRewardResult] = useState<any>(null);
  
  // If no reward is waiting and we are not showing the result, hide modal
  if (!hasUnclaimedDailyReward && !rewardResult) return null;

  const handleClaim = async () => {
    setIsClaiming(true);
    const result = await claimDailyReward();
    setIsClaiming(false);
    if (result) {
      setRewardResult(result);
    }
  };

  const closeResult = () => setRewardResult(null);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 lg:p-8 bg-black/80 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-black/0 to-black/0 pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          className="relative max-w-4xl w-full bg-[#0a162d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 lg:p-8 text-center border-b border-white/5 bg-white/5">
            <h2 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white">
              Bonus <span className="text-accent">Giornaliero</span>
            </h2>
            <p className="text-sm text-muted mt-2 uppercase tracking-widest font-medium">
              Accedi ogni giorno per premi esclusivi
            </p>
          </div>

          {rewardResult ? (
            // Success State
            <div className="p-8 lg:p-12 text-center space-y-8">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 mx-auto rounded-3xl bg-accent/20 border-2 border-accent flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(251,191,36,0.3)]"
              >
                {rewardResult.type === 'pack' ? (rewardResult.player ? '🎉' : '🎴') : '🪙'}
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase text-white">Premio Riscattato!</h3>
                <p className="text-accent font-bold text-xl">{rewardResult.text}</p>
                {rewardResult.player && (
                  <p className="text-muted text-sm mt-4 border border-white/10 p-4 rounded-xl inline-block bg-white/5">
                    Nuovo Giocatore: <span className="font-black text-white">{rewardResult.player.name}</span>
                  </p>
                )}
              </div>

              <button 
                onClick={closeResult}
                className="btn-primary px-8 py-3 rounded-xl uppercase font-black text-xs tracking-widest"
              >
                Continua
              </button>
            </div>
          ) : (
            // Claim State
            <div className="p-6 lg:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {REWARDS.map((reward, idx) => {
                  const isPast = reward.day < currentStreak;
                  const isCurrent = reward.day === currentStreak;
                  const isFuture = reward.day > currentStreak;

                  return (
                    <motion.div 
                      key={reward.day}
                      whileHover={isCurrent ? { scale: 1.05 } : {}}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                        isCurrent 
                          ? "bg-accent/20 border-accent shadow-[0_0_30px_rgba(251,191,36,0.2)]" 
                          : isPast
                          ? "bg-emerald-500/10 border-emerald-500/30 opacity-60"
                          : reward.special 
                          ? "bg-rose-500/5 border-rose-500/20 opacity-50"
                          : "bg-white/5 border-white/5 opacity-50"
                      }`}
                    >
                      {/* Day Label */}
                      <div className={`text-[10px] uppercase tracking-widest font-black mb-3 ${isCurrent ? 'text-accent' : isPast ? 'text-emerald-500' : 'text-muted'}`}>
                        Giorno {reward.day}
                      </div>

                      {/* Icon */}
                      <div className={`text-4xl mb-3 ${isPast ? 'grayscale' : ''}`}>
                        {reward.icon}
                      </div>

                      {/* Reward Amount/Name */}
                      <div className={`text-xs font-bold text-center ${isCurrent ? 'text-white' : 'text-muted'}`}>
                        {reward.type === 'currency' ? `${reward.amount} CR` : reward.name}
                      </div>

                      {/* Checkmark overlay for past days */}
                      {isPast && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black text-xs font-black shadow-lg">
                          ✓
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-10 flex justify-center">
                <button 
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="btn-primary w-full max-w-md py-4 rounded-2xl flex items-center justify-center gap-3 uppercase font-black tracking-[0.2em] shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:shadow-[0_0_60px_rgba(251,191,36,0.5)] transition-all disabled:opacity-50"
                >
                  {isClaiming ? (
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Riscatta Giorno {currentStreak}</span>
                      <span className="text-xl">🎁</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
