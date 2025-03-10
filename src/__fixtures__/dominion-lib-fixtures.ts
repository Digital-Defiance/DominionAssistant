import { faker } from '@faker-js/faker';
import { IPlayer } from '@/game/interfaces/player';
import {
  NOT_PRESENT,
  EmptyVictoryDetails,
  EmptyMatDetails,
  DefaultTurnDetails,
  DefaultPlayerColors,
  VERSION_NUMBER,
  DefaultRenaissanceFeatures,
} from '@/game/constants';
import { calculateInitialSupply, distributeInitialSupply } from '@/game/dominion-lib';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameOptions } from '@/game/interfaces/game-options';
import { IGame } from '@/game/interfaces/game';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { deepClone } from '@/game/utils';
import { IGameRaw } from '@/game/interfaces/game-raw';

export function createMockGame(playerCount: number, overrides?: Partial<IGame>): IGame {
  const options: IGameOptions = {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false } as IExpansionsEnabled,
    mats: {
      coffersVillagers: false,
      debt: false,
      favors: false,
    } as IMatsEnabled,
    trackCardCounts: true,
    trackCardGains: true,
    trackDiscard: true,
  };
  const supply = calculateInitialSupply(playerCount, options);
  const game: IGame = {
    players: Array(playerCount)
      .fill(null)
      .map((value, index) => createMockPlayer(index, overrides?.players?.[index])),
    supply,
    options,
    expansions: {
      renaissance: DefaultRenaissanceFeatures(),
      risingSun: {
        prophecy: {
          suns: NOT_PRESENT,
        },
        greatLeaderProphecy: false,
      },
    },
    currentTurn: 1,
    currentPlayerIndex: 0,
    selectedPlayerIndex: 0,
    log: [
      {
        id: faker.string.uuid(),
        timestamp: new Date(),
        gameTime: 0,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.START_GAME,
      },
    ],
    turnStatisticsCache: [],
    currentStep: CurrentStep.Game,
    setsRequired: 1,
    gameVersion: VERSION_NUMBER,
    pendingGroupedActions: [],
    ...(overrides ? deepClone<Partial<IGame>>(overrides) : {}),
  };
  return distributeInitialSupply(game);
}

export function createMockPlayer(index?: number, overrides?: Partial<IPlayer>): IPlayer {
  return {
    name: faker.person.firstName(),
    color:
      DefaultPlayerColors[
        index ?? faker.number.int({ min: 0, max: DefaultPlayerColors.length - 1 })
      ],
    mats: EmptyMatDetails(),
    turn: DefaultTurnDetails(),
    newTurn: DefaultTurnDetails(),
    victory: EmptyVictoryDetails(),
    ...deepClone<Partial<IPlayer>>(overrides ?? {}),
  } as IPlayer;
}

export function createMockLog(log?: Partial<ILogEntry>): ILogEntry {
  const action = log?.action ?? GameLogAction.ADD_ACTIONS;
  return {
    id: faker.string.uuid(),
    timestamp: new Date(),
    gameTime: faker.number.int({ min: 0, max: 50000 }),
    playerIndex: faker.number.int({ min: 0, max: 3 }),
    currentPlayerIndex: faker.number.int({ min: 0, max: 3 }),
    turn: faker.number.int({ min: 1, max: 10 }),
    action,
    count: faker.number.int({ min: 1, max: 5 }),
    correction: false,
    // linkedActionId: faker.string.uuid(),
    prevPlayerIndex:
      log?.action && log.action === GameLogAction.START_GAME
        ? -1
        : faker.number.int({ min: 0, max: 3 }),
    ...(action === GameLogAction.NEXT_TURN
      ? { playerTurnDetails: [DefaultTurnDetails(), DefaultTurnDetails()] }
      : {}),
    ...(log ? deepClone<Partial<ILogEntry>>(log) : {}),
  };
}

export function createMockGameRaw(numPlayers: number, overrides?: Partial<IGameRaw>): IGameRaw {
  // First, create a mock game using createMockGame
  const mockGame: IGame = createMockGame(numPlayers);

  // Convert the IGame to IGameRaw
  const baseGameRaw: IGameRaw = {
    ...mockGame,
    log: mockGame.log.map((logEntry) => ({
      ...logEntry,
      timestamp: logEntry.timestamp.toISOString(),
    })),
    turnStatisticsCache: mockGame.turnStatisticsCache.map((turnStatistics) => ({
      ...turnStatistics,
      start: turnStatistics.start.toISOString(),
      end: turnStatistics.end.toISOString(),
    })),
  };

  // Apply overrides if provided
  if (overrides) {
    // Merge overrides with baseGameRaw
    Object.keys(overrides).forEach((key) => {
      if (key === 'log' && Array.isArray(overrides.log)) {
        baseGameRaw.log = overrides.log;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (baseGameRaw as any)[key] = (overrides as any)[key];
      }
    });
  }

  return baseGameRaw;
}
