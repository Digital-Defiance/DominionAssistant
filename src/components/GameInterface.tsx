import React, { FC, SyntheticEvent, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  styled,
  Tab,
  Tabs,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Undo as UndoIcon,
  SkipNext as NextTurnIcon,
  Stop as EndGameIcon,
} from '@mui/icons-material';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { canUndoAction } from '@/game/dominion-lib-undo';
import { useGameContext } from '@/components/GameContext';
import SupplyCounts from '@/components/SupplyCounts';
import GameClock from '@/components/GameClock';
import { CurrentStep } from '@/game/enumerations/current-step';
import {
  addLogEntry,
  applyGroupedAction,
  applyGroupedActionSubAction,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { NO_PLAYER } from '@/game/constants';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import TurnAdjustmentsSummary from '@/components/TurnAdjustments';
import FloatingCounter from '@/components/FloatingCounter';
import { RecipesList } from '@/components/RecipeList';
import ForwardRefBox from '@/components/ForwardRefBox';
import { RecipeKey, Recipes, RecipeSections } from '@/components/Recipes';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeSummaryDialog } from '@/components/RecipeSummaryDialog';
import { useAlert } from '@/components/AlertContext';
import { PlayerBar } from './PlayerBar';

interface GameInterfaceProps {
  nextTurn: () => void;
  endGame: () => void;
  undoLastAction: () => void;
}

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  minHeight: '70vh',
  marginTop: 0,
  paddingTop: 0,
  [theme.breakpoints.down('sm')]: {
    padding: 0,
  },
}));

const FabContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    bottom: theme.spacing(8),
    right: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

const GameInterface: FC<GameInterfaceProps> = ({ nextTurn, endGame, undoLastAction }) => {
  const { gameState, setGameState } = useGameContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [canUndo, setCanUndo] = useState(false);
  const [confirmEndGameDialogOpen, setConfirmEndGameDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRecipeSection, setSelectedRecipeSection] = useState<RecipeSections | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeKey | null>(null);
  const viewBoxRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const recipeDialogTriggerRef = useRef<HTMLButtonElement>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      if (viewBoxRef.current) {
        const rect = viewBoxRef.current.getBoundingClientRect();
        const style = getComputedStyle(viewBoxRef.current);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        const paddingTop = parseFloat(style.paddingTop) || 0;
        const paddingBottom = parseFloat(style.paddingBottom) || 0;
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;

        const totalVerticalMargin = marginTop + marginBottom;
        const totalVerticalPadding = paddingTop + paddingBottom;
        const totalHorizontalMargin = marginLeft + marginRight;
        const totalHorizontalPadding = paddingLeft + paddingRight;

        setContainerHeight(rect.height - totalVerticalMargin - totalVerticalPadding);
        setContainerWidth(rect.width - totalHorizontalMargin - totalHorizontalPadding);
      }
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenConfirmEndGameDialog = () => {
    setConfirmEndGameDialogOpen(true);
  };

  const handleCloseConfirmEndGameDialog = () => {
    setConfirmEndGameDialogOpen(false);
  };

  const handleConfirmEndGame = () => {
    setConfirmEndGameDialogOpen(false);
    endGame();
  };

  const onApply = (section: RecipeSections, recipeKey: RecipeKey) => {
    const recipeSection = Recipes[section];
    const groupedAction = recipeSection.recipes[recipeKey] as IGroupedAction;

    if (!groupedAction) {
      return;
    }

    try {
      const newGame = applyGroupedAction(
        gameState,
        groupedAction,
        new Date(),
        applyGroupedActionSubAction,
        prepareGroupedActionTriggers,
        recipeKey
      );
      setGameState(newGame);
    } catch (error) {
      if (error instanceof Error) {
        showAlert(`${groupedAction.name} Failed`, error.message);
      } else {
        showAlert(`${groupedAction.name} Failed`, 'Unknown error');
      }
    }
  };

  const lastAction =
    gameState.log.length > 0 ? gameState.log[gameState.log.length - 1].action : null;
  const lastActionIsPause = lastAction === GameLogAction.PAUSE;
  const lastActionIsNotPause = lastAction !== GameLogAction.PAUSE;

  const handlePauseUnpause = () => {
    if (lastActionIsPause) {
      // Unpause the game
      setGameState((prevState) => {
        const newState = deepClone<IGame>(prevState);
        const lastLogEntry = newState.log[newState.log.length - 1];
        if (lastLogEntry.action !== GameLogAction.PAUSE) {
          return prevState;
        }
        addLogEntry(newState, NO_PLAYER, GameLogAction.UNPAUSE, {
          gameTime: lastLogEntry.gameTime,
        });
        return newState;
      });
    } else {
      // Pause the game
      setGameState((prevState) => {
        const newState = deepClone<IGame>(prevState);
        addLogEntry(newState, NO_PLAYER, GameLogAction.PAUSE);
        return newState;
      });
    }
  };

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue !== 3) {
      setSelectedRecipeSection(null);
      setSelectedRecipe(null);
    }
  };

  const onDetails = (section: RecipeSections, recipeKey: RecipeKey) => {
    setSelectedRecipeSection(section);
    setSelectedRecipe(recipeKey);
    setIsRecipeDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsRecipeDialogOpen(false);
    setSelectedRecipe(null);
    // Focus back on the trigger button after closing the dialog
    if (recipeDialogTriggerRef.current) {
      recipeDialogTriggerRef.current.focus();
    }
  };

  return (
    <>
      <Container
        ref={viewportRef}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: { xs: 0.5, sm: 1, md: 2 },
          overflow: 'auto',
          maxWidth: '100%',
          paddingBottom: { xs: '80px', sm: '70px' },
        }}
      >
        <PlayerBar />
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{ mt: { xs: 1, sm: 2 }, minHeight: { xs: 40, sm: 48 } }}
        >
          <Tab label={isMobile ? 'Player' : 'Player'} sx={{ minWidth: { xs: 60, sm: 90 } }} />
          <Tab label={isMobile ? 'Score' : 'Scoreboard'} sx={{ minWidth: { xs: 60, sm: 90 } }} />
          <Tab label={isMobile ? 'Adjust' : 'Adjustments'} sx={{ minWidth: { xs: 60, sm: 90 } }} />
          <Tab label={isMobile ? 'Supply' : 'Supply'} sx={{ minWidth: { xs: 60, sm: 90 } }} />
          <Tab
            label={isMobile ? 'Actions' : 'Common Actions'}
            sx={{ minWidth: { xs: 60, sm: 90 } }}
          />
        </Tabs>
        <ForwardRefBox
          ref={viewBoxRef}
          sx={{
            p: { xs: 0.5, sm: 2 },
            flex: 1,
            overflow: 'hidden',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {tabValue === 0 && <Player containerHeight={containerHeight} />}
          {tabValue === 1 && <Scoreboard />}
          {tabValue === 2 && <TurnAdjustmentsSummary containerHeight={containerHeight} />}
          {tabValue === 3 && <SupplyCounts containerHeight={containerHeight} />}
          {tabValue === 4 && (
            <RecipesList
              containerHeight={containerHeight}
              containerWidth={containerWidth}
              onApply={onApply}
              onDetails={onDetails}
            />
          )}
        </ForwardRefBox>
      </Container>
      <FabContainer>
        <Tooltip title="Next Turn">
          <Fab
            color="primary"
            aria-label="next-turn"
            onClick={nextTurn}
            disabled={!lastActionIsNotPause}
            size={isMobile ? 'small' : 'medium'}
          >
            <NextTurnIcon fontSize={isMobile ? 'small' : 'medium'} />
          </Fab>
        </Tooltip>
        <Tooltip title="Undo the most recent update">
          <Fab
            color="secondary"
            aria-label="undo"
            onClick={undoLastAction}
            disabled={!canUndo && !lastActionIsNotPause}
            size={isMobile ? 'small' : 'medium'}
          >
            <UndoIcon fontSize={isMobile ? 'small' : 'medium'} />
          </Fab>
        </Tooltip>
        <Tooltip title={lastActionIsNotPause ? 'Pause the game' : 'Unpause the game'}>
          <Fab
            color="primary"
            aria-label={lastActionIsNotPause ? 'pause' : 'unpause'}
            onClick={handlePauseUnpause}
            size={isMobile ? 'small' : 'medium'}
          >
            {lastActionIsNotPause ? (
              <PauseIcon fontSize={isMobile ? 'small' : 'medium'} />
            ) : (
              <PlayIcon fontSize={isMobile ? 'small' : 'medium'} />
            )}
          </Fab>
        </Tooltip>
        <Tooltip title="End Game">
          <Fab
            color="secondary"
            aria-label="end-game"
            onClick={handleOpenConfirmEndGameDialog}
            disabled={!lastActionIsNotPause}
            size={isMobile ? 'small' : 'medium'}
          >
            <EndGameIcon fontSize={isMobile ? 'small' : 'medium'} />
          </Fab>
        </Tooltip>
      </FabContainer>
      {gameState.currentStep === CurrentStep.Game && (
        <>
          <GameClock />
          {!isMobile && <FloatingCounter />}
        </>
      )}
      <Dialog open={confirmEndGameDialogOpen} onClose={handleCloseConfirmEndGameDialog}>
        <DialogTitle>Confirm End Game</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to end the game?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmEndGameDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmEndGame} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <RecipeSummaryDialog
        open={isRecipeDialogOpen}
        section={selectedRecipeSection ? Recipes[selectedRecipeSection] : null}
        recipe={
          selectedRecipe && selectedRecipeSection
            ? Recipes[selectedRecipeSection].recipes[selectedRecipe]
            : null
        }
        onClose={handleCloseDetailsDialog}
      />
    </>
  );
};

export default GameInterface;
