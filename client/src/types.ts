export type Position =
  | 'QB' | 'RB' | 'WR' | 'TE' | 'OL'
  | 'DL' | 'EDGE' | 'LB' | 'CB' | 'S'
  | 'K' | 'P';

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position | string;
  colleges: string[];
  draftYear?: number;
  draftPick?: number;
  isPlayer: boolean;
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
  position: Position | 'Generic' | string;
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
  type: BinderPageType | string;
  playerId?: string;
  slots: Array<{ index: number; note?: string }>;
}
