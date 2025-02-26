const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { createTeacherProfile } = require('./teacher.controller');
const Teacher = require('../models/teacher.model');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.initSuperAdmin = async (req, res) => {
    try {
        // Check if any user exists
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(400).json({ error: 'Superadmin already initialized' });
        }

        const { email, password, name } = req.body;
        
        const superadmin = new User({
            email,
            password,
            name,
            role: 'superadmin'
        });

        await superadmin.save();
        const token = generateToken(superadmin._id);

        res.status(201).json({
            message: 'Superadmin created successfully',
            token,
            user: {
                id: superadmin._id,
                email: superadmin.email,
                name: superadmin.name,
                role: superadmin.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set current time as lastLogin in local timezone
        user.lastLogin = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata'
        });
        await user.save();

        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        // Only superadmin and admin can create users
        if (!['superadmin', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { email, password, name, role, subjects, aboutMe, workingHours, salary } = req.body;

        // Superadmin can create any role, admin can only create teachers and students
        if (req.user.role === 'admin' && !['teacher', 'student'].includes(role)) {
            return res.status(403).json({ error: 'Admin can only create teachers and students' });
        }

        const user = new User({
            email,
            password,
            name,
            role,
            createdBy: req.user._id
        });

        await user.save();

        // If the role is teacher, create a teacher profile
        let teacherProfile;
        if (role === 'teacher') {
            try {
                teacherProfile = await createTeacherProfile(user, {
                    subjects: subjects || [],
                    aboutMe: aboutMe || '',
                    workingHours: workingHours || {},
                    salary: salary || { type: 'monthly'||'hourly', amount: 0 }
                });
            } catch (error) {
                // If teacher profile creation fails, delete the user
                await User.findByIdAndDelete(user._id);
                throw error;
            }
        }

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt
            },
            teacherProfile
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();

        res.json({
            count: teachers.length,
            teachers: teachers.map(teacher => ({
                id: teacher.teacherId,
                name: teacher.teacherName,
                email: teacher.emailId,
                subjects: teacher.subjects,
                startingDate: teacher.startingDate,
                aboutMe: teacher.aboutMe,
                workingHours: teacher.workingHours,
                salary: teacher.salary,
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};