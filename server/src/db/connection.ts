import initSqlJs, { Database as SQLJsDatabase } from 'sql.js';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'cards.db');

let db: SQLJsDatabase | null = null;

async function loadDb(): Promise<SQLJsDatabase> {
	if (db) return db;
		const SQL = await initSqlJs();
	if (fs.existsSync(dbPath)) {
		const fileBuffer = fs.readFileSync(dbPath);
		db = new SQL.Database(fileBuffer);
	} else {
		db = new SQL.Database();
	}
	return db!
}

function persist(database: SQLJsDatabase) {
		const data = database.export();
		const buffer = Buffer.from(data);
	fs.writeFileSync(dbPath, buffer);
}

export const dbAsync = {
	async exec(sql: string, params?: any[]) {
		const database = await loadDb();
		database.run(sql, params);
		persist(database);
	},
	async run(sql: string, params?: any[]) {
		const database = await loadDb();
		database.run(sql, params);
		persist(database);
	},
	async all<T = any>(sql: string, params?: any[]): Promise<T[]> {
		const database = await loadDb();
		const stmt = database.prepare(sql);
		const rows: T[] = [];
		stmt.bind(params ?? []);
		while (stmt.step()) {
			rows.push(stmt.getAsObject() as T);
		}
		stmt.free();
		return rows;
	},
	async get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
		const rows = await this.all<T>(sql, params);
		return rows[0];
	}
}

export type DB = typeof dbAsync;
