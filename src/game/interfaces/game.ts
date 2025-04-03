import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayer } from '@/game/interfaces/player';
import { IRenaissanceFeatures } from '@/game/interfaces/set-features/renaissance';
import { IRisingSunFeatures } from '@/game/interfaces/set-features/rising-sun';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IGameOptions } from '@/game/interfaces/game-options';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ITurnStatistics } from '@/game/interfaces/turn-statistics';
import { IRecipeAction } from '@/game/interfaces/recipe-action';
import { IAlchemyFeatures } from './set-features/alchemy';

export interface IGame {
  /**
   * The players in the game.
   */
  players: IPlayer[];
  /**
   * The options for the game.
   */
  options: IGameOptions;
  /**
   * The supply counts of cards for the game.
   */
  supply: IGameSupply;
  /**
   * The features from the expansions.
   */
  expansions: {
    /**
     * The features from the Alchemy expansion.
     */
    alchemy: IAlchemyFeatures;
    /**
     * The features from the Renaissance expansion.
     */
    renaissance: IRenaissanceFeatures;
    /**
     * The features from the Rising Sun expansion.
     */
    risingSun: IRisingSunFeatures;
  };
  /**
   * The current turn number.
   */
  currentTurn: number;
  /**
   * The index of the current player.
   */
  currentPlayerIndex: number;
  /**
   * The index of the selected player.
   */
  selectedPlayerIndex: number;
  /**
   * The log of actions taken in the game.
   */
  log: ILogEntry[];
  /**
   * The state machine state of the game.
   */
  currentStep: CurrentStep;
  /**
   * The number of sets required to play the game for the number of players.
   */
  setsRequired: number;
  /**
   * A cache of turn statistics for the game.
   */
  turnStatisticsCache: Array<ITurnStatistics>;
  /**
   * The version of the game.
   */
  gameVersion: string;
  /**
   * The pending grouped actions that will be applied in the future.
   */
  pendingGroupedActions: Array<Partial<IRecipeAction>>;
}
