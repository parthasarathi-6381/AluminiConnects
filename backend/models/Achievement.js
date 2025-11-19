// models/Achievement.js
import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    postedBy: { type: String, required: true },
  },
  { timestamps: true }
);

const achievement = mongoose.models.achievement || mongoose.model("achievement", achievementSchema);
export default achievement;