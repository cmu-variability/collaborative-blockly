// client/pages/index.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import dynamic from 'next/dynamic';
import TimeDisplay from '../components/TimeDisplay'; // import the new component

const BlocklyWorkspace = dynamic(() => import('../components/BlocklyWorkspace'), { ssr: false });
const LiveCursor = dynamic(() => import('../components/LiveCursor'), { ssr: false });

const HomePage: React.FC = () => {
  // For demo purposes, using static history data. In a real app, these would come from your database.
  const history = [
    { action: 'Added block', timestamp: '2025-02-05T20:38:20.000Z' },
    { action: 'Deleted block', timestamp: '2025-02-05T20:38:20.000Z' },
  ];

  const [syncEnabled, setSyncEnabled] = useState(true);
  const collaborators = ['Alice', 'Bob', 'Charlie'];

  const handleToggleSync = () => {
    setSyncEnabled(!syncEnabled);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Collaborative Blockly Workspace
          </Typography>
          <Button color="inherit" onClick={handleToggleSync}>
            {syncEnabled ? 'Disable Sync' : 'Enable Sync'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Collaborators
          </Typography>
          <List>
            {collaborators.map((collaborator) => (
              <ListItem key={collaborator}>
                <ListItemText primary={collaborator} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Edit History
          </Typography>
          <List>
            {history.map((entry, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={entry.action}
                  secondary={<TimeDisplay timestamp={entry.timestamp} />}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Blockly Workspace
          </Typography>
          <Box sx={{ position: 'relative', height: 480, border: '1px solid #ccc' }}>
            <BlocklyWorkspace />
            <LiveCursor />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
