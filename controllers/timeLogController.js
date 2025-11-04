const TimeLog = require('../models/TimeLog');
const ProjectTask = require('../models/ProjectTask');
const mongoose = require('mongoose');

// ============================
// GET ALL TIME LOGS
// ============================
exports.getTimeLogs = async (req, res) => {
  try {
    const { startDate, endDate, task } = req.query;
    const query = { isActive: true };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Add task filter if provided
    if (task) {
      query.task = task;
    }

    const timeLogs = await TimeLog.find(query)
      .populate('task', 'title description')
      .populate('user', 'name email')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: timeLogs
    });
  } catch (error) {
    console.error("Error fetching time logs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching time logs"
    });
  }
};

// ============================
// CREATE A NEW TIME LOG WITH TRANSACTION (fallback to non-transactional if not supported)
// ============================
exports.createTimeLog = async (req, res) => {
  const { task, hours, date, description } = req.body;

  // Basic pre-validation
  if (!task || date === undefined || date === null) {
    return res.status(400).json({ success: false, message: "'task' and 'date' fields are required" });
  }

  const numericHours = Number(hours);
  if (!Number.isFinite(numericHours) || numericHours <= 0) {
    return res.status(400).json({ success: false, message: "'hours' must be a positive number" });
  }

  let session;
  try {
    // Try to start a session/transaction (will fail on standalone mongod)
    session = await mongoose.startSession();
    session.startTransaction();

    // Check task exists within session
    const existingTask = await ProjectTask.findById(task).session(session);
    if (!existingTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const newTimeLogArr = await TimeLog.create([
      { task, user: req.user && req.user._id, hours: numericHours, date, description }
    ], { session });

    const updatedTask = await ProjectTask.findByIdAndUpdate(
      task,
      { $inc: { totalHours: numericHours } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, message: 'Time log created successfully', data: { timeLog: newTimeLogArr[0], task: updatedTask } });

  } catch (err) {
    // If transaction not supported (standalone mongod), fall back to non-transactional flow
    const txnNotSupported = err && typeof err.message === 'string' && err.message.includes('Transaction numbers are only allowed');

    if (session) {
      try { await session.abortTransaction(); } catch (e) { /* ignore */ }
      session.endSession();
    }

    if (txnNotSupported) {
      try {
        const existingTask = await ProjectTask.findById(task);
        if (!existingTask) return res.status(404).json({ success: false, message: 'Task not found' });

        const newTimeLog = await TimeLog.create({ task, user: req.user && req.user._id, hours: numericHours, date, description });

        const updatedTask = await ProjectTask.findByIdAndUpdate(task, { $inc: { totalHours: numericHours } }, { new: true });

        return res.status(201).json({ success: true, message: 'Time log created successfully (no transaction)', data: { timeLog: newTimeLog, task: updatedTask } });
      } catch (innerErr) {
        console.error('Fallback (non-transactional) error:', innerErr);
        if (innerErr && innerErr.name === 'ValidationError') {
          const messages = Object.values(innerErr.errors || {}).map(e => e.message);
          return res.status(400).json({ success: false, message: messages.join('; ') || innerErr.message });
        }
        return res.status(500).json({ success: false, message: 'Server error while creating time log (fallback)', error: innerErr.message });
      }
    }

    // Map other errors
    console.error('Error creating time log:', err);
    if (err && err.name === 'ValidationError') {
      const messages = Object.values(err.errors || {}).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') || err.message });
    }
    if (err && (err.name === 'CastError' || /Cast to ObjectId failed/.test(err.message || ''))) {
      return res.status(400).json({ success: false, message: 'Invalid id supplied' });
    }

    return res.status(500).json({ success: false, message: 'Server error while creating time log', error: err.message });
  }
};

// ============================
// GET ALL TIME LOGS FOR A TASK
// ============================
exports.getTimeLogsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const timeLogs = await TimeLog.find({ task: taskId, isActive: true })
      .populate('user', 'name email')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: timeLogs
    });
  } catch (error) {
    console.error("Error fetching time logs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching time logs"
    });
  }
};

// ============================
// GET TIME LOG SUMMARY FOR A TASK
// ============================
exports.getTimeLogSummary = async (req, res) => {
  try {
    const { taskId } = req.params;

    const summary = await TimeLog.aggregate([
      { $match: { task: mongoose.Types.ObjectId(taskId), isActive: true } },
      {
        $group: {
          _id: "$task",
          totalHours: { $sum: "$hours" },
          entries: { $sum: 1 }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalHours: 0,
          entries: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      summary: summary[0]
    });
  } catch (error) {
    console.error("Error fetching time log summary:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching summary"
    });
  }
};

// ============================
// UPDATE (EDIT) A TIME LOG
// ============================
exports.updateTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedLog = await TimeLog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Time log updated successfully",
      data: updatedLog
    });
  } catch (error) {
    console.error("Error updating time log:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating time log"
    });
  }
};

// ============================
// DELETE (SOFT DELETE) A TIME LOG
// ============================
exports.deleteTimeLog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLog = await TimeLog.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Time log deleted successfully (soft delete)"
    });
  } catch (error) {
    console.error("Error deleting time log:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting time log"
    });
  }
};
