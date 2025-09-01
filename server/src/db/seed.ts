import { dbAsync } from './connection.ts';
import { migrate } from './migrate.ts';
import { Template } from '../types.ts';

await migrate();

async function upsertTemplate(t: Template) {
  const exists = await dbAsync.get<{ id: string }>('SELECT id FROM templates WHERE id=?', [t.id]);
  const statLines = JSON.stringify(t.statLines);
  if (exists) {
    await dbAsync.run('UPDATE templates SET name=?, position=?, statLines=? WHERE id=?', [t.name, t.position, statLines, t.id]);
  } else {
    await dbAsync.run('INSERT INTO templates (id, name, position, statLines) VALUES (?,?,?,?)', [t.id, t.name, t.position, statLines]);
  }
}

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

for (const t of defaults) await upsertTemplate(t);

// Seed one sample player
const playerId = 'sample-rookie-1';
const exists = await dbAsync.get<{ id: string }>('SELECT id FROM players WHERE id=?', [playerId]);
if (!exists) {
  await dbAsync.run(
    `INSERT INTO players (id, name, team, position, colleges, draftYear, draftPick, isRookie, isBrownsStarter, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      playerId,
      'Sample Rookie',
      'CLE',
      'WR',
      JSON.stringify(['Ohio State']),
      2025,
      18,
      1,
      0,
      'Explosive slot receiver.'
    ]
  );
}

console.log('Seed complete.');
