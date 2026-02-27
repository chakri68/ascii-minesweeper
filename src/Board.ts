import { SUR_DIR_VECTORS } from "./constants";
import {
  CellStatus,
  CellType,
  GameState,
  type CellState,
  type Vector2D,
} from "./types";
import { addVec, weightedRand } from "./utils";

export class Board {
  readonly cells: CellState[][];
  gameState: GameState = GameState.NOT_STARTED;
  minesRemaining: number = 0;

  constructor(readonly size: Vector2D) {
    this.cells = Array.from({ length: size.y }, () =>
      Array.from(
        { length: size.x },
        () =>
          ({
            type: CellType.EMPTY,
            status: CellStatus.HIDDEN,
            val: null,
          }) as CellState,
      ),
    );
  }

  public initBoard(initCoord: Vector2D) {
    // 1. Randomly scatter the mines
    // We skip the initial click coordinate to ensure the first move is never a mine
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (initCoord.x === x && initCoord.y === y) continue;

        if (this.getMineProbability() > 0.5) {
          this.cells[y][x].type = CellType.MINE;
          this.minesRemaining++;
        }
      }
    }

    // 2. Calculate neighbor counts for non-mine cells
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (this.cells[y][x].type === CellType.MINE) continue;

        const surroundingMines = this.getSurroundingMines({ x, y });
        const count = surroundingMines.length;

        if (count > 0) {
          this.cells[y][x].type = CellType.NUMBER;
          this.cells[y][x].val = count;
        } else {
          this.cells[y][x].type = CellType.EMPTY;
        }
      }
    }
  }

  public revealCell(coord: Vector2D) {
    if (!this.isInBounds(coord)) return;

    // Only allow interaction if the game is active or hasn't started
    if (
      this.gameState !== GameState.NOT_STARTED &&
      this.gameState !== GameState.STARTED
    ) {
      return;
    }

    // Initialize board on first click
    if (this.gameState === GameState.NOT_STARTED) {
      this.initBoard(coord);
      this.gameState = GameState.STARTED;
    }

    const cell = this.cells[coord.y][coord.x];

    // Ignore if already revealed or flagged
    if (
      cell.status === CellStatus.FLAGGED ||
      cell.status === CellStatus.REVEALED
    ) {
      // Logic for "Chording" (clicking a revealed number to reveal neighbors)
      if (
        cell.status === CellStatus.REVEALED &&
        cell.type === CellType.NUMBER
      ) {
        this.attemptChord(coord, cell);
      }
      return;
    }

    // Reveal the cell
    cell.status = CellStatus.REVEALED;

    // Handle Game Over
    if (cell.type === CellType.MINE) {
      this.endGame(coord, GameState.LOSE);
      return;
    }

    // --- RECURSION LOGIC (The TODOs) ---
    // If we hit an empty cell, reveal all valid neighbors recursively
    if (cell.type === CellType.EMPTY) {
      for (const dir of SUR_DIR_VECTORS) {
        const neighborCoord = addVec(coord, dir);
        if (this.isInBounds(neighborCoord)) {
          const neighbor = this.cells[neighborCoord.y][neighborCoord.x];
          // Recurse only on hidden, non-flagged cells
          if (neighbor.status === CellStatus.HIDDEN) {
            this.revealCell(neighborCoord);
          }
        }
      }
    }

    // After every reveal, check if the player has won
    this.checkWinCondition();
  }

  public toggleFlag(coord: Vector2D) {
    // 1. Basic bounds and game state checks
    if (!this.isInBounds(coord)) return;
    if (
      this.gameState !== GameState.STARTED &&
      this.gameState !== GameState.NOT_STARTED
    )
      return;

    const cell = this.cells[coord.y][coord.x];

    // 2. You can only flag/unflag hidden cells
    if (cell.status === CellStatus.HIDDEN) {
      cell.status = CellStatus.FLAGGED;
      this.minesRemaining--;
    } else if (cell.status === CellStatus.FLAGGED) {
      cell.status = CellStatus.HIDDEN;
      this.minesRemaining++;
    }
  }

  private attemptChord(coord: Vector2D, cell: CellState) {
    // If the number of flags around this cell matches its value, reveal neighbors
    let flagCount = 0;
    for (const dir of SUR_DIR_VECTORS) {
      const pos = addVec(coord, dir);
      if (
        this.isInBounds(pos) &&
        this.cells[pos.y][pos.x].status === CellStatus.FLAGGED
      ) {
        flagCount++;
      }
    }

    if (flagCount === cell.val) {
      for (const dir of SUR_DIR_VECTORS) {
        const pos = addVec(coord, dir);
        if (
          this.isInBounds(pos) &&
          this.cells[pos.y][pos.x].status === CellStatus.HIDDEN
        ) {
          this.revealCell(pos);
        }
      }
    }
  }

  private checkWinCondition() {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const cell = this.cells[y][x];
        // If there is any non-mine cell still hidden, the game continues
        if (
          cell.type !== CellType.MINE &&
          cell.status !== CellStatus.REVEALED
        ) {
          return;
        }
      }
    }
    // If we get here, all safe cells are revealed
    this.endGame({ x: -1, y: -1 }, GameState.WIN);
  }

  private endGame(coord: Vector2D, state: GameState) {
    this.gameState = state;
    // Reveal all mines on game end (optional UX improvement)
    if (state === GameState.LOSE) {
      this.revealAllMines();
    }
  }

  private revealAllMines() {
    this.cells.forEach((row) =>
      row.forEach((cell) => {
        if (cell.type === CellType.MINE) cell.status = CellStatus.REVEALED;
      }),
    );
  }

  private getSurroundingMines(coords: Vector2D): Vector2D[] {
    const mines: Vector2D[] = [];
    for (const dir of SUR_DIR_VECTORS) {
      const newCoords = addVec(coords, dir);
      if (
        this.isInBounds(newCoords) &&
        this.cells[newCoords.y][newCoords.x].type === CellType.MINE
      ) {
        mines.push(newCoords);
      }
    }
    return mines;
  }

  private isInBounds(coord: Vector2D): boolean {
    return (
      coord.x >= 0 &&
      coord.x < this.size.x &&
      coord.y >= 0 &&
      coord.y < this.size.y
    );
  }

  private getMineProbability() {
    return weightedRand(-20) * (this.size.x * this.size.y);
  }
}
