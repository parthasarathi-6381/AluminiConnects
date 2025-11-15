// server.js
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import admin from "./firebase/firebaseAdmin.js";

// Chat models
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Store online users: uid -> socketId
const onlineUsers = new Map();

const startServer = async () => {
  try {
    await connectDB();

    // Create raw HTTP server (important for socket.io)
    const server = http.createServer(app);

    // Setup socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    // 🔐 SOCKET AUTH with Firebase token
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("No auth token provided"));

        const decoded = await admin.auth().verifyIdToken(token);

        socket.user = decoded; // { uid, email, role, verified… }
        next();
      } catch (err) {
        console.error("❌ Socket Authentication Failed", err.message);
        next(new Error("Authentication error"));
      }
    });

    // 🔌 When user connects
    io.on("connection", (socket) => {
      const uid = socket.user.uid;
      console.log(`⚡ User connected: ${uid}`);

      onlineUsers.set(uid, socket.id);

      // 📩 Receive private message
      socket.on("private_message", async ({ toUid, text }) => {
        try {
          if (!toUid || !text) return;

          const fromUid = uid;

          // find or create a conversation (always sort participants)
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
            text,
          });

          await msg.save();

          // Update conversation info
          convo.lastMessage = text;
          convo.lastSenderUid = fromUid;
          await convo.save();

          // Build payload
          const payload = {
            _id: msg._id,
            conversation: convo._id,
            senderUid: fromUid,
            receiverUid: toUid,
            text,
            createdAt: msg.createdAt,
          };

          // Send back confirmation to sender
          socket.emit("private_message_sent", payload);

          // Send to receiver (if online)
          const receiverSocketId = onlineUsers.get(toUid);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("private_message", payload);
          }
        } catch (err) {
          console.error("❌ Error sending message:", err);
          socket.emit("error_message", "Failed to send message");
        }
      });

      // 📴 When user disconnects
      socket.on("disconnect", () => {
        console.log(`🔌 User disconnected: ${uid}`);
        onlineUsers.delete(uid);
      });
    });

    // Start both Express + Socket.io
    server.listen(PORT, () => {
      console.log(`🚀 Server running with WebSockets on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
