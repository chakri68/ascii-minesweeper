import { Board } from "./Board";
import "./style.css";
import { CellStatus, CellType, GameState, type Vector2D } from "./types";

const uiBoard = document.getElementById("board")!;

const BOARD_SIZE: Vector2D = {
  x: 10,
  y: 10,
};

function initBoardUI(board: Board) {
  const size = board.size;
  for (let y = 0; y < size.y; y++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let x = 0; x < size.x; x++) {
      const col = document.createElement("div");
      col.classList.add("cell");
      col.id = `${x}-${y}`;
      row.appendChild(col);
    }
    uiBoard.appendChild(row);
  }
}

function renderBoard(board: Board) {
  const size = board.size;
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      const cell = document.getElementById(`${x}-${y}`)!;
      const cellState = board.cells[y][x];
      resetAndSetCellClassName(cell, cellState.status);
      switch (cellState.status) {
        case CellStatus.FLAGGED:
          cell.innerText = "🚩";
          return;
        case CellStatus.HIDDEN:
          cell.innerText = "";
          return;
        case CellStatus.REVEALED: {
          switch (cellState.type) {
            case CellType.EMPTY:
              cell.innerText = "";
              return;
            case CellType.MINE:
              cell.innerText = "💣";
              return;
            case CellType.NUMBER:
              cell.innerText = `${cellState.val}`;
              return;
          }
        }
      }
    }
  }
}

function resetAndSetCellClassName(cell: HTMLElement, className: string) {
  cell.className = `cell ${className}`;
}

async function main() {
  const b = new Board(BOARD_SIZE);
  initBoardUI(b);

  // Add event listeners
  for (let y = 0; y < BOARD_SIZE.y; y++) {
    for (let x = 0; x < BOARD_SIZE.x; x++) {
      document.getElementById(`${x}-${y}`)!.addEventListener("click", () => {
        console.log("CLICK");
        if (b.gameState === GameState.LOSE || b.gameState === GameState.WIN)
          return;
        b.revealCell({ x, y });
        console.log(b);
        renderBoard(b);
      });
    }
  }
}

main();
