import express, { Request, Response } from 'express';
import cors from 'cors';
import { dbAsync } from './db/connection.ts';
import { migrate } from './db/migrate.ts';
import { z } from 'zod';
import { Player, Template, Sheet, BinderPage, Game } from './types.ts';
import { TEAMS, POSITIONS } from './data/meta.ts';
import fs from 'fs';
import path from 'path';

await migrate();

// Ensure upload directories exist
const UPLOAD_ROOT = path.resolve(process.cwd(), 'server', 'uploads');
const TEAM_DIR = path.join(UPLOAD_ROOT, 'teams');
const PLAYER_DIR = path.join(UPLOAD_ROOT, 'players');
for (const dir of [UPLOAD_ROOT, TEAM_DIR, PLAYER_DIR]) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
}

async function ensureDefaultTemplates() {
  const defaults: Template[] = [
    { id: 'tmpl-qb', name: 'QB Default', position: 'QB', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'GS', label: 'GS', type: 'number', order: 2 },
      { key: 'CMP', label: 'CMP', type: 'number', order: 3 },
      { key: 'ATT', label: 'ATT', type: 'number', order: 4 },
      { key: 'YDS', label: 'YDS', type: 'number', order: 5 },
      { key: 'TD', label: 'TD', type: 'number', order: 6 },
      { key: 'INT', label: 'INT', type: 'number', order: 7 },
      { key: 'SACK', label: 'SACK', type: 'number', order: 8 },
      { key: 'RATE', label: 'RATE', type: 'number', order: 9 },
      { key: 'RUSH', label: 'RUSH', type: 'number', order: 10 },
      { key: 'RUSHYDS', label: 'RUSH YDS', type: 'number', order: 11 },
      { key: 'RUSHTD', label: 'RUSH TD', type: 'number', order: 12 }
    ]},
    { id: 'tmpl-rb', name: 'RB Default', position: 'RB', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'ATT', label: 'ATT', type: 'number', order: 2 },
      { key: 'YDS', label: 'YDS', type: 'number', order: 3 },
      { key: 'AVG', label: 'AVG', type: 'number', order: 4 },
      { key: 'TD', label: 'TD', type: 'number', order: 5 },
      { key: 'TGT', label: 'TGT', type: 'number', order: 6 },
      { key: 'REC', label: 'REC', type: 'number', order: 7 },
      { key: 'RECYDS', label: 'REC YDS', type: 'number', order: 8 },
      { key: 'RECTD', label: 'REC TD', type: 'number', order: 9 },
      { key: 'FUM', label: 'FUM', type: 'number', order: 10 }
    ]},
    { id: 'tmpl-wr', name: 'WR Default', position: 'WR', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'GS', label: 'GS', type: 'number', order: 2 },
      { key: 'TGT', label: 'Targets', type: 'number', order: 3 },
      { key: 'REC', label: 'Receptions', type: 'number', order: 4 },
      { key: 'YDS', label: 'Yards', type: 'number', order: 5 },
      { key: 'AVG', label: 'Yards/Rec', type: 'number', order: 6 },
      { key: 'TD', label: 'TD', type: 'number', order: 7 },
      { key: 'RUSH', label: 'Rush Att', type: 'number', order: 8 },
      { key: 'RUSHYDS', label: 'Rush Yds', type: 'number', order: 9 },
      { key: 'RUSHTD', label: 'Rush TD', type: 'number', order: 10 },
      { key: 'FUM', label: 'Fumbles', type: 'number', order: 11 }
    ]},
    { id: 'tmpl-te', name: 'TE Default', position: 'TE', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'GS', label: 'GS', type: 'number', order: 2 },
      { key: 'TGT', label: 'Targets', type: 'number', order: 3 },
      { key: 'REC', label: 'Receptions', type: 'number', order: 4 },
      { key: 'YDS', label: 'Yards', type: 'number', order: 5 },
      { key: 'AVG', label: 'Yards/Rec', type: 'number', order: 6 },
      { key: 'TD', label: 'TD', type: 'number', order: 7 },
      { key: 'FUM', label: 'Fumbles', type: 'number', order: 8 }
    ]},
    { id: 'tmpl-ol', name: 'OL Default', position: 'OL', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'GS', label: 'GS', type: 'number', order: 2 },
      { key: 'PEN', label: 'Penalties', type: 'number', order: 3 },
      { key: 'PENYDS', label: 'Penalty Yds', type: 'number', order: 4 },
      { key: 'SACKA', label: 'Sacks Allowed', type: 'number', order: 5 }
    ]},
    { id: 'tmpl-dl', name: 'DL Default', position: 'DL', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'TKL', label: 'Tackles', type: 'number', order: 2 },
      { key: 'TFL', label: 'Tackles for Loss', type: 'number', order: 3 },
      { key: 'SACK', label: 'Sacks', type: 'number', order: 4 },
      { key: 'QBH', label: 'QB Hits', type: 'number', order: 5 },
      { key: 'FF', label: 'Forced Fumbles', type: 'number', order: 6 },
      { key: 'FR', label: 'Fumble Recoveries', type: 'number', order: 7 }
    ]},
    { id: 'tmpl-edge', name: 'EDGE Default', position: 'EDGE', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'TKL', label: 'Tackles', type: 'number', order: 2 },
      { key: 'TFL', label: 'Tackles for Loss', type: 'number', order: 3 },
      { key: 'SACK', label: 'Sacks', type: 'number', order: 4 },
      { key: 'QBH', label: 'QB Hits', type: 'number', order: 5 },
      { key: 'FF', label: 'Forced Fumbles', type: 'number', order: 6 },
      { key: 'FR', label: 'Fumble Recoveries', type: 'number', order: 7 }
    ]},
    { id: 'tmpl-lb', name: 'LB Default', position: 'LB', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'TKL', label: 'Tackles', type: 'number', order: 2 },
      { key: 'TFL', label: 'Tackles for Loss', type: 'number', order: 3 },
      { key: 'SACK', label: 'Sacks', type: 'number', order: 4 },
      { key: 'INT', label: 'Interceptions', type: 'number', order: 5 },
      { key: 'PD', label: 'Passes Defended', type: 'number', order: 6 },
      { key: 'FF', label: 'Forced Fumbles', type: 'number', order: 7 },
      { key: 'FR', label: 'Fumble Recoveries', type: 'number', order: 8 }
    ]},
    { id: 'tmpl-cb', name: 'CB Default', position: 'CB', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'TKL', label: 'Tackles', type: 'number', order: 2 },
      { key: 'INT', label: 'Interceptions', type: 'number', order: 3 },
      { key: 'PD', label: 'Passes Defended', type: 'number', order: 4 },
      { key: 'TD', label: 'Def TD', type: 'number', order: 5 },
      { key: 'FF', label: 'Forced Fumbles', type: 'number', order: 6 },
      { key: 'FR', label: 'Fumble Recoveries', type: 'number', order: 7 }
    ]},
    { id: 'tmpl-s', name: 'S Default', position: 'S', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'TKL', label: 'Tackles', type: 'number', order: 2 },
      { key: 'INT', label: 'Interceptions', type: 'number', order: 3 },
      { key: 'PD', label: 'Passes Defended', type: 'number', order: 4 },
      { key: 'FF', label: 'Forced Fumbles', type: 'number', order: 5 },
      { key: 'FR', label: 'Fumble Recoveries', type: 'number', order: 6 }
    ]},
    { id: 'tmpl-k', name: 'K Default', position: 'K', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'FGM', label: 'FG Made', type: 'number', order: 2 },
      { key: 'FGA', label: 'FG Att', type: 'number', order: 3 },
      { key: 'LNG', label: 'Long', type: 'number', order: 4 },
      { key: 'XPM', label: 'XP Made', type: 'number', order: 5 },
      { key: 'XPA', label: 'XP Att', type: 'number', order: 6 },
      { key: 'PTS', label: 'Points', type: 'number', order: 7 }
    ]},
    { id: 'tmpl-p', name: 'P Default', position: 'P', statLines: [
      { key: 'GP', label: 'GP', type: 'number', order: 1 },
      { key: 'PUNT', label: 'Punts', type: 'number', order: 2 },
      { key: 'YDS', label: 'Yards', type: 'number', order: 3 },
      { key: 'AVG', label: 'Avg', type: 'number', order: 4 },
      { key: 'LNG', label: 'Long', type: 'number', order: 5 },
      { key: 'IN20', label: 'Inside 20', type: 'number', order: 6 }
    ]},
  ];
  for (const t of defaults) {
    await dbAsync.run('INSERT OR REPLACE INTO templates (id, name, position, statLines) VALUES (?,?,?,?)', [t.id, t.name, t.position, JSON.stringify(t.statLines)]);
  }
}

await ensureDefaultTemplates();

async function ensureSamplePlayer() {
  const count = await dbAsync.get<{ c: number }>('SELECT COUNT(1) as c FROM players');
  if ((count?.c ?? 0) > 0) return;
  const player: Player = {
    id: 'sample-rookie-1',
    name: 'Sample Rookie',
    team: 'CLE',
    position: 'WR',
    colleges: ['Ohio State'],
    draftYear: 2025,
    draftPick: 18,
    isPlayer: true,
    isBrownsStarter: false,
    notes: 'Explosive slot receiver.'
  };
  await dbAsync.run(
    `INSERT INTO players (id, name, team, position, colleges, draftYear, draftPick, isRookie, isBrownsStarter, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [player.id, player.name, player.team, player.position, JSON.stringify(player.colleges), player.draftYear, player.draftPick, player.isPlayer ? 1 : 0, player.isBrownsStarter ? 1 : 0, player.notes ?? null]
  );
}

await ensureSamplePlayer();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_ROOT));

// Helpers
function parseRow<T = any>(row: any): T {
  if (!row) return row;
  if ('colleges' in row && typeof row.colleges === 'string') row.colleges = JSON.parse(row.colleges);
  if ('statLines' in row && typeof row.statLines === 'string') row.statLines = JSON.parse(row.statLines);
  if ('data' in row && typeof (row as any).data === 'string') (row as any).values = JSON.parse((row as any).data);
  if ('slots' in row && typeof row.slots === 'string') row.slots = JSON.parse(row.slots);
  // Map database isRookie to client isPlayer for backward compatibility
  if ('isRookie' in row) {
    row.isPlayer = Boolean(row.isRookie);
    delete row.isRookie;
  }
  return row as T;
}

function findExistingFile(dir: string, base: string): string | null {
  const exts = ['png', 'jpg', 'jpeg', 'webp'];
  for (const ext of exts) {
    const fn = `${base}.${ext}`;
    if (fs.existsSync(path.join(dir, fn))) return fn;
  }
  return null;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; ext: string } {
  const m = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) throw new Error('Invalid image data');
  const mime = m[1];
  const ext = mime.endsWith('jpeg') ? 'jpg' : mime.split('/')[1];
  const buffer = Buffer.from(m[3], 'base64');
  return { buffer, ext };
}

// Meta
app.get('/api/meta/teams', (_req: Request, res: Response) => {
  const teams = TEAMS.map(t => {
    const existing = findExistingFile(TEAM_DIR, t.abbr);
    const helmetUrl = existing ? `/uploads/teams/${existing}` : undefined;
    return { ...t, helmetUrl };
  });
  res.json(teams);
});
app.get('/api/meta/positions', (_req: Request, res: Response) => {
  res.json(POSITIONS);
});

// Uploads
app.post('/api/upload/teamHelmet', async (req: Request, res: Response) => {
  try {
    const schema = z.object({ abbr: z.string(), image: z.string() });
    const { abbr, image } = schema.parse(req.body);
    const { buffer, ext } = dataUrlToBuffer(image);
    // Remove any existing files for this abbr to keep only one
    for (const e of ['png', 'jpg', 'jpeg', 'webp']) {
      const p = path.join(TEAM_DIR, `${abbr}.${e}`);
      try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
    }
    const filename = `${abbr}.${ext}`;
    fs.writeFileSync(path.join(TEAM_DIR, filename), buffer);
    res.status(201).json({ ok: true, url: `/uploads/teams/${filename}` });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Upload failed' });
  }
});

app.post('/api/upload/playerPhoto', async (req: Request, res: Response) => {
  try {
    const schema = z.object({ playerId: z.string(), image: z.string() });
    const { playerId, image } = schema.parse(req.body);
    const { buffer, ext } = dataUrlToBuffer(image);
    // Remove any existing files for this player
    for (const e of ['png', 'jpg', 'jpeg', 'webp']) {
      const p = path.join(PLAYER_DIR, `${playerId}.${e}`);
      try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
    }
    const filename = `${playerId}.${ext}`;
    fs.writeFileSync(path.join(PLAYER_DIR, filename), buffer);
    res.status(201).json({ ok: true, url: `/uploads/players/${filename}` });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Upload failed' });
  }
});

// Players
app.get('/api/players', async (_req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM players');
  res.json(rows.map(parseRow<Player>));
});

app.get('/api/players/:id', async (req: Request, res: Response) => {
  const row = await dbAsync.get('SELECT * FROM players WHERE id=?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const player = parseRow<Player>(row) as any;
  const existing = findExistingFile(PLAYER_DIR, req.params.id);
  if (existing) player.photoUrl = `/uploads/players/${existing}`;
  res.json(player);
});

app.post('/api/players', async (req: Request, res: Response) => {
  const schema = z.object({
    id: z.string(),
    name: z.string(),
    team: z.string(),
    position: z.string(),
    colleges: z.array(z.string()),
    draftYear: z.number().optional(),
    draftPick: z.number().optional(),
    isPlayer: z.union([z.boolean(), z.number(), z.string()]).transform(val => {
      if (typeof val === 'boolean') return val
      if (typeof val === 'number') return val !== 0
      if (typeof val === 'string') return val === 'true' || val === '1'
      return false
    }),
    isBrownsStarter: z.union([z.boolean(), z.number(), z.string()]).transform(val => {
      if (typeof val === 'boolean') return val
      if (typeof val === 'number') return val !== 0
      if (typeof val === 'string') return val === 'true' || val === '1'
      return false
    }),
    notes: z.string().optional(),
    templateId: z.string().optional(),
  });
  const body = schema.parse(req.body);
  await dbAsync.run(
    `INSERT OR REPLACE INTO players (id, name, team, position, colleges, draftYear, draftPick, isRookie, isBrownsStarter, notes, templateId)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [body.id, body.name, body.team, body.position, JSON.stringify(body.colleges), body.draftYear ?? null, body.draftPick ?? null, body.isPlayer ? 1 : 0, body.isBrownsStarter ? 1 : 0, body.notes ?? null, body.templateId ?? null]
  );
  // If player, ensure binder page exists and enforce max 32 player pages
  if (body.isPlayer) {
    const existing = await dbAsync.get('SELECT id FROM binderPages WHERE playerId=?', [body.id]);
    if (!existing) {
      const count = await dbAsync.get<{ c: number }>('SELECT COUNT(1) as c FROM binderPages WHERE type="Rookie"');
      if ((count?.c ?? 0) >= 32) {
        return res.status(400).json({ error: 'Rookie page limit (32) reached' });
      }
      const binderId = `bp-${body.id}`;
      const slots = Array.from({ length: 9 }, (_, i) => ({ index: i + 1 }));
      await dbAsync.run('INSERT OR REPLACE INTO binderPages (id, type, playerId, slots) VALUES (?,?,?,?)', [binderId, 'Rookie', body.id, JSON.stringify(slots)]);
    }
  }
  res.status(201).json({ ok: true });
});

app.delete('/api/players/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  await dbAsync.run('DELETE FROM games WHERE playerId=?', [id]);
  await dbAsync.run('DELETE FROM sheets WHERE playerId=?', [id]);
  await dbAsync.run('DELETE FROM binderPages WHERE playerId=?', [id]);
  await dbAsync.run('DELETE FROM players WHERE id=?', [id]);
  res.json({ ok: true });
});

// Templates
app.get('/api/templates', async (_req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM templates');
  res.json(rows.map(parseRow<Template>));
});

app.post('/api/templates', async (req: Request, res: Response) => {
  const schema = z.object({
    id: z.string(),
    name: z.string(),
    position: z.string(),
    statLines: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.union([z.literal('number'), z.literal('text'), z.literal('calc')]),
      formula: z.string().optional(),
      perGame: z.boolean().optional(),
      order: z.number(),
      description: z.string().optional()
    }))
  });
  const body = schema.parse(req.body);
  await dbAsync.run('INSERT OR REPLACE INTO templates (id, name, position, statLines) VALUES (?,?,?,?)', [body.id, body.name, body.position, JSON.stringify(body.statLines)]);
  res.status(201).json({ ok: true });
});

app.get('/api/templates/:id', async (req: Request, res: Response) => {
  const row = await dbAsync.get('SELECT * FROM templates WHERE id=?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(parseRow<Template>(row));
});

app.delete('/api/templates/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  await dbAsync.run('DELETE FROM sheets WHERE templateId=?', [id]);
  await dbAsync.run('DELETE FROM templates WHERE id=?', [id]);
  res.json({ ok: true });
});

// Sheets
app.get('/api/sheets', async (_req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM sheets');
  res.json(rows.map(parseRow<Sheet>));
});

app.post('/api/sheets', async (req: Request, res: Response) => {
  const schema = z.object({
    id: z.string(),
    playerId: z.string(),
    templateId: z.string(),
    seasonYear: z.number(),
    values: z.record(z.union([z.string(), z.number()]))
  });
  const body = schema.parse(req.body);
  await dbAsync.run('INSERT OR REPLACE INTO sheets (id, playerId, templateId, seasonYear, data) VALUES (?,?,?,?,?)', [body.id, body.playerId, body.templateId, body.seasonYear, JSON.stringify(body.values)]);
  res.status(201).json({ ok: true });
});

// Get all sheets for a given player
app.get('/api/players/:id/sheets', async (req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM sheets WHERE playerId=?', [req.params.id]);
  res.json(rows.map(parseRow<Sheet>));
});

// Delete a sheet by id
app.delete('/api/sheets/:id', async (req: Request, res: Response) => {
  await dbAsync.run('DELETE FROM sheets WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Games (per-week)
app.get('/api/players/:id/games', async (req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM games WHERE playerId=? ORDER BY (date IS NULL), date, id', [req.params.id]);
  res.json(rows.map(parseRow<Game>));
});

app.post('/api/games', async (req: Request, res: Response) => {
  const schema = z.object({
    id: z.string(),
    playerId: z.string(),
    templateId: z.string(),
    date: z.string().optional(),
    isBye: z.union([z.boolean(), z.number(), z.string()]).transform(v => {
      if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; return v === 'true' || v === '1';
    }),
    opponentAbbr: z.string().optional(),
    teamScore: z.number().optional(),
    oppScore: z.number().optional(),
    values: z.record(z.union([z.string(), z.number()]))
  });
  const body = schema.parse(req.body);
  await dbAsync.run('INSERT OR REPLACE INTO games (id, playerId, templateId, date, isBye, opponentAbbr, teamScore, oppScore, data) VALUES (?,?,?,?,?,?,?,?,?)', [body.id, body.playerId, body.templateId, body.date ?? null, body.isBye ? 1 : 0, body.opponentAbbr ?? null, body.teamScore ?? null, body.oppScore ?? null, JSON.stringify(body.values)]);
  res.status(201).json({ ok: true });
});

app.delete('/api/games/:id', async (req: Request, res: Response) => {
  await dbAsync.run('DELETE FROM games WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Stats endpoint for dashboard
app.get('/api/stats', async (_req: Request, res: Response) => {
  const [players, templates, binder] = await Promise.all([
    dbAsync.get<{ c: number }>('SELECT COUNT(1) as c FROM players'),
    dbAsync.get<{ c: number }>('SELECT COUNT(1) as c FROM templates'),
    dbAsync.get<{ c: number }>('SELECT COUNT(1) as c FROM binderPages'),
  ]);
  res.json({ players: players?.c ?? 0, templates: templates?.c ?? 0, binderPages: binder?.c ?? 0 });
});

// Binder pages
app.get('/api/binderPages', async (_req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM binderPages');
  res.json(rows.map(parseRow<BinderPage>));
});

app.post('/api/binderPages', async (req: Request, res: Response) => {
  const schema = z.object({
    id: z.string(),
    type: z.string(),
    playerId: z.string().optional(),
    slots: z.array(z.object({ index: z.number(), note: z.string().optional() }))
  });
  const body = schema.parse(req.body);
  await dbAsync.run('INSERT OR REPLACE INTO binderPages (id, type, playerId, slots) VALUES (?,?,?,?)', [body.id, body.type, body.playerId ?? null, JSON.stringify(body.slots)]);
  res.status(201).json({ ok: true });
});

// Admin seed: 2025 Round 1 draft
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const TEAM_ABBR: Record<string, string> = {
  'Tennessee Titans': 'TEN',
  'Jacksonville Jaguars': 'JAX',
  'New York Giants': 'NYG',
  'New England Patriots': 'NE',
  'Cleveland Browns': 'CLE',
  'Las Vegas Raiders': 'LV',
  'New York Jets': 'NYJ',
  'Carolina Panthers': 'CAR',
  'New Orleans Saints': 'NO',
  'Chicago Bears': 'CHI',
  'San Francisco 49ers': 'SF',
  'Dallas Cowboys': 'DAL',
  'Miami Dolphins': 'MIA',
  'Indianapolis Colts': 'IND',
  'Atlanta Falcons': 'ATL',
  'Arizona Cardinals': 'ARI',
  'Cincinnati Bengals': 'CIN',
  'Seattle Seahawks': 'SEA',
  'Tampa Bay Buccaneers': 'TB',
  'Denver Broncos': 'DEN',
  'Pittsburgh Steelers': 'PIT',
  'Los Angeles Chargers': 'LAC',
  'Green Bay Packers': 'GB',
  'Minnesota Vikings': 'MIN',
  'Baltimore Ravens': 'BAL',
  'Detroit Lions': 'DET',
  'Washington Commanders': 'WAS',
  'Buffalo Bills': 'BUF',
  'Philadelphia Eagles': 'PHI',
  'Kansas City Chiefs': 'KC',
};

function normalizeTeamName(name: string) {
  return name.replace(/\s*\(from.*\)$/i, '').trim();
}

function mapPosition(posRaw: string): { pos: string; templateId: string; note?: string } {
  const base = posRaw.toUpperCase().trim();
  if (base.includes('/')) {
    const primary = base.split('/')[0].trim();
    const mapped = mapPosition(primary);
    return { ...mapped, note: `Two-way: ${base}` };
  }
  switch (base) {
    case 'QB': return { pos: 'QB', templateId: 'tmpl-qb' };
    case 'RB': return { pos: 'RB', templateId: 'tmpl-rb' };
    case 'WR': return { pos: 'WR', templateId: 'tmpl-wr' };
    case 'TE': return { pos: 'TE', templateId: 'tmpl-te' };
    case 'CB': return { pos: 'CB', templateId: 'tmpl-cb' };
    case 'S': return { pos: 'S', templateId: 'tmpl-s' };
    case 'LB': return { pos: 'LB', templateId: 'tmpl-lb' };
    case 'EDGE': return { pos: 'EDGE', templateId: 'tmpl-edge' };
    case 'DT': return { pos: 'DL', templateId: 'tmpl-dl' };
    case 'OT':
    case 'OG':
    case 'OL': return { pos: 'OL', templateId: 'tmpl-ol' };
    case 'K': return { pos: 'K', templateId: 'tmpl-k' };
    case 'P': return { pos: 'P', templateId: 'tmpl-p' };
    default: return { pos: base, templateId: 'tmpl-wr' };
  }
}

type DraftPick = {
  round: number;
  pick: number; // round pick
  overall: number;
  team: string; // full team name, may include "(from ...)"
  name: string;
  pos: string; // e.g., "WR/CB"
  college: string;
};

const DRAFT_2025_R1: DraftPick[] = [
  { round: 1, pick: 1, overall: 1, team: 'Tennessee Titans', name: 'Cam Ward', pos: 'QB', college: 'Miami' },
  { round: 1, pick: 2, overall: 2, team: 'Jacksonville Jaguars', name: 'Travis Hunter', pos: 'WR/CB', college: 'Colorado' },
  { round: 1, pick: 3, overall: 3, team: 'New York Giants', name: 'Abdul Carter', pos: 'EDGE', college: 'Penn State' },
  { round: 1, pick: 4, overall: 4, team: 'New England Patriots', name: 'Will Campbell', pos: 'OT', college: 'LSU' },
  { round: 1, pick: 5, overall: 5, team: 'Cleveland Browns', name: 'Mason Graham', pos: 'DT', college: 'Michigan' },
  { round: 1, pick: 6, overall: 6, team: 'Las Vegas Raiders', name: 'Ashton Jeanty', pos: 'RB', college: 'Boise State' },
  { round: 1, pick: 7, overall: 7, team: 'New York Jets', name: 'Armand Membou', pos: 'OT', college: 'Missouri' },
  { round: 1, pick: 8, overall: 8, team: 'Carolina Panthers', name: 'Tetairoa McMillan', pos: 'WR', college: 'Arizona' },
  { round: 1, pick: 9, overall: 9, team: 'New Orleans Saints', name: 'Kelvin Banks Jr.', pos: 'OT', college: 'Texas' },
  { round: 1, pick: 10, overall: 10, team: 'Chicago Bears', name: 'Colston Loveland', pos: 'TE', college: 'Michigan' },
  { round: 1, pick: 11, overall: 11, team: 'San Francisco 49ers', name: 'Mykel Williams', pos: 'EDGE', college: 'Georgia' },
  { round: 1, pick: 12, overall: 12, team: 'Dallas Cowboys', name: 'Tyler Booker', pos: 'OG', college: 'Alabama' },
  { round: 1, pick: 13, overall: 13, team: 'Miami Dolphins', name: 'Kenneth Grant', pos: 'DT', college: 'Michigan' },
  { round: 1, pick: 14, overall: 14, team: 'Indianapolis Colts', name: 'Tyler Warren', pos: 'TE', college: 'Penn State' },
  { round: 1, pick: 15, overall: 15, team: 'Atlanta Falcons', name: 'Jalon Walker', pos: 'EDGE', college: 'Georgia' },
  { round: 1, pick: 16, overall: 16, team: 'Arizona Cardinals', name: 'Walter Nolen', pos: 'DT', college: 'Ole Miss' },
  { round: 1, pick: 17, overall: 17, team: 'Cincinnati Bengals', name: 'Shemar Stewart', pos: 'EDGE', college: 'Texas A&M' },
  { round: 1, pick: 18, overall: 18, team: 'Seattle Seahawks', name: 'Grey Zabel', pos: 'OG', college: 'North Dakota State' },
  { round: 1, pick: 19, overall: 19, team: 'Tampa Bay Buccaneers', name: 'Emeka Egbuka', pos: 'WR', college: 'Ohio State' },
  { round: 1, pick: 20, overall: 20, team: 'Denver Broncos', name: 'Jahdae Barron', pos: 'CB', college: 'Texas' },
  { round: 1, pick: 21, overall: 21, team: 'Pittsburgh Steelers', name: 'Derrick Harmon', pos: 'DT', college: 'Oregon' },
  { round: 1, pick: 22, overall: 22, team: 'Los Angeles Chargers', name: 'Omarion Hampton', pos: 'RB', college: 'North Carolina' },
  { round: 1, pick: 23, overall: 23, team: 'Green Bay Packers', name: 'Matthew Golden', pos: 'WR', college: 'Texas' },
  { round: 1, pick: 24, overall: 24, team: 'Minnesota Vikings', name: 'Donovan Jackson', pos: 'OG', college: 'Ohio State' },
  { round: 1, pick: 25, overall: 25, team: 'New York Giants', name: 'Jaxson Dart', pos: 'QB', college: 'Ole Miss' },
  { round: 1, pick: 26, overall: 26, team: 'Atlanta Falcons', name: 'James Pearce Jr.', pos: 'EDGE', college: 'Tennessee' },
  { round: 1, pick: 27, overall: 27, team: 'Baltimore Ravens', name: 'Malaki Starks', pos: 'S', college: 'Georgia' },
  { round: 1, pick: 28, overall: 28, team: 'Detroit Lions', name: 'Tyleik Williams', pos: 'DT', college: 'Ohio State' },
  { round: 1, pick: 29, overall: 29, team: 'Washington Commanders', name: 'Josh Conerly Jr.', pos: 'OT', college: 'Oregon' },
  { round: 1, pick: 30, overall: 30, team: 'Buffalo Bills', name: 'Maxwell Hairston', pos: 'CB', college: 'Kentucky' },
  { round: 1, pick: 31, overall: 31, team: 'Philadelphia Eagles', name: 'Jihaad Campbell', pos: 'LB', college: 'Alabama' },
  { round: 1, pick: 32, overall: 32, team: 'Kansas City Chiefs', name: 'Josh Simmons', pos: 'OL', college: 'Ohio State' },
];

async function seedDraft2025(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0, skipped = 0;
  for (const p of DRAFT_2025_R1) {
    const teamName = normalizeTeamName(p.team);
    const abbr = TEAM_ABBR[teamName];
    if (!abbr) { skipped++; continue; }
    const map = mapPosition(p.pos);
    const id = `p2025-${String(p.overall).padStart(3, '0')}-${slug(p.name)}`;
    const exists = await dbAsync.get('SELECT id FROM players WHERE id=?', [id]);
    if (exists) { skipped++; continue; }

    const notes = `Round ${p.round}, Pick ${p.pick} (Overall ${p.overall})` + (map.note ? ` — ${map.note}` : '');
    await dbAsync.run(
      `INSERT INTO players (id, name, team, position, colleges, draftYear, draftPick, isRookie, isBrownsStarter, notes, templateId)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, p.name, abbr, map.pos, JSON.stringify([p.college]), 2025, p.overall, 1, 0, notes, map.templateId]
    );
    inserted++;
  }
  return { inserted, skipped };
}

app.post('/api/admin/seed/draft2025', async (_req: Request, res: Response) => {
  try {
    const { inserted, skipped } = await seedDraft2025();
    res.json({ ok: true, inserted, skipped });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Seed failed' });
  }
});

const PORT = process.env.PORT || 5179;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
