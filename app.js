/* =========================================================
   Four in a Row - Online (Demo)
   Peer-to-peer over WebRTC via PeerJS (no game server of our
   own - PeerJS's public broker server is only used to help two
   browsers find each other; all game data flows directly
   between the two players). Board logic lives in game-logic.js.
   ========================================================= */

const { createBoard, dropPiece, isBoardFull, checkWin, ROWS, COLS } = window.GameLogic;

let peer = null;
let conn = null;
let myPlayer = null; // 1 = host (red), 2 = joiner (yellow)
let board = null;
let currentTurn = 1;
let gameOver = false;

/* ---------------- lobby: host ---------------- */
document.getElementById("btn-host").addEventListener("click", () => {
  document.getElementById("btn-host").disabled = true;
  peer = new Peer();
  peer.on("open", (id) => {
    document.getElementById("room-code").textContent = id;
    document.getElementById("host-code-box").style.display = "block";
  });
  peer.on("connection", (c) => {
    conn = c;
    myPlayer = 1;
    document.getElementById("host-status").textContent = "Opponent connected!";
    setupConnection();
  });
  peer.on("error", (err) => {
    document.getElementById("host-status").textContent = "Connection error: " + err.type;
  });
});

document.getElementById("btn-copy-code").addEventListener("click", async () => {
  const code = document.getElementById("room-code").textContent;
  try {
    await navigator.clipboard.writeText(code);
    document.getElementById("btn-copy-code").textContent = "Copied!";
    setTimeout(() => (document.getElementById("btn-copy-code").textContent = "Copy Code"), 1500);
  } catch {
    alert("Copy this code: " + code);
  }
});

/* ---------------- lobby: join ---------------- */
document.getElementById("btn-join").addEventListener("click", () => {
  const code = document.getElementById("join-code").value.trim();
  if (!code) return;
  document.getElementById("btn-join").disabled = true;
  document.getElementById("join-status").textContent = "Connecting...";

  peer = new Peer();
  peer.on("open", () => {
    conn = peer.connect(code, { reliable: true });
    myPlayer = 2;
    conn.on("open", () => {
      document.getElementById("join-status").textContent = "Connected!";
      setupConnection();
    });
    conn.on("error", () => {
      document.getElementById("join-status").textContent = "Could not connect. Check the room code.";
      document.getElementById("btn-join").disabled = false;
    });
  });
  peer.on("error", (err) => {
    document.getElementById("join-status").textContent = "Connection error: " + err.type;
    document.getElementById("btn-join").disabled = false;
  });
});

/* ---------------- shared connection setup ---------------- */
function setupConnection() {
  conn.on("data", handleMessage);
  conn.on("close", () => {
    document.getElementById("game-status").textContent = "Opponent disconnected.";
  });
  startGame();
}

function handleMessage(msg) {
  if (msg.type === "move") {
    applyMove(msg.col, otherPlayer(myPlayer));
  } else if (msg.type === "rematch") {
    resetBoard();
  }
}

function otherPlayer(p) { return p === 1 ? 2 : 1; }

/* ---------------- game flow ---------------- */
function startGame() {
  document.getElementById("lobby").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  const colorChip = document.getElementById("my-color");
  colorChip.textContent = myPlayer === 1 ? "Red (first)" : "Yellow";
  colorChip.className = "chip " + (myPlayer === 1 ? "red" : "yellow");
  resetBoard();
}

function resetBoard() {
  board = createBoard();
  currentTurn = 1;
  gameOver = false;
  document.getElementById("post-game").style.display = "none";
  renderBoard();
  updateStatus();
}

function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = board[r][c];
      const cell = document.createElement("div");
      cell.className = "fr-cell " + (val === 1 ? "p1" : val === 2 ? "p2" : "empty");
      cell.dataset.col = c;
      cell.addEventListener("click", () => attemptMove(c));
      boardEl.appendChild(cell);
    }
  }
}

function updateStatus() {
  const turnEl = document.getElementById("turn-indicator");
  if (gameOver) return;
  turnEl.textContent = currentTurn === myPlayer ? "Your turn" : "Opponent's turn";
}

function attemptMove(col) {
  if (gameOver || currentTurn !== myPlayer) return;
  const landedRow = dropPiece(board, col, myPlayer);
  if (landedRow === -1) return; // column full

  conn.send({ type: "move", col });
  afterMove(landedRow, col, myPlayer);
}

function applyMove(col, player) {
  const landedRow = dropPiece(board, col, player);
  if (landedRow === -1) return;
  afterMove(landedRow, col, player);
}

function afterMove(row, col, player) {
  renderBoard();
  if (checkWin(board, row, col)) {
    gameOver = true;
    document.getElementById("turn-indicator").textContent = "Game over";
    document.getElementById("game-status").textContent =
      player === myPlayer ? "You win!" : "Opponent wins.";
    document.getElementById("post-game").style.display = "block";
    return;
  }
  if (isBoardFull(board)) {
    gameOver = true;
    document.getElementById("turn-indicator").textContent = "Game over";
    document.getElementById("game-status").textContent = "It's a draw.";
    document.getElementById("post-game").style.display = "block";
    return;
  }
  currentTurn = otherPlayer(player);
  updateStatus();
}

document.getElementById("btn-rematch").addEventListener("click", () => {
  conn.send({ type: "rematch" });
  resetBoard();
});
