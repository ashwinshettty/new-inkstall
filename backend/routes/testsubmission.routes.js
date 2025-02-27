const express = require('express');
const router = express.Router();
const { createTestSubmission, getTestSubmissions } = require('../controllers/testsubmission.controller');

// POST: Create a test submission
router.post('/', createTestSubmission);

// GET: Get all test submissions
router.get('/', getTestSubmissions);

module.exports = router;
