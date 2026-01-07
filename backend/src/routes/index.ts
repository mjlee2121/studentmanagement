import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as studentController from '../controllers/studentController.js';
import * as courseController from '../controllers/courseController.js';
import * as enrollmentController from '../controllers/enrollmentController.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as progressController from '../controllers/progressController.js';
import * as testScoreController from '../controllers/testScoreController.js';
import * as invoiceController from '../controllers/invoiceController.js';
import * as noteController from '../controllers/noteController.js';
import {
  isAdmin,
  isAdminOrStaff,
  isAdminOrInstructor,
} from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getCurrentUser);

// Student routes
router.get('/students', authenticateToken, studentController.getStudents);
router.get('/students/:id', authenticateToken, studentController.getStudent);
router.post('/students', authenticateToken, isAdminOrStaff, studentController.createStudent);
router.put('/students/:id', authenticateToken, isAdminOrStaff, studentController.updateStudent);
router.delete('/students/:id', authenticateToken, isAdmin, studentController.deleteStudent);

// Course routes
router.get('/courses', authenticateToken, courseController.getCourses);
router.get('/courses/:id', authenticateToken, courseController.getCourse);
router.post('/courses', authenticateToken, isAdminOrStaff, courseController.createCourse);
router.put('/courses/:id', authenticateToken, isAdminOrStaff, courseController.updateCourse);
router.delete('/courses/:id', authenticateToken, isAdmin, courseController.deleteCourse);

// Enrollment routes
router.post('/enrollments', authenticateToken, isAdminOrStaff, enrollmentController.createEnrollment);
router.put('/enrollments/:id/status', authenticateToken, isAdminOrStaff, enrollmentController.updateEnrollmentStatus);
router.delete('/enrollments/:id', authenticateToken, isAdminOrStaff, enrollmentController.deleteEnrollment);

// Attendance routes
router.post('/attendances', authenticateToken, isAdminOrInstructor, attendanceController.createAttendance);
router.put('/attendances/:id', authenticateToken, isAdminOrInstructor, attendanceController.updateAttendance);
router.delete('/attendances/:id', authenticateToken, isAdminOrInstructor, attendanceController.deleteAttendance);

// Progress report routes
router.post('/progress-reports', authenticateToken, isAdminOrInstructor, progressController.createProgressReport);
router.put('/progress-reports/:id', authenticateToken, isAdminOrInstructor, progressController.updateProgressReport);
router.delete('/progress-reports/:id', authenticateToken, isAdminOrInstructor, progressController.deleteProgressReport);

// Test score routes
router.post('/test-scores', authenticateToken, isAdminOrStaff, testScoreController.createTestScore);
router.put('/test-scores/:id', authenticateToken, isAdminOrStaff, testScoreController.updateTestScore);
router.delete('/test-scores/:id', authenticateToken, isAdminOrStaff, testScoreController.deleteTestScore);

// Invoice routes
router.post('/invoices', authenticateToken, isAdminOrStaff, invoiceController.createInvoice);
router.put('/invoices/:id', authenticateToken, isAdminOrStaff, invoiceController.updateInvoice);
router.delete('/invoices/:id', authenticateToken, isAdminOrStaff, invoiceController.deleteInvoice);

// Note routes
router.post('/notes', authenticateToken, isAdminOrStaff, noteController.createNote);
router.put('/notes/:id', authenticateToken, isAdminOrStaff, noteController.updateNote);
router.delete('/notes/:id', authenticateToken, isAdminOrStaff, noteController.deleteNote);

export default router;

