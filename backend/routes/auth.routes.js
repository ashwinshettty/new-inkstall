const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const teacherController = require('../controllers/teacher.controller');

// Public routes
router.post('/init-superadmin', authController.initSuperAdmin);
router.post('/login', authController.login);

// Protected routes
router.post('/users', auth, authorize('superadmin', 'admin'), authController.createUser);
router.get('/teachers', auth, authorize('superadmin', 'admin'), authController.getAllTeachers);
router.get('/users/:id/teacher-profile', auth, teacherController.getTeacherProfile);

module.exports = router;