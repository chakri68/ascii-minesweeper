import type { Vector2D, DifficultyConfig } from "./types";
import { Difficulty } from "./types";

export const SUR_DIR_VECTORS: Vector2D[] = (() => {
  const res: Vector2D[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x === 0 && y === 0) continue;
      res.push({ x, y });
    }
  }

  return res;
})();

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.BEGINNER]: {
    size: { x: 9, y: 9 },
    mines: 10,
    label: "Beginner",
  },
  [Difficulty.INTERMEDIATE]: {
    size: { x: 16, y: 16 },
    mines: 40,
    label: "Intermediate",
  },
  [Difficulty.EXPERT]: {
    size: { x: 30, y: 16 },
    mines: 99,
    label: "Expert",
  },
};
