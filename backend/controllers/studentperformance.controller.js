const StudentPerformance = require('../models/studentperformance.model');

// Helper function to remove __v field from response
const removeVersionKey = (doc) => {
    if (!doc) return null;
    const docObj = doc.toObject ? doc.toObject() : doc;
    const { __v, ...docWithoutVersion } = docObj;
    return docWithoutVersion;
};

// Create a new student performance entry
exports.createStudentPerformance = async (req, res) => {
    try {
        const { studentName, subject, description, testType, marks, totalMarks, submitDateTime } = req.body;

        if (!studentName || !subject || !testType || !marks || !totalMarks || !submitDateTime) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const performance = new StudentPerformance({
            studentName,
            subject,
            description,
            testType,
            marks,
            totalMarks,
            submitDateTime
        });

        const savedPerformance = await performance.save();

        res.status(201).json({
            success: true,
            message: 'Student performance recorded successfully',
            data: removeVersionKey(savedPerformance)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error recording performance', error: error.message });
    }
};

// Get all student performance records
exports.getAllStudentPerformances = async (req, res) => {
    try {
        const performances = await StudentPerformance.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Student performance records retrieved successfully',
            data: performances.map(performance => removeVersionKey(performance))
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving records', error: error.message });
    }
};

// Get a single student performance record by ID
exports.getStudentPerformanceById = async (req, res) => {
    try {
        const performance = await StudentPerformance.findById(req.params.id);

        if (!performance) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({
            success: true,
            message: 'Student performance record retrieved successfully',
            data: removeVersionKey(performance)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving record', error: error.message });
    }
};

// Update student performance record
exports.updateStudentPerformance = async (req, res) => {
    try {
        const updatedPerformance = await StudentPerformance.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedPerformance) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({
            success: true,
            message: 'Student performance record updated successfully',
            data: removeVersionKey(updatedPerformance)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating record', error: error.message });
    }
};

// Delete student performance record
exports.deleteStudentPerformance = async (req, res) => {
    try {
        const deletedPerformance = await StudentPerformance.findByIdAndDelete(req.params.id);

        if (!deletedPerformance) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({
            success: true,
            message: 'Student performance record deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting record', error: error.message });
    }
};