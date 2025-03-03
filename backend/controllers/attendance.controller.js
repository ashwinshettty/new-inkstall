const Attendance = require("../models/attendance.model");
const axios = require("axios");


// Function to perform automatic punch-out at 3:00 PM IST
async function performAutoPunchOut() {
    try {
      // Get today's date at midnight for more accurate querying
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get tomorrow's date
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      // Find attendance records where punch-in exists but punch-out is missing
      const unpunchedRecords = await Attendance.find({
        date: {
          $gte: today,
          $lt: tomorrow
        },
        "punchIn.time": { $exists: true },
        "punchOut.time": { $exists: false },
      });
  
      console.log(`Found ${unpunchedRecords.length} records without punch-out`);
  
      for (const record of unpunchedRecords) {
        const punchOutTime = new Date();
        punchOutTime.setHours(15, 25, 0, 0); // Set to 3:00 PM IST
  
        // Ensure punch-out data is saved correctly
        record.punchOut = {
          time: punchOutTime,
          location: record.punchIn.location, // Reuse punch-in location
        };
  
        // First set status to ensure it's not overwritten
        record.status = "auto-punched-out";
  
        // Explicitly mark fields as modified (in case Mongoose doesn't detect it)
        record.markModified("punchOut");
        record.markModified("status");
  
        // Use save options to bypass schema validation if needed
        await record.save({ validateBeforeSave: false });
  
        console.log(
          `Auto punch-out completed for teacher: ${record.teacherId} & Updated Status: ${record.status}`
        );
      }
  
      return unpunchedRecords;
    } catch (error) {
      console.error("Auto punch-out error:", error);
      throw error;
    }
  }
  

// Export functions
module.exports = { 
    performAutoPunchOut 
};
