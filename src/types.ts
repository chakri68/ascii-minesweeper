export type Vector2D = { x: number; y: number };

export enum CellStatus {
  REVEALED = "REVEALED",
  HIDDEN = "HIDDEN",
  FLAGGED = "FLAGGED",
}

export enum CellType {
  EMPTY = "EMPTY",
  NUMBER = "NUMBER",
  MINE = "MINE",
}

export type CellState = {
  status: CellStatus;
  type: CellType;
  val: number | null;
};

export enum GameState {
  NOT_STARTED = "NOT_STARTED",
  STARTED = "STARTED",
  WIN = "WIN",
  LOSE = "LOSE",
}
