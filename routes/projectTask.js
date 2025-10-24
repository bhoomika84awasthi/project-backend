const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createTask, getTasksByProject, getTask, updateTask, deleteTask } = require('../controllers/projectTaskController');

router.post('/', auth, createTask);
router.get('/project/:projectId', auth, getTasksByProject);
router.get('/:id', auth, getTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
