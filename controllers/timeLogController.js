const TimeLog = require('../models/TimeLog');
const ProjectTask = require('../models/ProjectTask');

exports.createTimeLog = async (req, res) => {
  try {
    const { taskId, hours, date, description } = req.body;
    if (!taskId || !hours || !date) {
      return res.status(400).json({ message: 'Task ID, hours, and date are required' });
    }

    // Check if task exists
    const task = await ProjectTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const timeLog = new TimeLog({
      task: taskId,
      user: req.user._id,
      hours,
      date: new Date(date),
      description
    });

    await timeLog.save();
    res.status(201).json(timeLog);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getTimeLogsByTask = async (req, res) => {
  try {
    const timeLogs = await TimeLog.find({ 
      task: req.params.taskId,
      isActive: true 
    })
    .populate('user', 'name email')
    .sort({ date: -1 });
    
    res.json(timeLogs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateTimeLog = async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Only allow the user who created the time log to update it
    if (timeLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTimeLog = await TimeLog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedTimeLog);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteTimeLog = async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Only allow the user who created the time log to delete it
    if (timeLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Soft delete by setting isActive to false
    timeLog.isActive = false;
    await timeLog.save();

    res.json({ message: 'Time log deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getTimeLogSummary = async (req, res) => {
  try {
    const timeLogs = await TimeLog.aggregate([
      { 
        $match: { 
          task: mongoose.Types.ObjectId(req.params.taskId),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          logCount: { $sum: 1 }
        }
      }
    ]);

    const summary = timeLogs[0] || { totalHours: 0, logCount: 0 };
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};