const Task = require("../models/ProjectTask");
const mongoose = require("mongoose");

// Create a new Task
exports.createTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, description, project, status, assignedTo } = req.body;

    if (!title || !project) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "'title' and 'project' fields are required",
        example: {
          title: "Task title",
          description: "Task description (optional)",
          project: "project_id (ObjectId)",
          status: "status_id (ObjectId, optional)",
          assignedTo: "user_id (ObjectId, optional)"
        }
      });
    }

    const task = {
      title, 
      description, 
      project,
      ...(status && { status }),
      ...(assignedTo && { assignedTo })
    };

    const newTask = await Task.create(task);
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "✅ Task created successfully",
      data: newTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error creating task:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
