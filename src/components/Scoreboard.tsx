import React, { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import SuperCapsText from '@/components/SuperCapsText';
import { calculateVictoryPoints, getPlayerLabel } from '@/game/dominion-lib';
import { useGameContext } from '@/components/GameContext';
import { PlayerChip } from './PlayerChip';

const TableText = styled(Typography)(() => ({
  fontFamily: 'TrajanProBold',
}));

const TableScore = styled(Typography)(() => ({
  fontFamily: 'Minion Pro Bold Caption',
  fontWeight: 'bold',
}));

const Scoreboard: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null; // or some fallback UI
  }

  return (
    <Paper elevation={3} sx={{ padding: 0, maxWidth: 600 }}>
      <TableContainer className="scoreboard">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <TableText className={`typography-text`}>Badge</TableText>
              </TableCell>
              <TableCell>
                <TableText className={`typography-text`} align="left">
                  Player
                </TableText>
              </TableCell>
              <TableCell>
                <TableText className={`typography-text`} align="center">
                  Score
                </TableText>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gameState.players.map((player, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor:
                    index === gameState.selectedPlayerIndex ? 'rgba(0, 0, 0, 0.08)' : 'inherit',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <TableCell align="center">
                  <Tooltip
                    title={
                      index === gameState.currentPlayerIndex
                        ? `${player.name} is the current player`
                        : ''
                    }
                  >
                    <PlayerChip
                      label={getPlayerLabel(gameState.players, index)}
                      size="small"
                      style={{
                        backgroundColor: player.color,
                        color: 'white',
                        fontWeight: index === gameState.currentPlayerIndex ? 'bold' : 'normal',
                        border: index === gameState.currentPlayerIndex ? '2px solid #000' : 'none',
                        minWidth: '30px',
                      }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  <SuperCapsText className={`typography-text`}>{player.name}</SuperCapsText>
                </TableCell>
                <TableCell align="center">
                  <TableScore className={`typography-title`}>
                    {calculateVictoryPoints(player)}
                  </TableScore>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Scoreboard;
