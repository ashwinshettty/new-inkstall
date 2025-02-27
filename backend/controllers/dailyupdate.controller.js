const DailyUpdate = require('../models/dailyupdate.model');

// Create a new daily update
const createDailyUpdate = async (req, res) => {
    try {
        const dailyUpdate = new DailyUpdate(req.body);
        await dailyUpdate.save();
        res.status(201).json(dailyUpdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Fetch all daily updates
const getDailyUpdates = async (req, res) => {
    try {
        const updates = await DailyUpdate.find();
        res.status(200).json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createDailyUpdate, getDailyUpdates };
