import React from 'react';
import GameLog from '@/components/GameLog';
import ScrollableContainer from '@/components/ScrollableContainer';
import { TabViewHandle } from '@/components/TabView';

interface GameLogScreenProps {
  tabViewRef: React.RefObject<TabViewHandle>;
}
export default function GameLogScreen({ tabViewRef }: GameLogScreenProps) {
  return (
    <ScrollableContainer>
      <GameLog tabViewRef={tabViewRef} />
    </ScrollableContainer>
  );
}
