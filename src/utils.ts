import type { Vector2D } from "./types";

/**
 *
 * @param p Power of the weighting (more negative - prefer below 0.5, more positive - prefer more than 0.5)
 */
export function weightedRand(p: number): number {
  const x = Math.random();
  if (p === 0) return x;
  if (p < 0) return Math.pow(x, -p);
  else return Math.pow(x, 1 / p);
}

export function addVec(vec1: Vector2D, vec2: Vector2D): Vector2D {
  return { x: vec1.x + vec2.x, y: vec1.y + vec2.y };
}
