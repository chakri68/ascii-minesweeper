import { Board } from "./Board";
import "./style.css";
import { CellStatus, CellType, GameState, type Vector2D } from "./types";

const uiBoard = document.getElementById("board")!;
const instructions = document.getElementById("instructions")!;
const mineCountEl = document.getElementById("mine-count")!;
const timerEl = document.getElementById("timer-el")!;

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
  uiBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE.x}, var(--cell-size))`;
}

function renderBoard(board: Board) {
  mineCountEl.innerText = `Mines remaining: ${board.minesRemaining}`;

  const size = board.size;
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      const cell = document.getElementById(`${x}-${y}`)!;
      const cellState = board.cells[y][x];
      resetAndSetCellClassName(cell, cellState.status);
      switch (cellState.status) {
        case CellStatus.FLAGGED:
          cell.innerText = "🚩";
          break;
        case CellStatus.HIDDEN:
          cell.innerText = "";
          break;
        case CellStatus.REVEALED: {
          switch (cellState.type) {
            case CellType.EMPTY:
              cell.innerText = "";
              break;
            case CellType.MINE:
              cell.innerText = "💣";
              break;
            case CellType.NUMBER:
              cell.innerText = `${cellState.val}`;
              cell.setAttribute("data-val", `${cellState.val}`);
              break;
          }
        }
      }
    }
  }
}

function resetAndSetCellClassName(cell: HTMLElement, className: string) {
  cell.className = `cell ${className}`;
}

function checkGameState(b: Board) {
  if (b.gameState === GameState.LOSE) {
    instructions.innerText = "You lost!\nReload to restart a new game.";
    stopTimer();
  } else if (b.gameState === GameState.WIN) {
    instructions.innerText = "You Won!\nReload to start a new game.";
    mineCountEl.innerText = "";
    stopTimer();
  }
}

function startTimer() {
  timerEl.setAttribute("time-s", "1");
  timerEl.innerText = `Time elapsed: ${1}s`;

  const hdlr = setInterval(() => {
    const t = parseInt(timerEl.getAttribute("time-s") ?? "0");
    timerEl.setAttribute("time-s", (t + 1).toString());
    timerEl.innerText = `Time elapsed: ${t + 1}s`;
  }, 1000);
  timerEl.setAttribute("timer-hdlr", hdlr.toString());
}

function stopTimer() {
  if (!timerEl.getAttribute("timer-hdlr"))
    throw new Error("Interval ref not found");
  const hdlr = parseInt(timerEl.getAttribute("timer-hdlr")!);
  clearInterval(hdlr);
  timerEl.setAttribute("time-s", "");
  timerEl.innerText = "";
}

async function main() {
  const b = new Board(BOARD_SIZE);
  initBoardUI(b);

  // Add event listeners
  for (let y = 0; y < BOARD_SIZE.y; y++) {
    for (let x = 0; x < BOARD_SIZE.x; x++) {
      document.getElementById(`${x}-${y}`)!.addEventListener("click", () => {
        if (b.gameState === GameState.NOT_STARTED) {
          instructions.innerText = "";
          startTimer();
        }

        if (b.gameState === GameState.LOSE || b.gameState === GameState.WIN)
          return;

        b.revealCell({ x, y });
        renderBoard(b);
        checkGameState(b);
      });

      document
        .getElementById(`${x}-${y}`)!
        .addEventListener("contextmenu", (e) => {
          e.preventDefault();
          if (b.gameState === GameState.LOSE || b.gameState === GameState.WIN)
            return;

          b.toggleFlag({ x, y });
          renderBoard(b);
          checkGameState(b);
        });
    }
  }
}

main();
