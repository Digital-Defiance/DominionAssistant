import { CurrentStep } from '@/game/enumerations/current-step';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IMatDetails } from '@/game/interfaces/mat-details';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IVictoryDetails } from '@/game/interfaces/victory-details';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IGameOptions } from '@/game/interfaces/game-options';
import { deepClone } from '@/game/utils';
import { IGame } from '@/game/interfaces/game';
import { ISupplyInfo } from '@/game/interfaces/supply-info';
import { IRenaissanceFeatures } from '@/game/interfaces/set-features/renaissance';
import { IRisingSunFeatures } from '@/game/interfaces/set-features/rising-sun';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';
import { calculateInitialSunTokens } from '@/game/interfaces/set-mats/prophecy';
import { VictoryField } from './types';
import { IAlchemyFeatures } from './interfaces/set-features/alchemy';

/**
 * The current game version
 */
export const VERSION_NUMBER = '0.15.5' as const;
/**
 * The lowest version of the game that is compatible with this version of the save game format.
 */
export const MINIMUM_COMPATIBLE_SAVE_VERSION = '0.15.1' as const;

export const MIN_PLAYERS = 2 as const;
export const MAX_PLAYERS = 6 as const;
export const NO_PLAYER = -1 as const;
export const NOT_PRESENT = -1 as const;
// Base Set
export const ESTATE_COST = 2 as const;
export const ESTATE_VP = 1 as const;
export const DUCHY_COST = 5 as const;
export const DUCHY_VP = 3 as const;
export const PROVINCE_COST = 8 as const;
export const PROVINCE_VP = 6 as const;
export const CURSE_COST = 0 as const;
export const CURSE_VP = -1 as const;
export const COPPER_COST = 0 as const;
export const COPPER_VALUE = 1 as const;
export const SILVER_COST = 3 as const;
export const SILVER_VALUE = 2 as const;
export const GOLD_COST = 6 as const;
export const GOLD_VALUE = 3 as const;
export const HAND_STARTING_ESTATES = 3 as const;
export const HAND_STARTING_ESTATES_FROM_SUPPLY = false as const;
export const HAND_STARTING_COPPERS = 7 as const;
export const HAND_STARTING_COPPERS_FROM_SUPPLY = true as const;
// Prosperity Kingdom
export const PLATINUM_TOTAL_COUNT = 12;
export const PLATINUM_COST = 9 as const;
export const PLATINUM_VALUE = 5 as const;
export const COLONY_TOTAL_COUNT_2P = 8 as const;
export const COLONY_TOTAL_COUNT = 12 as const;
export const COLONY_COST = 11 as const;
export const COLONY_VP = 10 as const;

// game defaults
export const DEFAULT_TURN_ACTIONS = 1 as const;
export const DEFAULT_TURN_BUYS = 1 as const;
export const DEFAULT_TURN_COINS = 0 as const;
export const DEFAULT_TURN_CARDS = 5 as const;

/**
 * Default values for the expansions enabled.
 * @returns The default expansions enabled.
 */
export function DefaultExpansionsEnabled(): IExpansionsEnabled {
  return deepClone<IExpansionsEnabled>({
    alchemy: false,
    prosperity: false,
    renaissance: false,
    risingSun: false,
  });
}

/**
 * Default (zero) values for the mats enabled.
 */
export function DefaultMatsEnabled(): IMatsEnabled {
  return deepClone<IMatsEnabled>({
    coffersVillagers: false,
    debt: false,
    favors: false,
  });
}

/**
 * Default values for the game options.
 */
export function DefaultGameOptions(): IGameOptions {
  return deepClone<IGameOptions>({
    curses: true,
    expansions: DefaultExpansionsEnabled(),
    mats: DefaultMatsEnabled(),
    trackCardCounts: true,
    trackCardGains: true,
    trackDiscard: true,
  });
}

/**
 * Default (zero) values for the game supply.
 */
export function EmptyGameSupply(): IGameSupply {
  return deepClone<IGameSupply>({
    coppers: 0,
    silvers: 0,
    golds: 0,
    platinums: 0,
    estates: 0,
    duchies: 0,
    provinces: 0,
    colonies: 0,
    curses: 0,
  });
}

/**
 * Default (zero) values for the mat details.
 */
export function EmptyMatDetails(): IMatDetails {
  return deepClone<IMatDetails>({
    villagers: 0,
    coffers: 0,
    debt: 0,
    favors: 0,
  });
}

/**
 * Default (zero) values for the player game turn details.
 */
export function DefaultTurnDetails(): IPlayerGameTurnDetails {
  return deepClone<IPlayerGameTurnDetails>({
    actions: DEFAULT_TURN_ACTIONS,
    buys: DEFAULT_TURN_BUYS,
    coins: DEFAULT_TURN_COINS,
    cards: DEFAULT_TURN_CARDS,
    gains: 0,
    discard: 0,
  });
}

/**
 * Default (zero) values for the victory details.
 */
export function EmptyVictoryDetails(): IVictoryDetails {
  return deepClone<IVictoryDetails>({
    tokens: 0,
    estates: 0,
    duchies: 0,
    provinces: 0,
    colonies: 0,
    other: 0,
    curses: 0,
  });
}

/**
 * Default values for the alchemy features.
 * @returns The default alchemy features.
 */
export function DefaultAlchemyFeatures(): IAlchemyFeatures {
  return deepClone<IAlchemyFeatures>({
    trackPotions: true,
  });
}

/**
 * Default values for the renaissance set
 * @returns The default renaissance features.
 */
export function DefaultRenaissanceFeatures(): IRenaissanceFeatures {
  return deepClone<IRenaissanceFeatures>({
    flagBearerEnabled: false,
    flagBearer: null,
  });
}

export function DefaultRisingSunFeatures(): IRisingSunFeatures {
  return deepClone<IRisingSunFeatures>({
    prophecy: { suns: NOT_PRESENT },
    greatLeaderProphecy: false,
  });
}

export function EnabledRisingSunFeatures(
  numPlayers: number,
  greatLeaderProphecy = true
): IRisingSunFeatures {
  return deepClone<IRisingSunFeatures>({
    prophecy: calculateInitialSunTokens(numPlayers),
    greatLeaderProphecy,
  });
}

// Base Supply calculations from https://wiki.dominionstrategy.com/index.php/Gameplay
// Prosperity Supply calculations from https://wiki.dominionstrategy.com/index.php/Prosperity

/**
 * Calculate the supply for a two player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function TwoPlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 1,
    supply: deepClone<IGameSupply>({
      estates: 8,
      duchies: 8,
      provinces: 8,
      coppers: 46,
      silvers: 40,
      golds: 30,
      curses: 10,
      colonies: prosperity ? 8 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a three player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function ThreePlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 1,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 39,
      silvers: 40,
      golds: 30,
      curses: 20,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a four player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function FourPlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 1,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a five player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function FivePlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 2,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 15,
      coppers: 85, // Two sets
      silvers: 80, // Two sets
      golds: 60, // Two sets
      curses: 40,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a six player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function SixPlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 2,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 18,
      coppers: 78, // Two sets
      silvers: 80, // Two sets
      golds: 60, // Two sets
      curses: 50,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a given player count.
 * @param playerCount The number of players.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function SupplyForPlayerCount(playerCount: number, prosperity: boolean): ISupplyInfo {
  switch (playerCount) {
    case 2:
      return TwoPlayerSupply(prosperity);
    case 3:
      return ThreePlayerSupply(prosperity);
    case 4:
      return FourPlayerSupply(prosperity);
    case 5:
      return FivePlayerSupply(prosperity);
    case 6:
      return SixPlayerSupply(prosperity);
    default:
      throw new Error(`Invalid player count: ${playerCount}`);
  }
}

/**
 * A basic game state with no players or options.
 */
export function EmptyGameState(): IGame {
  return deepClone<IGame>({
    currentStep: 1,
    players: [],
    setsRequired: 1,
    supply: EmptyGameSupply(),
    options: DefaultGameOptions(),
    currentTurn: 1,
    expansions: {
      alchemy: DefaultAlchemyFeatures(),
      renaissance: DefaultRenaissanceFeatures(),
      risingSun: DefaultRisingSunFeatures(),
    },
    currentPlayerIndex: NO_PLAYER,
    selectedPlayerIndex: NO_PLAYER,
    log: [],
    turnStatisticsCache: [],
    gameVersion: VERSION_NUMBER,
    pendingGroupedActions: [],
  });
}

/**
 * A list of actions that do not affect player state.
 */
export const NoPlayerActions: GameLogAction[] = [
  GameLogAction.END_GAME,
  GameLogAction.SAVE_GAME,
  GameLogAction.LOAD_GAME,
  GameLogAction.PAUSE,
  GameLogAction.UNPAUSE,
] as const;

/**
 * A list of actions that require a count
 */
export const AdjustmentActions: GameLogAction[] = [
  // turn actions
  GameLogAction.ADD_ACTIONS,
  GameLogAction.REMOVE_ACTIONS,
  GameLogAction.ADD_COINS,
  GameLogAction.REMOVE_COINS,
  GameLogAction.ADD_BUYS,
  GameLogAction.REMOVE_BUYS,
  GameLogAction.ADD_CARDS,
  GameLogAction.REMOVE_CARDS,
  GameLogAction.ADD_POTIONS,
  GameLogAction.REMOVE_POTIONS,
  GameLogAction.ADD_GAINS,
  GameLogAction.REMOVE_GAINS,
  GameLogAction.ADD_DISCARD,
  GameLogAction.REMOVE_DISCARD,
  // mats
  GameLogAction.ADD_COFFERS,
  GameLogAction.REMOVE_COFFERS,
  GameLogAction.ADD_VILLAGERS,
  GameLogAction.REMOVE_VILLAGERS,
  GameLogAction.ADD_DEBT,
  GameLogAction.REMOVE_DEBT,
  GameLogAction.ADD_FAVORS,
  GameLogAction.REMOVE_FAVORS,
  // global mats
  GameLogAction.ADD_PROPHECY,
  GameLogAction.REMOVE_PROPHECY,
  // victory points
  GameLogAction.ADD_ESTATES,
  GameLogAction.REMOVE_ESTATES,
  GameLogAction.ADD_DUCHIES,
  GameLogAction.REMOVE_DUCHIES,
  GameLogAction.ADD_PROVINCES,
  GameLogAction.REMOVE_PROVINCES,
  GameLogAction.ADD_COLONIES,
  GameLogAction.REMOVE_COLONIES,
  GameLogAction.ADD_VP_TOKENS,
  GameLogAction.REMOVE_VP_TOKENS,
  GameLogAction.ADD_OTHER_VP,
  GameLogAction.REMOVE_OTHER_VP,
  GameLogAction.ADD_CURSES,
  GameLogAction.REMOVE_CURSES,
  // next turn actions
  GameLogAction.ADD_NEXT_TURN_ACTIONS,
  GameLogAction.REMOVE_NEXT_TURN_ACTIONS,
  GameLogAction.ADD_NEXT_TURN_BUYS,
  GameLogAction.REMOVE_NEXT_TURN_BUYS,
  GameLogAction.ADD_NEXT_TURN_COINS,
  GameLogAction.REMOVE_NEXT_TURN_COINS,
  GameLogAction.ADD_NEXT_TURN_POTIONS,
  GameLogAction.REMOVE_NEXT_TURN_POTIONS,
  GameLogAction.ADD_NEXT_TURN_CARDS,
  GameLogAction.REMOVE_NEXT_TURN_CARDS,
  GameLogAction.ADD_NEXT_TURN_DISCARD,
  GameLogAction.REMOVE_NEXT_TURN_DISCARD,
] as const;

/**
 * A list of actions that have a negative adjustment.
 */
export const NegativeAdjustmentActions: GameLogAction[] = [
  // turn actions
  GameLogAction.REMOVE_ACTIONS,
  GameLogAction.REMOVE_COINS,
  GameLogAction.REMOVE_BUYS,
  GameLogAction.REMOVE_CARDS,
  GameLogAction.REMOVE_POTIONS,
  GameLogAction.REMOVE_GAINS,
  GameLogAction.REMOVE_DISCARD,
  // mats
  GameLogAction.REMOVE_COFFERS,
  GameLogAction.REMOVE_VILLAGERS,
  GameLogAction.REMOVE_DEBT,
  GameLogAction.REMOVE_FAVORS,
  // global mats
  GameLogAction.REMOVE_PROPHECY,
  // victory points
  GameLogAction.REMOVE_ESTATES,
  GameLogAction.REMOVE_DUCHIES,
  GameLogAction.REMOVE_PROVINCES,
  GameLogAction.REMOVE_COLONIES,
  GameLogAction.REMOVE_VP_TOKENS,
  GameLogAction.REMOVE_OTHER_VP,
  GameLogAction.REMOVE_CURSES,
  // next turn actions
  GameLogAction.REMOVE_NEXT_TURN_ACTIONS,
  GameLogAction.REMOVE_NEXT_TURN_BUYS,
  GameLogAction.REMOVE_NEXT_TURN_COINS,
  GameLogAction.REMOVE_NEXT_TURN_POTIONS,
  GameLogAction.REMOVE_NEXT_TURN_CARDS,
  GameLogAction.REMOVE_NEXT_TURN_DISCARD,
] as const;

/**
 * Actions that have an associated player index. Others are expected to have NO_PLAYER (-1).
 */
export const ActionsWithPlayer: GameLogAction[] = [
  ...AdjustmentActions,
  GameLogAction.START_GAME,
  GameLogAction.NEXT_TURN,
  GameLogAction.SELECT_PLAYER,
  GameLogAction.GROUPED_ACTION,
] as const;

/**
 * Actions that can only be undone if they are the last action in the game log.
 */
export const ActionsWithOnlyLastActionUndo: GameLogAction[] = [
  GameLogAction.SELECT_PLAYER,
  GameLogAction.NEXT_TURN,
] as const;

/**
 * Actions that cannot be undone.
 */
export const NoUndoActions: GameLogAction[] = [
  ...NoPlayerActions,
  GameLogAction.START_GAME,
] as const;

/**
 * State machine transitions for the game steps.
 */
export const StepTransitions: Record<CurrentStep, CurrentStep> = {
  [CurrentStep.AddPlayerNames]: CurrentStep.SelectFirstPlayer,
  [CurrentStep.SelectFirstPlayer]: CurrentStep.SetGameOptions,
  [CurrentStep.SetGameOptions]: CurrentStep.Game,
  [CurrentStep.Game]: CurrentStep.EndGame,
  [CurrentStep.EndGame]: CurrentStep.EndGame,
} as const;

/**
 * Victory sub-fields that have a supply value that needs to be tracked.
 */
export const VictoryFieldToSupplyFieldMap: Record<
  VictoryField,
  { gameSupply: keyof IGameSupply; victoryDetails: keyof IVictoryDetails } | undefined
> = {
  estates: { gameSupply: 'estates', victoryDetails: 'estates' },
  duchies: { gameSupply: 'duchies', victoryDetails: 'duchies' },
  provinces: { gameSupply: 'provinces', victoryDetails: 'provinces' },
  colonies: { gameSupply: 'colonies', victoryDetails: 'colonies' },
  curses: { gameSupply: 'curses', victoryDetails: 'curses' },
  other: undefined,
  tokens: undefined,
} as const;

export const SaveGameStorageKey = '@dominion_saved_games' as const;
export const SaveGameStorageKeyPrefix = '@dominion_game_' as const;
export const AutoSaveGameSaveName = 'AutoSave' as const;
export const AutoSaveGameSaveId = 'autosave' as const;

export const DefaultPlayerColors = [
  '#e57373',
  '#64b5f6',
  '#81c784',
  '#ffd54f',
  '#ba68c8',
  '#4db6ac',
] as const;

export const APP_TITLE = 'Unofficial Dominion Assistant' as const;
export const APP_TAGLINE = 'Build Your Empire, Track Your Triumph' as const;
export const APP_SHORT_DESCRIPTION =
  'This React application enhances your Dominion gameplay experience with comprehensive features for game management, scoring, and player interaction.' as const;
export const APP_FEATURES = [
  'Player Management: Add, remove, and track multiple players',
  'Dynamic Scoring: Real-time calculation and leaderboard',
  'Game Setup Wizard: Customizable game modes and expansions',
  'Turn Tracking: Keep track of player turns and phases',
  'Detailed Game Log: Record and review game events',
  'Expansion Support: Compatible with various Dominion expansions',
  'Save/Load Games: Save progress and resume later',
  'Intuitive UI: User-friendly Material-UI components',
  'Victory point graphing/statistics',
  'Most-recent move is auto-saved to local storage',
] as const;
export const APP_MINI_DISCLAIMER =
  'Unofficial Dominion Assistant is an open-source project and not affiliated with or endorsed by the makers of Dominion or Donald X Vaccarino. It is offered free of charge and is provided as-is, and with limited support. Please consider supporting Digital Defiance to promote open source and help us to serve the open source community.' as const;
export const APP_MINI_DISCLAIMER_NOTE =
  'Please note that this tool requires the physical game of Dominion to play.' as const;

export const TITLE_FONT = 'CharlemagneStdBold' as const;
