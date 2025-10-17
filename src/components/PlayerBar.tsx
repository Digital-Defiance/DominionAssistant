import React, { FC } from 'react';
import { useGameContext } from './GameContext';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { calculateVictoryPoints, getPlayerLabel } from '@/game/dominion-lib';
import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import { PlayerChip } from './PlayerChip';

const ScoreText = styled(Typography)(() => ({
  fontFamily: 'Minion Pro Bold Caption',
  fontWeight: 'bold',
  fontSize: '1rem',
  textAlign: 'center',
}));

export const PlayerBar: FC = () => {
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null;
  }

  const handlePlayerSelect = (index: number) => {
    setGameState((prevState: IGame) => {
      if (prevState.selectedPlayerIndex === index) {
        return prevState;
      }
      const newGame = deepClone<IGame>(prevState);
      addLogEntry(newGame, index, GameLogAction.SELECT_PLAYER, {
        prevPlayerIndex: prevState.selectedPlayerIndex,
      });
      newGame.selectedPlayerIndex = index;
      return newGame;
    });
  };

  const isGamePaused = (): boolean => {
    const lastLogEntry = gameState.log.length > 0 ? gameState.log[gameState.log.length - 1] : null;
    return lastLogEntry !== null && lastLogEntry.action === GameLogAction.PAUSE;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        padding: { xs: '4px', sm: '8px' },
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: { xs: 1, sm: 2, md: 3 },
          overflowX: 'auto',
          width: '100%',
          maxWidth: '100%',
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 2,
          },
        }}
      >
        {gameState.players.map((player, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isGamePaused() ? 'not-allowed' : 'pointer',
              opacity: isGamePaused() ? 0.7 : 1,
              padding: { xs: '2px 4px', sm: '4px 8px' },
              borderRadius: '4px',
              minWidth: { xs: 60, sm: 'auto' },
              backgroundColor:
                index === gameState.selectedPlayerIndex ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: isGamePaused() ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
            onClick={() => !isGamePaused() && handlePlayerSelect(index)}
          >
            <Tooltip
              title={`${player.name}${index === gameState.currentPlayerIndex ? ' (Current Player)' : ''}`}
            >
              <PlayerChip
                label={getPlayerLabel(gameState.players, index)}
                size="medium"
                style={{
                  backgroundColor: player.color,
                  color: 'white',
                  fontWeight: index === gameState.currentPlayerIndex ? 'bold' : 'normal',
                  border: index === gameState.currentPlayerIndex ? '2px solid #000' : 'none',
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                }}
              />
            </Tooltip>
            <ScoreText mt={1} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {calculateVictoryPoints(player)}
            </ScoreText>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
