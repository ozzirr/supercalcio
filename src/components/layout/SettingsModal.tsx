"use client";

import { useGameStore } from "@/lib/store/game-store";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isMuted, setMuted } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div 
        className="card w-full max-w-md p-8 space-y-8 shadow-[0_0_80px_rgba(251,191,36,0.1)] border-accent/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Impostazioni <span className="text-gold">Gioco</span></h2>
          <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-black mt-2">Personalizza la tua esperienza</p>
        </div>

        <div className="space-y-6">
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Audio & Suoni</h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-xl">{isMuted ? "🔇" : "🔊"}</span>
                <div>
                  <div className="text-xs font-black uppercase">Volume Master</div>
                  <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Effetti e Musica</div>
                </div>
              </div>
              <button 
                onClick={() => setMuted(!isMuted)}
                className={`w-12 h-6 rounded-full relative transition-colors ${isMuted ? 'bg-white/10' : 'bg-gold'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isMuted ? 'left-1' : 'left-7'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <span className="text-xl">🎙️</span>
                <div>
                  <div className="text-xs font-black uppercase">Telecronaca ITA</div>
                  <div className="text-[10px] text-muted font-bold uppercase tracking-widest italic">Coming Soon</div>
                </div>
              </div>
              <div className="w-12 h-6 rounded-full bg-white/10 relative">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Graphics Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Grafica</h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-xl">✨</span>
                <div>
                  <div className="text-xs font-black uppercase">Effetti Partita</div>
                  <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Particellari e Glow</div>
                </div>
              </div>
              <div className="text-[10px] font-black text-gold border border-gold/40 px-2 py-1 rounded bg-gold/10">ALTA</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl"
          >
            Chiudi e Salva
          </button>
        </div>
      </div>
    </div>
  );
}
