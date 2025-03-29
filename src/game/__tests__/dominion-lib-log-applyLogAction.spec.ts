import { applyLogAction } from '@/game/dominion-lib-log';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { DefaultTurnDetails } from '@/game/constants';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '../interfaces/player-game-turn-details';
import { ITurnStatistics } from '../interfaces/turn-statistics';
import { NO_PLAYER } from '../constants';

// Helper function to create NEXT_TURN log entries
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

describe('applyLogAction', () => {
  let mockGame: IGame;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGame = createMockGame(2);

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle NEXT_TURN action without creating negative counters', () => {
    const mockGame: IGame = createMockGame(2);
    const initialPlayerStates = mockGame.players.map((player) =>
      deepClone<IPlayerGameTurnDetails>(player.turn)
    );
    const gameStart = mockGame.log[0].timestamp;

    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      playerTurnDetails: [DefaultTurnDetails(), DefaultTurnDetails()],
      prevPlayerIndex: 0,
      currentPlayerIndex: 1,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    // Check that the current player index and turn have been updated
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(2);

    // Check that no player has negative counters
    result.players.forEach((player, index) => {
      expect(player.turn.actions).toBeGreaterThanOrEqual(0);
      expect(player.turn.buys).toBeGreaterThanOrEqual(0);
      expect(player.turn.coins).toBeGreaterThanOrEqual(0);

      // Check that the turn values have been reset to newTurn values
      expect(player.turn).toEqual(mockGame.players[index].newTurn);
    });

    // Verify that the previous turn details are stored in the log entry
    expect(logEntry.playerTurnDetails).toEqual(initialPlayerStates);
  });

  it('should handle NEXT_TURN action', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      prevPlayerIndex: 0,
      currentPlayerIndex: 1,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(2);
  });

  it('should wrap around player index on NEXT_TURN', () => {
    mockGame.currentPlayerIndex = 1;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 0,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      prevPlayerIndex: 1,
      currentPlayerIndex: 0,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(0);
    expect(result.currentTurn).toBe(2);
  });

  it('should update player field for ADD_ACTIONS', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(3); // Default 1 + 2
  });

  it('should update player field for REMOVE_ACTIONS', () => {
    mockGame.players[0].turn.actions = 3;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(1);
  });

  it('should update game-wide counter for ADD_PROPHECY', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 0;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_PROPHECY,
      playerIndex: 0,
      count: 3,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(3);
  });

  it('should update game-wide counter for REMOVE_PROPHECY', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 5;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_PROPHECY,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(3);
  });

  it('should not allow negative player field/subfield counters', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughSubfieldError);
  });

  it('should not allow negative game-wide counters', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun = { prophecy: { suns: 1 }, greatLeaderProphecy: true };
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_PROPHECY,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughProphecyError);
  });

  it('should use default count of 1 for ADD_PROPHECY when count is not provided', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 0;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_PROPHECY,
      playerIndex: 0,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(1);
  });

  it('should use default count of 1 for REMOVE_PROPHECY when count is not provided', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 3;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_PROPHECY,
      playerIndex: 0,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(2);
  });

  it('should handle actions with no count', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const startingActions = mockGame.players[0].turn.actions;
    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(startingActions + 1);
  });

  it('should throw for actions with invalid player index', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 99, // Invalid player index
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(Error('Invalid player index: 99'));
  });

  it('should throw for unknown action types', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: 'UNKNOWN_ACTION' as GameLogAction,
      playerIndex: 0,
      count: 1,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(
      Error('Invalid log entry action: UNKNOWN_ACTION')
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should update the selectedPlayerIndex correctly', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      id: '2',
      playerIndex: 2,
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.SELECT_PLAYER,
      currentPlayerIndex: 2,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(2);
  });

  it('should change the selectedPlayerIndex for select_player', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 2,
    });
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      id: '2',
      playerIndex: 0,
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.SELECT_PLAYER,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });

  it('should not affect selectedPlayerIndex for other actions', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      id: '2',
      playerIndex: 0,
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.ADD_ACTIONS,
      count: 1,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });

  // --- Tests for Turn Statistics Cache ---

  it('should add correct turn statistics to cache on NEXT_TURN action', () => {
    // Setup initial player states before the NEXT_TURN action is applied
    mockGame.players[0].turn = { actions: 2, buys: 1, coins: 5, cards: 3, gains: 1, discard: 0 };
    mockGame.players[1].turn = { actions: 1, buys: 2, coins: 3, cards: 5, gains: 0, discard: 2 };
    mockGame.players[0].mats = { coffers: 3, villagers: 1, debt: 0, favors: 2 };
    mockGame.players[1].mats = { coffers: 0, villagers: 0, debt: 2, favors: 0 };
    mockGame.currentTurn = 5;
    mockGame.currentPlayerIndex = 0; // Player 0's turn ends

    // Add log entries for turns 2, 3, 4, 5
    const gameStart = mockGame.log[0].timestamp;
    let currentTime = gameStart.getTime();
    let currentGameTime = 0;
    for (let i = 2; i <= 5; i++) {
      const prevPlayer = (i + mockGame.players.length - 2) % mockGame.players.length;
      const currentPlayer = (i + mockGame.players.length - 1) % mockGame.players.length;
      currentTime += 1000; // Increment time for each turn
      currentGameTime += 1000;
      mockGame.log.push(
        createNextTurnLogEntry(i, prevPlayer, currentPlayer, new Date(currentTime), currentGameTime)
      );
    }

    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1, // Player 1 starts turn 6
      id: 'next-turn-id',
      timestamp: new Date(gameStart.getTime() + 10000), // Ensure time progresses
      gameTime: 10000,
      prevPlayerIndex: 0,
      currentPlayerIndex: 1, // This will be updated by applyLogAction
      turn: 6, // This will be updated by applyLogAction
    };

    const result = applyLogAction(mockGame, logEntry);

    // Check cache after applying the action
    expect(result.turnStatisticsCache).toHaveLength(1);
    const stats: ITurnStatistics = result.turnStatisticsCache[0];

    expect(stats.turn).toBe(5); // Stats are for the turn that just ended
    expect(stats.playerIndex).toBe(0); // Player whose turn ended
    // Check player-specific stats (should reflect state *before* NEXT_TURN reset)
    expect(stats.playerActions[0]).toBe(2);
    expect(stats.playerActions[1]).toBe(1);
    expect(stats.playerBuys[0]).toBe(1);
    expect(stats.playerBuys[1]).toBe(2);
    expect(stats.playerCoins[0]).toBe(5);
    expect(stats.playerCoins[1]).toBe(3);
    expect(stats.playerCardsDrawn[0]).toBe(3);
    expect(stats.playerCardsDrawn[1]).toBe(5);
    expect(stats.playerGains[0]).toBe(1);
    expect(stats.playerGains[1]).toBe(0);
    expect(stats.playerDiscards[0]).toBe(0);
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

  it('should add correct turn statistics to cache on END_GAME action', () => {
    // Setup initial player states before the END_GAME action is applied
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

    const logEntry: ILogEntry = {
      action: GameLogAction.END_GAME,
      playerIndex: NO_PLAYER, // No specific player for END_GAME itself
      id: 'end-game-id',
      timestamp: new Date(gameStart.getTime() + 20000), // Ensure time progresses
      gameTime: 20000,
      prevPlayerIndex: 1, // Player whose turn ended
      currentPlayerIndex: 1, // Remains the same for END_GAME
      turn: 10, // Turn number when game ended
    };

    const result = applyLogAction(mockGame, logEntry);

    // Check cache after applying the action
    expect(result.turnStatisticsCache).toHaveLength(1);
    const stats: ITurnStatistics = result.turnStatisticsCache[0];

    expect(stats.turn).toBe(10); // Stats are for the turn that just ended
    expect(stats.playerIndex).toBe(1); // Player whose turn ended
    // Check player-specific stats (should reflect state *before* END_GAME)
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
});
