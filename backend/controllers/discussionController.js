import Discussion from '../models/Discussion.js';
import User from "../models/User.js";
import Alumni from "../models/alumni.js";

// Helper function to get user from either collection
const findUser = async (uid) => {
  let user = await User.findOne({ uid });
  if (!user) user = await Alumni.findOne({ uid });
  return user;
};

// -------------------------------
// Create a new post
// -------------------------------
export const createPost = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await findUser(uid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { department } = req.params;
    const { title, content } = req.body;

    const post = new Discussion({
      department,
      title,
      content,
      authorId: user.uid,
      authorName: user.name
    });

    await post.save();
    res.status(201).json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Get all posts of a department
// -------------------------------
export const getPostsByDept = async (req, res) => {
  try {
    const { department } = req.params;
    const posts = await Discussion.find({ department }).sort({ createdAt: -1 });
    res.json(posts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Get a single post
// -------------------------------
export const getPost = async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);

    if (!post)
      return res.status(404).json({ message: 'Not found' });

    res.json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Comment on a post
// -------------------------------
export const commentOnPost = async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);

    if (!post)
      return res.status(404).json({ message: 'Not found' });

    const { uid } = req.user;
    const user = await findUser(uid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = {
      authorId: user.uid,
      authorName: user.name,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();

    res.json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Delete a post
// -------------------------------
export const deletePost = async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
