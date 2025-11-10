import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: String, required: true },
  name: String,
  email: String,
  role: String,
  qrCode: String,
  registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
export default Registration;
