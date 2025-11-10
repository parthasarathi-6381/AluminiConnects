import Discussion from '../models/Discussion.js';
import User from "../models/User.js"
const createPost = async (req, res) => {
  try {


    const {uid} = req.user;
    const user = await User.findOne({ uid }); 
    const { department } = req.params;
    const { title, content } = req.body;
    const post = new Discussion({
      department,
      title,
      content,
      authorId: user._id,
      authorName: user.name
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

 const getPostsByDept = async (req, res) => {
  try {
    const { department } = req.params;
    const posts = await Discussion.find({ department }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const commentOnPost = async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    const {uid} = req.user;
    const user = await User.findOne({ uid });
    const comment = {
      authorId: user.id,
      authorName: user.name,
      content: req.body.content
    };
    post.comments.push(comment);
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

 const deletePost = async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export { getPost,createPost,getPostsByDept,commentOnPost,deletePost };