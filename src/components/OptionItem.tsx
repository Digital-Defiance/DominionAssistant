import React from 'react';
import { Box, Checkbox, Tooltip, Typography } from '@mui/material';

interface OptionItemProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  tooltip: string;
}

const OptionItem: React.FC<OptionItemProps> = ({ checked, onChange, title, tooltip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 1 }}>
    <Checkbox checked={checked} onChange={onChange} />
    <Tooltip title={tooltip} arrow>
      <Typography variant="body1">{title}</Typography>
    </Tooltip>
  </Box>
);

export default OptionItem;
