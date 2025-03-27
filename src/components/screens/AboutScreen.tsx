import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, Paper, List, ListItem, ListItemText } from '@mui/material';
import DominionTransparentLogo from '@/assets/images/DominionAssistant.png';
import SuperCapsText from '@/components/SuperCapsText';
import {
  APP_TITLE,
  APP_TAGLINE,
  APP_MINI_DISCLAIMER,
  APP_MINI_DISCLAIMER_NOTE,
  APP_FEATURES,
  VERSION_NUMBER,
  TITLE_FONT,
} from '@/game/constants';
import CenteredContainer from '@/components/CenteredContainer';

export default function AboutScreen() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/assets/messages.json');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.log(data);
          return;
        }
        setMessages(data);
      } catch {
        setMessages(['Failed to fetch messages. Please try again later.']);
      }
    };

    fetchMessages();
  }, []);

  return (
    <CenteredContainer
      sx={{
        marginLeft: { xs: 0, md: '15%' },
        marginRight: { xs: 0, md: '15%' },
        minHeight: '100%',
        overflow: 'hidden',
        overflowY: 'auto',
        scrollbarWidth: 'none', // For Firefox
        justifyContent: 'flex-start',
        py: 2,
        '&::-webkit-scrollbar': {
          display: 'none', // For Chrome, Safari, and Opera
        },
        '@media (max-width: 900px)': {
          marginLeft: 0,
          marginRight: 0,
        },
      }}
    >
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Paper
              elevation={3}
              sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 150,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <img
                  src={DominionTransparentLogo}
                  alt="Dominion Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              <Typography variant="h4" sx={{ fontFamily: TITLE_FONT, textAlign: 'center', mb: 2 }}>
                {APP_TITLE}
              </Typography>
              <Typography variant="body1" component="p" align="center">
                {APP_TAGLINE}
              </Typography>
            </Paper>
          </Box>

          {messages.length > 0 && (
            <Box>
              <Paper elevation={3} sx={{ p: 2 }}>
                <SuperCapsText className={`typography-title`}>Messages</SuperCapsText>
                <List dense>
                  {messages.map((message, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={<span dangerouslySetInnerHTML={{ __html: message }} />}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <SuperCapsText className={`typography-title`}>Features</SuperCapsText>
                <List dense>
                  {APP_FEATURES.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <SuperCapsText className={`typography-title`} sx={{ paddingBottom: '10px' }}>
                  About
                </SuperCapsText>
                <Typography variant="body1" component="p">
                  This application is created by{' '}
                  <Link
                    href="https://digitaldefiance.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Digital Defiance
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://github.com/JessicaMulein"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Jessica Mulein
                  </Link>
                  . {APP_MINI_DISCLAIMER}
                </Typography>
                <Typography variant="body1" component="p">
                  For more information, contributions, or to report{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/DominionAssistant/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    issues
                  </Link>
                  , please visit our{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/DominionAssistant"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub repository
                  </Link>
                  .
                </Typography>
                <Typography variant="body1" component="p">
                  {APP_MINI_DISCLAIMER_NOTE}
                </Typography>
                <Typography variant="body1" component="p">
                  See our{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/DominionAssistant?tab=readme-ov-file#disclaimer-for-end-users"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Disclaimer for End Users
                  </Link>{' '}
                  for important information.
                </Typography>
                <Typography variant="body1" component="p" align="center">
                  <Link
                    href="https://github.com/Digital-Defiance/DominionAssistant/blob/main/USER_MANUAL.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    User Manual
                  </Link>
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box mt={4} width="100%" textAlign="center" sx={{ paddingBottom: '56px' }}>
        <Typography variant="body2">
          Version:{' '}
          <Link
            href="https://github.com/Digital-Defiance/DominionAssistant?tab=readme-ov-file#changelog"
            target="_blank"
            rel="noopener noreferrer"
          >
            {VERSION_NUMBER}
          </Link>
          {' • '}
          <Link
            href="https://github.com/Digital-Defiance/DominionAssistant/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </CenteredContainer>
  );
}
