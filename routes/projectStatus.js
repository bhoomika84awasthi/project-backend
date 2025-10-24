const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createStatus, getStatuses } = require('../controllers/projectStatusController');

router.post('/', auth, createStatus);
router.get('/', auth, getStatuses);

module.exports = router;
