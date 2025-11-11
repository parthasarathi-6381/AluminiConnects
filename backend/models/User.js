import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String },
  email: { type: String, required: true , unique:true },
  department: { type: String },
  batch : { type: String },
  role: { type: String, enum: ["alumni", "student", "admin"], default: "alumni" },
  verified: { type:Boolean , default:false},
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
