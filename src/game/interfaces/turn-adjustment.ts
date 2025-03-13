import { PlayerField, PlayerSubFields, ProphecyField, ProphecySubField } from '@/game/types';

export interface ITurnAdjustment {
  field: PlayerField | ProphecyField | null;
  subfield: PlayerSubFields | ProphecySubField | null;
  increment: number;
  playerIndex: number;
}
