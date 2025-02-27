import React, { useEffect, useState } from "react";
import { Box, Button, Card } from "@mui/material";
import { AttendanceCard } from "./ui/AttendanceCard";
import MainFrame from "./ui/MainFrame";
import ApplyForLeaveForm from "./ui/ApplyForLeaveForm";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import api from "../api";

const MyAttendance = () => {
  const [open, setOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50vw",
    bgcolor: "background.paper",
    boxShadow: 19,
    p: 1,
  };

  // Fetch attendance data from the updated API endpoint
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await api.get("/attendance/my-attendance");
  
        // 1. Sort the response data so that latest date appears first
        const sortedData = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
  
        // 2. Format the sorted data
        const formattedData = sortedData.map((attendance) => ({
          ...attendance,
          date: new Date(attendance.date).toLocaleDateString(),
          dayOfWeek: new Date(attendance.date).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          checkIn: attendance.punchIn
            ? {
                time: new Date(attendance.punchIn.time).toLocaleTimeString(),
                location:
                  attendance.punchIn.location?.address || "Unknown Location",
              }
            : null,
          checkOut: attendance.punchOut
            ? {
                time: new Date(attendance.punchOut.time).toLocaleTimeString(),
                location:
                  attendance.punchOut.location?.address || "Unknown Location",
              }
            : null,
          workingHours:
            attendance.workingHours > 0 ? `${attendance.workingHours} hrs` : "0",
          status: attendance.status, // Use status directly from backend
        }));
  
        // 3. Update state with sorted & formatted data
        setAttendanceData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
  
    fetchAttendanceData();
  }, []);
  

  return (
    <MainFrame>
      <Card className="w-full mx-auto p-6">
        <Box className="w-full flex items-start justify-between">
          <h2 className="text-2xl font-semibold mb-6 text-primary">
            Recent Attendance (Last 30 Days)
          </h2>
          <Button
            onClick={handleOpen}
            sx={{ backgroundColor: "#fecc00", color: "#fff", fontSize: "14px" }}
          >
            Apply for a Leave
          </Button>
        </Box>
        <div className="space-y-4">
          {attendanceData.map((attendance) => (
            <AttendanceCard
              key={attendance._id} // Ensure unique key
              date={attendance.date}
              dayOfWeek={attendance.dayOfWeek}
              status={attendance.status}
              checkIn={attendance.checkIn}
              checkOut={attendance.checkOut}
              workingHours={attendance.workingHours}
            />
          ))}
        </div>
      </Card>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <ApplyForLeaveForm />
          </Box>
        </Fade>
      </Modal>
    </MainFrame>
  );
};

export default MyAttendance;
