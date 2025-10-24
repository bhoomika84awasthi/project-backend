const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createProject, getProjects, getProject, updateProject, deleteProject, uploadProjectLogo } = require('../controllers/projectController');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// configure multer storage for project logos
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = path.join(__dirname, '..', 'uploads', 'projects');
		fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const safeName = file.originalname.replace(/\s+/g, '_');
		cb(null, Date.now() + '-' + safeName);
	}
});

const upload = multer({ storage });

router.post('/', auth, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

// POST /api/projects/:id/logo -> upload logo for project (field name: 'logo')
router.post('/:id/logo', auth, upload.single('logo'), uploadProjectLogo);

module.exports = router;
