/* Simple unit tests for the pure game logic in game-logic.js.
   Run with: node test-logic.js
   (Not needed to play the game — this is just to demonstrate/verify
   the win-detection logic works correctly in every direction.) */

const { createBoard, dropPiece, isBoardFull, checkWin, ROWS, COLS } = require('./game-logic.js');

function assert(cond, msg) {
  if (!cond) { console.error("FAIL:", msg); process.exitCode = 1; }
  else console.log("PASS:", msg);
}

// 1. basic drop stacks pieces bottom-up
{
  const b = createBoard();
  const r1 = dropPiece(b, 3, 1);
  const r2 = dropPiece(b, 3, 2);
  assert(r1 === ROWS - 1, "first drop lands on bottom row");
  assert(r2 === ROWS - 2, "second drop in same column lands one row up");
}

// 2. column full returns -1
{
  const b = createBoard();
  for (let i = 0; i < ROWS; i++) dropPiece(b, 0, (i % 2) + 1);
  const overflow = dropPiece(b, 0, 1);
  assert(overflow === -1, "dropping into a full column returns -1");
}

// 3. horizontal win
{
  const b = createBoard();
  [0, 1, 2, 3].forEach((c) => dropPiece(b, c, 1));
  const row = ROWS - 1;
  assert(checkWin(b, row, 3) === true, "horizontal 4-in-a-row detected");
}

// 4. vertical win
{
  const b = createBoard();
  let lastRow;
  for (let i = 0; i < 4; i++) lastRow = dropPiece(b, 2, 1);
  assert(checkWin(b, lastRow, 2) === true, "vertical 4-in-a-row detected");
}

// 5. diagonal win (built via a real playable sequence)
{
  const b = createBoard();
  dropPiece(b, 0, 1); // r5c0 = 1
  dropPiece(b, 1, 2); // r5c1 = 2
  dropPiece(b, 1, 1); // r4c1 = 1
  dropPiece(b, 2, 2); // r5c2 = 2
  dropPiece(b, 2, 2); // r4c2 = 2
  dropPiece(b, 2, 1); // r3c2 = 1
  dropPiece(b, 3, 2); // r5c3 = 2
  dropPiece(b, 3, 2); // r4c3 = 2
  dropPiece(b, 3, 2); // r3c3 = 2
  const lastRow = dropPiece(b, 3, 1); // r2c3 = 1  -> completes diagonal r5c0,r4c1,r3c2,r2c3
  assert(checkWin(b, lastRow, 3) === true, "diagonal 4-in-a-row detected");
}

// 6. no false positive on a non-winning board
{
  const b = createBoard();
  dropPiece(b, 0, 1);
  dropPiece(b, 1, 1);
  dropPiece(b, 2, 2);
  const lastRow = dropPiece(b, 3, 1);
  assert(checkWin(b, lastRow, 3) === false, "no win falsely detected on scattered pieces");
}

// 7. full board detection
{
  const b = createBoard();
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) dropPiece(b, c, 1);
  assert(isBoardFull(b) === true, "full board correctly detected");
}

console.log("Board size:", ROWS, "x", COLS);
