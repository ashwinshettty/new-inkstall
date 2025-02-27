const TestSubmission = require('../models/testsubmission.model');

// Create a new test submission
const createTestSubmission = async (req, res) => {
    try {
        console.log("Received data:", JSON.stringify(req.body, null, 2));

        // Ensure subject fields are properly set
        const submissionData = {
            submissionDate: req.body.submissionDate || new Date(),
            proposedDate: req.body.proposedDate,
            totalMarks: req.body.totalMarks,
            students: req.body.students || [],
            subject: {
                name: req.body.subject.name,
                chapters: req.body.subject.chapters || [],
                notes: req.body.subject.notes || "No notes provided",
                uploadTestFileUrl: req.body.subject.uploadTestFileUrl || "No file uploaded"
            }
        };

        console.log("Modified data to save:", JSON.stringify(submissionData, null, 2));

        const newSubmission = new TestSubmission(submissionData);
        const savedSubmission = await newSubmission.save();

        console.log("Saved submission:", JSON.stringify(savedSubmission.toObject(), null, 2));

        res.status(201).json(savedSubmission);
    } catch (error) {
        console.error("Error creating test submission:", error);
        res.status(400).json({ message: error.message });
    }
};

// Get all test submissions
const getTestSubmissions = async (req, res) => {
    try {
        const submissions = await TestSubmission.find();
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTestSubmission, getTestSubmissions };
