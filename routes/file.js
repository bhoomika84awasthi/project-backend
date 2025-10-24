const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createFile,
  getFiles,
  getFileById,
  updateFile,
  deleteFile,
} = require('../controllers/fileController');

router.post('/', auth, createFile);
router.get('/', auth, getFiles);
router.get('/:id', auth, getFileById);
router.put('/:id', auth, updateFile);
router.delete('/:id', auth, deleteFile);

module.exports = router;
