const express = require("express");
const router = express.Router();
const Grades = require("../models/grades.model"); // Import model

// GET API to fetch all grades
router.get("/grades", async (req, res) => {
  try {
    const results = await Grades.find();
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No grades found" });
    }
    res.json(results);
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
