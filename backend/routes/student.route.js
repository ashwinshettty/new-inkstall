const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const Student = require('../models/student.model');

// Create new student
router.post('/', auth, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { 
            studentName, 
            grade, 
            branch, 
            school, 
            board, 
            subjects,
            phoneNumbers,
            status,
            feeConfig
        } = req.body;

        // Validate required fields
        if (!studentName || !grade || !branch || !school || !board) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate subjects
        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one subject is required'
            });
        }

        // Validate phone numbers
        if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one phone number is required'
            });
        }

        // Validate phone number format
        for (const phone of phoneNumbers) {
            if (!phone.number || !phone.relation || !phone.relationName) {
                return res.status(400).json({
                    success: false,
                    message: 'Each phone number must have number, relation, and relationName'
                });
            }
            if (!['father', 'mother', 'guardian', 'self', 'other'].includes(phone.relation)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid relation type. Must be one of: father, mother, guardian, self, other'
                });
            }
        }

        // Validate status if provided
        const validStatuses = ['admissiondue', 'active', 'inactive', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: admissiondue, active, inactive, completed'
            });
        }

        // Validate fee config
        if (!feeConfig || typeof feeConfig.basePrice !== 'number' || typeof feeConfig.totalAmount !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Fee configuration must include basePrice and totalAmount as numbers'
            });
        }

        // Generate student ID
        const studentId = await Student.generateStudentId(board, grade);

        // Create fee breakdown from subjects
        const feeBreakdown = subjects.map(subject => ({
            subject: {
                name: subject.name,
                total: subject.total
            }
        }));

        // Create new student
        const student = new Student({
            studentId,
            studentName,
            grade,
            branch,
            school,
            board,
            subjects: subjects.map(subject => ({
                name: subject.name,
                total: subject.total,
                startDate: subject.startDate ? new Date(subject.startDate) : new Date(),
                endDate: subject.endDate ? new Date(subject.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            })),
            feeBreakdown,
            feeConfig: {
                basePrice: Number(feeConfig.basePrice),
                gstApplied: Boolean(feeConfig.gstApplied),
                gstPercentage: Number(feeConfig.gstPercentage || 0),
                gstAmount: Number(feeConfig.gstAmount || 0),
                scholarshipApplied: Boolean(feeConfig.scholarshipApplied),
                scholarshipPercentage: Number(feeConfig.scholarshipPercentage || 0),
                scholarshipAmount: Number(feeConfig.scholarshipAmount || 0),
                oneToOneApplied: Boolean(feeConfig.oneToOneApplied),
                oneToOnePercentage: Number(feeConfig.oneToOnePercentage || 0),
                oneToOneAmount: Number(feeConfig.oneToOneAmount || 0),
                baseAmount: Number(feeConfig.baseAmount || feeConfig.subTotal),
                totalAmount: Number(feeConfig.totalAmount || feeConfig.total)
            },
            phoneNumbers,
            status: status || 'admissiondue'
        });

        // Save student to database
        const savedStudent = await student.save();
        
        // Format the response
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student: {
                studentId: savedStudent.studentId,
                studentName: savedStudent.studentName,
                grade: savedStudent.grade,
                branch: savedStudent.branch,
                school: savedStudent.school,
                board: savedStudent.board,
                status: savedStudent.status,
                subjects: savedStudent.subjects,
                feeBreakdown: savedStudent.feeBreakdown,
                feeConfig: savedStudent.feeConfig,
                phoneNumbers: savedStudent.phoneNumbers
            }
        });

    } catch (error) {
        console.error('Error creating student:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
});

// Get all students
router.get('/', auth, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            message: 'Students retrieved successfully',
            students: students.map(student => ({
                studentId: student.studentId,
                studentName: student.studentName,
                grade: student.grade,
                branch: student.branch,
                school: student.school,
                board: student.board,
                status: student.status,
                subjects: student.subjects,
                feeBreakdown: student.feeBreakdown,
                phoneNumbers: student.phoneNumbers
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get student by ID
router.get('/:id', auth, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            message: 'Student retrieved successfully',
            student: {
                studentId: student.studentId,
                studentName: student.studentName,
                grade: student.grade,
                branch: student.branch,
                school: student.school,
                board: student.board,
                status: student.status,
                subjects: student.subjects,
                feeBreakdown: student.feeBreakdown,
                phoneNumbers: student.phoneNumbers
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Update student by ID
router.put('/:id', auth, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { 
            studentName,
            grade,
            branch,
            school,
            board,
            subjects,
            feeBreakdown,
            phoneNumbers,
            status
        } = req.body;
        
        let student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        // Validate status if provided
        if (status && !['admissiondue', 'active', 'inactive', 'completed'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: admissiondue, active, inactive, completed'
            });
        }

        // Update basic fields if provided
        if (studentName) student.studentName = studentName;
        if (grade) student.grade = grade;
        if (branch) student.branch = branch;
        if (school) student.school = school;
        if (board) student.board = board;
        if (status) student.status = status;

        // Validate and update phone numbers if provided
        if (Array.isArray(phoneNumbers)) {
            if (phoneNumbers.length === 0) {
                return res.status(400).json({
                    message: 'At least one phone number is required'
                });
            }

            // Validate phone number format
            for (const phone of phoneNumbers) {
                if (!phone.number || !phone.relation || !phone.relationName) {
                    return res.status(400).json({
                        message: 'Each phone number must have number, relation, and relationName'
                    });
                }
                if (!['father', 'mother', 'guardian', 'self', 'other'].includes(phone.relation)) {
                    return res.status(400).json({
                        message: 'Invalid relation type. Must be one of: father, mother, guardian, self, other'
                    });
                }
            }
            student.phoneNumbers = phoneNumbers;
        }

        // Update subjects and fee breakdown if provided
        if (Array.isArray(subjects) && subjects.length > 0) {
            student.subjects = subjects.map(subject => ({
                name: subject.name,
                total: subject.total || 5000,
                startDate: new Date(subject.startDate) || new Date(),
                endDate: new Date(subject.endDate) || new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }));

            // Process subjects and create fee breakdown
            const processedFeeBreakdown = subjects.map(subject => ({
                subject: {
                    name: subject.name,
                    total: subject.total || 5000
                },
                gstApplied: false,
                scholarshipApplied: false,
                scholarshipPercentage: 0,
                oneToOneApplied: false,
                oneToOnePercentage: 0
            }));

            // Apply fee configurations from feeBreakdown if provided
            if (Array.isArray(feeBreakdown)) {
                feeBreakdown.forEach(fee => {
                    if (fee.gstApplied !== undefined) {
                        processedFeeBreakdown.forEach(pFee => {
                            pFee.gstApplied = fee.gstApplied;
                        });
                    }
                    if (fee.scholarshipApplied !== undefined) {
                        processedFeeBreakdown.forEach(pFee => {
                            pFee.scholarshipApplied = fee.scholarshipApplied;
                            pFee.scholarshipPercentage = fee.scholarshipPercentage || 0;
                        });
                    }
                    if (fee.oneToOneApplied !== undefined) {
                        processedFeeBreakdown.forEach(pFee => {
                            pFee.oneToOneApplied = fee.oneToOneApplied;
                            pFee.oneToOnePercentage = fee.oneToOnePercentage || 0;
                        });
                    }
                });
            }

            student.feeBreakdown = processedFeeBreakdown;
        }

        // Save updated student
        const updatedStudent = await student.save();

        // Format the response
        res.json({
            message: 'Student updated successfully',
            student: {
                studentId: updatedStudent.studentId,
                studentName: updatedStudent.studentName,
                grade: updatedStudent.grade,
                branch: updatedStudent.branch,
                school: updatedStudent.school,
                board: updatedStudent.board,
                status: updatedStudent.status,
                subjects: updatedStudent.subjects,
                feeBreakdown: updatedStudent.feeBreakdown,
                phoneNumbers: updatedStudent.phoneNumbers
            }
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            message: 'Error updating student',
            error: error.message
        });
    }
});

// Delete student by ID
router.delete('/:id', auth, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await Student.deleteOne({ _id: req.params.id });
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
});

module.exports = router;
