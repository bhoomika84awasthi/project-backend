const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  projectid: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isactive: { type: Boolean, default: true },
  addedon: { type: Date, default: Date.now },
  addedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedon: { type: Date },
  updatedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);
