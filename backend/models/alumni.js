import mongoose from "mongoose";
const alumniSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String , required: true},
  email: { type: String, required: true , unique:true },
  department: { type: String , required: true },
  graduationYear : { type: String , required: true },
  role: { type: String, enum: ["alumni", "student", "admin"], default: "alumni" },
  verified: { type:Boolean , default:false},
  createdAt: { type: Date, default: Date.now },
});

const Alumni = mongoose.models.Alumni || mongoose.model("Alumni", alumniSchema);
export default Alumni;
