const express = require("express");
const router = express.Router();
const axios = require("axios");
const { auth } = require("../middleware/auth.middleware");
const Attendance = require("../models/attendance.model");
const Teacher = require("../models/teacher.model");
const cron = require('node-cron');

// Schedule the job for every day at 10:30 PM IST
cron.schedule('30 22 * * *', async () => {
    try {
        await performAutoPunchOut();
    } catch (error) {
        console.error('Auto punch-out error:', error);
    }
}, {
    timezone: "Asia/Kolkata"  // Ensures IST scheduling
});

// Function to get address from coordinates using Google Maps API
async function getAddressFromCoordinates(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }
    throw new Error("No address found");
  } catch (error) {
    console.error("Error fetching address:", error);
    throw new Error("Failed to fetch address details");
  }
}

// Function to perform automatic punch-out at 10:30 PM IST
async function performAutoPunchOut() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = today.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Find all attendance records for today without punch-out
    const unpunchedRecords = await Attendance.find({
      date: todayFormatted,
      "punchIn.time": { $exists: true },
      "punchOut.time": { $exists: false },
    });

    console.log(`Found ${unpunchedRecords.length} records without punch-out`);

    for (const record of unpunchedRecords) {
      const punchOutTime = new Date();
      // Set punchOutTime to 10:30 PM IST
      punchOutTime.setHours(22, 30, 0, 0);

      record.punchOut = {
        time: punchOutTime.toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        location: record.punchIn.location, // Reuse punch-in location for auto punch-out
      };
      // Update status to indicate auto punch-out
      record.status = "auto-punched-out";
      await record.save();
      console.log(`Auto punch-out completed for teacher: ${record.teacherId}`);
    }
    return unpunchedRecords;
  } catch (error) {
    console.error("Auto punch-out error:", error);
    throw error;
  }
}

// Automatic punch-out check every minute
setInterval(async () => {
  try {
    const now = new Date();
    // Check if current time is exactly 10:30 PM IST
    if (now.getHours() === 22 && now.getMinutes() === 30) {
      await performAutoPunchOut();
    }
  } catch (error) {
    console.error("Auto punch-out error:", error);
  }
}, 60000); // Check every minute

// Punch In
router.post("/punch-in", auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const teacherId = req.user._id;

    // Allow teachers, admins, and superadmins
    if (!["teacher", "admin", "superadmin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: "Only teachers, admins, and superadmins can punch in",
        });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Get address from coordinates
    const address = await getAddressFromCoordinates(latitude, longitude);

    // Check if attendance record exists for today
    let attendance = await Attendance.findOne({
      teacherId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (attendance) {
      return res.status(400).json({ message: "Already punched in for today" });
    }

    // Create new attendance record
    attendance = new Attendance({
      teacherId,
      date: today,
      status: "inprogress",
      punchIn: {
        time: now,
        location: {
          latitude,
          longitude,
          address,
        },
      },
    });

    await attendance.save();

    // Get the formatted response
    const response = attendance.toJSON();

    res.status(201).json({
      message: "Punch in successful",
      attendance: response,
    });
  } catch (error) {
    console.error("Punch in error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Punch Out
router.post("/punch-out", auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const teacherId = req.user._id;

    // Allow teachers, admins, and superadmins
    if (!["teacher", "admin", "superadmin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: "Only teachers, admins, and superadmins can punch out",
        });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's attendance record with punch-in
    const attendance = await Attendance.findOne({
      teacherId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
      "punchIn.time": { $exists: true },
    });

    if (!attendance) {
      return res
        .status(400)
        .json({ message: "You must punch in first before punching out" });
    }

    if (attendance.punchOut && attendance.punchOut.time) {
      return res
        .status(400)
        .json({ message: "You have already punched out for today" });
    }

    // Get address from coordinates
    const address = await getAddressFromCoordinates(latitude, longitude);

    // Update with punch out details
    attendance.punchOut = {
      time: new Date(),
      location: {
        latitude,
        longitude,
        address,
      },
    };

    // Set status to completed
    // attendance.status = 'completed';

    await attendance.save();

    res.json({
      message: "Punch out successful",
      attendance: attendance.toJSON(),
    });
  } catch (error) {
    console.error("Punch out error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance history
router.get("/history", auth, async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { teacherId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all attendance records with optional filters
router.get("/all", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query filters
    const query = {};

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Attendance.countDocuments(query);

    // Get attendance records with pagination
    const attendanceRecords = await Attendance.find(query)
      .populate("teacherId", "name email phone") // Include teacher details
      .sort({ date: -1 }) // Sort by date descending
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      message: "Attendance records retrieved successfully",
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      records: attendanceRecords,
    });
  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/my-attendance", auth, async (req, res) => {
  try {
    const teacherId = req.user._id;
    const attendanceRecords = await Attendance.find({ teacherId });
    res.json(attendanceRecords); // Ensure this includes punchIn, punchOut, workingHours, and status
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching attendance records",
        error: error.message,
      });
  }
});
module.exports = router;
