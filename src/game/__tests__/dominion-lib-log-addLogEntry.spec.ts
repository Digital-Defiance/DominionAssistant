import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { InvalidTrashActionError } from '@/game/errors/invalid-trash-action';
import { AdjustmentActions, NO_PLAYER, NoPlayerActions } from '../constants';
import { GamePausedError } from '../errors/game-paused';
import { CountRequiredError } from '../errors/count-required';
import { ILogEntry } from '../interfaces/log-entry'; // Import ILogEntry if needed for helper
import { ITurnStatistics } from '../interfaces/turn-statistics';

// Helper function (optional, could be inline)
const createNextTurnLogEntry = (
  turn: number,
  prevPlayerIndex: number,
  currentPlayerIndex: number,
  timestamp: Date,
  gameTime: number
): ILogEntry => ({
  action: GameLogAction.NEXT_TURN,
  playerIndex: currentPlayerIndex,
  id: `turn-${turn}`,
  timestamp,
  gameTime,
  prevPlayerIndex,
  currentPlayerIndex,
  turn,
});

describe('addLogEntry', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a log entry with minimal fields', () => {
    addLogEntry(mockGame, 0, GameLogAction.START_GAME, { turn: 1 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.START_GAME,
        turn: 1,
      })
    );
  });

  it('should add a log entry with all fields', () => {
    addLogEntry(mockGame, 0, GameLogAction.REMOVE_ESTATES, {
      count: 1,
      correction: false,
      linkedActionId: 'linkedActionId',
      playerTurnDetails: [],
      trash: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.REMOVE_ESTATES,
        count: 1,
        correction: false,
        linkedActionId: 'linkedActionId',
        playerTurnDetails: [],
        trash: true,
      })
    );
  });

  it('should add a log entry with only some fields overridden', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, { count: 5 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
      })
    );
  });

  it('should handle invalid player index gracefully', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.ADD_COINS, { count: 5 });
    }).toThrow('Player index is out of range');
  });

  it('should add a log entry with a correction flag', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with player turn details', () => {
    const playerTurnDetails = [
      { playerIndex: 0, actions: 1, buys: 1, coins: 1, cards: 5, gains: 0, discard: 0 },
    ];
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, {
      count: 5,
      playerTurnDetails,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
        playerTurnDetails,
      })
    );
  });

  // New edge cases
  it('should throw an error when player index is required but not provided', () => {
    expect(() => {
      addLogEntry(mockGame, -1, GameLogAction.ADD_COINS, { count: 5 });
    }).toThrow('Player index is required for this action');
  });

  it('should throw an error when player index is out of range', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.ADD_COINS, { count: 5 });
    }).toThrow('Player index is out of range');
  });

  it('should throw an error when player index is provided for an action that does not require it', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.END_GAME, { count: 5 });
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1', () => {
    addLogEntry(mockGame, -1, GameLogAction.END_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogAction.END_GAME,
      })
    );
  });

  it('should throw an error when player index is provided for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.END_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should throw an error when player index is out of range for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.END_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1 with overrides', () => {
    addLogEntry(mockGame, -1, GameLogAction.END_GAME, {
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogAction.END_GAME,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with overrides', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with minimal overrides', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, { count: 1 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 1,
      })
    );
  });

  it('should throw an error if you try to mark trash a non-removal action as trash', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.ADD_ACTIONS, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
  });
  it('should throw an error if you try to mark trash a a positive increase action as trash', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.ADD_ESTATES, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
  });
  it('should throw an error if you try to mark trash something other than a victory card', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.REMOVE_ACTIONS, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
  });

  it('should not throw an error if you try to mark trash a victory card', () => {
    addLogEntry(mockGame, 0, GameLogAction.REMOVE_ESTATES, {
      count: 1,
      trash: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.REMOVE_ESTATES,
        count: 1,
        trash: true,
      })
    );
  });

  it.each(AdjustmentActions)(
    'should throw an error when an adjustment action is performed without a count',
    (action: GameLogAction) => {
      expect(() => {
        addLogEntry(mockGame, 0, action);
      }).toThrow(CountRequiredError);
    }
  );

  // --- Tests for Turn Statistics Cache ---

  it('should add correct turn statistics to cache on NEXT_TURN', () => {
    // Setup initial player states
    mockGame.players[0].turn = { actions: 2, buys: 1, coins: 5, cards: 3, gains: 1, discard: 0 };
    mockGame.players[1].turn = { actions: 1, buys: 2, coins: 3, cards: 5, gains: 0, discard: 2 };
    mockGame.players[0].mats = { coffers: 3, villagers: 1, debt: 0, favors: 2 };
    mockGame.players[1].mats = { coffers: 0, villagers: 0, debt: 2, favors: 0 };
    mockGame.currentTurn = 5;
    mockGame.currentPlayerIndex = 0; // Player 0's turn ends

    addLogEntry(mockGame, 1, GameLogAction.NEXT_TURN, { prevPlayerIndex: 0 }); // Player 1 starts turn 6

    expect(mockGame.turnStatisticsCache).toHaveLength(1);
    const stats: ITurnStatistics = mockGame.turnStatisticsCache[0];

    expect(stats.turn).toBe(5);
    expect(stats.playerIndex).toBe(0); // Player whose turn ended
    // Check player-specific stats
    expect(stats.playerActions[0]).toBe(2);
    expect(stats.playerActions[1]).toBe(1);
    expect(stats.playerBuys[0]).toBe(1);
    expect(stats.playerBuys[1]).toBe(2);
    expect(stats.playerCoins[0]).toBe(5);
    expect(stats.playerCoins[1]).toBe(3);
    expect(stats.playerCardsDrawn[0]).toBe(3); // Drawn cards
    expect(stats.playerCardsDrawn[1]).toBe(5);
    expect(stats.playerGains[0]).toBe(1);
    expect(stats.playerGains[1]).toBe(0);
    expect(stats.playerDiscards[0]).toBe(0); // Discarded cards
    expect(stats.playerDiscards[1]).toBe(2);
    expect(stats.playerCoffers[0]).toBe(3);
    expect(stats.playerCoffers[1]).toBe(0);
    expect(stats.playerVillagers[0]).toBe(1);
    expect(stats.playerVillagers[1]).toBe(0);
    expect(stats.playerDebt[0]).toBe(0);
    expect(stats.playerDebt[1]).toBe(2);
    expect(stats.playerFavors[0]).toBe(2);
    expect(stats.playerFavors[1]).toBe(0);
  });

  it('should add correct turn statistics to cache on END_GAME', () => {
    // Setup initial player states
    mockGame.players[0].turn = { actions: 0, buys: 1, coins: 2, cards: 4, gains: 0, discard: 1 };
    mockGame.players[1].turn = { actions: 3, buys: 1, coins: 7, cards: 2, gains: 2, discard: 0 };
    mockGame.players[0].mats = { coffers: 1, villagers: 0, debt: 1, favors: 0 };
    mockGame.players[1].mats = { coffers: 2, villagers: 3, debt: 0, favors: 5 };
    mockGame.currentTurn = 10;
    mockGame.currentPlayerIndex = 1; // Player 1's turn ends

    // Add log entries for turns 2 through 10
    const gameStart = mockGame.log[0].timestamp;
    let currentTime = gameStart.getTime();
    let currentGameTime = 0;
    for (let i = 2; i <= 10; i++) {
      const prevPlayer = (i + mockGame.players.length - 2) % mockGame.players.length;
      const currentPlayer = (i + mockGame.players.length - 1) % mockGame.players.length;
      currentTime += 1000; // Increment time for each turn
      currentGameTime += 1000;
      mockGame.log.push(
        createNextTurnLogEntry(i, prevPlayer, currentPlayer, new Date(currentTime), currentGameTime)
      );
    }

    addLogEntry(mockGame, NO_PLAYER, GameLogAction.END_GAME, { prevPlayerIndex: 1 });

    expect(mockGame.turnStatisticsCache).toHaveLength(1);
    const stats: ITurnStatistics = mockGame.turnStatisticsCache[0];

    expect(stats.turn).toBe(10);
    expect(stats.playerIndex).toBe(1); // Player whose turn ended
    // Check player-specific stats
    expect(stats.playerActions[0]).toBe(0);
    expect(stats.playerActions[1]).toBe(3);
    expect(stats.playerBuys[0]).toBe(1);
    expect(stats.playerBuys[1]).toBe(1);
    expect(stats.playerCoins[0]).toBe(2);
    expect(stats.playerCoins[1]).toBe(7);
    expect(stats.playerCardsDrawn[0]).toBe(4);
    expect(stats.playerCardsDrawn[1]).toBe(2);
    expect(stats.playerGains[0]).toBe(0);
    expect(stats.playerGains[1]).toBe(2);
    expect(stats.playerDiscards[0]).toBe(1);
    expect(stats.playerDiscards[1]).toBe(0);
    expect(stats.playerCoffers[0]).toBe(1);
    expect(stats.playerCoffers[1]).toBe(2);
    expect(stats.playerVillagers[0]).toBe(0);
    expect(stats.playerVillagers[1]).toBe(3);
    expect(stats.playerDebt[0]).toBe(1);
    expect(stats.playerDebt[1]).toBe(0);
    expect(stats.playerFavors[0]).toBe(0);
    expect(stats.playerFavors[1]).toBe(5);
  });

  // --- End Turn Statistics Cache Tests ---

  it.each(
    Object.values(GameLogAction).filter((action: GameLogAction) => action !== GameLogAction.UNPAUSE)
  )(
    'should not allow any action besides unpause after the game is paused (%s)',
    (action: GameLogAction) => {
      // Simulate the game being paused
      mockGame.log.push(createMockLog({ action: GameLogAction.PAUSE }));

      // Attempt to perform the action
      // AdjustmentActions require a count, actions not in NoPlayerActions require a playerIndex
      const playerIndex = NoPlayerActions.includes(action) ? NO_PLAYER : 0;
      const overrides = AdjustmentActions.includes(action) ? { count: 1 } : {};

      expect(() => addLogEntry(mockGame, playerIndex, action, overrides)).toThrow(GamePausedError);
    }
  );
});
