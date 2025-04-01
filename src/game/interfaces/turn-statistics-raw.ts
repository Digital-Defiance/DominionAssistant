import { IGameSupply } from '@/game/interfaces/game-supply';

export interface ITurnStatisticsRaw {
  /**
   * The turn number
   */
  turn: number;
  /**
   * The score of each player at the end of the turn
   */
  playerScores: { [playerIndex: number]: number };
  /**
   * The number of actions played by each player during the turn
   */
  playerActions: { [playerIndex: number]: number };
  /**
   * The number of buys used by each player during the turn
   */
  playerBuys: { [playerIndex: number]: number };
  /**
   * The amount of coin generated/spent by each player during the turn
   */
  playerCoins: { [playerIndex: number]: number };
  /**
   * The number of cards drawn by each player during the turn
   */
  playerCardsDrawn: { [playerIndex: number]: number };
  /**
   * The number of cards gained by each player during the turn
   */
  playerGains: { [playerIndex: number]: number };
  /**
   * The number of cards discarded by each player during the turn
   */
  playerDiscards: { [playerIndex: number]: number };
  /**
   * The Coffer count for each player at the end of the turn
   */
  playerCoffers: { [playerIndex: number]: number };
  /**
   * The Villager count for each player at the end of the turn
   */
  playerVillagers: { [playerIndex: number]: number };
  /**
   * The Debt count for each player at the end of the turn
   */
  playerDebt: { [playerIndex: number]: number };
  /**
   * The Favor count for each player at the end of the turn
   */
  playerFavors: { [playerIndex: number]: number };
  /**
   * The supply at the end of the turn
   */
  supply: IGameSupply;
  /**
   * The index of the player whose turn it was
   */
  playerIndex: number;
  /**
   * The start time of the turn
   */
  start: string;
  /**
   * The end time of the turn
   */
  end: string;
  /**
   * The duration of the turn in milliseconds
   */
  turnDuration: number;
}
