const File = require('../models/File');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  if (!req.body.projectId) {
    return next(new AppError('Project ID is required', 400));
  }

  const file = new File({
    filename: req.file.originalname,
    filepath: path.join('uploads', req.file.filename).replace(/\\/g, '/'),
    projectid: req.body.projectId,
    userid: req.user._id,
    addedby: req.user._id,
    addedon: new Date(),
    isactive: true
  });

  await file.save();

  res.status(201).json({
    status: 'success',
    data: {
      file
    }
  });
});

exports.getFiles = catchAsync(async (req, res, next) => {
  const filter = { isactive: true };
  if (req.query.projectId) filter.projectid = req.query.projectId;
  if (req.query.userId) filter.userid = req.query.userId;

  const files = await File.find(filter)
    .populate('projectid', 'title')
    .populate('userid', 'name')
    .sort({ addedon: -1 });

  res.status(200).json({
    status: 'success',
    results: files.length,
    data: {
      files
    }
  });
});

exports.getFile = catchAsync(async (req, res, next) => {
  const file = await File.findById(req.params.id)
    .populate('projectid', 'title')
    .populate('userid', 'name');

  if (!file || !file.isactive) {
    return next(new AppError('File not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      file
    }
  });
});

exports.downloadFile = catchAsync(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file || !file.isactive) {
    return next(new AppError('File not found', 404));
  }

  const filePath = path.join(__dirname, '..', file.filepath);
  
  if (!fs.existsSync(filePath)) {
    return next(new AppError('File not found on server', 404));
  }

  res.download(filePath, file.filename);
});

exports.updateFile = catchAsync(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file || !file.isactive) {
    return next(new AppError('File not found', 404));
  }

  // Check if user has permission
  if (file.userid.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this file', 403));
  }

  // Update allowed fields
  if (req.body.filename) file.filename = req.body.filename;
  if (req.body.isactive !== undefined) file.isactive = req.body.isactive;
  
  file.updatedon = new Date();
  file.updatedby = req.user._id;

  await file.save();

  res.status(200).json({
    status: 'success',
    data: {
      file
    }
  });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file || !file.isactive) {
    return next(new AppError('File not found', 404));
  }

  // Check if user has permission
  if (file.userid.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this file', 403));
  }

  // Soft delete
  file.isactive = false;
  file.updatedon = new Date();
  file.updatedby = req.user._id;
  await file.save();

  res.status(200).json({
    status: 'success',
    message: 'File deleted successfully'
  });
});
