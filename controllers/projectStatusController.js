const ProjectStatus = require('../models/ProjectStatus');

exports.createStatus = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const status = new ProjectStatus({ name, color });
    await status.save();
    res.json(status);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await ProjectStatus.find();
    res.json(statuses);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};
