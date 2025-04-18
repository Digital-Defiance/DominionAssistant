import React, { FC } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { OptionField, OptionSubField } from '@/game/types';
import { IGame } from '@/game/interfaces/game';
import { NewGameState } from '@/game/dominion-lib';
import CenteredContainer from '@/components/CenteredContainer';
import OptionItem from '@/components/OptionItem';
import TabTitle from '@/components/TabTitle';
import { deepClone } from '@/game/utils';

interface SetGameOptionsProps {
  startGame: () => void;
}

const SetGameOptions: FC<SetGameOptionsProps> = ({ startGame }) => {
  const { gameState, setGameState } = useGameContext();

  const updateOption = <T extends OptionField>(
    field: T,
    subfield: OptionSubField<T>,
    value: boolean
  ) => {
    setGameState((prevState: IGame) => {
      if (!prevState) return prevState;
      const newGame = deepClone<IGame>(prevState);

      if (field === 'curses') {
        newGame.options.curses = value;
      } else if (field === 'expansions') {
        newGame.options.expansions[subfield as keyof typeof newGame.options.expansions] = value;
      } else if (field === 'mats') {
        newGame.options.mats[subfield as keyof typeof newGame.options.mats] = value;
      }

      return newGame;
    });
  };

  const handleStartGame = () => {
    setGameState((prevState: IGame) => {
      const newGame = NewGameState(prevState, new Date());
      console.log(newGame);
      return newGame;
    });

    startGame();
  };

  return (
    <CenteredContainer>
      <TabTitle>Game Options</TabTitle>

      <OptionItem
        checked={gameState.options.curses}
        onChange={(e) => {
          updateOption('curses', true, e.target.checked);
        }}
        title="Curses"
        tooltip="Include curses in the game"
      />

      <OptionItem
        checked={gameState.options.mats.favors}
        onChange={(e) => {
          updateOption('mats', 'favors', e.target.checked);
        }}
        title="Favors"
        tooltip="Include favors in the game"
      />

      <OptionItem
        checked={gameState.options.mats.debt}
        onChange={(e) => {
          updateOption('mats', 'debt', e.target.checked);
        }}
        title="Debts"
        tooltip="Include debts in the game"
      />

      <OptionItem
        checked={gameState.options.mats.coffersVillagers}
        onChange={(e) => {
          updateOption('mats', 'coffersVillagers', e.target.checked);
        }}
        title="Coffers/Villagers"
        tooltip="Include coffers and villagers in the game"
      />

      <OptionItem
        checked={gameState.options.expansions.prosperity}
        onChange={(e) => {
          updateOption('expansions', 'prosperity', e.target.checked);
        }}
        title="Prosperity"
        tooltip="Include platinum and colonies in the game"
      />

      <OptionItem
        checked={gameState.options.expansions.risingSun}
        onChange={(e) => {
          updateOption('expansions', 'risingSun', e.target.checked);
        }}
        title="Rising Sun"
        tooltip="Enable Rising Sun"
      />

      {gameState.options.expansions.risingSun && (
        <Box>
          <OptionItem
            checked={gameState.expansions.risingSun.greatLeaderProphecy || false}
            onChange={(e) => {
              setGameState((prevState: IGame) => {
                const newGame = deepClone<IGame>(prevState);
                newGame.expansions.risingSun = {
                  prophecy: {
                    suns: prevState.expansions.risingSun.prophecy.suns,
                  },
                  greatLeaderProphecy: e.target.checked,
                };
                return newGame;
              });
            }}
            title="Great Leader"
            tooltip="Enable Great Leader- +1 action after each action"
          />
        </Box>
      )}

      <OptionItem
        checked={gameState.options.expansions.alchemy}
        onChange={(e) => {
          updateOption('expansions', 'alchemy', e.target.checked);
        }}
        title="Alchemy"
        tooltip="Enable Alchemy"
      />

      {gameState.options.expansions.alchemy && (
        <Box>
          <OptionItem
            checked={gameState.expansions.alchemy.trackPotions || false}
            onChange={(e) => {
              setGameState((prevState: IGame) => {
                const newGame = deepClone<IGame>(prevState);
                newGame.expansions.alchemy = {
                  trackPotions: e.target.checked,
                };
                return newGame;
              });
            }}
            title="Track Potions"
            tooltip="Enable Potions tracking for each player"
          />
        </Box>
      )}

      <hr />
      <Typography variant="h6" gutterBottom>
        Features
      </Typography>

      <OptionItem
        checked={gameState.options.trackCardCounts}
        onChange={(e) => {
          setGameState((prevState: IGame) => {
            return {
              ...prevState,
              options: { ...prevState.options, trackCardCounts: e.target.checked },
            };
          });
        }}
        title="Track Card Counts"
        tooltip="Whether to track the number of cards in each player's hand"
      />

      <OptionItem
        checked={gameState.options.trackCardGains}
        onChange={(e) => {
          setGameState((prevState: IGame) => {
            return {
              ...prevState,
              options: { ...prevState.options, trackCardGains: e.target.checked },
            };
          });
        }}
        title="Track Card Gains"
        tooltip="Whether to track the cards gained by each player"
      />

      <OptionItem
        checked={gameState.options.trackDiscard}
        onChange={(e) => {
          setGameState((prevState: IGame) => {
            return {
              ...prevState,
              options: { ...prevState.options, trackDiscard: e.target.checked },
            };
          });
        }}
        title="Track Discards"
        tooltip="Whether to track the cards discarded by each player"
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button variant="contained" onClick={handleStartGame}>
          Start Game
        </Button>
      </Box>
    </CenteredContainer>
  );
};

export default SetGameOptions;
