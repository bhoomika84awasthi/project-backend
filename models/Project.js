const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // support both a File reference (uploaded file) and a simple string URL/path
  logo: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  logoUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
