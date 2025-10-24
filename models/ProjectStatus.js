const mongoose = require('mongoose');

const ProjectStatusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: String
}, { timestamps: true });

module.exports = mongoose.model('ProjectStatus', ProjectStatusSchema);
