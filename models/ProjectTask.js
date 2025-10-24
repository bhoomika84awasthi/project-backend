const mongoose = require('mongoose');

const ProjectTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectStatus' },
}, { timestamps: true });

module.exports = mongoose.model('ProjectTask', ProjectTaskSchema);
