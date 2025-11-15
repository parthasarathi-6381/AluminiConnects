// src/pages/Messages.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../components/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Messages() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef(null);

  const myUid = currentUser?.uid;

  // helper: find the other person's uid in a conversation
  const getOtherUid = (convo) => {
    if (!convo || !convo.participants) return null;
    return convo.participants.find((uid) => uid !== myUid);
  };

  // 🔌 Setup Socket.io connection
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    const setupSocket = async () => {
      const token = await currentUser.getIdToken();

      const socket = io(API_BASE, {
        auth: { token },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to chat socket");
      });

      socket.on("private_message", (msg) => {
        console.log("📩 Incoming message", msg);

        // if we are in the same conversation, append to messages
        setMessages((prev) => {
          if (selectedConvo && msg.conversation === selectedConvo._id) {
            return [...prev, msg];
          }
          return prev;
        });

        // optional: update conversation preview text
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text, lastSenderUid: msg.senderUid, updatedAt: msg.createdAt }
              : c
          )
        );
      });

      socket.on("private_message_sent", (msg) => {
        console.log("📤 Message sent confirmed", msg);

        // optimistic update for sender
        setMessages((prev) => {
          if (selectedConvo && msg.conversation === selectedConvo._id) {
            // avoid duplicate if already added
            const exists = prev.some((m) => m._id === msg._id);
            if (!exists) return [...prev, msg];
          }
          return prev;
        });

        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text, lastSenderUid: msg.senderUid, updatedAt: msg.createdAt }
              : c
          )
        );
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from chat socket");
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // 🔁 Fetch my conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;
      setLoadingConvos(true);
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/api/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setConversations(data || []);
      } catch (err) {
        console.error("Error fetching conversations", err);
      }
      setLoadingConvos(false);
    };

    fetchConversations();
  }, [currentUser]);

  // 🔁 Load messages when selecting a conversation
  const loadMessages = async (convo) => {
    if (!currentUser || !convo) return;
    setLoadingMessages(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/messages/${convo._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
    setLoadingMessages(false);
  };

  const handleSelectConversation = async (convo) => {
    setSelectedConvo(convo);
    await loadMessages(convo);
  };

  // 🧠 Search alumni by name
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `${API_BASE}/api/messages/search-alumni?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error("Error searching alumni", err);
    }
    setSearchLoading(false);
  };

  // 🧵 Start conversation with a searched alumni
  const startConversationWithAlumni = async (alumni) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/messages/conversation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUid: alumni.uid }),
      });

      const convo = await res.json();

      // merge in conversations list if new
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === convo._id);
        if (!exists) return [convo, ...prev];
        return prev;
      });

      setSelectedConvo(convo);
      setSearchResults([]);
      setSearchQuery("");
      await loadMessages(convo);
    } catch (err) {
      console.error("Error starting conversation", err);
    }
  };

  // ✉️ Send message through socket
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvo || !socketRef.current) return;

    const text = messageText.trim();
    const toUid = getOtherUid(selectedConvo);

    socketRef.current.emit("private_message", {
      toUid,
      text,
    });

    setMessageText("");
  };

  // UI helpers
  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isMine = (msg) => msg.senderUid === myUid;

  return (
    <div className="container-fluid min-vh-100 bg-dark text-light py-3">
      <div className="row h-100">
        {/* LEFT: Conversations + Search */}
        <div className="col-md-4 border-end border-secondary">
          <h4 className="mb-3">Messages</h4>

          {/* Search alumni */}
          <form className="d-flex mb-3" onSubmit={handleSearch}>
            <input
              className="form-control me-2 bg-dark text-light border-secondary"
              placeholder="Search alumni by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-light" disabled={searchLoading}>
              {searchLoading ? "..." : "Search"}
            </button>
          </form>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-3">
              <div className="small text-muted mb-1">Search Results</div>
              <ul className="list-group">
                {searchResults.map((alumni) => (
                  <li
                    key={alumni.uid}
                    className="list-group-item list-group-item-action bg-dark text-light d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => startConversationWithAlumni(alumni)}
                  >
                    <div>
                      <div>{alumni.name}</div>
                      <div className="small text-muted">
                        {alumni.department} • {alumni.graduationYear}
                      </div>
                    </div>
                    <span className="badge bg-primary">Message</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr className="border-secondary" />

          {/* Conversation list */}
          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {loadingConvos && <div className="small">Loading conversations...</div>}
            {!loadingConvos && conversations.length === 0 && (
              <div className="small text-muted">No conversations yet. Start one from search.</div>
            )}

            {conversations.map((convo) => {
              const otherUid = getOtherUid(convo);
              const isActive = selectedConvo && selectedConvo._id === convo._id;
              return (
                <div
                  key={convo._id}
                  className={`p-2 mb-1 rounded ${isActive ? "bg-primary" : "bg-secondary bg-opacity-25"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelectConversation(convo)}
                >
                  <div className="fw-bold">Chat with: {otherUid}</div>
                  <div className="small text-truncate">{convo.lastMessage || "No messages yet"}</div>
                  <div className="small text-muted">
                    {convo.updatedAt && formatTime(convo.updatedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Chat window */}
        <div className="col-md-8 d-flex flex-column">
          {!selectedConvo ? (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center text-muted">
              Select a conversation or search an alumni to start chatting.
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="py-2 border-bottom border-secondary">
                <h5 className="mb-0">
                  Chat with: {getOtherUid(selectedConvo)}
                </h5>
              </div>

              {/* Messages list */}
              <div
                className="flex-grow-1 py-3"
                style={{ overflowY: "auto", maxHeight: "70vh" }}
              >
                {loadingMessages && <div className="small">Loading messages...</div>}
                {!loadingMessages && messages.length === 0 && (
                  <div className="small text-muted text-center">
                    No messages yet. Say hi 👋
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`d-flex mb-2 ${
                      isMine(msg) ? "justify-content-end" : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-4 ${
                        isMine(msg) ? "bg-primary text-white" : "bg-secondary bg-opacity-50"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      <div>{msg.text}</div>
                      <div className="small text-end text-light opacity-75">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input box */}
              <form onSubmit={handleSendMessage} className="mt-2">
                <div className="input-group">
                  <input
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
