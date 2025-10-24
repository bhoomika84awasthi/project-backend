const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createComment, getCommentsByTask } = require('../controllers/commentController');

router.post('/', auth, createComment);
router.get('/task/:taskId', auth, getCommentsByTask);

module.exports = router;
