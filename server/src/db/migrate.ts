import { dbAsync } from './connection.ts';

// Run simple schema migrations (idempotent)
export async function migrate() {
  await dbAsync.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL,
      position TEXT NOT NULL,
      colleges TEXT NOT NULL,
      draftYear INTEGER,
      draftPick INTEGER,
      isRookie INTEGER NOT NULL,
      isBrownsStarter INTEGER NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      statLines TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sheets (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      templateId TEXT NOT NULL,
      seasonYear INTEGER NOT NULL,
      data TEXT NOT NULL,
      FOREIGN KEY(playerId) REFERENCES players(id),
      FOREIGN KEY(templateId) REFERENCES templates(id)
    );

    CREATE TABLE IF NOT EXISTS binderPages (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      playerId TEXT,
      slots TEXT NOT NULL,
      FOREIGN KEY(playerId) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sheets_player ON sheets(playerId);
    CREATE INDEX IF NOT EXISTS idx_sheets_template ON sheets(templateId);

    -- New per-game stats table
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      templateId TEXT NOT NULL,
      date TEXT,
      isBye INTEGER NOT NULL,
      opponentAbbr TEXT,
      teamScore INTEGER,
      oppScore INTEGER,
      data TEXT NOT NULL,
      FOREIGN KEY(playerId) REFERENCES players(id),
      FOREIGN KEY(templateId) REFERENCES templates(id)
    );

    CREATE INDEX IF NOT EXISTS idx_games_player ON games(playerId);
    CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
  `);

  // Add players.templateId column if it does not exist
  try {
    await dbAsync.exec(`ALTER TABLE players ADD COLUMN templateId TEXT`);
  } catch {
    // ignore if exists
  }
}
// Allow running directly
const isDirect = process.argv[1] && process.argv[1].includes('migrate.ts');
if (isDirect) {
  migrate().then(() => console.log('Migrations applied.'));
}
