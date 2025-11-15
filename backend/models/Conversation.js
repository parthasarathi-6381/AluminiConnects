import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Always store 2 participants (student + alumni) sorted by uid
    participants: {
      type: [String], // array of Firebase UIDs
      required: true,
      validate: {
        validator: v => Array.isArray(v) && v.length === 2,
        message: "Conversation must have exactly 2 participants",
      },
    },
    lastMessage: { type: String },
    lastSenderUid: { type: String },
  },
  { timestamps: true }
);

// speed up lookup by participants pair
conversationSchema.index({ participants: 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
