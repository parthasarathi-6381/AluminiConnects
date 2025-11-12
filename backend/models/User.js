import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String , required: true},
  email: { type: String, required: true , unique:true },
  department: { type: String , required: true },
  graduationYear : { type: String , required: true },
  role: { type: String, enum: ["alumni", "student", "admin"], default: "alumni" },
  verified: { type:Boolean , default:false},
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
