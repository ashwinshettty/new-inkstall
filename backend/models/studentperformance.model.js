const mongoose = require('mongoose');

const studentPerformanceSchema = new mongoose.Schema({
    studentName: { type: String, required: true },  // Student Name
    subject: { type: String, required: true },  // Subject
    description: { type: String },  // Description (Optional)
    testType: { type: String, required: true },  // Test Type (e.g., Quiz, Exam)
    marks: { type: String, required: true },  // Marks Obtained (as String)
    totalMarks: { type: String, required: true },  // Total Marks (as String)
    submitDateTime: { type: String, required: true },  // Submission Date & Time
}, { timestamps: false });

const StudentPerformance = mongoose.model('StudentPerformance', studentPerformanceSchema);
module.exports = StudentPerformance;