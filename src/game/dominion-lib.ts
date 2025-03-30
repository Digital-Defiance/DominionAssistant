import { v4 as uuidv4 } from 'uuid';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { IGameSupply } from '@/game/interfaces/game-supply';
import {
  CURSE_VP,
  DUCHY_VP,
  ESTATE_VP,
  HAND_STARTING_COPPERS,
  HAND_STARTING_ESTATES,
  PROVINCE_VP,
  COLONY_VP,
  EmptyMatDetails,
  DefaultTurnDetails,
  EmptyVictoryDetails,
  MAX_PLAYERS,
  MIN_PLAYERS,
  DefaultPlayerColors,
  HAND_STARTING_COPPERS_FROM_SUPPLY,
  HAND_STARTING_ESTATES_FROM_SUPPLY,
  NOT_PRESENT,
  NO_PLAYER,
} from '@/game/constants';
import { computeStartingSupply as computeBaseStartingSupply } from '@/game/interfaces/set-kingdom/base';
import {
  computeStartingSupply as computeProsperityStartingSupply,
  NullSet as ProsperityNullSet,
} from '@/game/interfaces/set-kingdom/prosperity';
import { IPlayer } from '@/game/interfaces/player';
import { IVictoryDetails } from '@/game/interfaces/victory-details';
import { IMatDetails } from '@/game/interfaces/mat-details';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import {
  PlayerField,
  PlayerFieldMap,
  PlayerSubFields,
  ProphecyField,
  ProphecySubField,
} from '@/game/types';
import { CurrentStep } from '@/game/enumerations/current-step';
import { calculateInitialSunTokens } from '@/game/interfaces/set-mats/prophecy';
import { IGameOptions } from '@/game/interfaces/game-options';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { NotEnoughSupplyError } from '@/game/errors/not-enough-supply';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { RankedPlayer } from '@/game/interfaces/ranked-player';
import { deepClone } from '@/game/utils';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { InvalidPlayerIndexError } from '@/game/errors/invalid-player-index';

// --- Helper Functions for updatePlayerField ---

function updateVictoryDetail(
  playerVictory: IVictoryDetails,
  subfield: keyof IVictoryDetails,
  increment: number
): void {
  const currentVal = playerVictory[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('victory', subfield);
  }
  playerVictory[subfield] = Math.max(currentVal + increment, 0);
}

function updateTurnDetail(
  playerTurn: IPlayerGameTurnDetails,
  subfield: keyof IPlayerGameTurnDetails,
  increment: number
): void {
  const currentVal = playerTurn[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('turn', subfield); // Or 'newTurn' depending on context
  }
  playerTurn[subfield] = Math.max(currentVal + increment, 0);
}

function updateMatDetail(
  playerMats: IMatDetails,
  subfield: keyof IMatDetails,
  increment: number
): void {
  const currentVal = playerMats[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('mats', subfield);
  }
  playerMats[subfield] = Math.max(currentVal + increment, 0);
}

// --- End Helper Functions ---

/**
 * Updates a specific victory subfield for a player by applying the given increment.
 *
 * This function adjusts the value of a designated subfield in the player's victory details,
 * ensuring that the result is not negative. If the new value would be below zero, it throws a
 * {@link NotEnoughSubfieldError} to prevent invalid state.
 *
 * @param playerVictory - The player's victory details.
 * @param subfield - The subfield within the victory details to update.
 * @param increment - The value to add to the current subfield value.
 *
 * @throws {NotEnoughSubfieldError} If the update would result in a negative value.
 */

function updateVictoryDetail(
  playerVictory: IVictoryDetails,
  subfield: keyof IVictoryDetails,
  increment: number
): void {
  const currentVal = playerVictory[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('victory', subfield);
  }
  playerVictory[subfield] = Math.max(currentVal + increment, 0);
}

/**
 * Updates a player's turn detail by adding the specified increment to the provided subfield.
 *
 * If the resulting value would be negative, a {@link NotEnoughSubfieldError} is thrown.
 *
 * @param playerTurn The player's current turn details.
 * @param subfield The property of the turn details to update.
 * @param increment The value to add to the subfield (can be positive or negative).
 *
 * @throws {NotEnoughSubfieldError} Thrown when the updated subfield value would be negative.
 */
function updateTurnDetail(
  playerTurn: IPlayerGameTurnDetails,
  subfield: keyof IPlayerGameTurnDetails,
  increment: number
): void {
  const currentVal = playerTurn[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('turn', subfield); // Or 'newTurn' depending on context
  }
  playerTurn[subfield] = Math.max(currentVal + increment, 0);
}

/**
 * Updates the specified subfield within the player's mat details by applying an increment.
 *
 * The function retrieves the current value of the subfield (defaulting to 0 if undefined) and adds the increment.
 * If the result is negative, it throws a NotEnoughSubfieldError to prevent an invalid state.
 *
 * @param playerMats - The player's mat details.
 * @param subfield - The specific subfield in the mat details to update.
 * @param increment - The value to apply to the current subfield (can be positive or negative).
 *
 * @throws {NotEnoughSubfieldError} If updating would result in a negative value.
 */
function updateMatDetail(
  playerMats: IMatDetails,
  subfield: keyof IMatDetails,
  increment: number
): void {
  const currentVal = playerMats[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('mats', subfield);
  }
  playerMats[subfield] = Math.max(currentVal + increment, 0);
}

// --- End Helper Functions ---

/**
 * Calculate the victory points for a player.
 * @param player - The player
 * @returns The victory points
 */
export function calculateVictoryPoints(player: IPlayer): number {
  // Add null checks and default values
  const estatePoints = (player.victory.estates || 0) * ESTATE_VP;
  const duchyPoints = (player.victory.duchies || 0) * DUCHY_VP;
  const provincePoints = (player.victory.provinces || 0) * PROVINCE_VP;
  const colonyPoints = (player.victory.colonies || 0) * COLONY_VP;
  const tokenPoints = player.victory.tokens || 0;
  const otherPoints = player.victory.other || 0;
  const cursePoints = (player.victory.curses || 0) * CURSE_VP;

  return (
    estatePoints +
    duchyPoints +
    provincePoints +
    colonyPoints +
    tokenPoints +
    otherPoints +
    cursePoints
  );
}

/**
 * Calculate the initial game kingdom card supply based on the number of players and options.
 * @param numPlayers - The number of players
 * @param options - The game options
 * @returns The initial game supply
 */
export function calculateInitialSupply(numPlayers: number, options: IGameOptions): IGameSupply {
  const baseSupply = computeBaseStartingSupply(numPlayers, options.curses);
  const prosperitySupply = options.expansions.prosperity
    ? computeProsperityStartingSupply(numPlayers)
    : ProsperityNullSet;
  return deepClone<IGameSupply>({ ...baseSupply, ...prosperitySupply });
}

/**
 * Distribute the initial supply of cards to the players.
 * @param game - The game
 * @returns The updated game
 */
export function distributeInitialSupply(game: IGame): IGame {
  const updatedGame = deepClone<IGame>(game);
  const playerCount = updatedGame.players.length;

  // If there are no players, return the game as is
  if (playerCount === 0) {
    return updatedGame;
  }

  /* do not subtract estates from the supply- the supply should
   * start with the specified number
   */
  updatedGame.players = updatedGame.players.map((player) => ({
    ...player,
    victory: {
      ...EmptyVictoryDetails(),
      estates: HAND_STARTING_ESTATES,
    },
  }));
  if (HAND_STARTING_ESTATES_FROM_SUPPLY) {
    // Subtract the distributed estates from the supply
    updatedGame.supply = {
      ...updatedGame.supply,
      estates: updatedGame.supply.estates - playerCount * HAND_STARTING_ESTATES,
    };
  }
  if (HAND_STARTING_COPPERS_FROM_SUPPLY) {
    // Subtract the distributed coppers from the supply
    updatedGame.supply = {
      ...updatedGame.supply,
      coppers: updatedGame.supply.coppers - playerCount * HAND_STARTING_COPPERS,
    };
  }
  return updatedGame;
}

/**
 * Create a new player object with default values
 * @param playerName - The name of the player
 * @param index - The index of the player
 * @returns The new player object
 */
export function newPlayer(playerName: string, index: number, color: string): IPlayer {
  const newPlayer: IPlayer = {
    name: playerName.trim(),
    color,
    mats: EmptyMatDetails(),
    turn: DefaultTurnDetails(),
    newTurn: DefaultTurnDetails(),
    victory: EmptyVictoryDetails(),
  };
  return newPlayer;
}

/**
 * Re-Initialize the game state with the given number of players and options.
 * @param gameStateWithOptions - The game state with players and selected options
 * @param gameStart - The start time of the game
 * @returns The updated game state
 */
export const NewGameState = (gameStateWithOptions: IGame, gameStart: Date): IGame => {
  let newGameState = deepClone<IGame>(gameStateWithOptions);
  const playerCount = gameStateWithOptions.players.length;

  // Check for minimum and maximum players
  if (playerCount < MIN_PLAYERS) {
    throw new MinPlayersError();
  }
  if (playerCount > MAX_PLAYERS) {
    throw new MaxPlayersError();
  }

  // Create a new game state with the initial supply, while resetting the player details
  newGameState.players = newGameState.players.map((player, index) => ({
    ...newPlayer(player.name, index, newGameState.players[index].color),
  }));
  newGameState.supply = calculateInitialSupply(
    gameStateWithOptions.players.length,
    gameStateWithOptions.options
  );
  newGameState.currentStep = CurrentStep.Game;
  newGameState.currentTurn = 1;
  newGameState.log = [
    {
      id: uuidv4(),
      timestamp: gameStart,
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.START_GAME,
    } as ILogEntry,
  ];
  newGameState.selectedPlayerIndex = 0;
  newGameState.currentPlayerIndex = 0;

  // Distribute initial supply to players
  newGameState = distributeInitialSupply(newGameState);

  // Initialize Rising Sun tokens if the expansion is enabled
  newGameState.expansions.risingSun.prophecy.suns = NOT_PRESENT;
  if (newGameState.options.expansions.risingSun) {
    newGameState.expansions.risingSun = {
      greatLeaderProphecy: newGameState.expansions.risingSun.greatLeaderProphecy,
      prophecy: calculateInitialSunTokens(newGameState.players.length),
    };
  } else {
    newGameState.expansions.risingSun = {
      greatLeaderProphecy: false,
      prophecy: { suns: NOT_PRESENT },
    };
  }
  // reset flag bearer
  newGameState.expansions.renaissance.flagBearer = null;

  return newGameState;
};

/**
 * Updates a specified field for a given player in the game state.
 *
 * This function creates a deep copy of the game state and modifies a particular field on the player,
 * delegating the update to specific helper functions based on the field type:
 * - For the 'victory' field, it verifies that the game supply has enough cards for subfields corresponding
 *   to card piles (such as estates, duchies, provinces, colonies, or curses) and adjusts the supply accordingly,
 *   unless the update is marked as a trash operation.
 * - For 'turn', 'mats', and 'newTurn', it updates the corresponding subfield using their respective helpers.
 *
 * @param game - The current game state.
 * @param playerIndex - The index of the player to update.
 * @param field - The player field to update (either 'victory', 'turn', 'mats', or 'newTurn').
 * @param subfield - The specific subfield within the selected field to update.
 * @param increment - The amount to adjust the subfield by.
 * @param victoryTrash - When updating the 'victory' field, if true, the increment does not affect the supply.
 * @returns The new game state with the updated player field.
 *
 * @throws {InvalidPlayerIndexError} If the player index is out of bounds.
 * @throws {NotEnoughSupplyError} If there is insufficient supply when decrementing a victory subfield.
 * @throws {InvalidFieldError} If the provided field type is not recognized.
 */
export function updatePlayerField<T extends keyof PlayerFieldMap>(
  game: IGame,
  playerIndex: number,
  field: T,
  subfield: PlayerFieldMap[T],
  increment: number,
  victoryTrash?: boolean
): IGame {
  const updatedGame = deepClone<IGame>(game);
  if (playerIndex < 0 || playerIndex >= updatedGame.players.length) {
    throw new InvalidPlayerIndexError(playerIndex);
  }
  const player = updatedGame.players[playerIndex];

  // Delegate to helper functions based on field type
  if (field === 'victory') {
    // Check supply before potentially modifying player state
    const decrementSupply = ['estates', 'duchies', 'provinces', 'colonies', 'curses'].includes(
      subfield as string // Cast is okay here for simple check
    );
    if (decrementSupply) {
      const supplyKey = subfield as keyof IGameSupply;
      const supplyCount = updatedGame.supply[supplyKey] as number;
      if (increment > 0 && supplyCount < increment) {
        throw new NotEnoughSupplyError(supplyKey);
      }
    }

    // Call helper
    updateVictoryDetail(player.victory, subfield as keyof IVictoryDetails, increment);

    // Update supply after successful player update
    if (decrementSupply && !victoryTrash) {
      (updatedGame.supply[subfield as keyof IGameSupply] as number) -= increment;
    }
  } else if (field === 'turn') {
    updateTurnDetail(player.turn, subfield as keyof IPlayerGameTurnDetails, increment);
  } else if (field === 'mats') {
    updateMatDetail(player.mats, subfield as keyof IMatDetails, increment);
  } else if (field === 'newTurn') {
    // Assuming newTurn has the same structure as turn for subfields
    updateTurnDetail(player.newTurn, subfield as keyof IPlayerGameTurnDetails, increment);
  } else {
    // This path should be unreachable due to the generic constraint
    throw new InvalidFieldError(`Unhandled field type: ${field as string}`);
  }

  return updatedGame;
}

/**
 * Get the field and subfield from a game log action.
 * @param action - The game log action
 * @returns The field and subfield
 */
export function getFieldAndSubfieldFromAction(action: GameLogAction): {
  field: PlayerField | ProphecyField | null;
  subfield: PlayerSubFields | ProphecySubField | null;
} {
  switch (action) {
    case GameLogAction.ADD_ACTIONS:
    case GameLogAction.REMOVE_ACTIONS:
      return { field: 'turn', subfield: 'actions' };
    case GameLogAction.ADD_BUYS:
    case GameLogAction.REMOVE_BUYS:
      return { field: 'turn', subfield: 'buys' };
    case GameLogAction.ADD_COINS:
    case GameLogAction.REMOVE_COINS:
      return { field: 'turn', subfield: 'coins' };
    case GameLogAction.ADD_CARDS:
    case GameLogAction.REMOVE_CARDS:
      return { field: 'turn', subfield: 'cards' };
    case GameLogAction.ADD_GAINS:
    case GameLogAction.REMOVE_GAINS:
      return { field: 'turn', subfield: 'gains' };
    case GameLogAction.ADD_DISCARD:
    case GameLogAction.REMOVE_DISCARD:
      return { field: 'turn', subfield: 'discard' };
    case GameLogAction.ADD_COFFERS:
    case GameLogAction.REMOVE_COFFERS:
      return { field: 'mats', subfield: 'coffers' };
    case GameLogAction.ADD_VILLAGERS:
    case GameLogAction.REMOVE_VILLAGERS:
      return { field: 'mats', subfield: 'villagers' };
    case GameLogAction.ADD_DEBT:
    case GameLogAction.REMOVE_DEBT:
      return { field: 'mats', subfield: 'debt' };
    case GameLogAction.ADD_FAVORS:
    case GameLogAction.REMOVE_FAVORS:
      return { field: 'mats', subfield: 'favors' };
    case GameLogAction.ADD_CURSES:
    case GameLogAction.REMOVE_CURSES:
      return { field: 'victory', subfield: 'curses' };
    case GameLogAction.ADD_ESTATES:
    case GameLogAction.REMOVE_ESTATES:
      return { field: 'victory', subfield: 'estates' };
    case GameLogAction.ADD_DUCHIES:
    case GameLogAction.REMOVE_DUCHIES:
      return { field: 'victory', subfield: 'duchies' };
    case GameLogAction.ADD_PROVINCES:
    case GameLogAction.REMOVE_PROVINCES:
      return { field: 'victory', subfield: 'provinces' };
    case GameLogAction.ADD_COLONIES:
    case GameLogAction.REMOVE_COLONIES:
      return { field: 'victory', subfield: 'colonies' };
    case GameLogAction.ADD_VP_TOKENS:
    case GameLogAction.REMOVE_VP_TOKENS:
      return { field: 'victory', subfield: 'tokens' };
    case GameLogAction.ADD_OTHER_VP:
    case GameLogAction.REMOVE_OTHER_VP:
      return { field: 'victory', subfield: 'other' };
    case GameLogAction.ADD_NEXT_TURN_ACTIONS:
    case GameLogAction.REMOVE_NEXT_TURN_ACTIONS:
      return { field: 'newTurn', subfield: 'actions' };
    case GameLogAction.ADD_NEXT_TURN_BUYS:
    case GameLogAction.REMOVE_NEXT_TURN_BUYS:
      return { field: 'newTurn', subfield: 'buys' };
    case GameLogAction.ADD_NEXT_TURN_COINS:
    case GameLogAction.REMOVE_NEXT_TURN_COINS:
      return { field: 'newTurn', subfield: 'coins' };
    case GameLogAction.ADD_NEXT_TURN_CARDS:
    case GameLogAction.REMOVE_NEXT_TURN_CARDS:
      return { field: 'newTurn', subfield: 'cards' };
    case GameLogAction.ADD_NEXT_TURN_DISCARD:
    case GameLogAction.REMOVE_NEXT_TURN_DISCARD:
      return { field: 'newTurn', subfield: 'discard' };
    case GameLogAction.ADD_PROPHECY:
    case GameLogAction.REMOVE_PROPHECY:
      return { field: 'prophecy', subfield: 'suns' };
    default:
      return { field: null, subfield: null };
  }
}

/**
 * Gets the index of the previous player in the game.
 * @param prevGame
 * @returns The index of the previous player
 */
export function getPreviousPlayerIndex(prevGame: IGame): number {
  if (prevGame.currentTurn <= 1) {
    return NO_PLAYER;
  }
  return getPreviousPlayerIndexByIndex(prevGame.currentPlayerIndex, prevGame.players.length);
}

/**
 * Gets the index of the previous player in the game.
 * @param currentPlayerIndex - The index of the current player in the game
 * @param playerCount - The number of players in the game
 * @returns The index of the previous player in the game
 */
export function getPreviousPlayerIndexByIndex(
  currentPlayerIndex: number,
  playerCount: number
): number {
  return playerCount === 0 ? NO_PLAYER : (currentPlayerIndex - 1 + playerCount) % playerCount;
}

/**
 * Gets the index of the next player in the game.
 * @param prevGame
 * @returns The index of the next player in the game
 */
export function getNextPlayerIndex(prevGame: IGame): number {
  return getNextPlayerIndexByIndex(prevGame.currentPlayerIndex, prevGame.players.length);
}

/**
 * Gets the index of the next player in the game.
 * @param currentPlayerIndex - The index of the current player in the game
 * @param playerCount - The number of players in the game
 * @returns The index of the next player in the game
 */
export function getNextPlayerIndexByIndex(currentPlayerIndex: number, playerCount: number): number {
  return playerCount === 0 ? NO_PLAYER : (currentPlayerIndex + 1) % playerCount;
}

/**
 * Increment the turn counters for the game.
 * @param prevGame - The previous game state
 * @returns The updated game state with incremented turn counters
 */
export function incrementTurnCountersAndPlayerIndices(prevGame: IGame): IGame {
  const nextPlayerIndex = getNextPlayerIndex(prevGame);
  const newGame = deepClone<IGame>(prevGame);
  newGame.currentTurn = prevGame.currentTurn + 1;
  newGame.currentPlayerIndex = nextPlayerIndex;
  newGame.selectedPlayerIndex = nextPlayerIndex;
  return newGame;
}

/**
 * Reset the turn counters for all players.
 * @param prevGame - The previous game state
 * @returns The updated game state with reset turn counters
 */
export function resetPlayerTurnCounters(prevGame: IGame): IGame {
  const newGame = deepClone<IGame>(prevGame);
  newGame.players = newGame.players.map((player) => ({
    ...player,
    turn: deepClone<IPlayerGameTurnDetails>(player.newTurn ?? DefaultTurnDetails()),
  }));
  return newGame;
}

/**
 * Rank players based on their victory points.
 * @param players - The list of players
 * @param calculateVictoryPoints - A function to calculate the victory points for a player
 * @returns An array of ranked players, sorted by score (descending) and then by name (ascending)
 */
export function rankPlayers(
  players: IPlayer[],
  calculateVictoryPoints: (player: IPlayer) => number
): RankedPlayer[] {
  // Calculate scores for each player
  const playersWithScores = players.map((player, index) => ({
    index,
    score: calculateVictoryPoints(player),
  }));

  // Sort players by score (descending) and then by name (ascending)
  playersWithScores.sort((a, b) => {
    if (b.score === a.score) {
      return players[a.index].name.localeCompare(players[b.index].name);
    }
    return b.score - a.score;
  });

  // Assign ranks considering ties
  const rankedPlayers: RankedPlayer[] = [];
  let currentRank = 1;

  for (let i = 0; i < playersWithScores.length; i++) {
    if (i > 0 && playersWithScores[i].score !== playersWithScores[i - 1].score) {
      currentRank = i + 1;
    }
    rankedPlayers.push({
      index: playersWithScores[i].index,
      score: playersWithScores[i].score,
      rank: currentRank,
    });
  }

  // Sort the final array by rank and then by name within the same rank
  rankedPlayers.sort((a, b) => {
    if (a.rank === b.rank) {
      return players[a.index].name.localeCompare(players[b.index].name);
    }
    return a.rank - b.rank;
  });

  return rankedPlayers;
}

/**
 * Returns the next available player color from the appropriate color palette.
 * @param players An array of players with color properties
 * @param bossEnabled Whether the boss mode is enabled
 * @returns The next available color string
 * @throws Error if there are no more available colors
 */
export function getNextAvailablePlayerColor(players: Array<{ color: string }>): string {
  // Get the set of colors currently in use
  const usedColors = new Set(
    players.filter((player) => player.color !== undefined).map((player) => player.color)
  );

  // Find the first color in the palette that isn't used
  for (const color of DefaultPlayerColors) {
    if (!usedColors.has(color)) {
      return color;
    }
  }

  throw new Error('No available colors found.');
}

// Fisher-Yates shuffle algorithm
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function shuffleArray<T extends unknown>(array: T[]): { shuffled: T[]; changed: boolean } {
  // Create a copy of the original array for comparison
  const original = [...array];

  // Create another copy for shuffling
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Compare with the original copy to check if anything changed
  let changed = false;
  for (let i = 0; i < shuffled.length; i++) {
    if (shuffled[i] !== original[i]) {
      changed = true;
      break;
    }
  }

  return { shuffled, changed };
}

/**
 * Returns the first uppercase printable character from the specified player's name, or the player's number as a fallback.
 *
 * The function inspects the player's name for a printable ASCII character. If the player's index is out of bounds,
 * the name is missing or invalid, or no printable character is found, it returns the player's number (index + 1) as a string.
 *
 * @param players - The array of player objects.
 * @param playerIndex - The index of the target player in the array.
 * @returns The uppercase printable character from the player's name, or the player's number as a string.
 */
export function getPlayerLabel(players: IPlayer[], playerIndex: number) {
  // Return player number if index is invalid
  if (!players || !Array.isArray(players) || playerIndex < 0 || playerIndex >= players.length) {
    return String(playerIndex + 1);
  }

  const player = players[playerIndex];

  // Check if player or player.name is valid
  if (!player || !player.name || typeof player.name !== 'string') {
    return String(playerIndex + 1);
  }

  // Loop through name characters to find first printable one
  for (let i = 0; i < player.name.length; i++) {
    const char = player.name.charAt(i);

    // Check if character is a printable ASCII character
    // This regex matches alphanumeric characters and common printable symbols
    // eslint-disable-next-line no-useless-escape
    if (/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]$/.test(char)) {
      return char.toUpperCase();
    }
  }

  // Fallback to player number if no printable characters found
  return String(playerIndex + 1);
}
