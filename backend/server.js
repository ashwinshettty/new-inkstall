const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const corsOptions = require('./config/cors');
const routes = require('./routes/index.routes');
const authRoutes = require('./routes/auth.routes');
const teacherRoutes = require('./routes/teacher.routes');
const studentRoutes = require('./routes/student.routes');
const leaveRequestRoutes = require('./routes/leaveRequest.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const dailyUpdateRoutes = require('./routes/dailyupdate.routes');
const testSubmissionRoutes = require('./routes/testsubmission.routes');
const subjectsRoutes = require('./routes/subjects.routes');
const boardRoutes = require('./routes/board.routes');
const gradesRoutes = require('./routes/grades.routes');
const branchRoutes = require('./routes/branch.routes');
const uploadRoutes = require('./routes/upload.routes'); // Import photo route
// const nextcloudRoutes = require('./routes/nextcloud-routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const studentPerformanceRoutes = require('./routes/studentperformance.routes');

const app = express();

// Set a fixed port
const PORT = 4000;

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

// Middleware
app.use(cors(corsOptions));
// Increase JSON payload limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/daily-updates', dailyUpdateRoutes);
app.use('/api/test-submissions', testSubmissionRoutes )
app.use('/api/student-performance', studentPerformanceRoutes);
app.use('/api', subjectsRoutes)
app.use('/api',boardRoutes)
app.use('/api',gradesRoutes)
app.use('/api',branchRoutes)
app.use('/api/upload', uploadRoutes); // Register the route


app.use('/', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    server.close(() => {
        process.exit(1);
    });
});