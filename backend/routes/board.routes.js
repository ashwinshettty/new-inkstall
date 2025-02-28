const express = require('express');
const Board = require('../models/board.model');

const router = express.Router();

// Get all boards
router.get('/boards', async (req, res) => {
    try {
        const boards = await Board.find();
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;