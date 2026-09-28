/* =========================================================
   Four in a Row — pure game logic (no DOM, no network).
   Kept separate so it can be unit-tested directly with Node,
   and reused as-is in the browser.
   ========================================================= */
(function (global) {
  const ROWS = 6;
  const COLS = 7;

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  /** Drops `player` (1 or 2) into `col`. Returns the row it landed on, or -1 if the column is full. */
  function dropPiece(board, col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        board[r][col] = player;
        return r;
      }
    }
    return -1;
  }

  function isBoardFull(board) {
    return board[0].every((cell) => cell !== 0);
  }

  /** Checks for a 4-in-a-row through (row, col). Returns true/false. */
  function checkWin(board, row, col) {
    const player = board[row][col];
    if (!player) return false;
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal down-left
    ];
    for (const [dr, dc] of directions) {
      let count = 1;
      count += countDirection(board, row, col, dr, dc, player);
      count += countDirection(board, row, col, -dr, -dc, player);
      if (count >= 4) return true;
    }
    return false;
  }

  function countDirection(board, row, col, dr, dc, player) {
    let count = 0;
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  const api = { ROWS, COLS, createBoard, dropPiece, isBoardFull, checkWin };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.GameLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
