import React, { useState, useEffect } from "react";
import MainFrame from "./ui/MainFrame";
import { Box, Card, Typography, Snackbar, Alert } from "@mui/material";
import InkstallButton from "./ui/InkstallButton";
import api from "../api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const TodaysAttendance = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [lastPunchIn, setLastPunchIn] = useState("--");
  const [lastPunchOut, setLastPunchOut] = useState("--");
  const [visibility, setVisibility] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch attendance data for today
  const fetchAttendanceHistory = async () => {
    try {
      setLastPunchIn("--");
      setLastPunchOut("--");

      const today = dayjs();
      const formattedDate = today.format("M/D/YYYY"); 

      const response = await api.get(`/attendance/history?date=${formattedDate}`);

      if (response.data && response.data[0]) {
        const attendance = response.data[0];
        const datePart = attendance.date.split(",")[0].trim();
        const recordDate = dayjs(datePart, "M/D/YYYY");

        if (recordDate.isSame(today, "day")) {
          if (attendance.punchIn) {
            const timePart = attendance.formattedPunchIn.split(", ")[1];
            setLastPunchIn(timePart);
            setCheckedIn(true);
          }
          if (attendance.punchOut) {
            const timePart = attendance.formattedPunchOut.split(", ")[1];
            setLastPunchOut(timePart);
            setCheckedIn(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch attendance history",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  // Punch In / Punch Out
  const handlePunchAction = async (type) => {
    setLoading(true);
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(
                  new Error("Please allow location access to mark attendance")
                );
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
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const now = new Date();
      const formattedTime = now.toISOString(); // Send in ISO format

      const payload = {
        latitude: Number(latitude.toFixed(7)),
        longitude: Number(longitude.toFixed(7)),
        time: formattedTime,
      };

      const endpoint =
        type === "In" ? "/attendance/punch-in" : "/attendance/punch-out";
      const response = await api.post(endpoint, payload);

      // Convert to local time for display
      const displayTime = now.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

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
        severity: "success",
      });
    } catch (error) {
      console.error(`Punch ${type} failed:`, error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          `Failed to punch ${type.toLowerCase()}. Please try again.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <MainFrame>
      {/* Container for both sections */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        
        {/* Today's Attendance Card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 2,
            p: 4,
            boxShadow: 1,
          }}
        >
          <Typography
            sx={{
              color: "#000066",
              fontWeight: 800,
              fontSize: "22px",
              textAlign: "center",
              mb: 2,
            }}
          >
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
            {/* Punch In Section */}
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
              <Card sx={{ width: "30%", p: 1, textAlign: "center" }}>
                <Typography sx={{ fontSize: "14px", color: "black", fontWeight: 500 }}>
                  Last In: {lastPunchIn}
                </Typography>
              </Card>
            </Box>

            {/* Punch Out Section */}
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
              <Card sx={{ width: "30%", p: 1, textAlign: "center" }}>
                <Typography sx={{ fontSize: "14px", color: "black", fontWeight: 500 }}>
                  Last Out: {lastPunchOut}
                </Typography>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Top Performers Card */}
        <Box
  sx={{
    bgcolor: "#fff",
    borderRadius: 2,
    p: 4,
    boxShadow: 1,
  }}
>
  <Typography
    sx={{
      color: "#000066",
      fontWeight: 800,
      fontSize: "22px",
      textAlign: "center",
    }}
  >
    Top Performers
  </Typography>

  {/* Flex container to center the table */}
  <Box
    sx={{
      mt: 2,
      display: "flex",
      justifyContent: "center", // horizontally center
    }}
  >
    {/* Make table narrower, center text */}
    <table
      style={{
        width: "300px",            // fixed width to make it small
        borderCollapse: "collapse",
        textAlign: "center",       // center all table text
      }}
    >
      <thead style={{ backgroundColor: "#f5f5f5" }}>
        <tr>
          <th style={{ padding: "8px" }}>Name</th>
          <th style={{ padding: "8px" }}>Points</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: "8px" }}>Alice</td>
          <td style={{ padding: "8px" }}>120</td>
        </tr>
        <tr>
          <td style={{ padding: "8px" }}>Bob</td>
          <td style={{ padding: "8px" }}>95</td>
        </tr>
        <tr>
          <td style={{ padding: "8px" }}>Charlie</td>
          <td style={{ padding: "8px" }}>85</td>
        </tr>
      </tbody>
    </table>
  </Box>
</Box>

      </Box>

      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainFrame>
  );
};

export default TodaysAttendance;
