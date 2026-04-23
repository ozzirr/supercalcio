"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";

const MENU_TRACKS = [
  {
    title: "GIOOL Anthem",
    subtitle: "Official Menu Mix",
    src: "/audio/menu/giool-anthem.mp3",
  },
  {
    title: "GIOOL Anthem",
    subtitle: "Night Stadium Mix",
    src: "/audio/menu/giool-anthem-alt.mp3",
  },
] as const;

export function MenuMusicPlayer() {
  const isMuted = useGameStore((state) => state.isMuted);
  const setMuted = useGameStore((state) => state.setMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentTrack = MENU_TRACKS[trackIndex];

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

  function togglePlayback() {
    setHasInteracted(true);
    setIsPlaying((current) => !current);
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" onEnded={() => cycleTrack(1)} />

      <div className="fixed bottom-20 left-4 right-4 z-[90] lg:bottom-6 lg:left-auto lg:right-6 lg:w-[380px]">
        <div className="overflow-hidden rounded-[28px] border border-accent/20 bg-[#07111d]/85 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div
            className="absolute inset-0 opacity-70 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(251,191,36,0.2), transparent 45%), radial-gradient(circle at bottom right, rgba(244,63,94,0.18), transparent 40%)",
            }}
          />

          <div className="relative flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4">
            <button
              type="button"
              onClick={() => cycleTrack(-1)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              aria-label="Traccia precedente"
            >
              <span className="text-lg">⏮</span>
            </button>

            <button
              type="button"
              onClick={togglePlayback}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-black shadow-[0_0_24px_rgba(251,191,36,0.32)] transition hover:scale-105 active:scale-95"
              aria-label={isPlaying ? "Metti in pausa" : "Riproduci"}
            >
              <span className="text-lg">{isPlaying ? "⏸" : "▶"}</span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-accent/80">
                  Playlist GIOOL
                </span>
              </div>
              <div className="truncate text-sm font-black uppercase italic tracking-tight text-white">
                {currentTrack.title}
              </div>
              <div className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                {currentTrack.subtitle}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMuted(!isMuted)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label={isMuted ? "Attiva audio" : "Disattiva audio"}
              >
                <span className="text-base">{isMuted ? "🔇" : "🔊"}</span>
              </button>

              <button
                type="button"
                onClick={() => cycleTrack(1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Traccia successiva"
              >
                <span className="text-lg">⏭</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
