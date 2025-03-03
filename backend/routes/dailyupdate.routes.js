const express = require('express');
const router = express.Router();
const { createDailyUpdate, getDailyUpdates } = require('../controllers/dailyupdate.controller');
const { auth } = require('../middleware/auth.middleware'); // Import authentication middleware

// POST: Create a new daily update (Requires Authentication)
router.post('/', auth, createDailyUpdate);

// GET: Fetch all daily updates for the logged-in user
router.get('/', auth, getDailyUpdates);

module.exports = router;
