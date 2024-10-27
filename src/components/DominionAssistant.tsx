import React, { useEffect, useState } from 'react';
import AddPlayerNames from '@/components/AddPlayerNames';
import SelectFirstPlayer from '@/components/SelectFirstPlayer';
import SetGameOptions from '@/components/SetGameOptions';
import GameScreen from '@/components/GameScreen';
import EndGame from '@/components/EndGame';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { useGameContext } from '@/components/GameContext';
import { CurrentStep } from '@/game/enumerations/current-step';
import { NO_PLAYER, StepTransitions } from '@/game/constants';
import {
  EmptyGameState,
  getNextPlayerIndex,
  incrementTurnCountersAndPlayerIndices,
  resetPlayerTurnCounters,
} from '@/game/dominion-lib';
import { canUndoAction, undoAction } from '@/game/dominion-lib-undo';
import { addLogEntry } from '@/game/dominion-lib-log';
import { useAlert } from '@/components/AlertContext';
import { Location, NavigateFunction } from 'react-router-dom';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';

interface DominionAssistantProps {
  route: Location;
  navigation: NavigateFunction;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DominionAssistant: React.FC<DominionAssistantProps> = ({ route, navigation }) => {
  const { gameState, setGameState } = useGameContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canUndo, setCanUndo] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState, gameState.log]);

  const undoLastAction = () => {
    setGameState((prevGame) => {
      const { game, success } = undoAction(prevGame, prevGame.log.length - 1);
      if (!success) {
        showAlert('Undo Failed', 'Unable to undo the last action.');
        return prevGame;
      }
      return game;
    });
  };

  const nextStep = () => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      newGame.currentStep = StepTransitions[prevState.currentStep] || prevState.currentStep;
      return newGame;
    });
  };

  /**
   * Start the game with the selected players and options.
   */
  const startGame = () => {
    // The game initialization is now handled in SetGameOptions
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      newGame.currentStep = CurrentStep.GameScreen;
      return newGame;
    });
  };

  const nextTurn = () => {
    setGameState((prevGame: IGame) => {
      const newGame = deepClone(prevGame);
      const nextPlayerIndex = getNextPlayerIndex(newGame);
      addLogEntry(newGame, nextPlayerIndex, GameLogAction.NEXT_TURN, {
        currentPlayerIndex: nextPlayerIndex,
        playerTurnDetails: gameState.players.map((player) => player.turn),
        prevPlayerIndex: gameState.currentPlayerIndex,
        turn: prevGame.currentTurn + 1,
      });
      return resetPlayerTurnCounters(incrementTurnCountersAndPlayerIndices(newGame));
    });
  };

  const endGame = () => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      addLogEntry(newGame, NO_PLAYER, GameLogAction.END_GAME, {
        prevPlayerIndex: gameState.currentPlayerIndex,
      });
      newGame.currentStep = CurrentStep.EndGame;
      newGame.currentPlayerIndex = NO_PLAYER;
      newGame.selectedPlayerIndex = NO_PLAYER;
      return newGame;
    });
  };

  const resetGame = () => {
    setGameState({
      ...EmptyGameState(),
      currentStep: CurrentStep.AddPlayerNames,
    });
  };

  switch (gameState.currentStep) {
    case CurrentStep.AddPlayerNames:
      return <AddPlayerNames nextStep={nextStep} />;
    case CurrentStep.SelectFirstPlayer:
      return <SelectFirstPlayer nextStep={nextStep} />;
    case CurrentStep.SetGameOptions:
      return <SetGameOptions startGame={startGame} />;
    case CurrentStep.GameScreen:
      return <GameScreen nextTurn={nextTurn} endGame={endGame} undoLastAction={undoLastAction} />;
    case CurrentStep.EndGame:
      return <EndGame game={gameState} onNewGame={resetGame} />;
    default:
      return null;
  }
};

export default DominionAssistant;
