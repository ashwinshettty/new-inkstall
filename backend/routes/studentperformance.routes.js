const express = require('express');
const router = express.Router();
const {
    createStudentPerformance,
    getAllStudentPerformances,
    getStudentPerformanceById,
    updateStudentPerformance,
    deleteStudentPerformance
} = require('../controllers/studentPerformance.controller');


// Routes for student performance without auth for testing
router.post('/', createStudentPerformance);
router.get('/', getAllStudentPerformances);
router.get('/:id', getStudentPerformanceById);
router.put('/:id', updateStudentPerformance);
router.delete('/:id', deleteStudentPerformance);


module.exports = router;