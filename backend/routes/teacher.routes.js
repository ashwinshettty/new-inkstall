const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const teacherController = require('../controllers/teacher.controller');

// Get teacher profile
router.get('/:id', auth, teacherController.getTeacherProfile);

// Update teacher profile (including profile photo)
router.patch('/:id', auth, teacherController.updateTeacherProfile);

// Delete teacher profile
router.delete('/:id', auth, teacherController.deleteTeacherProfile);

module.exports = router;