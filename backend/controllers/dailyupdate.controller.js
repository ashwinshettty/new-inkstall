const DailyUpdate = require('../models/dailyupdate.model');
// Assuming you have a TestSubmission model (if not, you'll need to create one)
const TestSubmission = require('../models/testsubmission.model'); 
const axios = require('axios');
require('dotenv').config();

const NEXTCLOUD_BASE_URL = process.env.NEXTCLOUD_BASE_URL || 'https://drive.inkstall.us';
const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME;
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD;

if (!NEXTCLOUD_USERNAME || !NEXTCLOUD_PASSWORD) {
    console.error('❌ Missing Nextcloud credentials.');
    process.exit(1);
}

/**
 * Helper function to encode each path segment separately.
 */
function encodePath(path) {
    return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

/**
 * Ensure a folder exists in Nextcloud.
 */
async function ensureFolderExists(folderPath) {
    try {
        const encodedFolderPath = encodePath(folderPath);
        const fullUrl = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${encodeURIComponent(NEXTCLOUD_USERNAME)}/${encodedFolderPath}/`;
        await axios({
            method: 'MKCOL',
            url: fullUrl,
            auth: { username: NEXTCLOUD_USERNAME, password: NEXTCLOUD_PASSWORD },
            validateStatus: (status) => status === 201 || status === 405,
        });
        console.log(`✅ Folder ensured: ${folderPath}`);
    } catch (error) {
        console.error(`⚠️ Error ensuring folder: ${folderPath}`, error.response ? error.response.data : error.message);
    }
}

/**
 * Build folder path as:
 * Tests and K-Sheets / [Subject] / [K-sheet or Test Sheet] / [Grade] / [filename]
 */
function buildFolderAndFilePath(file, student, subject, fileType) {
    const baseFolder = "Tests and K-Sheets";
    const subjectFolder = subject.trim();
    const typeFolder = fileType === "k-sheet" ? "K-sheet" : "Test Sheet";
    const gradeFolder = student.grade.trim();
    const folderPath = `${baseFolder}/${subjectFolder}/${typeFolder}/${gradeFolder}`;
    const filePath = `${folderPath}/${file.originalname}`;
    return { folderPath, filePath };
}

/**
 * Upload file to Nextcloud.
 */
async function uploadToNextcloud(file, student, subject, fileType) {
    try {
        const { folderPath, filePath } = buildFolderAndFilePath(file, student, subject, fileType);
        // Ensure folders exist
        const baseFolder = "Tests and K-Sheets";
        await ensureFolderExists(baseFolder);
        await ensureFolderExists(`${baseFolder}/${subject}`);
        await ensureFolderExists(`${baseFolder}/${subject}/${fileType === "k-sheet" ? "K-sheet" : "Test Sheet"}`);
        await ensureFolderExists(`${baseFolder}/${subject}/${fileType === "k-sheet" ? "K-sheet" : "Test Sheet"}/${student.grade.trim()}`);
        const encodedFilePath = encodePath(filePath);
        const fullUrl = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${encodeURIComponent(NEXTCLOUD_USERNAME)}/${encodedFilePath}`;
        console.log(`📤 Uploading file to: ${fullUrl}`);
        await axios({
            method: 'PUT',
            url: fullUrl,
            data: file.buffer,
            headers: {
                Authorization: `Basic ${Buffer.from(`${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}`).toString('base64')}`,
                'Content-Type': file.mimetype,
                'Content-Length': file.size,
            },
            validateStatus: (status) => status === 201 || status === 204,
        });
        return fullUrl;
    } catch (error) {
        console.error('❌ Nextcloud Upload Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Modified upload endpoint that checks for either dailyUpdateId or testSubmissionId.
 */
const uploadKSheet = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized: No user logged in" });
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        
        const { dailyUpdateId, testSubmissionId, subjectName, chapterName, fileType } = req.body;
        let record;
        let recordType;

        if (dailyUpdateId) {
            record = await DailyUpdate.findById(dailyUpdateId);
            recordType = "dailyUpdate";
            if (!record) return res.status(404).json({ message: "Daily update not found" });
        } else if (testSubmissionId) {
            record = await TestSubmission.findById(testSubmissionId);
            recordType = "testSubmission";
            if (!record) return res.status(404).json({ message: "Test submission not found" });
        } else {
            return res.status(400).json({ message: "No valid record identifier provided" });
        }

        // Use the first student to determine grade.
        const student = record.students[0];
        if (!student || !student.grade) {
            return res.status(400).json({ message: "Student grade information is missing" });
        }

        const uploadedUrl = await uploadToNextcloud(req.file, student, subjectName, fileType);

        // Update the record appropriately:
        if (recordType === "dailyUpdate") {
            record.subjects.forEach(subject => {
                if (subject.name === subjectName) {
                    subject.chapters.forEach(chapter => {
                        if (chapter.chapterName === chapterName) {
                            if (fileType === "k-sheet") {
                                chapter.kSheetUrl = uploadedUrl;
                            } else {
                                chapter.testSubmissionUrl = uploadedUrl;
                            }
                        }
                    });
                }
            });
        } else {
            // For test submissions, assume a single subject field.
            record.subject.uploadTestFileUrl = uploadedUrl;
        }

        await record.save();
        res.status(200).json({ message: "File uploaded successfully", fileUrl: uploadedUrl });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ message: "Error uploading file", error: error.message });
    }
};
/**
 * Get all DailyUpdates for the logged-in user.
 */
const getDailyUpdates = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized: No user logged in" });
        const updates = await DailyUpdate.find({ createdBy: req.user._id });
        res.status(200).json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new DailyUpdate for the logged-in user.
 */
const createDailyUpdate = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user logged in" });
        }
        const dailyUpdate = new DailyUpdate({
            ...req.body, 
            createdBy: req.user._id
        });
        await dailyUpdate.save();
        res.status(201).json(dailyUpdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createDailyUpdate, getDailyUpdates, uploadKSheet };
