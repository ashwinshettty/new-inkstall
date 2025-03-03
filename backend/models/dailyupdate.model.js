const mongoose = require('mongoose');

const DailyUpdateSchema = new mongoose.Schema({
    date: {
        type: Date, 
        default: Date.now,
        required: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    students: [
        {
            name: { type: String, required: true },
            grade: { type: String, required: true },
            board: { type: String, required: true },
        }
    ],
    subjects: [
        {
            name: { type: String, required: true },
            chapters: [
                {
                    chapterName: { type: String, required: true },
                    notes: { type: String },
                    date: { type: Date, default: Date.now },
                    kSheet: { 
                        type: String, 
                        enum: ['no', 'textual', 'yes'], 
                        default: 'no',
                        required: true 
                    },
                    kSheetUrl: { type: String },
                    chapterCompletion: { 
                        type: String,
                        required: true,
                        default: 'pending'
                    }
                }
            ]
        }
    ]
});

// Middleware to generate K-sheet URL if 'yes' is selected
DailyUpdateSchema.pre('save', async function (next) {
    this.subjects.forEach(subject => {
        subject.chapters.forEach(chapter => {
            if (chapter.kSheet === 'yes') {
                chapter.kSheetUrl = generateNextcloudUrl(this.students, subject.name);
            }
        });
    });
    next();
});

// Function to generate Nextcloud URL (mocked example)
function generateNextcloudUrl(students, subject) {
    const student = students[0]; // Assuming URL based on first student
    return `https://nextcloud.server.com/${student.name}_${student.grade}_${student.board}_${subject}.pdf`;
}

module.exports = mongoose.model('DailyUpdate', DailyUpdateSchema);
