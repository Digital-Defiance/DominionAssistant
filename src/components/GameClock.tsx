import React, { useState, useEffect } from 'react';
import {
  calculateAverageTurnDuration,
  calculateAverageTurnDurationForPlayer,
  calculateCurrentTurnDuration,
  calculateDurationUpToEvent,
  calculateTurnDurations,
  formatTimeSpan,
} from '@/game/dominion-lib-log';
import { useGameContext } from '@/components/GameContext';
import { Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { CurrentStep } from '@/game/enumerations/current-step';
import { TITLE_FONT } from '@/game/constants';

const GameClock = () => {
  const { gameState } = useGameContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (gameState.currentStep !== CurrentStep.Game) {
    return null;
  }

  const gameTime = calculateDurationUpToEvent(gameState.log, currentTime);
  const turnDurations = calculateTurnDurations(gameState.log);
  const averageTurnTime = calculateAverageTurnDuration(turnDurations);
  const averageTurnCurrentPlayer = calculateAverageTurnDurationForPlayer(
    turnDurations,
    gameState.selectedPlayerIndex
  );
  const currentTurnTime = calculateCurrentTurnDuration(gameState.log, currentTime);

  if (isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 56,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '2px 4px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '0.65rem', color: 'white' }}>
          Turn {gameState.currentTurn}
        </Typography>
        <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '0.65rem', color: 'white' }}>
          {formatTimeSpan(gameTime)}
        </Typography>
        <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '0.65rem', color: 'white' }}>
          {formatTimeSpan(currentTurnTime)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 100,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '8px 16px',
        borderRadius: '8px',
      }}
    >
      <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '1rem', color: 'white' }}>
        Turn: {gameState.currentTurn}
      </Typography>
      <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '1rem', color: 'white' }}>
        Game Time: {formatTimeSpan(gameTime)}
      </Typography>
      <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '1rem', color: 'white' }}>
        Current Turn: {formatTimeSpan(currentTurnTime)}
      </Typography>
      <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '1rem', color: 'white' }}>
        Average Turn: {formatTimeSpan(averageTurnTime)}
      </Typography>
      <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '1rem', color: 'white' }}>
        Avg Player Turn: {formatTimeSpan(averageTurnCurrentPlayer)}
      </Typography>
    </Box>
  );
};

export default GameClock;
