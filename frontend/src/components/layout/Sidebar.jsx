import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Divider, Toolbar } from '@mui/material';
import {  Settings, Assessment } from '@mui/icons-material';
import DashBoard from "../DashBoard"
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 240;

  const menuItems = [
    { text: 'DashBoard', path: '/dashboard' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
          border: 'none'
        },
      }}
    >
      <Toolbar /> {/* This creates space for the AppBar */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Inkstall Admin
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 1,
              backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;