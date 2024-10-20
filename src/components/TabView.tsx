import React, { SyntheticEvent } from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
}));

interface TabViewProps {
  tabs: {
    label: string;
    icon: React.ReactElement;
    content: React.ReactNode;
    path: string;
  }[];
}

const TabView: React.FC<TabViewProps> = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    navigate(tabs[newValue].path);
  };

  return (
    <Box sx={{ paddingBottom: '56px' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Paper elevation={3}>
        <StyledBottomNavigation
          value={tabs.findIndex((tab) => tab.path === location.pathname)}
          onChange={handleChange}
          showLabels
        >
          {tabs.map((tab, index) => (
            <BottomNavigationAction key={index} label={tab.label} icon={tab.icon} />
          ))}
        </StyledBottomNavigation>
      </Paper>
    </Box>
  );
};

export default TabView;
