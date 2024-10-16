import React from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { getTimeSpanFromStartGame, logEntryToString } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IGame } from '@/game/interfaces/game';

interface GameLogEntryProps {
  game: IGame;
  entry: ILogEntry;
}

const GameLogEntry: React.FC<GameLogEntryProps> = ({ game, entry }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <TableRow style={{ backgroundColor: entry.correction ? '#ffeb3b' : 'inherit' }}>
      <TableCell style={{ width: '15%' }}>
        <Typography variant="body2">{formatDate(entry.timestamp)}</Typography>
      </TableCell>
      <TableCell style={{ width: '15%' }}>
        <Typography variant="body2">
          {getTimeSpanFromStartGame(game.log, entry.timestamp)}
        </Typography>
      </TableCell>
      <TableCell style={{ width: '65%' }}>
        <Typography variant="body1">{logEntryToString(entry)}</Typography>
      </TableCell>
      <TableCell style={{ width: '5%' }}>{entry.linkedActionId && <LinkIcon />}</TableCell>
    </TableRow>
  );
};

export default GameLogEntry;
