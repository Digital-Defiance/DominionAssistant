import React, { FC, MouseEvent, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Link,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Icon for corrections
import LinkIcon from '@mui/icons-material/Link';
import UndoIcon from '@mui/icons-material/Undo';
import AdjustmentsIcon from '@mui/icons-material/Tune';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGameContext } from '@/components/GameContext';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { canUndoAction, undoAction } from '@/game/dominion-lib-undo';
import { formatTimeSpan, getSignedCount, logEntryToString } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { AdjustmentActions } from '@/game/constants';
import ColoredPlayerName from '@/components/ColoredPlayerName';
import '@/styles.scss';
import { Recipes } from './Recipes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/pro-solid-svg-icons';
import { PlayerChip } from './PlayerChip';
import { getFieldAndSubfieldFromAction, getPlayerLabel } from '@/game/dominion-lib';

interface GameLogEntryProps {
  logIndex: number;
  entry: ILogEntry;
  onOpenTurnAdjustmentsDialog: (turn: number) => void;
}

const GameLogEntry: FC<GameLogEntryProps> = ({ logIndex, entry, onOpenTurnAdjustmentsDialog }) => {
  const { gameState, setGameState } = useGameContext();
  const [openUndoDialog, setOpenUndoDialog] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  // Check if the action can be undone, but catch and handle any errors
  useEffect(() => {
    try {
      setCanUndo(canUndoAction(gameState, logIndex));
    } catch (error) {
      console.error('Error checking if action can be undone:', error);
      setCanUndo(false);
    }
  }, [gameState, logIndex]);

  const handleUndoClick = () => {
    setOpenUndoDialog(true);
  };

  const handleUndoConfirm = () => {
    const { game: newGame, success } = undoAction(gameState, logIndex);
    if (success) {
      setGameState(newGame);
    }
    setOpenUndoDialog(false);
  };

  const handleUndoCancel = () => {
    setOpenUndoDialog(false);
  };

  const formatDate = (timestamp: Date) => {
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();

    const timeString = timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (isToday) {
      return timeString;
    } else {
      const dateString = timestamp.toLocaleDateString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      return `${dateString} ${timeString}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(`log-entry-${id}`);
      const escapedId = CSS.escape(id);
      const elements = document.querySelectorAll(`[data-action-id="${escapedId}"]`);
      if (element) {
        // Remove highlight from all elements
        document.querySelectorAll('.highlighted').forEach((el) => {
          el.classList.remove('highlighted');
        });
        // Add highlight to the target element and its children
        element.classList.add('highlighted');
        elements.forEach((el) => {
          el.classList.add('highlighted');
        });
        // Scroll the main element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Remove the highlight after 2 seconds
        setTimeout(() => {
          element.classList.remove('highlighted');
          elements.forEach((el) => {
            el.classList.remove('highlighted');
          });
        }, 2000);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Trigger the highlight on component mount if there's a hash in the URL
    if (window.location.hash) {
      handleHashChange();
    }
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLinkClick = (event: MouseEvent, id: string) => {
    event.preventDefault();
    window.location.hash = `#${id}`;
    // Manually trigger the hashchange event
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const turnAdjustmentsForEntry = (): number | null => {
    if (!AdjustmentActions.includes(entry.action)) {
      return null;
    }
    const { field, subfield } = getFieldAndSubfieldFromAction(entry.action);
    let count = getSignedCount(entry);
    let index = logIndex - 1;
    while (index >= 0 && gameState.log[index].turn === entry.turn) {
      const prevEntry = gameState.log[index];
      index--;
      if (
        AdjustmentActions.includes(prevEntry.action) &&
        prevEntry.playerIndex === entry.playerIndex
      ) {
        const { field: prevField, subfield: prevSubfield } = getFieldAndSubfieldFromAction(
          prevEntry.action
        );
        if (field !== prevField || subfield !== prevSubfield) {
          continue;
        }
        count += getSignedCount(prevEntry);
      }
    }
    return count;
  };

  const actionText = logEntryToString(entry);

  const relevantPlayer = entry.playerIndex > -1 ? gameState.players[entry.playerIndex] : undefined;
  const isActivePlayer = entry.playerIndex === entry.currentPlayerIndex;
  const isNewTurn = entry.action === GameLogAction.NEXT_TURN;
  const isAttributeChange = AdjustmentActions.includes(entry.action);
  const isAttributeChangeOutOfTurn = isAttributeChange && !isActivePlayer;
  const isNotTriggeredByPlayer = [GameLogAction.SELECT_PLAYER, GameLogAction.NEXT_TURN].includes(
    entry.action
  );
  const hasLinkedAction = gameState.log.some((logEntry) => logEntry.linkedActionId === entry.id);
  const groupedAdjustments = turnAdjustmentsForEntry();

  if (entry.playerIndex > -1 && !gameState.players[entry.playerIndex]) {
    console.warn(`Player not found for index ${entry.playerIndex}`, {
      entry,
      gamePlayersLength: gameState.players.length,
    });
  }

  const dataActionId = {
    'data-action-id': entry.linkedActionId ?? entry.id,
  };

  const groupedAction =
    entry.action === GameLogAction.GROUPED_ACTION && entry.actionKey
      ? (() => {
          for (const section of Object.values(Recipes)) {
            if (section.recipes[entry.actionKey]) {
              return section.recipes[entry.actionKey];
            }
          }
          return null;
        })()
      : null;

  return (
    <>
      <Box
        id={`log-entry-${entry.id}`}
        {...dataActionId}
        sx={{
          display: 'grid',
          gridTemplateColumns: '15% 15% 70%',
          alignItems: 'center',
          backgroundColor: isNewTurn ? '#e3f2fd' : 'inherit',
          transition: 'background-color 0.3s',
          boxSizing: 'border-box',
        }}
      >
        <Box>
          <Typography variant="caption">{formatDate(entry.timestamp)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption">{formatTimeSpan(entry.gameTime)}</Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            {relevantPlayer && (
              <PlayerChip
                label={getPlayerLabel(gameState.players, entry.playerIndex)}
                size="small"
                style={{
                  backgroundColor: relevantPlayer.color,
                  color: 'white',
                  marginRight: '8px',
                  fontWeight: isActivePlayer ? 'bold' : 'normal',
                  border: isActivePlayer ? '2px solid #000' : 'none',
                  minWidth: '30px',
                }}
              />
            )}
            <Box display="flex" alignItems="center" flexGrow={1}>
              {relevantPlayer !== undefined && !isNotTriggeredByPlayer && (
                <ColoredPlayerName player={relevantPlayer} marginDirection="right" />
              )}
              {entry.action === GameLogAction.GROUPED_ACTION && (
                <Box
                  component="span"
                  sx={{ fontSize: '16px', display: 'inline-flex', alignItems: 'center', mr: 1 }}
                >
                  {groupedAction?.icon ?? <FontAwesomeIcon icon={faPlay} />}
                </Box>
              )}
              <Typography variant="body2" component="span">
                {actionText}
              </Typography>
              {isNotTriggeredByPlayer && relevantPlayer !== undefined && (
                <ColoredPlayerName player={relevantPlayer} marginDirection="left" />
              )}
              {[GameLogAction.START_GAME, GameLogAction.NEXT_TURN].includes(entry.action) &&
                `\u00A0(\u00A0${entry.turn}\u00A0)`}
              {entry.trash === true && (
                <Tooltip title="The card was trashed" arrow>
                  <DeleteIcon
                    fontSize="small"
                    titleAccess="Card was trashed"
                    style={{ marginLeft: '8px' }}
                  />
                </Tooltip>
              )}
              {isAttributeChangeOutOfTurn && (
                <ChangeCircleIcon
                  fontSize="small"
                  style={{ marginLeft: '8px', color: '#ff9800' }}
                  titleAccess="Attribute changed outside of player's turn"
                />
              )}
              {entry.correction && (
                <Tooltip title="This entry was a correction" arrow>
                  <EditIcon fontSize="small" style={{ marginLeft: '8px', color: '#ff9800' }} />
                </Tooltip>
              )}
              {groupedAdjustments !== null && (
                <Tooltip title="Total adjustments this turn on this field and player">
                  <Typography
                    variant="caption"
                    component="span"
                    style={{ marginLeft: '4px', color: groupedAdjustments >= 0 ? 'green' : 'red' }}
                  >
                    {groupedAdjustments > 0 ? '+' : ''}
                    {groupedAdjustments}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            {(hasLinkedAction || entry.linkedActionId) && (
              <Link
                href={`#${entry.linkedActionId ?? entry.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  handleLinkClick(e, entry.linkedActionId ?? entry.id);
                }}
                sx={{ marginRight: 1 }}
              >
                <LinkIcon fontSize="small" color="action" />
              </Link>
            )}
            {canUndo && (
              <IconButton onClick={handleUndoClick} size="small">
                <Tooltip title="Undo this entry">
                  <UndoIcon fontSize="small" />
                </Tooltip>
              </IconButton>
            )}
            {(entry.action === GameLogAction.NEXT_TURN ||
              entry.action === GameLogAction.START_GAME) && (
              <IconButton onClick={() => onOpenTurnAdjustmentsDialog(entry.turn)} size="small">
                <Tooltip title="View Turn Adjustments">
                  <AdjustmentsIcon fontSize="small" />
                </Tooltip>
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openUndoDialog}
        onClose={handleUndoCancel}
        aria-labelledby="undo-dialog-title"
        aria-describedby="undo-dialog-description"
      >
        <DialogTitle id="undo-dialog-title">Confirm Undo</DialogTitle>
        <DialogContent>
          <DialogContentText id="undo-dialog-description">
            Are you sure you want to undo this action?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUndoCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUndoConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameLogEntry;
