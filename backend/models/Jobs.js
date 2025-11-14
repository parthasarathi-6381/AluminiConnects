// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, required: true },
    stipend: { type: String, required: true },
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], required: true },
    link: { type: String, required: true },
    description: { type: String, required: true },
    postedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
