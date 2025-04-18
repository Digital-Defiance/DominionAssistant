import {
  createMockGame,
  createMockGameRaw,
  createMockLog,
} from '@/__fixtures__/dominion-lib-fixtures';
import { convertGameRawToGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import {
  DefaultAlchemyFeatures,
  DefaultRenaissanceFeatures,
  EnabledRisingSunFeatures,
} from '@/game/constants';
import { getNextPlayerIndexByIndex } from '../dominion-lib';

const numPlayers = 2;
const nextPlayerIndex = getNextPlayerIndexByIndex(0, numPlayers);

const mockGame: IGame = createMockGame(numPlayers, {
  currentPlayerIndex: 0,
  selectedPlayerIndex: 0,
  log: [
    createMockLog({
      id: '1',
      action: GameLogAction.START_GAME,
      timestamp: new Date('2023-01-01T00:00:00Z'),
      gameTime: 0,
      count: 3,
      currentPlayerIndex: 0,
      playerIndex: 0,
      prevPlayerIndex: -1,
      turn: 1,
      correction: false,
      linkedActionId: '1ab917db-9d17-419f-8b16-3e068d58b85e',
    }),
    createMockLog({
      id: '2',
      action: GameLogAction.NEXT_TURN,
      timestamp: new Date('2023-01-01T01:00:00Z'),
      gameTime: 60 * 60 * 1000,
      count: 3,
      currentPlayerIndex: nextPlayerIndex,
      playerIndex: nextPlayerIndex,
      prevPlayerIndex: 0,
      turn: 3,
      correction: false,
      linkedActionId: 'ea926061-1113-4760-abc5-56fbe7f3a5ce',
    }),
  ],
  expansions: {
    alchemy: DefaultAlchemyFeatures(),
    renaissance: DefaultRenaissanceFeatures(),
    risingSun: EnabledRisingSunFeatures(2),
  },
});

// Mock data
const mockGameRaw: IGameRaw = createMockGameRaw(numPlayers, {
  currentPlayerIndex: mockGame.currentPlayerIndex,
  selectedPlayerIndex: mockGame.selectedPlayerIndex,
  log: [
    {
      ...createMockLog({
        id: '1',
        action: GameLogAction.START_GAME,
        gameTime: 0,
        turn: 1,
        count: 3,
        currentPlayerIndex: 0,
        playerIndex: 0,
        correction: false,
        linkedActionId: '1ab917db-9d17-419f-8b16-3e068d58b85e',
      }),
      timestamp: '2023-01-01T00:00:00Z',
    },
    {
      ...createMockLog({
        id: '2',
        action: GameLogAction.NEXT_TURN,
        gameTime: 60 * 60 * 1000,
        turn: 3,
        count: 3,
        currentPlayerIndex: nextPlayerIndex,
        playerIndex: nextPlayerIndex,
        prevPlayerIndex: 0,
        correction: false,
        linkedActionId: 'ea926061-1113-4760-abc5-56fbe7f3a5ce',
      }),
      timestamp: '2023-01-01T01:00:00Z',
    },
  ],
  expansions: {
    alchemy: DefaultAlchemyFeatures(),
    renaissance: DefaultRenaissanceFeatures(),
    risingSun: EnabledRisingSunFeatures(2),
  },
  players: mockGame.players,
});

describe('convertGameRawToGame', () => {
  it('should convert a valid IGameRaw object to IGame', () => {
    const result = convertGameRawToGame(mockGameRaw);
    expect(result).toEqual(mockGame);
  });

  it('should throw an error for invalid timestamp', () => {
    const invalidGameRaw = {
      ...mockGameRaw,
      log: [
        {
          ...createMockLog({ id: '1', action: GameLogAction.START_GAME, turn: 1, gameTime: 0 }),
          timestamp: 'invalid-date',
        },
      ],
    };
    expect(() => convertGameRawToGame(invalidGameRaw)).toThrow('Invalid timestamp: invalid-date');
  });
});
