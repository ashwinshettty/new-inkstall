const mongoose = require('mongoose');

const TestSubmissionSchema = new mongoose.Schema({
    submissionDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    proposedDate: {
        type: Date,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    students: [
        {
            name: {
                type: String,
                required: true
            },
            grade: {
                type: String,
                required: true
            }
        }
    ],
    subject: {
        name: {
            type: String,
            required: true
        },
        chapters: [
            {
                chapterName: {
                    type: String,
                    required: true
                }
            }
        ],
        notes: {  
            type: String,
            default: "No notes provided"
        },
        uploadTestFileUrl: {  
            type: String,
            default: "No file uploaded"
        }
    }
});

module.exports = mongoose.model('testsubmission', TestSubmissionSchema);
