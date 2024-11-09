import React, { FC, memo, MouseEvent, TouchEvent, useCallback, useEffect, useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { RecipeKey, Recipes, RecipeSections } from '@/components/Recipes';
import { RecipeSection } from '@/game/interfaces/recipe-section';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/pro-solid-svg-icons';
import { RecipeCard } from '@/components/RecipeCard';

interface RecipesProps {
  containerHeight: number;
  containerWidth: number;
  onHover: (
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => void;
  onLeave: () => void;
  onClick: (
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => void;
}

const createSections = (): { key: RecipeSections; section: RecipeSection }[] => {
  return Object.entries(Recipes).map(([sectionKey, section]) => ({
    key: sectionKey as RecipeSections,
    section: {
      title: section.title,
      icon: section.icon ?? <FontAwesomeIcon icon={faUtensils} />,
      recipes: section.recipes,
    },
  }));
};

const StyledListItem = styled(Box)(() => ({
  position: 'relative',
  zIndex: 1,
  paddingRight: '75px', // Increased padding to accommodate the new popover position
  '&:hover': {
    zIndex: 1000,
  },
}));

const sectionList = createSections();

const MemoizedRecipeCard = memo(RecipeCard);

export const RecipesList: FC<RecipesProps> = ({
  containerHeight,
  containerWidth,
  onHover,
  onLeave,
  onClick,
}) => {
  const [activeRecipeKey, setActiveRecipeKey] = useState<RecipeKey | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleTouchStart = () => {
    setIsScrolling(false);
  };

  const handleTouchMove = () => {
    setIsScrolling(true);
  };

  const handleClick = useCallback(
    (
      event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
      section: RecipeSections,
      recipeKey: RecipeKey
    ) => {
      if (isScrolling) return;
      onClick(event, section, recipeKey);
      setActiveRecipeKey(recipeKey);

      // Clear the active state after a short delay
      setTimeout(() => {
        setActiveRecipeKey(null);
      }, 300); // Adjust this delay as needed
    },
    [onClick]
  );

  const handleOutsideClick = useCallback(() => {
    setActiveRecipeKey(null);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const itemCount = sectionList.reduce(
    (count, entry) => count + Object.keys(entry.section.recipes).length + 2, // +2 for header and spacer
    0
  );

  const getItemKey = (index: number) => {
    let currentIndex = 0;
    for (const entry of sectionList) {
      if (index === currentIndex) return `header-${entry.section.title}`;
      if (index === currentIndex + 1) return `spacer-${entry.section.title}`;
      currentIndex += 2;
      if (index < currentIndex + Object.keys(entry.section.recipes).length) {
        return Object.keys(entry.section.recipes)[index - currentIndex];
      }
      currentIndex += Object.keys(entry.section.recipes).length;
    }
    return '';
  };

  const getItemSize = (index: number) => {
    let currentIndex = 0;
    for (const entry of sectionList) {
      if (index === currentIndex) return 40; // Height for section headers
      if (index === currentIndex + 1) return 16; // Increased height for spacer
      currentIndex += 2;
      if (index < currentIndex + Object.keys(entry.section.recipes).length) {
        return 36; // Height for recipe items
      }
      currentIndex += Object.keys(entry.section.recipes).length;
    }
    return 0;
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    let currentIndex = 0;
    for (const entry of sectionList) {
      if (index === currentIndex) {
        return (
          <Box
            key={`header-${entry.section.title}`}
            style={{
              ...style,
              padding: '8px 8px',
              borderBottom: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
            }}
            display="flex"
            alignItems="center"
          >
            {entry.section.icon}
            <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
              {entry.section.title}
            </Typography>
          </Box>
        );
      }
      if (index === currentIndex + 1) {
        return <div key={`spacer-${entry.section.title}`} style={style} />; // Spacer
      }
      currentIndex += 2;
      if (index < currentIndex + Object.keys(entry.section.recipes).length) {
        const actionKey = Object.keys(entry.section.recipes)[index - currentIndex] as RecipeKey;
        const action = entry.section.recipes[actionKey];
        return (
          <StyledListItem
            key={actionKey}
            style={{
              ...style,
              padding: '4px 8px',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <MemoizedRecipeCard
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onHover={onHover}
              onLeave={onLeave}
              onClick={handleClick}
              isActive={actionKey === activeRecipeKey}
              section={entry.key}
              key={actionKey}
              recipeKey={actionKey}
              recipe={action}
            />
          </StyledListItem>
        );
      }
      currentIndex += Object.keys(entry.section.recipes).length;
    }
    return null;
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        maxHeight: `${containerHeight}px`,
      }}
      onMouseLeave={onLeave}
    >
      <VariableSizeList
        height={containerHeight}
        width={containerWidth}
        itemCount={itemCount}
        itemSize={getItemSize}
        itemKey={getItemKey}
        overscanCount={5} // Increase overscan for smoother scrolling
      >
        {Row}
      </VariableSizeList>
    </Box>
  );
};

export default RecipesList;
