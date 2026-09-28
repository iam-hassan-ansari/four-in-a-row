# Four in a Row — Online (Demo)

A classic disc-drop strategy game — two players, connected directly browser-to-browser with a shareable room code. No game server, no accounts.

## Overview
Drop pieces into a 7-column, 6-row grid, taking turns; the first to line up four in a row — horizontally, vertically, or diagonally — wins. One player hosts (gets a room code), the other joins with that code, and every move after that flows directly between the two browsers over WebRTC.

## Live Demo
🔗 Add the link here once this repo is deployed on GitHub Pages
(Settings → Pages → Deploy from branch → main → / (root))

⚠️ Needs an internet connection — see "How the networking works" below.

## Features
- **Host or Join** — one player creates a room and shares the code, the other types it in
- **Real peer-to-peer play** — no backend of ours; moves travel directly between the two browsers
- **Live sync** — board, turns and win/draw detection stay in sync on both sides
- **Rematch** — either player can reset the board for both

## Tech Stack
- HTML5, CSS3, vanilla JavaScript
- [PeerJS](https://peerjs.com/) (a friendly wrapper around WebRTC data channels)
- No backend server of our own, no build step

## How the Networking Works
This is peer-to-peer, not client-server: once two browsers are connected, every move goes **directly** between them, with nothing of ours in the middle. A third party is only involved for a few seconds at the very start:

1. **Signaling**: WebRTC needs a way for two browsers that have never met to exchange connection details first. PeerJS runs a small free public "broker" server for exactly this — it only helps two peers find each other, then gets out of the way. This project doesn't run any server of its own.
2. **Host**: calls `new Peer()`, gets back a random ID (the "room code"), and waits.
3. **Join**: calls `peer.connect(roomCode)`, using that ID to ask the broker to introduce the two browsers.
4. Once connected, the browsers talk directly (a WebRTC `DataConnection`) — the broker is no longer involved, and no game data passes through any third-party server.
5. Because this is peer-to-peer, it can occasionally struggle behind strict school/office firewalls or certain mobile networks that block WebRTC — this is a known limitation of P2P web apps in general, not specific to this code.

## How the Game Logic Works — Code Walkthrough
- **`game-logic.js`** holds pure functions with no DOM or network code at all — `createBoard`, `dropPiece`, `checkWin`, `isBoardFull` — so the rules can be tested completely on their own (see `test-logic.js`, runnable with `node test-logic.js`).
- **Dropping a piece**: `dropPiece` scans a column from the bottom row upward and places the piece in the first empty cell — the same idea as gravity, without any physics.
- **Win detection**: `checkWin(board, row, col)` only needs to check lines that pass through the *just-placed* piece, in 4 directions (horizontal, vertical, two diagonals). For each direction it counts how many of the same player's pieces are consecutive going one way, plus the same going the exact opposite way, plus the piece itself — if that total reaches 4, it's a win. This is far cheaper than re-scanning the whole board after every move.
- **Keeping two browsers in sync**: both players run the *exact same* `game-logic.js`. A move is never "sent as a picture of the board" — only the column number is sent. Each side calls `dropPiece` and `checkWin` locally with that column, so as long as both sides process moves in the same order, their boards can never disagree.
- **Turn enforcement**: `currentTurn` (1 or 2) is tracked identically on both sides and flips after every valid move; a click is ignored client-side if it isn't that player's turn, so a player can't accidentally play out of turn.
- **Rematch**: sending `{ type: "rematch" }` and having *both* sides independently call the same `resetBoard()` keeps this simple — no negotiation needed, since a full reset is safe either way.

## Run Locally
1. Open `index.html` in two different browser windows (or on two devices), both with internet access.
2. Click **Create Room** in the first, then paste the code into **Join a game** in the second.

## Notes
- This is an original demo project built for portfolio purposes.
- The name avoids the trademarked title of the well-known commercial version of this game; the drop-four-in-a-row mechanic itself is a traditional, widely implemented game idea.
