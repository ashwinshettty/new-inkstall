// subjects.routes.js
const express = require('express');
const router = express.Router();
const Subject = require('../models/subjects.model');

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({}, { name: 1, _id: 0 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
