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
  isRookie: boolean;
  isBrownsStarter: boolean;
  notes?: string;
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

export type BinderPageType = 'Rookie' | 'Browns' | 'Extra';

export interface BinderPage {
  id: string;
  type: BinderPageType;
  playerId?: string;
  slots: Array<{ index: number; note?: string }>;
}
