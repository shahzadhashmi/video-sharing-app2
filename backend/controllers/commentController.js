import Comment from '../models/comment.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId }).populate('user', 'username');
    res.json(comments);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addComment = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text required' });

  try {
    const comment = new Comment({
      user: req.user.id,
      video: req.params.videoId,
      text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
