import { dbAsync } from './connection.ts';
import { migrate } from './migrate.ts';
import { Template, Team } from '../types.ts';

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

async function upsertTeam(t: Team) {
  const exists = await dbAsync.get<{ id: string }>('SELECT id FROM teams WHERE id=?', [t.id]);
  if (exists) {
    await dbAsync.run(
      'UPDATE teams SET name=?, code=?, city=?, colorPrimary=?, colorSecondary=?, logoUrl=?, conference=?, division=? WHERE id=?',
      [t.name, t.code, t.city || null, t.colorPrimary || null, t.colorSecondary || null, t.logoUrl || null, t.conference || null, t.division || null, t.id]
    );
  } else {
    await dbAsync.run(
      'INSERT INTO teams (id, name, code, city, colorPrimary, colorSecondary, logoUrl, conference, division) VALUES (?,?,?,?,?,?,?,?,?)',
      [t.id, t.name, t.code, t.city || null, t.colorPrimary || null, t.colorSecondary || null, t.logoUrl || null, t.conference || null, t.division || null]
    );
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

// Seed NFL teams
const teams: Team[] = [
  // AFC East
  { id: 'team-buf', name: 'Bills', code: 'BUF', city: 'Buffalo', colorPrimary: '#00338D', colorSecondary: '#C60C30', conference: 'AFC', division: 'East' },
  { id: 'team-mia', name: 'Dolphins', code: 'MIA', city: 'Miami', colorPrimary: '#008E97', colorSecondary: '#FC4C02', conference: 'AFC', division: 'East' },
  { id: 'team-ne', name: 'Patriots', code: 'NE', city: 'New England', colorPrimary: '#002244', colorSecondary: '#C60C30', conference: 'AFC', division: 'East' },
  { id: 'team-nyj', name: 'Jets', code: 'NYJ', city: 'New York', colorPrimary: '#125740', colorSecondary: '#FFFFFF', conference: 'AFC', division: 'East' },
  
  // AFC North
  { id: 'team-bal', name: 'Ravens', code: 'BAL', city: 'Baltimore', colorPrimary: '#241773', colorSecondary: '#000000', conference: 'AFC', division: 'North' },
  { id: 'team-cin', name: 'Bengals', code: 'CIN', city: 'Cincinnati', colorPrimary: '#FB4F14', colorSecondary: '#000000', conference: 'AFC', division: 'North' },
  { id: 'team-cle', name: 'Browns', code: 'CLE', city: 'Cleveland', colorPrimary: '#311D00', colorSecondary: '#FF3C00', conference: 'AFC', division: 'North' },
  { id: 'team-pit', name: 'Steelers', code: 'PIT', city: 'Pittsburgh', colorPrimary: '#FFB612', colorSecondary: '#101820', conference: 'AFC', division: 'North' },
  
  // AFC South
  { id: 'team-hou', name: 'Texans', code: 'HOU', city: 'Houston', colorPrimary: '#03202F', colorSecondary: '#A71930', conference: 'AFC', division: 'South' },
  { id: 'team-ind', name: 'Colts', code: 'IND', city: 'Indianapolis', colorPrimary: '#002C5F', colorSecondary: '#A2AAAD', conference: 'AFC', division: 'South' },
  { id: 'team-jax', name: 'Jaguars', code: 'JAX', city: 'Jacksonville', colorPrimary: '#006778', colorSecondary: '#9F792C', conference: 'AFC', division: 'South' },
  { id: 'team-ten', name: 'Titans', code: 'TEN', city: 'Tennessee', colorPrimary: '#0C2340', colorSecondary: '#4B92DB', conference: 'AFC', division: 'South' },
  
  // AFC West
  { id: 'team-den', name: 'Broncos', code: 'DEN', city: 'Denver', colorPrimary: '#FB4F14', colorSecondary: '#002244', conference: 'AFC', division: 'West' },
  { id: 'team-kc', name: 'Chiefs', code: 'KC', city: 'Kansas City', colorPrimary: '#E31837', colorSecondary: '#FFB81C', conference: 'AFC', division: 'West' },
  { id: 'team-lv', name: 'Raiders', code: 'LV', city: 'Las Vegas', colorPrimary: '#000000', colorSecondary: '#A5ACAF', conference: 'AFC', division: 'West' },
  { id: 'team-lac', name: 'Chargers', code: 'LAC', city: 'Los Angeles', colorPrimary: '#0080C6', colorSecondary: '#FFC20E', conference: 'AFC', division: 'West' },
  
  // NFC East
  { id: 'team-dal', name: 'Cowboys', code: 'DAL', city: 'Dallas', colorPrimary: '#003594', colorSecondary: '#041E42', conference: 'NFC', division: 'East' },
  { id: 'team-nyg', name: 'Giants', code: 'NYG', city: 'New York', colorPrimary: '#0B2265', colorSecondary: '#A71930', conference: 'NFC', division: 'East' },
  { id: 'team-phi', name: 'Eagles', code: 'PHI', city: 'Philadelphia', colorPrimary: '#004C54', colorSecondary: '#A5ACAF', conference: 'NFC', division: 'East' },
  { id: 'team-was', name: 'Commanders', code: 'WAS', city: 'Washington', colorPrimary: '#5A1414', colorSecondary: '#FFB612', conference: 'NFC', division: 'East' },
  
  // NFC North
  { id: 'team-chi', name: 'Bears', code: 'CHI', city: 'Chicago', colorPrimary: '#0B162A', colorSecondary: '#C83803', conference: 'NFC', division: 'North' },
  { id: 'team-det', name: 'Lions', code: 'DET', city: 'Detroit', colorPrimary: '#0076B6', colorSecondary: '#B0B7BC', conference: 'NFC', division: 'North' },
  { id: 'team-gb', name: 'Packers', code: 'GB', city: 'Green Bay', colorPrimary: '#203731', colorSecondary: '#FFB612', conference: 'NFC', division: 'North' },
  { id: 'team-min', name: 'Vikings', code: 'MIN', city: 'Minnesota', colorPrimary: '#4F2683', colorSecondary: '#FFC62F', conference: 'NFC', division: 'North' },
  
  // NFC South
  { id: 'team-atl', name: 'Falcons', code: 'ATL', city: 'Atlanta', colorPrimary: '#A71930', colorSecondary: '#000000', conference: 'NFC', division: 'South' },
  { id: 'team-car', name: 'Panthers', code: 'CAR', city: 'Carolina', colorPrimary: '#0085CA', colorSecondary: '#101820', conference: 'NFC', division: 'South' },
  { id: 'team-no', name: 'Saints', code: 'NO', city: 'New Orleans', colorPrimary: '#D3BC8D', colorSecondary: '#101820', conference: 'NFC', division: 'South' },
  { id: 'team-tb', name: 'Buccaneers', code: 'TB', city: 'Tampa Bay', colorPrimary: '#D50A0A', colorSecondary: '#FF7900', conference: 'NFC', division: 'South' },
  
  // NFC West
  { id: 'team-ari', name: 'Cardinals', code: 'ARI', city: 'Arizona', colorPrimary: '#97233F', colorSecondary: '#000000', conference: 'NFC', division: 'West' },
  { id: 'team-lar', name: 'Rams', code: 'LAR', city: 'Los Angeles', colorPrimary: '#003594', colorSecondary: '#FFA300', conference: 'NFC', division: 'West' },
  { id: 'team-sf', name: '49ers', code: 'SF', city: 'San Francisco', colorPrimary: '#AA0000', colorSecondary: '#B3995D', conference: 'NFC', division: 'West' },
  { id: 'team-sea', name: 'Seahawks', code: 'SEA', city: 'Seattle', colorPrimary: '#002244', colorSecondary: '#69BE28', conference: 'NFC', division: 'West' }
];

for (const t of teams) await upsertTeam(t);

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
