import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, Typography, Divider, Button, IconButton, AppBar, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineTaskAlt } from "react-icons/md";
import { FaDatabase, FaRegBell } from "react-icons/fa";
import { GrUserSettings } from "react-icons/gr";
import { LiaUserSolid } from "react-icons/lia";
import { TbLogout } from "react-icons/tb";
import { motion } from "framer-motion";
import { LuClipboard } from "react-icons/lu";
import pfp from "../../assets/Images/pfp.jpeg";
import { useAuth } from "../../context/AuthContext";
import { IoSettingsOutline } from "react-icons/io5";
import { HiOutlineChartBar } from "react-icons/hi";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const drawerWidth = 240;

  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'guest';

  // Generate dashboard title based on user role
  const getDashboardTitle = () => {
    switch(userRole) {
      case 'superadmin':
        return 'SuperAdmin Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      default:
        return 'Dashboard';
    }
  };

  // console.log('Layout - Current user:', { userName, userRole }); // Debug log

  // Check authentication
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated) {
    // console.log('Not authenticated, redirecting to login');
    navigate('/login');
    return null;
  }

  // Define which menu items are restricted to admin/super-admin
  const adminOnlyPaths = ['/admin', '/teachers', '/settings', '/students'];

  const menuItems = [
    {
      text: "Today's Attendance",
      icon: <IoHomeOutline size={20} />,
      path: "/", 
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "My Attendance",
      icon: <MdOutlineTaskAlt size={20} />,
      path: "/my-attendance",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Daily Updates",
      icon: <FaRegBell size={20} />,
      path: "/daily-updates",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Test Submission",
      icon: <LuClipboard size={20} />,
      path: "/test-submission",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Students",
      icon: <LiaUserSolid size={20} />,
      path: "/students",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Students Database",
      icon: <FaDatabase size={20} />,
      path: "/students-database",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Student Performance",
      icon: <HiOutlineChartBar size={20} />,
      path: "/student-performance",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Admin",
      icon: <GrUserSettings size={20} />,
      path: "/admin",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Settings",
      icon: <IoSettingsOutline size={20} />,
      path: "/settings",
      allowedRoles: ['admin', 'superadmin']
    }
  ];

  // Redirect from protected routes if user doesn't have access
  useEffect(() => {
    if (adminOnlyPaths.includes(location.pathname) && !['admin', 'superadmin'].includes(userRole)) {
      navigate('/todays-attendance');
    }
  }, [location.pathname, userRole]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", scrollBehavior: "smooth" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#fff", boxShadow: "none" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon sx={{ color: "black" }} />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "#fff", px: "8px", py: "4px", borderRadius: "12px", boxShadow: 1 }}>
            <img src={pfp} alt="Profile" style={{ height: "40px", width: "40px", borderRadius: "50%" }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "-1rem" }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>{userName}</Typography>
              <span style={{ fontSize: "12px", fontWeight: 100, color: "gray" }}>{userRole}</span>
            </Box>
            <TbLogout cursor="pointer" color="#000" fontSize="22px" onClick={handleLogout} />
          </Box>
        </Toolbar>
      </AppBar>
      
      <motion.div animate={{ width: open ? drawerWidth : 0 }} transition={{ duration: 0.3 }}>
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.3s ease-in-out",
              boxSizing: "border-box",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            },
          }}
        >
          {/* Top section with hamburger menu */}
          <Box sx={{ 
            p: 2, 
            display: "flex", 
            justifyContent: "flex-end"
          }}>
            <IconButton onClick={toggleDrawer} sx={{ color: "black" }}>
              <MenuIcon />
            </IconButton>
          </Box>
          
          {/* Logo and dashboard title */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            mb: 2
          }}>
            <img 
              src="https://static.wixstatic.com/shapes/abaee8_dc6d6d64fba440848d2b9769e4f2e998.svg" 
              alt="Inkstall Logo" 
              style={{ height: "60px", width: "auto", marginBottom: "8px" }} 
            />
            <Typography sx={{ 
              fontSize: "16px", 
              color: "#000",
              fontWeight: 500 
            }}>
              {getDashboardTitle()}
            </Typography>
          </Box>
          
          <Divider />
          
          {/* Menu items in scrollable container */}
          <Box sx={{ 
            flex: 1,
            overflowY: "auto",
            py: 1
          }}>
            <List sx={{ px: 1 }}>
              {menuItems
                .filter(item => {
                  const hasAccess = item.allowedRoles.includes(userRole);
                  return hasAccess;
                })
                .map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mb: 0.5,
                    py: 1.5,
                    borderRadius: 0,
                    borderLeft: location.pathname === item.path ? '4px solid #fecc00' : '4px solid transparent',
                    backgroundColor: location.pathname === item.path ? 'rgba(254, 204, 0, 0.1)' : 'transparent',
                    color: '#555',
                    "&:hover": { 
                      backgroundColor: 'rgba(254, 204, 0, 0.1)',
                      cursor: 'pointer',
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === item.path ? '#000' : '#000', 
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography sx={{ 
                    fontSize: "15px",
                    fontWeight: location.pathname === item.path ? 500 : 400,
                    color: location.pathname === item.path ? '#000' : '#000',
                  }}>
                    {item.text}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
          
          {/* Logout button fixed at bottom */}
          <Box sx={{ 
            borderTop: "1px solid #eee",
            bgcolor: "#fff",
            mt: "auto",
            p: 0
          }}>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                py: 1.5,
                
                color: '#555',
                "&:hover": { 
                  backgroundColor: '#FECC00',
                  cursor: 'pointer',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#000', minWidth: 40 }}>
                <TbLogout size={20} />
              </ListItemIcon>
              <Typography sx={{ fontSize: "15px" }}>
                Logout
              </Typography>
            </ListItem>
          </Box>
        </Drawer>
      </motion.div>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: `calc(100% - ${open ? drawerWidth : 0}px)`, 
          transition: "width 0.3s ease-in-out", 
          minHeight: "100vh", 
          backgroundColor: "#f5f5f5", 
          pt: 8 
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;