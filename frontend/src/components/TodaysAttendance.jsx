import React, { useState, useEffect } from "react";
import MainFrame from "./ui/MainFrame";
import { Box, Card, Typography, Snackbar, Alert } from "@mui/material";
import InkstallButton from "./ui/InkstallButton";
import api from "../api";

const TodaysAttendance = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [lastPunchIn, setLastPunchIn] = useState("--");
  const [lastPunchOut, setLastPunchOut] = useState("--");
  const [visibility, setVisibility] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchAttendanceHistory = async () => {
    try {
      // Get today's date in MM/DD/YYYY format
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US');
      
      const response = await api.get(`/attendance/history?date=${formattedDate}`);
      
      if (response.data && response.data[0]) {
        const attendance = response.data[0];
        
        if (attendance.punchIn) {
          setLastPunchIn(attendance.formattedPunchIn.split(', ')[1]); // Get only the time part
          setCheckedIn(true);
        }
        
        if (attendance.punchOut) {
          setLastPunchOut(attendance.formattedPunchOut.split(', ')[1]); // Get only the time part
          setCheckedIn(false);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setSnackbar({
        open: true,
        message: "Failed to fetch attendance history",
        severity: "error"
      });
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const handlePunchAction = async (type) => {
    setLoading(true);
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("Please allow location access to mark attendance"));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable"));
              break;
            case error.TIMEOUT:
              reject(new Error("Location request timed out"));
              break;
            default:
              reject(error);
          }
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Format the date exactly as required
      const now = new Date();
      const formattedTime = now.toISOString();  // Send in ISO format

      const payload = {
        latitude: Number(position.coords.latitude.toFixed(7)),
        longitude: Number(position.coords.longitude.toFixed(7)),
        time: formattedTime
      };
      
      console.log('Sending request to:', "/attendance/punch-in");
      console.log('Request payload:', JSON.stringify(payload, null, 2));
      console.log('Headers:', {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      });
      
      try {
        const response = await api.post(type === "In" ? "/attendance/punch-in" : "/attendance/punch-out", payload);
        console.log('Success Response:', response.data);
        
        // For display purposes, convert to local time
        const displayTime = now.toLocaleString('en-US', {
          // month: 'numeric',
          // day: 'numeric',
          // year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          // second: '2-digit',
          hour12: true
        });

        // Update state based on punch type
        if (type === "In") {
          setCheckedIn(true);
          setLastPunchIn(displayTime);
        } else {
          setCheckedIn(false);
          setLastPunchOut(displayTime);
        }

        setSnackbar({
          open: true,
          message: `Successfully punched ${type.toLowerCase()}!`,
          severity: "success"
        });
      } catch (error) {
        console.error('Error Response:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        setSnackbar({
          open: true,
          message: error.response?.data?.message || `Failed to punch ${type.toLowerCase()}. Please try again.`,
          severity: "error"
        });
        throw error;
      }
    } catch (error) {
      console.error(`Punch ${type} failed:`, error);
      setSnackbar({
        open: true,
        message: error.message || error.response?.data?.message || `Failed to punch ${type.toLowerCase()}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <MainFrame>
      <Box
        sx={{
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 3,
          p: 2,
        }}
      >
        <Typography sx={{ color: "#0000eb", fontWeight: 600, fontSize: "18px" }}>
          Today's Attendance
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              width: "50%",
            }}
          >
            <InkstallButton 
              texts="In" 
              btnColor="#3366cc" 
              visibility={visibility}
              onClick={() => handlePunchAction("In")}
              loading={loading}
            />
            <Card sx={{ width: "30%", padding: "8px", textAlign: "center" }}>
              <Typography sx={{fontSize:"12px", color:"gray", fontWeight:100}}>
                Last In: {lastPunchIn}
              </Typography>
            </Card>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              width: "50%",
            }}
          >
            <InkstallButton 
              texts="Out" 
              btnColor="#fecc00"
              visibility={visibility}
              onClick={() => handlePunchAction("Out")}
              loading={loading}
            />
            <Card sx={{ width: "30%", padding: "8px", textAlign: "center" }}>
              <Typography sx={{fontSize:"12px", color:"gray", fontWeight:100}}>
                Last Out: {lastPunchOut}
              </Typography>
            </Card>
          </Box>
        </Box>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainFrame>
  );
};

export default TodaysAttendance;
