import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import {
  searchAlumni,
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessageHttp,
} from "../controllers/messageController.js";

const router = express.Router();

// search alumni by name
router.get("/search-alumni", verifyFirebaseToken, searchAlumni);

// get or create a conversation between two users
router.post("/conversation", verifyFirebaseToken, getOrCreateConversation);

// list my conversations
router.get("/conversations", verifyFirebaseToken, getMyConversations);

// get all messages in a conversation
router.get("/:conversationId", verifyFirebaseToken, getMessages);

// optional: HTTP send message (useful without sockets)
router.post("/:conversationId", verifyFirebaseToken, sendMessageHttp);

export default router;
