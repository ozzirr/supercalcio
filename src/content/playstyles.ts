import type { PlaystyleDefinition } from "@/types/squad";

export const PLAYSTYLES: PlaystyleDefinition[] = [
  {
    id: "aggressive_press",
    name: "Aggressive Press",
    description:
      "High-energy pressing. Win the ball back fast, attack relentlessly. Leaves gaps at the back.",
    modifiers: {
      possessionBias: -0.1,
      pressIntensity: 0.9,
      counterSpeed: 0.5,
      defenseLine: 0.8,
      passingTempo: 0.7,
    },
  },
  {
    id: "counter_attack",
    name: "Counter Attack",
    description:
      "Sit deep, absorb pressure, then strike with devastating speed on the break.",
    modifiers: {
      possessionBias: -0.3,
      pressIntensity: 0.3,
      counterSpeed: 0.95,
      defenseLine: 0.25,
      passingTempo: 0.9,
    },
  },
  {
    id: "possession_control",
    name: "Possession Control",
    description:
      "Dominate the ball. Patient passing, controlled tempo, break them down methodically.",
    modifiers: {
      possessionBias: 0.4,
      pressIntensity: 0.5,
      counterSpeed: 0.3,
      defenseLine: 0.55,
      passingTempo: 0.3,
    },
  },
];

export function getPlaystyle(id: string): PlaystyleDefinition | undefined {
  return PLAYSTYLES.find((p) => p.id === id);
}
