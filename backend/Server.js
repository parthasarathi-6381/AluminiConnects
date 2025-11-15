// server.js
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import admin from "./firebase/firebaseAdmin.js";

import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import Alumni from "./models/alumni.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Track online users
const onlineUsers = new Map();

// Helper: find user in BOTH collections
const findUserByUid = async (uid) => {
  let user = await Alumni.findOne({ uid });
  if (!user) user = await User.findOne({ uid });
  return user;
};

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    // Authenticate socket with Firebase token
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("No auth token"));

        const decoded = await admin.auth().verifyIdToken(token);
        socket.user = decoded;
        next();
      } catch (err) {
        console.error("❌ Socket Auth Error:", err.message);
        next(new Error("Authentication failed"));
      }
    });

    // Connection event
    io.on("connection", (socket) => {
      const uid = socket.user.uid;
      console.log(`⚡ User connected: ${uid}`);

      onlineUsers.set(uid, socket.id);

      socket.on("private_message", async ({ toUid, text }) => {
        try {
          if (!toUid || !text?.trim()) return;

          const fromUid = uid;

          // Only allow student <-> alumni
          const sender = await findUserByUid(fromUid);
          const receiver = await findUserByUid(toUid);

          if (!sender || !receiver) return;
         // if (sender.role === receiver.role) return;

          // Create / find conversation
          const participants = [fromUid, toUid].sort();
          let convo = await Conversation.findOne({ participants });

          if (!convo) {
            convo = new Conversation({ participants });
            await convo.save();
          }

          // Save message
          const msg = new Message({
            conversation: convo._id,
            senderUid: fromUid,
            receiverUid: toUid,
            text: text.trim(),
          });

          await msg.save();

          // Update conversation preview
          convo.lastMessage = text.trim();
          convo.lastSenderUid = fromUid;
          convo.updatedAt = new Date(); // ⭐ FIXED
          await convo.save();

          const payload = {
            ...msg.toObject(),
            conversation: convo._id, // ⭐ ALWAYS include convo ID
          };

          // Send to sender
          socket.emit("private_message_sent", payload);

          // Send to receiver if online
          const receiverSocket = onlineUsers.get(toUid);
          if (receiverSocket) {
            io.to(receiverSocket).emit("private_message", payload);
          }
        } catch (err) {
          console.error("❌ Error sending message:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log(`🔌 User disconnected: ${uid}`);
        onlineUsers.delete(uid);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running with WebSockets on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
