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
    // 1. Randomly scatter the mines first
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (initCoord.x === x && initCoord.y === y) continue;

        if (this.getMineProbability() > 0.5) {
          this.cells[y][x].type = CellType.MINE;
        }
      }
    }

    // 2. Calculate the non MINEs numbers and all
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (this.cells[y][x].type === CellType.MINE) continue;

        const c = this.getSurroundingMines({ x, y }).length;
        if (c === 0) {
          this.cells[y][x].type = CellType.EMPTY;
        } else {
          this.cells[y][x].type = CellType.NUMBER;
          this.cells[y][x].val = c;
        }
      }
    }
  }

  public revealCell(coord: Vector2D) {
    // Checks whether to play or no
    if (!this.isInBounds(coord)) throw new Error("Out of bounds!");
    if (
      this.gameState !== GameState.NOT_STARTED &&
      this.gameState !== GameState.STARTED
    )
      return;

    // If the game hasn't started yet, generate the board and start it
    if (this.gameState === GameState.NOT_STARTED) {
      this.initBoard(coord);
      this.gameState = GameState.STARTED;
    }

    const cell = this.cells[coord.y][coord.y];

    // If the cell is flaggd ignore this click
    if (cell.status === CellStatus.FLAGGED) return;

    // The cell is already revealed
    if (cell.status === CellStatus.REVEALED) {
      if (cell.type === CellType.NUMBER) {
        // Reveal all the cells around this cell if the number of revealed mines around this cell is the same number as this cell
        const mines = this.getSurroundingMines(coord);
        let revealedMinesCount = 0;
        for (const mineCoord of mines) {
          if (
            this.cells[mineCoord.y][mineCoord.x].status === CellStatus.REVEALED
          )
            revealedMinesCount++;
        }

        if (revealedMinesCount === cell.val) {
          for (const dir of SUR_DIR_VECTORS) {
            const newCoords = addVec(coord, dir);
            this.revealCell(newCoords);
          }
        }
      }
      return;
    }

    // The cell is hidden, set the status to REVEALED
    cell.status = CellStatus.REVEALED;
    if (cell.type === CellType.MINE) {
      this.endGame(coord, GameState.LOSE);
      return;
    }
    if (cell.type === CellType.EMPTY) {
      // TODO: Recursively reveal the surrounding empty cells too here
    }

    if (cell.type === CellType.NUMBER) {
      // TODO: Recursively reveal the surrounding empty cells too here
    }
  }

  private endGame(coord: Vector2D, state: GameState) {
    this.gameState = state;
  }

  private getSurroundingMines(coords: Vector2D): Vector2D[] {
    const mines: Vector2D[] = [];
    for (const dir of SUR_DIR_VECTORS) {
      const newCoords = addVec(coords, dir);
      if (!this.isInBounds(newCoords)) continue;
      if (this.cells[newCoords.y][newCoords.x].type === CellType.MINE)
        mines.push(newCoords);
    }

    return mines;
  }

  private isInBounds(coord: Vector2D): boolean {
    const { x, y } = coord;
    return x >= 0 && x < this.size.x && y >= 0 && y < this.size.y;
  }

  private getMineProbability() {
    return weightedRand(-8) * (this.size.x * this.size.y);
  }
}
