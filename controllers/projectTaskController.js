const ProjectTask = require('../models/ProjectTask');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
  try {
    const { title, description, project: projectId, assignedTo, status } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Title and project required' });

    // ensure owner owns the project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    const task = new ProjectTask({ title, description, project: projectId, assignedTo, status });
    await task.save();
    res.json(task);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await ProjectTask.find({ project: req.params.projectId });
    res.json(tasks);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getTask = async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await ProjectTask.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await ProjectTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};
