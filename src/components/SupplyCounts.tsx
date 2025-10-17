import React, { FC } from 'react';
import { Box, Typography, List, ListItem, styled } from '@mui/material';
import SuperCapsText from '@/components/SuperCapsText';
import { useGameContext } from '@/components/GameContext';
import { IBaseKingdom } from '@/game/interfaces/set-kingdom/base';
import { IProsperityKingdom } from '@/game/interfaces/set-kingdom/prosperity';
import theme from '@/components/theme';
import SecondarySubtitle from '@/components/SecondarySubtitle';

const Container = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  maxWidth: 600,
  margin: '0 auto',
  overflowY: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    maxWidth: '100%',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 8,
  paddingBottom: 8,
  [theme.breakpoints.down('sm')]: {
    paddingTop: 4,
    paddingBottom: 4,
  },
}));

const CardName = styled(Typography)(({ theme }) => ({
  fontFamily: 'Minion Pro Medium Cond Subhead',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

const Quantity = styled(Typography)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
  fontWeight: 'bold',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

const Note = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
}));

interface SupplyCountsProps {
  containerHeight: number;
}

const SupplyCounts: FC<SupplyCountsProps> = ({ containerHeight }) => {
  const { gameState } = useGameContext();

  const supplyCards: (keyof IBaseKingdom | keyof IProsperityKingdom)[] = [
    'estates',
    'duchies',
    'provinces',
    'coppers',
    'silvers',
    'golds',
    'curses',
    'colonies',
    'platinums',
  ];

  const getSetInfo = () => {
    const playerCount = gameState.players.length;
    if (playerCount <= 2) return '1 set (2 players)';
    if (playerCount <= 4) return '1 set (3-4 players)';
    return '2 sets (5-6 players)';
  };

  return (
    <Container
      style={{
        maxHeight: `${containerHeight}px`,
      }}
    >
      <Header>
        <SuperCapsText className={`typography-large-title`}>Kingdom Supply</SuperCapsText>
        <SecondarySubtitle sx={{ marginTop: theme.spacing(1) }}>{getSetInfo()}</SecondarySubtitle>
      </Header>
      <List>
        {supplyCards.map((item) => {
          const quantity = gameState.supply[item] ?? 0;
          if (quantity === -1) return null;
          const cardName = item.charAt(0).toUpperCase() + item.slice(1);

          return (
            <StyledListItem key={item}>
              <CardName className="typography-title">{cardName}</CardName>
              <Quantity className="typography-title">{quantity}</Quantity>
            </StyledListItem>
          );
        })}
      </List>
      <Note>Note: Supply counts include trashed cards.</Note>
    </Container>
  );
};

export default SupplyCounts;
