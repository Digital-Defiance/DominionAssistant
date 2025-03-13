import { IGameOptions } from '@/game/interfaces/game-options';
import { IPlayer } from '@/game/interfaces/player';
import { IProphecyMat } from './interfaces/set-mats/prophecy';

export type TurnField = 'actions' | 'buys' | 'coins' | 'cards' | 'gains' | 'discard';
export type VictoryField =
  | 'curses'
  | 'estates'
  | 'duchies'
  | 'provinces'
  | 'colonies'
  | 'tokens'
  | 'other';
export type MatField = 'coffers' | 'villagers' | 'debt' | 'favors';

export type PlayerFieldMap = {
  turn: TurnField;
  victory: VictoryField;
  mats: MatField;
  newTurn: TurnField;
};

export type PlayerField = 'turn' | 'mats' | 'victory' | 'newTurn';
export type PlayerSubField<T extends PlayerField> = keyof IPlayer[T];
export type PlayerSubFields =
  | PlayerSubField<'turn'>
  | PlayerSubField<'mats'>
  | PlayerSubField<'victory'>
  | PlayerSubField<'newTurn'>;

export type OptionField = keyof IGameOptions;
export type OptionSubField<T extends OptionField> = T extends 'curses'
  ? boolean
  : keyof IGameOptions[T];

export type ProphecyField = 'prophecy';
export type ProphecySubField = keyof IProphecyMat;

export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];
