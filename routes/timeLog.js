const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const timeLogController = require('../controllers/timeLogController');

// Create a new time log
router.post('/', auth, timeLogController.createTimeLog);

// Get all time logs (with optional filters)
router.get('/', auth, timeLogController.getTimeLogs);

// Get all time logs for a task
router.get('/task/:taskId', auth, timeLogController.getTimeLogsByTask);

// Get time log summary for a task
router.get('/task/:taskId/summary', auth, timeLogController.getTimeLogSummary);

// Update a time log
router.put('/:id', auth, timeLogController.updateTimeLog);

// Delete a time log (soft delete)
router.delete('/:id', auth, timeLogController.deleteTimeLog);

module.exports = router;