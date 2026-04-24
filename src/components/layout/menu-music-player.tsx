"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const MENU_TRACKS = [
  {
    title: "GOLAZOO Anthem",
    subtitle: "Official Menu Mix",
    src: "/audio/menu/giool-anthem.mp3",
  },
  {
    title: "GOLAZOO Anthem",
    subtitle: "Night Stadium Mix",
    src: "/audio/menu/giool-anthem-alt.mp3",
  },
] as const;

export function MenuMusicPlayer() {
  const pathname = usePathname();
  const isMuted = useGameStore((state) => state.isMuted);
  const setMuted = useGameStore((state) => state.setMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const currentTrack = MENU_TRACKS[trackIndex];
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const markInteracted = () => setHasInteracted(true);

    window.addEventListener("pointerdown", markInteracted, { once: true });
    window.addEventListener("keydown", markInteracted, { once: true });

    return () => {
      window.removeEventListener("pointerdown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.34;
  }, []);

  const isMatchScreen = pathname === "/match";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.load();

    if (!isPlaying || isMuted || !hasInteracted) {
      audio.pause();
      return;
    }

    void audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [currentTrack.src, hasInteracted, isMuted, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || !isPlaying) {
      audio.pause();
      return;
    }

    if (hasInteracted) {
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [hasInteracted, isMuted, isPlaying]);

  function cycleTrack(direction: 1 | -1) {
    setHasInteracted(true);
    setTrackIndex((current) => (current + direction + MENU_TRACKS.length) % MENU_TRACKS.length);
    setIsPlaying(true);
  }

  function togglePlayback(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setHasInteracted(true);
    setIsPlaying((current) => !current);
  }

  function toggleCollapse(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setIsCollapsed(c => !c);
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" onEnded={() => cycleTrack(1)} />
      {!isMatchScreen && (
        <AnimatePresence mode="wait">
          {isCollapsed ? (
          <motion.div
            key="collapsed"
            drag
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 lg:bottom-8 right-6 z-[90] cursor-grab active:cursor-grabbing"
          >
            <div 
              onClick={toggleCollapse}
              className="relative w-16 h-16 rounded-full bg-[#07111d] border-2 border-accent/40 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center hover:scale-110 transition-transform overflow-hidden"
            >
              <div className={`absolute inset-0 bg-accent/20 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              <span className="text-2xl relative z-10">{isPlaying ? "🎵" : "⏸"}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            drag
            dragMomentum={false}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[90] lg:bottom-10 lg:left-auto lg:right-10 lg:w-[400px] cursor-grab active:cursor-grabbing"
          >
            <div className="overflow-hidden rounded-[32px] border border-gold/30 bg-[#05070a]/90 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(255,193,32,0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(6,182,212,0.1), transparent 40%)",
                }}
              />

              <div className="relative flex items-center gap-4 px-5 py-4 lg:px-6 lg:py-5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); cycleTrack(-1); }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Traccia precedente"
                >
                  <span className="text-xl">⏮</span>
                </button>

                <button
                  type="button"
                  onClick={togglePlayback}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-black shadow-[0_0_30px_rgba(255,193,32,0.4)] transition hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Metti in pausa" : "Riproduci"}
                >
                  <span className="text-xl">{isPlaying ? "⏸" : "▶"}</span>
                </button>

                <div className="min-w-0 flex-1 px-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`inline-flex h-2 w-2 rounded-full bg-gold ${isPlaying ? 'animate-pulse shadow-[0_0_10px_#FFC324]' : 'opacity-40'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                      PLAYLIST GOLAZOO
                    </span>
                  </div>
                  <div className="truncate text-sm font-black uppercase italic tracking-tighter text-white">
                    {currentTrack.title}
                  </div>
                  <div className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-gold/60">
                    {currentTrack.subtitle}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); cycleTrack(1); }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white hidden sm:flex"
                    aria-label="Traccia successiva"
                  >
                    <span className="text-xl">⏭</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/30 transition hover:bg-white/10 hover:text-white"
                    aria-label="Collassa player"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </div>
              
              {/* Waveform Visualization (Fake) */}
              <div className="h-1 w-full bg-white/5 flex items-end px-1 gap-[1px]">
                 {Array.from({ length: 60 }).map((_, i) => (
                   <motion.div 
                     key={i} 
                     className="flex-1 bg-gold/30"
                     animate={{ height: isPlaying ? [2, Math.random() * 8 + 2, 2] : 2 }}
                     transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
                   />
                 ))}
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
