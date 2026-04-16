"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { MatchScene } from "@/game/MatchScene";
import { EventBus } from "@/game/EventBus";

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Ensure we only initialize once
    if (!gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: "phaser-container",
        width: 800,
        height: 400,
        backgroundColor: "#0a0f18",
        scene: [MatchScene],
        physics: {
          default: "arcade",
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 800,
          height: 400,
        },
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      // Clean up game instance when unmounting
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        EventBus.removeAllListeners();
      }
    };
  }, []);

  return <div id="phaser-container" className="w-full h-full rounded-xl overflow-hidden" />;
}
