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

  console.log('Layout - Current user:', { userName, userRole }); // Debug log

  // Check authentication
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    navigate('/login');
    return null;
  }

  // Define which menu items are restricted to admin/super-admin
  const adminOnlyPaths = ['/admin', '/teachers', '/settings', '/students'];

  const menuItems = [
    {
      text: "Today's Attendance",
      icon: <IoHomeOutline color="black" />,
      path: "/", 
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "My Attendance",
      icon: <MdOutlineTaskAlt />,
      path: "/my-attendance",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Daily Updates",
      icon: <FaRegBell />,
      path: "/daily-updates",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Test Submission",
      icon: <LuClipboard />,
      path: "/test-submission",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Student Performance",
      icon: <HiOutlineChartBar />,
      path: "/student-performance",
      allowedRoles: ['admin', 'superadmin', 'teacher']
    },
    {
      text: "Admin",
      icon: <GrUserSettings />,
      path: "/admin",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Settings",
      icon: <IoSettingsOutline />,
      path: "/settings",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Teachers",
      icon: <LiaUserSolid />,
      path: "/teachers",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Students",
      icon: <LiaUserSolid />,
      path: "/students",
      allowedRoles: ['admin', 'superadmin']
    },
    {
      text: "Students Database",
      icon : <FaDatabase/>,
      path: "/students-database",
      allowedRoles: ['admin', 'superadmin','teacher']
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
    <Box sx={{ display: "flex" ,scrollBehavior:"smooth" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#fff", boxShadow: "none" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon sx={{ color: "black" }} />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 , bgcolor:"#fecc00" , px:"8px" , py:"4px", borderRadius:"12px" , boxShadow:1 }}>
            <img src={pfp} alt="Profile" style={{ height: "40px", width:"40px", borderRadius: "50%" }} />
           <Box sx={{display:"flex"  , flexDirection:"column" , gap:"-1rem"}}>
           <Typography sx={{ fontSize: "14px", fontWeight: 600 , color:"#000" }}>{userName}</Typography>
           <span style={{ fontSize: "12px", fontWeight: 100 , color:"gray" }}>{userRole}</span>
            </Box>
            <TbLogout cursor="pointer" color="#fff" fontSize="22px"  onClick={handleLogout} />
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
              overflowX:"hidden"
            },
          }}
        >
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <img src="https://static.wixstatic.com/shapes/abaee8_dc6d6d64fba440848d2b9769e4f2e998.svg" alt="Inkstall Logo" className="w-32 h-auto mb-6" />
            <p className="mt-2 text-sm text-gray-600">Admin Dashboard</p>
            <IconButton onClick={toggleDrawer}>
              <MenuIcon sx={{ color: "black" }} />
            </IconButton>
          </Box>
          <Divider sx={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
        <Box sx={{display:"flex" , flexDirection:"column" , justifyContent:"space-between" , height:"100%" }} >
        <List>
            {menuItems
              .filter(item => {
                const hasAccess = item.allowedRoles.includes(userRole);
                console.log(`Menu item "${item.text}" - Role: ${userRole} - Has access: ${hasAccess}`);
                return hasAccess;
              })
              .map((item) => (
              <motion.div whileHover={{ scale: 1.05 }} key={item.text}>
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  sx={{
                    mb: 1,
                    mx: 1,
                    scrollBehavior:"smooth",
                    borderRadius: 1,
                    cursor:"pointer",
                    backgroundColor: location.pathname === item.path ? "rgb(250 204 21)" : "transparent",
                    color: location.pathname === item.path ? "#fff" : "#000",
                    "&:hover": { backgroundColor: "rgb(250 204 21)" },
                    cursor:"pointer"
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? "#fff" : "#000", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography sx={{ fontSize: "14px" }}>{item.text}</Typography>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Box>
          <Box sx={{ pl: "2rem", pb: "1rem" }}>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button onClick={handleLogout} sx={{ fontSize: "16px", fontWeight: "600", color: "#fff", bgcolor: "rgb(250 204 21)", p: "8px", display: "flex", flexDirection: "row", gap: "1rem" }}>
                <TbLogout fontSize="18px" /> Logout
              </Button>
            </motion.div>
          </Box>
        </Drawer>
      </motion.div>
      
      <Box component="main" sx={{ flexGrow: 1, width: `calc(100% - ${open ? drawerWidth : 0}px)`, transition: "width 0.3s ease-in-out", minHeight: "100vh", backgroundColor: "#f5f5f5", pt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
