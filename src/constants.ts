import type { Vector2D } from "./types";

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
