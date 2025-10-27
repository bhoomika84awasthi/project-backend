const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const Project = require('../models/Project');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.post('/:projectId/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { projectId } = req.params;

    const file = new File({
      project: projectId,
      filename: req.file.filename,
      filepath: req.file.path,
    });

    await file.save();
    await Project.findByIdAndUpdate(projectId, { $push: { files: file._id } });
    res.status(201).json({ message: 'File uploaded successfully', file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
