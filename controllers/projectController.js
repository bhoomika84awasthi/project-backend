const Project = require('../models/Project');
const File = require('../models/File');
const path = require('path');

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const project = new Project({ title, description, owner: req.user._id });
    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err); res.status(500).send('Server error');
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id });
    res.json(projects);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found or not authorized' });
    res.json(project);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or not authorized' });
    res.json({ message: 'Project deleted' });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

// Upload project logo handler (expects middleware to handle file upload)
exports.uploadProjectLogo = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or not authorized' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Save file record
    const relativePath = path.join('uploads', 'projects', req.file.filename).replace(/\\/g, '/');
    const file = new File({
      filename: req.file.originalname,
      filepath: relativePath,
      projectid: project._id,
      userid: req.user._id,
      addedby: req.user._id,
      addedon: new Date(),
      isactive: true,
    });

    await file.save();

    // attach to project
    project.logo = file._id;
    await project.save();

    res.json({ project, file });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
