import mongoose from 'mongoose';
 const commentSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  authorName: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

 const discussionSchema = new mongoose.Schema({
  department: { type: String, enum: ['CSE','ECE','MECH','CIVIL','EEE'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String , required: true },
  authorName: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

const Discussion = mongoose.models.Discussion || mongoose.model("Discussion", discussionSchema);
export default Discussion;