import React, { FC, forwardRef } from 'react';
import { Box, Typography, IconButton, Tooltip, TooltipProps, TypographyProps } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import '@/styles.scss';

// Modify StyledTypography to use forwardRef
const StyledTypography = forwardRef<HTMLSpanElement, TypographyProps>((props, ref) => (
  <Typography
    ref={ref}
    {...props}
    className={`typography-title ${props.className ?? ''}`}
    sx={{
      fontFamily: 'Minion Pro Medium Cond Subhead',
      ...props.sx,
    }}
  />
));

StyledTypography.displayName = 'StyledTypography';

// Similarly, update StyledLargeNumber
const StyledLargeNumber = forwardRef<HTMLSpanElement, TypographyProps>((props, ref) => (
  <Typography
    ref={ref}
    {...props}
    className={`typography-title ${props.className || ''}`}
    sx={{
      fontFamily: 'Minion Pro Bold Caption',
      fontWeight: 'bold',
      ...props.sx,
    }}
  />
));

StyledLargeNumber.displayName = 'StyledLargeNumber';

interface IncrementDecrementControlProps {
  label: string;
  value: number;
  tooltip?: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onTrash?: () => void;
  sx?: SxProps<Theme>;
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
}

const IncrementDecrementControl: FC<IncrementDecrementControlProps> = ({
  label,
  value,
  tooltip,
  onIncrement,
  onDecrement,
  onTrash,
  tooltipProps,
  sx,
  ...otherProps
}) => {
  const labelContent = (
    <StyledTypography
      variant="body1"
      sx={{ marginRight: { xs: 0.25, sm: 1 }, fontSize: { xs: '0.8rem', sm: '1rem' } }}
    >
      {label}:
    </StyledTypography>
  );

  return (
    <Box
      {...otherProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        ...sx,
      }}
    >
      {tooltip ? (
        <Tooltip title={tooltip} {...tooltipProps}>
          {labelContent}
        </Tooltip>
      ) : (
        labelContent
      )}
      {onTrash && (
        <Tooltip title="Trash this card and remove it from the supply">
          <IconButton
            onClick={onTrash}
            size="small"
            sx={{
              minWidth: { xs: 40, sm: 'auto' },
              minHeight: { xs: 40, sm: 'auto' },
              padding: { xs: '4px', sm: '8px' },
            }}
          >
            <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Decrease quantity">
        <IconButton
          onClick={onDecrement}
          size="small"
          sx={{
            minWidth: { xs: 40, sm: 'auto' },
            minHeight: { xs: 40, sm: 'auto' },
            padding: { xs: '4px', sm: '8px' },
          }}
        >
          <RemoveIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
        </IconButton>
      </Tooltip>
      <StyledLargeNumber
        variant="body1"
        sx={{ minWidth: { xs: 24, sm: 20 }, textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1.2rem' } }}
      >
        {value}
      </StyledLargeNumber>
      <Tooltip title="Increase quantity">
        <IconButton
          onClick={onIncrement}
          size="small"
          sx={{
            minWidth: { xs: 40, sm: 'auto' },
            minHeight: { xs: 40, sm: 'auto' },
            padding: { xs: '4px', sm: '8px' },
          }}
        >
          <AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default IncrementDecrementControl;
