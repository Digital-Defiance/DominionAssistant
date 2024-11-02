import {
  createMockGame,
  createMockGameRaw,
  createMockLog,
} from '@/__fixtures__/dominion-lib-fixtures';
import { convertGameRawToGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { GameLogAction } from '@/game/enumerations/game-log-action';

const mockGame: IGame = createMockGame(2, {
  log: [
    createMockLog({
      id: '1',
      action: GameLogAction.START_GAME,
      timestamp: new Date('2023-01-01T00:00:00Z'),
      count: 3,
      currentPlayerIndex: 0,
      playerIndex: 3,
      prevPlayerIndex: 1,
      turn: 1,
      correction: false,
      linkedActionId: '1ab917db-9d17-419f-8b16-3e068d58b85e',
    }),
    createMockLog({
      id: '2',
      action: GameLogAction.NEXT_TURN,
      timestamp: new Date('2023-01-01T01:00:00Z'),
      count: 3,
      currentPlayerIndex: 0,
      playerIndex: 2,
      prevPlayerIndex: 3,
      turn: 3,
      correction: false,
      linkedActionId: 'ea926061-1113-4760-abc5-56fbe7f3a5ce',
    }),
  ],
  timeCache: [
    {
      eventId: '1',
      totalPauseTime: 0,
      inSaveState: false,
      inPauseState: false,
      saveStartTime: null,
      pauseStartTime: null,
      adjustedDuration: 0,
      turnPauseTime: 0,
    },
    {
      eventId: '2',
      totalPauseTime: 0,
      inSaveState: false,
      inPauseState: false,
      saveStartTime: null,
      pauseStartTime: null,
      adjustedDuration: 0,
      turnPauseTime: 0,
    },
  ],
  risingSun: {
    greatLeaderProphecy: false,
    prophecy: {
      suns: 5,
    },
  },
});

// Mock data
const mockGameRaw: IGameRaw = createMockGameRaw(2, {
  log: [
    {
      ...createMockLog({
        id: '1',
        action: GameLogAction.START_GAME,
        turn: 1,
        count: 3,
        currentPlayerIndex: 0,
        playerIndex: 3,
        prevPlayerIndex: 1,
        correction: false,
        linkedActionId: '1ab917db-9d17-419f-8b16-3e068d58b85e',
      }),
      timestamp: '2023-01-01T00:00:00Z',
    },
    {
      ...createMockLog({
        id: '2',
        action: GameLogAction.NEXT_TURN,
        turn: 3,
        count: 3,
        currentPlayerIndex: 0,
        playerIndex: 2,
        prevPlayerIndex: 3,
        correction: false,
        linkedActionId: 'ea926061-1113-4760-abc5-56fbe7f3a5ce',
      }),
      timestamp: '2023-01-01T01:00:00Z',
    },
  ],
  timeCache: [
    {
      eventId: '1',
      totalPauseTime: 0,
      inSaveState: false,
      inPauseState: false,
      saveStartTime: null,
      pauseStartTime: null,
      adjustedDuration: 0,
      turnPauseTime: 0,
    },
    {
      eventId: '2',
      totalPauseTime: 0,
      inSaveState: false,
      inPauseState: false,
      saveStartTime: null,
      pauseStartTime: null,
      adjustedDuration: 0,
      turnPauseTime: 0,
    },
  ],
  risingSun: {
    greatLeaderProphecy: false,
    prophecy: {
      suns: 5,
    },
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
          ...createMockLog({ id: '1', action: GameLogAction.START_GAME, turn: 1 }),
          timestamp: 'invalid-date',
        },
      ],
    };
    expect(() => convertGameRawToGame(invalidGameRaw)).toThrow('Invalid timestamp: invalid-date');
  });
});
