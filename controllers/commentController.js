const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
  try {
    const { content, task } = req.body;
    if (!content || !task) return res.status(400).json({ message: 'Content and task required' });
    const comment = new Comment({ content, task, user: req.user._id });
    await comment.save();
    res.json(comment);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId }).populate('user', 'name email');
    res.json(comments);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
};
