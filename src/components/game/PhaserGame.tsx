"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { MatchScene } from "@/game/MatchScene";
import { EventBus } from "@/game/EventBus";
import { useGameStore } from "@/lib/store/game-store";

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const setEngineReady = useGameStore.getState().setEngineReady;

    const onSceneReady = () => {
      console.log("DEBUG: Phaser Scene Created");
    };

    const onEngineReady = () => {
      console.log("DEBUG: Match Engine Ready with Players");
      setEngineReady(true);
    };

    EventBus.on("current-scene-ready", onSceneReady);
    EventBus.on("engine-ready-with-players", onEngineReady);

    // Ensure we only initialize once
    if (!gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: "phaser-container",
        width: 1000,
        height: 600,
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
          width: 1000,
          height: 600,
        },
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      EventBus.off("current-scene-ready", onSceneReady);
      EventBus.off("engine-ready-with-players", onEngineReady);
      
      // Clean up game instance when unmounting
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" className="w-full h-full overflow-hidden" />;
}
