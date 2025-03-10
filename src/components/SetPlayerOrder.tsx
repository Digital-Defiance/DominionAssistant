import React, { FC, useCallback, useEffect } from 'react';
import {
  Button,
  List,
  ListItemText,
  ListItemButton,
  Box,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useGameContext } from '@/components/GameContext';
import theme from '@/components/theme';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';
import SuperCapsText from '@/components/SuperCapsText';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import { IPlayer } from '@/game/interfaces/player';
import { shuffleArray } from '@/game/dominion-lib';

interface SetPlayerOrderProps {
  nextStep: () => void;
}

interface PlayerMapping {
  player: IPlayer;
  originalIndex: number;
}

const SetPlayerOrder: FC<SetPlayerOrderProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const [shuffleChanged, setShuffleChanged] = React.useState<boolean | undefined>(undefined);

  const selectRandomFirstPlayer = useCallback(() => {
    if (gameState.players.length > 0) {
      const randomIndex = Math.floor(Math.random() * gameState.players.length);
      setGameState((prevState: IGame) => {
        const newGame = deepClone<IGame>(prevState);
        newGame.currentPlayerIndex = randomIndex;
        newGame.selectedPlayerIndex = randomIndex;
        return newGame;
      });
    }
  }, [gameState.players.length, setGameState]);

  const shufflePlayers = useCallback(() => {
    setShuffleChanged(false);
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);

      // Create a mapping structure to track original indices
      const playerMappings: PlayerMapping[] = newGame.players.map((player, index) => ({
        player: deepClone(player),
        originalIndex: index,
      }));

      const { shuffled, changed } = shuffleArray(playerMappings);
      setShuffleChanged(changed);
      newGame.players = shuffled.map((mapping) => mapping.player);

      newGame.currentPlayerIndex = 0;
      newGame.selectedPlayerIndex = 0;

      return newGame;
    });
  }, [setGameState]);

  useEffect(() => {
    selectRandomFirstPlayer();
  }, [selectRandomFirstPlayer]);

  return (
    <CenteredContainer>
      <TabTitle>Set Player Order</TabTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <List sx={{ width: '100%' }}>
          {gameState.players.map((player, index) => (
            <ListItemButton
              key={`player-${index}`}
              selected={gameState.selectedPlayerIndex === index}
              onClick={() => {
                setGameState((prevState: IGame) => {
                  const newGame = deepClone<IGame>(prevState);
                  newGame.selectedPlayerIndex = index;
                  newGame.currentPlayerIndex = index;
                  return newGame;
                });
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: player.color,
                        cursor: 'pointer',
                        marginRight: 1,
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: 'TrajanProBold',
                        marginRight: 1,
                      }}
                    >
                      {`${index + 1}.`}
                    </Typography>
                    <SuperCapsText className="typography-title">{player.name}</SuperCapsText>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="Shuffle Player Order">
            <IconButton onClick={shufflePlayers} color="secondary">
              <ShuffleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {shuffleChanged === false && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography align="center" variant="body2">
            Players were shuffled but the order remained the same.
          </Typography>
        </Box>
      )}
      <Button
        fullWidth
        variant="contained"
        style={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }}
        onClick={nextStep}
        disabled={gameState.selectedPlayerIndex === null}
        sx={{ mt: 2 }}
      >
        Next
      </Button>
    </CenteredContainer>
  );
};

export default SetPlayerOrder;
