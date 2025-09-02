export type Position =
  | 'QB' | 'RB' | 'WR' | 'TE' | 'OL'
  | 'DL' | 'EDGE' | 'LB' | 'CB' | 'S'
  | 'K' | 'P';

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  colleges: string[];
  draftYear?: number;
  draftPick?: number;
  isPlayer: boolean;
  isBrownsStarter: boolean;
  notes?: string;
  templateId?: string; // New: assign a template to the player
  photoUrl?: string;
}

export type StatType = 'number' | 'text' | 'calc';

export interface StatLineDef {
  key: string;
  label: string;
  type: StatType;
  formula?: string;
  perGame?: boolean;
  order: number;
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  position: Position | 'Generic';
  statLines: StatLineDef[];
}

export interface Sheet {
  id: string;
  playerId: string;
  templateId: string;
  seasonYear: number;
  values: Record<string, number | string>;
}

// New: per-game stats captured when viewing a player
export interface Game {
  id: string;
  playerId: string;
  templateId: string;
  date?: string; // ISO date string (YYYY-MM-DD)
  isBye: boolean;
  opponentAbbr?: string;
  teamScore?: number;
  oppScore?: number;
  values: Record<string, number | string>;
}

export type BinderPageType = 'Rookie' | 'Browns' | 'Extra';

export interface Binder {
  id: string;
  name: string;
  year?: number;
  pageCount?: number;
  pageSize?: number; // slots per page, e.g., 9
  coverUrl?: string;
}

export interface BinderPage {
  id: string;
  type: BinderPageType;
  binderId?: string;
  playerId?: string;
  slots: Array<{ index: number; note?: string }>;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  city?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  logoUrl?: string;
  conference?: string;
  division?: string;
}

export interface BinderPageTemplate {
  id: string;
  name: string;
  description?: string;
  rows: number;
  cols: number;
  orientation: 'portrait' | 'landscape';
  unit: 'in' | 'mm';
  slotWidth: number;
  slotHeight: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  gutterX?: number;
  gutterY?: number;
}
