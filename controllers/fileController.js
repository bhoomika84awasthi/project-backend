const File = require('../models/File');

exports.createFile = async (req, res) => {
  try {
    const { filename, filepath, projectid, userid } = req.body;
    if (!filename || !filepath || !projectid || !userid) return res.status(400).json({ message: 'Missing required fields' });

    const file = new File({
      filename,
      filepath,
      projectid,
      userid,
      addedby: req.user ? req.user._id : userid,
      addedon: new Date(),
      isactive: true,
    });

    await file.save();
    res.json(file);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getFiles = async (req, res) => {
  try {
    // allow query by projectid or userid, default to all active files
    const filter = { isactive: true };
    if (req.query.projectid) filter.projectid = req.query.projectid;
    if (req.query.userid) filter.userid = req.query.userid;

    const files = await File.find(filter).populate('projectid', 'title').populate('userid', 'name');
    res.json(files);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || !file.isactive) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.updateFile = async (req, res) => {
  try {
    const { filename, filepath, isactive } = req.body;
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (filename !== undefined) file.filename = filename;
    if (filepath !== undefined) file.filepath = filepath;
    if (isactive !== undefined) file.isactive = isactive;

    file.updatedon = new Date();
    file.updatedby = req.user ? req.user._id : file.updatedby;

    await file.save();
    res.json(file);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.deleteFile = async (req, res) => {
  try {
    // soft delete
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.isactive = false;
    file.updatedon = new Date();
    file.updatedby = req.user ? req.user._id : file.updatedby;
    await file.save();
    res.json({ message: 'File deactivated' });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};
