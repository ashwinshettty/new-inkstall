const mongoose = require('mongoose');
const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const Attendance = require('../models/attendance.model');

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata'
    });
};

exports.createTeacherProfile = async (userData, additionalData) => {
    try {
        if (!userData || !userData._id) {
            throw new Error('User data is required');
        }

        const { subjects, aboutMe, workingHours, salary, profilePhotourl } = additionalData || {};

        const teacher = new Teacher({
            teacherId: userData._id,
            teacherName: userData.name,
            emailId: userData.email,
            profilePhotourl, // Now saving the URL here
            startingDate: formatDate(new Date()),
            subjects,
            aboutMe,
            workingHours,
            salary
        });

        await teacher.save();
        return teacher;
    } catch (error) {
        throw error;
    }
};


exports.getTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.params.id;
        if (!teacherId) {
            return res.status(400).json({ error: 'Teacher ID is required' });
        }

        const teacher = await Teacher.findOne({ teacherId });
        
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher profile not found' });
        }

        res.json(teacher);
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({ error: 'Failed to fetch teacher profile' });
    }
};

exports.updateTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.params.id;
        if (!teacherId) {
            return res.status(400).json({ error: 'Teacher ID is required' });
        }

        const updates = req.body;
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        // Validate profile photo if it's being updated
        if (updates.profilePhoto) {
            if (!updates.profilePhoto.url && !updates.profilePhoto.filename) {
                return res.status(400).json({ error: 'Profile photo must have either url or filename' });
            }
            updates.profilePhoto = {
                url: updates.profilePhoto.url || '',
                filename: updates.profilePhoto.filename || ''
            };
        }

        const teacher = await Teacher.findOneAndUpdate(
            { teacherId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher profile not found' });
        }

        res.json(teacher);
    } catch (error) {
        console.error('Error updating teacher profile:', error);
        res.status(500).json({ 
            error: 'Failed to update teacher profile',
            details: error.message
        });
    }
};

// Delete teacher profile
exports.deleteTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.params.id;
        if (!teacherId) {
            return res.status(400).json({ error: 'Teacher ID is required' });
        }

        // First check if teacher exists
        const teacherExists = await Teacher.findOne({ teacherId });
        if (!teacherExists) {
            return res.status(404).json({ error: 'Teacher profile not found' });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete teacher profile
            await Teacher.findOneAndDelete({ teacherId }).session(session);
            
            // Delete user account using the teacherId (which is the user's _id)
            const deletedUser = await User.findByIdAndDelete(teacherId).session(session);
            if (!deletedUser) {
                throw new Error('Failed to delete user account');
            }

            // Delete attendance records
            await Attendance.deleteMany({ teacherId }).session(session);

            // Commit the transaction
            await session.commitTransaction();
            
            res.json({ 
                message: 'Teacher and user records deleted successfully'
            });
        } catch (error) {
            // If any operation fails, abort the transaction
            await session.abortTransaction();
            throw error;
        } finally {
            // End the session
            session.endSession();
        }
        
    } catch (error) {
        console.error('Error deleting teacher profile:', error);
        res.status(500).json({ 
            error: 'Failed to delete teacher and user records',
            details: error.message
        });
    }
};