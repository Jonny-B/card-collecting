# Football Card Binder (React + Express + SQLite)

This is a starter scaffold for the football card collecting app. It uses:

- Client: React 18 + Vite + TypeScript, Bootstrap, Font Awesome
- Server: Express + better-sqlite3 + TypeScript
- DB: SQLite (stored in `server/data/cards.db`)

Run server then client. See below.

## Dev setup

1. Install dependencies

- Server
  - `cd server`
  - `npm install`
  - `npm run migrate && npm run seed`
  - `npm run dev`
- Client
  - In another terminal: `cd client`
  - `npm install`
  - `npm run dev`

The client will proxy API calls to `http://localhost:5179`.

## Notes

- This scaffold covers core entities and endpoints, plus a minimal UI with routes.
- Printing CSS targets US Letter by default; A4 rules are included in component styles.
- You can expand pages per the requirements (rookie overview/stat sheets, binder planner, template editor).
