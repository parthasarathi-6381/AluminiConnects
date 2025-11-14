import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  capacity: { type: Number, default: 100 },
  venue: { type: String, required: true },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming"
  },
 /* createdBy: {
    uid: { type: String, required: true }, // Firebase UID of club member/admin
    name: { type: String .required: true},
    role: { type: String, enum: ["clubMember", "admin"], required: true }
  },*/
  //tags: { type: [String], default: [] },
 
}, { timestamps: true });

const Event =
  mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
