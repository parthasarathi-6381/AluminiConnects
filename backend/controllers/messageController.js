// controllers/messageController.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Alumni from "../models/alumni.js";

// 🔍 Helper: always check Alumni FIRST, then User
const findUserByUid = async (uid) => {
  let user = await Alumni.findOne({ uid });
  if (!user) user = await User.findOne({ uid });
  return user;
};

// 🔎 Search alumni by name (student UI search)
export const searchAlumni = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store"); // avoid 304 caching

    const { q } = req.query;
    if (!q || !q.trim()) return res.status(200).json([]);

    const alumni = await Alumni.find({
      name: { $regex: q, $options: "i" },
    })
      .select("uid name department graduationYear email role")
      .limit(20)
      .lean();

    return res.status(200).json(alumni);
  } catch (err) {
    console.error("searchAlumni error:", err);
    res.status(500).json({ message: "Error searching alumni" });
  }
};

// 📌 Get or create conversation between current user and another user
export const getOrCreateConversation = async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const { otherUid } = req.body;

    if (!otherUid) {
      return res.status(400).json({ message: "otherUid is required" });
    }

    if (otherUid === currentUid) {
      return res
        .status(400)
        .json({ message: "You cannot start a conversation with yourself" });
    }

    const currentUser = await findUserByUid(currentUid);
    const otherUser = await findUserByUid(otherUid);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // allow ONLY student <-> alumni
    if (currentUser.role === otherUser.role) {
      return res.status(403).json({
        message: "Messaging allowed only between students and alumni",
      });
    }

    const participants = [currentUid, otherUid].sort();
    let convo = await Conversation.findOne({ participants });

    if (!convo) {
      convo = new Conversation({ participants });
      await convo.save();
    }

    const convoObj = convo.toObject();
    const other = {
      uid: otherUid,
      name: otherUser.name,
      email: otherUser.email,
      department: otherUser.department,
      graduationYear: otherUser.graduationYear,
      role: otherUser.role,
    };

    return res.status(200).json({ ...convoObj, other });
  } catch (err) {
    console.error("getOrCreateConversation error:", err);
    res.status(500).json({ message: "Error getting/creating conversation" });
  }
};

// 📋 List conversations for logged-in user
export const getMyConversations = async (req, res) => {
  try{
    const uid = req.user.uid;

    let convos = await Conversation.find({ participants: uid })
      .sort({ updatedAt: -1 })
      .lean();

    // attach "other" info for UI (name, role, etc.)
    for (let convo of convos) {
      const otherUid = convo.participants.find((p) => p !== uid);

      const otherUser = await findUserByUid(otherUid);

      convo.other = {
        uid: otherUid,
        name: otherUser?.name || "Unknown User",
        email: otherUser?.email,
        department: otherUser?.department,
        graduationYear: otherUser?.graduationYear,
        role: otherUser?.role,
      };
    }

    return res.status(200).json(convos);
  } catch (err) {
    console.error("getMyConversations error:", err);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

// 💬 Get messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const uid = req.user.uid;

    if (!conversationId || conversationId === "undefined") {
      return res.status(400).json({ message: "Valid conversationId required" });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participants.includes(uid)) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const msgs = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(msgs);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// ✉️ Optional: HTTP send (mainly for testing without sockets)
export const sendMessageHttp = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, toUid } = req.body;
    const senderUid = req.user.uid;

    if (!conversationId || conversationId === "undefined") {
      return res.status(400).json({ message: "Valid conversationId required" });
    }

    if (!text || !toUid) {
      return res.status(400).json({ message: "text and toUid are required" });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participants.includes(senderUid)) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const sender = await findUserByUid(senderUid);
    const receiver = await findUserByUid(toUid);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (sender.role === receiver.role) {
      return res.status(403).json({
        message: "Messaging allowed only between students and alumni",
      });
    }

    const msg = new Message({
      conversation: conversationId,
      senderUid,
      receiverUid: toUid,
      text,
    });

    await msg.save();

    convo.lastMessage = text;
    convo.lastSenderUid = senderUid;
    convo.updatedAt = new Date();
    await convo.save();

    return res.status(201).json(msg);
  } catch (err) {
    console.error("sendMessageHttp error:", err);
    res.status(500).json({ message: "Error sending message" });
  }
};
