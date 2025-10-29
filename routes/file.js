const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');

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

// File filter
const fileFilter = (req, file, cb) => {
  // Add any file type restrictions here
  cb(null, true);
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter 
});

// Protected routes
router.use(auth);

// Upload file
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Get all files (with optional filters)
router.get('/', fileController.getFiles);

// Get single file by ID
router.get('/:id', fileController.getFile);

// Download file
router.get('/download/:id', fileController.downloadFile);

// Update file metadata
router.patch('/:id', fileController.updateFile);

// Delete file (soft delete)
router.delete('/:id', fileController.deleteFile);

module.exports = router;
