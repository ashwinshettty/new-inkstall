const mongoose = require('mongoose');

// Subject schema
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    total: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date }
}, { _id: true });

// Phone number schema
const phoneNumberSchema = new mongoose.Schema({
    number: { type: String, required: true },
    relation: { type: String, required: true, enum: ['father', 'mother', 'guardian', 'self', 'brother', 'sister', 'uncle', 'aunt', 'grandfather', 'grandmother', 'other'] },
    relationName: { type: String, required: true }
}, { _id: true });

// Fee breakdown schema simplified
const feeBreakdownSchema = new mongoose.Schema({
    subject: {
        name: { type: String, required: true },
        total: { type: Number, required: true }
    }
}, { _id: true });

// Fee config schema
const feeConfigSchema = new mongoose.Schema({
    basePrice: { type: Number, required: true },
    gstApplied: { type: Boolean, default: false },
    gstPercentage: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    scholarshipApplied: { type: Boolean, default: false },
    scholarshipPercentage: { type: Number, default: 0 },
    scholarshipAmount: { type: Number, default: 0 },
    oneToOneApplied: { type: Boolean, default: false },
    oneToOnePercentage: { type: Number, default: 0 },
    oneToOneAmount: { type: Number, default: 0 },
    baseAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
}, { _id: true });

// Main student schema
const studentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true, required: true },
    studentName: { type: String, required: true },
    grade: { type: String, required: true },
    branch: { type: String, required: true },
    school: { type: String, required: true },
    status: { type: String, required: true, enum: ['admissiondue', 'active', 'inactive', 'completed'], default: 'admissiondue' },
    subjects: { type: [subjectSchema], required: true, validate: [arr => arr.length > 0, 'At least one subject is required'] },
    phoneNumbers: { type: [phoneNumberSchema], required: true, validate: [arr => arr.length > 0, 'At least one phone number is required'] },
    feeBreakdown: [feeBreakdownSchema],
    feeConfig: { type: feeConfigSchema, required: true },
    studentPhotoUrl: { type: String, default: null },
    board: { type: String, required: true, uppercase: true }
}, { 
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Function to generate student ID
studentSchema.statics.generateStudentId = async function(board, grade) {
    try {
        const boardPrefix = board.toUpperCase();
        const paddedGrade = grade.toString().padStart(2, '0');
        
        const latestStudent = await this.findOne({ board: boardPrefix, grade: grade }).sort({ studentId: -1 });
        let nextNumber = 1;
        if (latestStudent && latestStudent.studentId) {
            const matches = latestStudent.studentId.match(/(\d+)$/);
            if (matches) {
                nextNumber = parseInt(matches[1]) + 1;
            }
        }
        return `${boardPrefix}-${paddedGrade}-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating student ID:', error);
        throw error;
    }
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
