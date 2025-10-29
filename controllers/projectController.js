const Project = require('../models/Project');
const File = require('../models/File');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createProject = catchAsync(async (req, res, next) => {
  const { title, description, logo } = req.body;
  
  if (!title) {
    return next(new AppError('Title is required', 400));
  }

  const project = new Project({ 
    title, 
    description, 
    owner: req.user._id 
  });

  if (logo) project.logoUrl = logo;
  await project.save();
  
  res.status(201).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.getProjects = catchAsync(async (req, res, next) => {
  const projects = await Project.find({ owner: req.user._id }).populate('logo');
  
  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects
    }
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({ 
    _id: req.params.id, 
    owner: req.user._id 
  }).populate('logo');

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const update = { ...req.body };
  if (req.body.logo) update.logoUrl = req.body.logo;

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: update },
    { new: true, runValidators: true }
  ).populate('logo');

  if (!project) {
    return next(new AppError('Project not found or not authorized', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findOneAndDelete({ 
    _id: req.params.id, 
    owner: req.user._id 
  });

  if (!project) {
    return next(new AppError('Project not found or not authorized', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Project deleted successfully'
  });
});

// Upload project logo handler (expects middleware to handle file upload)
exports.uploadProjectLogo = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({ 
    _id: req.params.id, 
    owner: req.user._id 
  });

  if (!project) {
    return next(new AppError('Project not found or not authorized', 404));
  }

  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

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

  res.status(200).json({
    status: 'success',
    data: {
      project,
      file
    }
  });
});
