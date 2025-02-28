const express = require('express');
const Branch = require('../models/branch.model');

const router = express.Router();

// Get all branches
router.get('/branches', async (req, res) => {
    try {
        const branches = await Branch.find();
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;