const express = require('express');
const router = express.Router();
const { createDailyUpdate, getDailyUpdates } = require('../controllers/dailyupdate.controller');

// POST: Create a new daily update entry
router.post('/', createDailyUpdate);

// GET: Fetch all daily updates
router.get('/', getDailyUpdates);

module.exports = router;
