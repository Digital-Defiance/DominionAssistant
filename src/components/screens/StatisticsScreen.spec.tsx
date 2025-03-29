import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react'; // Added cleanup
import '@testing-library/jest-dom';
import StatisticsScreen from './StatisticsScreen';
// import { GameProvider } from '@/components/GameContext'; // No longer needed
import { useGameContext } from '@/components/GameContext'; // Import the hook to mock
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ITurnStatistics } from '@/game/interfaces/turn-statistics';
import { IGameSupply } from '@/game/interfaces/game-supply'; // Import IGameSupply for mock

// Mock the Line component from react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(({ data }) => (
    <div data-testid={`chart-${data.datasets[0]?.label || 'unknown'}`} />
  )),
}));

// Mock the TabTitle component
jest.mock('@/components/TabTitle', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tab-title">{children}</div>
  ),
}));

// Mock the ScrollableContainer component
jest.mock('@/components/ScrollableContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scrollable-container">{children}</div>
  ),
}));

// Mock the useGameContext hook
jest.mock('@/components/GameContext', () => ({
  useGameContext: jest.fn(),
}));
const mockedUseGameContext = useGameContext as jest.Mock;

const renderWithMockContext = (game: IGame) => {
  // Setup the mock for useGameContext to return the desired game state
  mockedUseGameContext.mockReturnValue({ gameState: game });

  return render(
    // Render the component directly, context is mocked
    <StatisticsScreen />
  );
};

// Helper to create a valid mock supply
const createMockSupply = (overrides: Partial<IGameSupply> = {}): IGameSupply => ({
  coppers: 46,
  silvers: 40,
  golds: 30,
  platinums: 0, // Added default
  // potions: 10, // Removed - not in IGameSupply
  estates: 6,
  duchies: 8,
  provinces: 8,
  colonies: 0, // Added default
  curses: 10,
  ...overrides,
});

describe('StatisticsScreen', () => {
  let mockGame: IGame;

  beforeEach(() => {
    // Create a base mock game with some stats
    mockGame = createMockGame(2);
    mockGame.currentStep = CurrentStep.Game;
    mockGame.turnStatisticsCache = [
      {
        turn: 1,
        playerScores: { 0: 3, 1: 3 },
        playerActions: { 0: 1, 1: 1 },
        playerBuys: { 0: 1, 1: 1 },
        playerCoins: { 0: 0, 1: 0 },
        playerCardsDrawn: { 0: 5, 1: 5 },
        playerGains: { 0: 0, 1: 0 },
        playerDiscards: { 0: 0, 1: 0 },
        playerCoffers: { 0: 0, 1: 0 },
        playerVillagers: { 0: 0, 1: 0 },
        playerDebt: { 0: 0, 1: 0 },
        playerFavors: { 0: 0, 1: 0 },
        supply: createMockSupply({ estates: 6 }), // Use helper
        playerIndex: 0,
        start: new Date(),
        end: new Date(),
        turnDuration: 1000,
      },
      {
        turn: 2,
        playerScores: { 0: 3, 1: 6 },
        playerActions: { 0: 2, 1: 1 },
        playerBuys: { 0: 1, 1: 2 },
        playerCoins: { 0: 3, 1: 5 },
        playerCardsDrawn: { 0: 5, 1: 5 },
        playerGains: { 0: 0, 1: 1 },
        playerDiscards: { 0: 1, 1: 0 },
        playerCoffers: { 0: 1, 1: 0 },
        playerVillagers: { 0: 0, 1: 1 },
        playerDebt: { 0: 0, 1: 0 },
        playerFavors: { 0: 0, 1: 0 },
        supply: createMockSupply({ silvers: 39 }), // Use helper
        playerIndex: 1,
        start: new Date(),
        end: new Date(),
        turnDuration: 1500,
      },
    ] as ITurnStatistics[]; // Cast to ensure type correctness
  });

  afterEach(() => {
    // Reset mocks and cleanup DOM after each test
    jest.clearAllMocks();
    cleanup(); // Add cleanup here
  });

  it('renders standard graphs when game has started and has turns', () => {
    renderWithMockContext(mockGame);
    expect(screen.getByText('Player Scores')).toBeInTheDocument();
    expect(screen.getByText('Victory Supply Counts')).toBeInTheDocument();
    expect(screen.getByText('Turn Times')).toBeInTheDocument();
  });

  it('renders checkboxes for always-enabled stats', () => {
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Buys')).toBeInTheDocument();
    expect(screen.getByLabelText('Coins')).toBeInTheDocument();
  });

  it('renders Gains checkbox only if trackCardGains is true', () => {
    mockGame.options.trackCardGains = true;
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Gains')).toBeInTheDocument();

    cleanup(); // Explicit cleanup before re-render
    mockGame.options.trackCardGains = false;
    renderWithMockContext(mockGame);
    expect(screen.queryByLabelText('Gains')).not.toBeInTheDocument();
  });

  it('renders Discards checkbox only if trackDiscard is true', () => {
    // Updated label
    mockGame.options.trackDiscard = true;
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Discards')).toBeInTheDocument(); // Updated label

    cleanup(); // Explicit cleanup before re-render
    mockGame.options.trackDiscard = false;
    renderWithMockContext(mockGame);
    expect(screen.queryByLabelText('Discards')).not.toBeInTheDocument(); // Updated label
  });

  it('renders Coffers/Villagers checkboxes only if mats.coffersVillagers is true', () => {
    mockGame.options.mats.coffersVillagers = true;
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Coffers')).toBeInTheDocument();
    expect(screen.getByLabelText('Villagers')).toBeInTheDocument();

    cleanup(); // Explicit cleanup before re-render
    mockGame.options.mats.coffersVillagers = false;
    renderWithMockContext(mockGame);
    expect(screen.queryByLabelText('Coffers')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Villagers')).not.toBeInTheDocument();
  });

  it('renders Debt checkbox only if mats.debt is true', () => {
    mockGame.options.mats.debt = true;
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Debt')).toBeInTheDocument();

    cleanup(); // Explicit cleanup before re-render
    mockGame.options.mats.debt = false;
    renderWithMockContext(mockGame);
    expect(screen.queryByLabelText('Debt')).not.toBeInTheDocument();
  });

  it('renders Favors checkbox only if mats.favors is true', () => {
    mockGame.options.mats.favors = true;
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Favors')).toBeInTheDocument();

    cleanup(); // Explicit cleanup before re-render
    mockGame.options.mats.favors = false;
    renderWithMockContext(mockGame);
    expect(screen.queryByLabelText('Favors')).not.toBeInTheDocument();
  });

  it('renders Cards Drawn checkbox only if trackCardCounts is true', () => {
    // Updated label
    mockGame.options.trackCardCounts = true;
    renderWithMockContext(mockGame);
    expect(screen.getByLabelText('Cards Drawn')).toBeInTheDocument(); // Updated label

    cleanup(); // Explicit cleanup before re-render
    mockGame.options.trackCardCounts = false;
    renderWithMockContext(mockGame);
    expect(screen.queryByLabelText('Cards Drawn')).not.toBeInTheDocument(); // Updated label
  });

  it('toggles graph visibility when checkbox is clicked', () => {
    // Ensure the checkbox is visible first
    mockGame.options.trackCardGains = true;
    renderWithMockContext(mockGame);

    const gainsCheckbox = screen.getByLabelText('Gains') as HTMLInputElement;
    const gainsGraphTitle = 'Gains per Player Turn'; // Updated title

    // Initially visible by default if option is true
    expect(screen.getByText(gainsGraphTitle)).toBeInTheDocument();
    expect(gainsCheckbox.checked).toBe(true);

    // Click to hide
    fireEvent.click(gainsCheckbox);
    expect(screen.queryByText(gainsGraphTitle)).not.toBeInTheDocument();
    expect(gainsCheckbox.checked).toBe(false);

    // Click to show again
    fireEvent.click(gainsCheckbox);
    expect(screen.getByText(gainsGraphTitle)).toBeInTheDocument();
    expect(gainsCheckbox.checked).toBe(true);
  });

  it('does not render graphs or tables if game not started', () => {
    mockGame.currentStep = CurrentStep.AddPlayerNames; // Corrected enum
    renderWithMockContext(mockGame);
    expect(screen.getByText('The game has not started yet.')).toBeInTheDocument();
    expect(screen.queryByText('Player Scores')).not.toBeInTheDocument();
    expect(screen.queryByText('Player Statistics Graphs')).not.toBeInTheDocument();
  });

  it('does not render graphs or tables if no turns completed', () => {
    mockGame.turnStatisticsCache = [];
    renderWithMockContext(mockGame);
    expect(
      screen.getByText('At least one turn must be completed to show statistics.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Player Scores')).not.toBeInTheDocument();
    expect(screen.queryByText('Player Statistics Graphs')).not.toBeInTheDocument();
  });

  // --- Tests for Player Filtering ---
  it('renders the player filter section and checkboxes', () => {
    renderWithMockContext(mockGame);
    expect(screen.getByText('Filter Players')).toBeInTheDocument();
    mockGame.players.forEach((player) => {
      const checkbox = screen.getByLabelText(player.name) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.checked).toBe(true); // Initially all players should be visible
    });
  });

  it('toggles player visibility when a player filter checkbox is clicked', () => {
    renderWithMockContext(mockGame);
    const player1Checkbox = screen.getByLabelText(mockGame.players[0].name) as HTMLInputElement;

    // Initial state
    expect(player1Checkbox.checked).toBe(true);

    // Click to hide player 1
    fireEvent.click(player1Checkbox);
    expect(player1Checkbox.checked).toBe(false);

    // Click to show player 1 again
    fireEvent.click(player1Checkbox);
    expect(player1Checkbox.checked).toBe(true);
  });
});
