import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import DominionAssistant from '@/components/DominionAssistant';
import SuperCapsText from '@/components/SuperCapsText';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  height: 'calc(100vh - 56px)',
}));

export default function DominionAssistantScreen() {
  return (
    <StyledContainer>
      <SuperCapsText className="typography-super-title">
        Unofficial Dominion Assistant
      </SuperCapsText>
      <DominionAssistant />
    </StyledContainer>
  );
}
