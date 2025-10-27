// routes/file.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// set a reasonable file size limit to avoid stream issues
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// Accept any single file field (more permissive) and handle errors
router.post('/upload', (req, res) => {
  // Use upload.any() to accept different field names. We'll pick the first file.
  upload.any()(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    let fileObj = null;
    if (Array.isArray(req.files) && req.files.length) fileObj = req.files[0];
    if (!fileObj && req.file) fileObj = req.file;
    if (!fileObj) return res.status(400).json({ success: false, message: 'No file uploaded' });

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      filePath: `/uploads/${fileObj.filename}`
    });
  });
});

module.exports = router;
