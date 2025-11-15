import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// 🔎 Search alumni by name (student UI search)
export const searchAlumni = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const alumni = await User.find({
      role: "alumni",
      verified: true,
      name: { $regex: q, $options: "i" },
    })
      .select("uid name department graduationYear email")
      .limit(20);

    res.json(alumni);
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

    const participants = [currentUid, otherUid].sort(); // always sort

    let convo = await Conversation.findOne({ participants });

    if (!convo) {
      convo = new Conversation({ participants });
      await convo.save();
    }

    res.json(convo);
  } catch (err) {
    console.error("getOrCreateConversation error:", err);
    res.status(500).json({ message: "Error getting/creating conversation" });
  }
};

// 📋 List conversations for logged-in user
export const getMyConversations = async (req, res) => {
  try {
    const uid = req.user.uid;

    const convos = await Conversation.find({ participants: uid })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(convos);
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

    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participants.includes(uid)) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const msgs = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(msgs);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// ✉️ Fallback HTTP send (useful for testing without sockets)
export const sendMessageHttp = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, toUid } = req.body;
    const senderUid = req.user.uid;

    if (!text || !toUid) {
      return res.status(400).json({ message: "text and toUid are required" });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participants.includes(senderUid)) {
      return res.status(404).json({ message: "Conversation not found" });
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
    await convo.save();

    res.status(201).json(msg);
  } catch (err) {
    console.error("sendMessageHttp error:", err);
    res.status(500).json({ message: "Error sending message" });
  }
};
