const express = require('express');
const multer = require('multer');
const router = express.Router();
const dailyUpdateController = require('../controllers/dailyupdate.controller');
const { auth } = require('../middleware/auth.middleware');

// Configure multer to use memory storage so that files can be directly uploaded to Nextcloud.
const upload = multer({ storage: multer.memoryStorage() });

// Route for creating a new daily update record.
router.post('/', auth, dailyUpdateController.createDailyUpdate);
// Route for fetching daily updates.
router.get('/', auth, dailyUpdateController.getDailyUpdates);
// Route for uploading a K-Sheet (or Test-Sheet) file.
router.post('/upload-ksheet', auth, upload.single("file"), dailyUpdateController.uploadKSheet);

module.exports = router;
