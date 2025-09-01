import express, { Request, Response } from 'express';
import cors from 'cors';
import { dbAsync } from './db/connection.ts';
import { migrate } from './db/migrate.ts';
import { z } from 'zod';
import { Player, Template, Sheet, BinderPage } from './types.ts';

await migrate();

async function ensureDefaultTemplates() {
  const countRow = await dbAsync.get<{ c: number }>('SELECT COUNT(1) as c FROM templates');
  if ((countRow?.c ?? 0) > 0) return;
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
    ]}
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
    isRookie: true,
    isBrownsStarter: false,
    notes: 'Explosive slot receiver.'
  };
  await dbAsync.run(
    `INSERT INTO players (id, name, team, position, colleges, draftYear, draftPick, isRookie, isBrownsStarter, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [player.id, player.name, player.team, player.position, JSON.stringify(player.colleges), player.draftYear, player.draftPick, player.isRookie ? 1 : 0, player.isBrownsStarter ? 1 : 0, player.notes ?? null]
  );
}

await ensureSamplePlayer();

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
function parseRow<T = any>(row: any): T {
  if (!row) return row;
  if ('colleges' in row && typeof row.colleges === 'string') row.colleges = JSON.parse(row.colleges);
  if ('statLines' in row && typeof row.statLines === 'string') row.statLines = JSON.parse(row.statLines);
  if ('data' in row && typeof (row as any).data === 'string') (row as any).values = JSON.parse((row as any).data);
  if ('slots' in row && typeof row.slots === 'string') row.slots = JSON.parse(row.slots);
  return row as T;
}

// Players
app.get('/api/players', async (_req: Request, res: Response) => {
  const rows = await dbAsync.all('SELECT * FROM players');
  res.json(rows.map(parseRow<Player>));
});

app.get('/api/players/:id', async (req: Request, res: Response) => {
  const row = await dbAsync.get('SELECT * FROM players WHERE id=?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(parseRow<Player>(row));
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
    isRookie: z.boolean(),
    isBrownsStarter: z.boolean(),
    notes: z.string().optional(),
  });
  const body = schema.parse(req.body);
  await dbAsync.run(
    `INSERT OR REPLACE INTO players (id, name, team, position, colleges, draftYear, draftPick, isRookie, isBrownsStarter, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [body.id, body.name, body.team, body.position, JSON.stringify(body.colleges), body.draftYear ?? null, body.draftPick ?? null, body.isRookie ? 1 : 0, body.isBrownsStarter ? 1 : 0, body.notes ?? null]
  );
  // If rookie, ensure binder page exists and enforce max 32 rookie pages
  if (body.isRookie) {
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

const PORT = process.env.PORT || 5179;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
