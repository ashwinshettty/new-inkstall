const DailyUpdate = require('../models/dailyupdate.model');

// Create a new daily update under the logged-in user
const createDailyUpdate = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user logged in" });
        }

        const dailyUpdate = new DailyUpdate({
            ...req.body, 
            createdBy: req.user._id // Assign logged-in user ID
        });

        await dailyUpdate.save();
        res.status(201).json(dailyUpdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Fetch daily updates for the logged-in user
const getDailyUpdates = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user logged in" });
        }

        const updates = await DailyUpdate.find({ createdBy: req.user._id });
        res.status(200).json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createDailyUpdate, getDailyUpdates };
