import { Board } from "./Board";
import "./style.css";
import { CellStatus, CellType, GameState, Difficulty } from "./types";
import { DIFFICULTY_CONFIGS } from "./constants";

const uiBoard = document.getElementById("board")!;
const instructions = document.getElementById("instructions")!;
const minesDisplay = document.getElementById("mines-display")!;
const timerDisplay = document.getElementById("timer-display")!;
const difficultySelect = document.getElementById(
  "difficulty-select",
) as HTMLSelectElement;

let currentBoard: Board;
let currentDifficulty: Difficulty = Difficulty.BEGINNER;
let gameTimer: number | null = null;
let gameStartTime: number = 0;
let moveCount: number = 0;

function updateMinesDisplay(count: number) {
  const digits = Math.abs(count).toString().padStart(3, "0");
  const display = minesDisplay.querySelector(".led-digits")! as HTMLElement;
  display.textContent = digits;

  // Show negative count with different styling if needed
  if (count < 0) {
    display.style.color = "#ffA500";
    display.style.textShadow = "0 0 5px #ffA500";
  } else {
    display.style.color = "#ff0000";
    display.style.textShadow = "0 0 5px #ff0000";
  }
}

function updateTimerDisplay(seconds: number) {
  const digits = Math.min(999, seconds).toString().padStart(3, "0");
  timerDisplay.querySelector(".led-digits")!.textContent = digits;
}

function startTimer() {
  gameStartTime = Date.now();
  gameTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    updateTimerDisplay(elapsed);
  }, 1000);
}

function stopTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function createNewGame() {
  stopTimer();
  moveCount = 0;

  const config = DIFFICULTY_CONFIGS[currentDifficulty];
  currentBoard = new Board(config.size, config.mines);

  updateMinesDisplay(config.mines);
  updateTimerDisplay(0);

  initBoardUI(currentBoard);
  renderBoard(currentBoard);
}

function initBoardUI(board: Board) {
  // Clear existing board
  uiBoard.innerHTML = "";

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

  uiBoard.style.gridTemplateColumns = `repeat(${size.x}, var(--cell-size))`;

  // Add event listeners for the new board
  addCellEventListeners();
}

function addCellEventListeners() {
  const size = currentBoard.size;
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      const cell = document.getElementById(`${x}-${y}`)!;

      // Remove existing listeners by cloning the element
      const newCell = cell.cloneNode(true) as HTMLElement;
      cell.parentNode!.replaceChild(newCell, cell);

      newCell.addEventListener("click", () => handleCellClick(x, y));
      newCell.addEventListener("contextmenu", (e) =>
        handleCellRightClick(e, x, y),
      );
    }
  }
}

function renderBoard(board: Board) {
  updateMinesDisplay(board.minesRemaining);

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

function handleCellClick(x: number, y: number) {
  if (currentBoard.gameState === GameState.NOT_STARTED) {
    instructions.innerText = "";
    startTimer();
  }

  if (
    currentBoard.gameState === GameState.LOSE ||
    currentBoard.gameState === GameState.WIN
  )
    return;

  currentBoard.revealCell({ x, y });
  moveCount++;
  renderBoard(currentBoard);
  checkGameState(currentBoard);
}

function handleCellRightClick(e: MouseEvent, x: number, y: number) {
  e.preventDefault();

  if (
    currentBoard.gameState === GameState.LOSE ||
    currentBoard.gameState === GameState.WIN
  )
    return;

  currentBoard.toggleFlag({ x, y });
  renderBoard(currentBoard);
  checkGameState(currentBoard);
}
function checkGameState(b: Board) {
  if (b.gameState === GameState.LOSE) {
    instructions.innerText = "You lost!\nSelect a difficulty to play again.";
    stopTimer();
  } else if (b.gameState === GameState.WIN) {
    instructions.innerText = "You Won!\nSelect a difficulty to play again.";
    stopTimer();
  }
}

function resetAndSetCellClassName(cell: HTMLElement, className: string) {
  cell.className = `cell ${className}`;
}

async function main() {
  // Set initial difficulty
  difficultySelect.value = currentDifficulty;

  // Add difficulty change listener
  difficultySelect.addEventListener("change", (e) => {
    const select = e.target as HTMLSelectElement;
    currentDifficulty = select.value as Difficulty;
    createNewGame();
    instructions.innerText = "Click to play.\nRight click to place flags.";
  });

  // Create initial game
  createNewGame();
  instructions.innerText = "Click to play.\nRight click to place flags.";
}

main();
