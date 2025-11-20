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

  const [showRecentChats, setShowRecentChats] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedConvoRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const myUid = currentUser?.uid;

  /* -------------------------------------
        VERIFIED BADGE SVG ICONS
  -------------------------------------- */
  const AlumniBadge = (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#1DA1F2" strokeWidth="3" fill="white" />
      <path
        d="M10 14l-2-2-1.5 1.5L10 17l7-7-1.5-1.5z"
        fill="#1DA1F2"
      />
    </svg>
  );

  const ClubBadge = (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="transparent" />
      <path
        d="M10 14l-2-2-1.5 1.5L10 17l7-7-1.5-1.5z"
        fill="white"
      />
    </svg>
  );

  /* Return name + correct badge */
  const renderNameWithBadge = (user) => {
    if (!user) return "Unknown";

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        {user.name}
        {user.role === "alumni" && AlumniBadge}
        {user.role === "clubMember" && ClubBadge}
      </span>
    );
  };

  /* SCROLL */
  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    selectedConvoRef.current = selectedConvo;
  }, [selectedConvo]);

  const getOther = (convo) => convo?.other;

  /* SOCKET SETUP */
  useEffect(() => {
    if (!currentUser) return;

    const setupSocket = async () => {
      const token = await currentUser.getIdToken();
      const socket = io(API_BASE, { auth: { token } });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to chat socket");
      });

      socket.on("private_message", (msg) => {
        const current = selectedConvoRef.current;

        if (current && msg.conversation === current._id) {
          setMessages((prev) => [...prev, msg]);

          setSelectedConvo((prev) =>
            prev
              ? {
                  ...prev,
                  lastMessage: msg.text,
                  updatedAt: msg.createdAt,
                }
              : prev
          );
        }

        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt }
              : c
          )
        );
      });

      socket.on("private_message_sent", (msg) => {
        const current = selectedConvoRef.current;

        if (current && msg.conversation === current._id) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === msg._id);
            return exists ? prev : [...prev, msg];
          });

          setSelectedConvo((prev) =>
            prev
              ? {
                  ...prev,
                  lastMessage: msg.text,
                  updatedAt: msg.createdAt,
                }
              : prev
          );
        }

        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt }
              : c
          )
        );
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser]);

  /* FETCH CONVERSATIONS */
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;
      setLoadingConvos(true);
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConversations(data || []);
      } catch (err) {
        console.error("Error loading conversations", err);
      }
      setLoadingConvos(false);
    };

    fetchConversations();
  }, [currentUser]);

  /* LOAD MESSAGES */
  const loadMessages = async (convo) => {
    if (!convo || !convo._id) return;

    setLoadingMessages(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/messages/${convo._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Error loading messages", err);
    }
    setLoadingMessages(false);
  };

  const handleSelectConversation = async (convo) => {
    setSelectedConvo(convo);
    await loadMessages(convo);
    setShowRecentChats(false);
  };

  /* SEARCH USERS */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `${API_BASE}/api/messages/search-users?q=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults((await res.json()) || []);
    } catch (err) {
      console.error("Error searching users", err);
    }
    setSearchLoading(false);
  };

  /* START NEW CONVO */
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

      if (!convo?._id) return;

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === convo._id);
        return exists ? prev : [convo, ...prev];
      });

      setSelectedConvo(convo);
      setSearchResults([]);
      setSearchQuery("");
      await loadMessages(convo);
      setShowRecentChats(false);
    } catch (err) {
      console.error("Error starting conversation", err);
    }
  };

  /* SEND MESSAGE */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvo || !socketRef.current) return;

    const other = getOther(selectedConvo);
    if (!other?.uid) return;

    socketRef.current.emit("private_message", {
      toUid: other.uid,
      text: messageText.trim(),
    });

    setMessageText("");
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isMine = (msg) => msg.senderUid === myUid;

  /* ---------------- RENDER UI ---------------- */
  return (
    <div className="min-vh-100 messages-container">
      <div className="background-overlay"></div>

      <div className="container-fluid h-100 py-3">
        <div className="row h-100 g-0">
          {/* LEFT SIDE */}
          <div className="col-md-4 border-end border-violet">
            <div className="h-100 d-flex flex-column">
              <div className="p-3 border-bottom border-violet d-flex justify-content-between align-items-center">
                <h4 className="text-light">Messages</h4>
                <button
                  className="recent-chats-btn"
                  onClick={() => setShowRecentChats(!showRecentChats)}
                >
                  {showRecentChats ? "Hide" : "Recent Chats"}
                </button>
              </div>

              {/* SEARCH */}
              <div className="p-3">
                <form onSubmit={handleSearch} className="search-form-wrapper">
                  <div className="search-input-container">
                    <input
                      className="search-input text-light"
                      placeholder="Search alumni"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" type="submit" disabled={searchLoading}>
                      🔍
                    </button>
                  </div>
                </form>
              </div>

              {/* SEARCH RESULTS */}
              {searchResults.length > 0 && (
                <div className="search-results-scroll">
                  {searchResults.map((a) => (
                    <div
                      key={a.uid}
                      className="p-3 border-bottom border-violet search-result-item"
                      onClick={() => startConversationWithAlumni(a)}
                    >
                      <div className="fw-semibold text-light">
                        {renderNameWithBadge(a)}
                      </div>
                      <div className="small text-light opacity-75">
                        {a.department} • {a.graduationYear}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RECENT CHATS */}
              {showRecentChats && (
                <div className="recent-chats-scroll">
                  {conversations.map((c) => {
                    const other = getOther(c);
                    const active = selectedConvo?._id === c._id;
                    return (
                      <div
                        key={c._id}
                        className={`p-3 border-bottom border-violet conversation-item ${
                          active ? "active-conversation" : ""
                        }`}
                        onClick={() => handleSelectConversation(c)}
                      >
                        <div className="fw-bold text-light">
                          {renderNameWithBadge(other)}
                        </div>
                        <div className="small text-light opacity-75">
                          {c.lastMessage || "No messages yet"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-8 d-flex flex-column chat-window">
            {!selectedConvo ? (
              <div className="text-light opacity-75 text-center m-auto">
                Select a conversation
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="chat-header p-3 border-bottom border-violet">
                  <h5 className="text-light m-0">
                    Chat with: {renderNameWithBadge(getOther(selectedConvo))}
                  </h5>
                </div>

                {/* MESSAGES */}
                <div
                  className="messages-scroll-container flex-grow-1"
                  ref={messagesContainerRef}
                >
                  <div className="messages-content p-3">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`d-flex mb-3 ${
                          isMine(msg)
                            ? "justify-content-end"
                            : "justify-content-start"
                        }`}
                      >
                        <div
                          className={`px-3 py-2 rounded-4 message-bubble ${
                            isMine(msg)
                              ? "my-message"
                              : "other-message"
                          }`}
                          style={{ maxWidth: "70%" }}
                        >
                          <div className="text-light">{msg.text}</div>
                          <div className="small text-light opacity-75">
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* INPUT */}
                <div className="message-input-container p-3 border-top border-violet">
                  <form onSubmit={handleSendMessage} className="w-100">
                    <div className="input-group align-items-center">
                      <input
                        type="text"
                        className="form-control message-input text-light"
                        placeholder="Type message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                      <button className="btn send-button" type="submit">
                        ➤
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .messages-container {
          background: linear-gradient(135deg, #0c0c0c 0%, #1a0b2e 50%, #0c0c0c 100%);
          position: relative;
          overflow: hidden;
          height: 100vh;
          padding-bottom: 80px;
        }
        
        .background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 255, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .chat-header {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }
          
        
        .recent-chats-btn {
          background: linear-gradient(135deg, #8a2be2, #6a0dad);
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.9;
        }
        
        .recent-chats-btn:hover {
          opacity: 1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
        }
        
        .border-violet {
          border-color: rgba(138, 43, 226, 0.3) !important;
        }
        
        .bg-violet {
          background: linear-gradient(135deg, #8a2be2, #6a0dad) !important;
        }
        
        .conversation-item {
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .conversation-item:hover {
          background: rgba(138, 43, 226, 0.15) !important;
        }
        
        .active-conversation {
          background: rgba(138, 43, 226, 0.2) !important;
          border-left: 3px solid rgba(138, 43, 226, 0.8) !important;
        }
        
        .search-result-item {
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .search-result-item:hover {
          background: rgba(138, 43, 226, 0.1);
        }
        
        /* FIXED: Search input with properly positioned button - NO OVERLAP */
        .search-form-wrapper {
          width: 100%;
        }

        .search-input-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 12px 45px 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          backdrop-filter: blur(10px);
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          color: white;
          box-sizing: border-box;
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(138, 43, 226, 0.6);
          box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-button {
          position: absolute;
          right: 8px;
          background: linear-gradient(135deg, #8a2be2, #6a0dad);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.9;
          z-index: 2;
          font-size: 12px;
        }

        .search-button:hover:not(:disabled) {
          opacity: 1;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
        }

        .search-button:disabled {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Search results area with scroll */
        .search-results-scroll {
          flex-grow: 1;
          overflow-y: auto;
          max-height: 250px;
        }

        /* Recent Chats Section with scroll */
        .recent-chats-scroll {
          flex-grow: 1;
          overflow-y: auto;
          max-height: calc(100vh - 300px);
        }

        /* Chat window layout */
        .chat-window {
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        /* Messages scroll container */
        .messages-scroll-container {
          flex-grow: 1;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }
        
        .messages-content {
          flex-grow: 1;
          padding-bottom: 20px;
        }
        
        .message-bubble {
          backdrop-filter: blur(10px);
        }
        
        .my-message {
          background: linear-gradient(135deg, #8a2be2, #6a0dad);
          border: 1px solid rgba(138, 43, 226, 0.3);
        }
        
        .other-message {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* FIXED: Message input area - properly positioned and visible */
        .message-input-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
          border-top: 1px solid rgba(138, 43, 226, 0.3) !important;
          position: sticky;
          bottom: 0;
          z-index: 10;
          padding: 15px !important;
          margin-top: auto;
        }

        .message-input-container form {
          width: 100%;
        }

        .input-group {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .message-input {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(138, 43, 226, 0.3) !important;
          color: white !important;
          border-radius: 25px !important;
          padding: 12px 20px !important;
          flex: 1 !important;
          min-width: 0 !important;
          margin: 0 !important;
        }

        .message-input:focus {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(138, 43, 226, 0.6) !important;
          box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2) !important;
          color: white !important;
        }

        .message-input::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .send-button {
          background: linear-gradient(135deg, #8a2be2, #6a0dad) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 45px !important;
          height: 45px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .send-button:hover:not(:disabled) {
          opacity: 1 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4) !important;
        }

        .send-button:disabled {
          background: rgba(255, 255, 255, 0.2) !important;
          cursor: not-allowed !important;
          transform: none !important;
          box-shadow: none !important;
          opacity: 0.6 !important;
        }

        /* Custom scrollbars */
        .search-results-scroll::-webkit-scrollbar,
        .recent-chats-scroll::-webkit-scrollbar,
        .messages-scroll-container::-webkit-scrollbar {
          width: 8px;
        }

        .search-results-scroll::-webkit-scrollbar-track,
        .recent-chats-scroll::-webkit-scrollbar-track,
        .messages-scroll-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .search-results-scroll::-webkit-scrollbar-thumb,
        .recent-chats-scroll::-webkit-scrollbar-thumb,
        .messages-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(138, 43, 226, 0.6);
          border-radius: 4px;
        }

        .search-results-scroll::-webkit-scrollbar-thumb:hover,
        .recent-chats-scroll::-webkit-scrollbar-thumb:hover,
        .messages-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(138, 43, 226, 0.8);
        }

        /* Remove external scrollbar from main container */
        body {
          overflow: hidden;
        }
        
        .container-fluid {
          overflow: hidden;
          height: 100%;
        }
        
        .row {
          overflow: hidden;
          height: 100%;
        }

        /* Ensure proper flex behavior */
        .h-100 {
          height: 100% !important;
        }

        .min-vh-100 {
          min-height: 100vh;
        }

        .flex-grow-1 {
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
}