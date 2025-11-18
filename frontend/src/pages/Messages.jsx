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

  // SOCKET SETUP
  useEffect(() => {
    if (!currentUser) return;

    const setupSocket = async () => {
      const token = await currentUser.getIdToken();
      const socket = io(API_BASE, { auth: { token } });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to chat socket");
      });

      socket.on("private_message", (msg) => {
        console.log("📩 Incoming message", msg);
        const current = selectedConvoRef.current;

        // update message list if this convo is open
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

        // ALWAYS update conversation list preview
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt }
              : c
          )
        );
      });

      socket.on("private_message_sent", (msg) => {
        console.log("📤 Message sent confirmed", msg);
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

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from chat socket");
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  // FETCH MY CONVERSATIONS
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

  // LOAD MESSAGES
  const loadMessages = async (convo) => {
    if (!currentUser || !convo || !convo._id) {
      console.error("Invalid conversation passed to loadMessages:", convo);
      return;
    }
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
    if (!convo || !convo._id) return;
    setSelectedConvo(convo);
    await loadMessages(convo);
    setShowRecentChats(false);
  };

  // SEARCH ALUMNI
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `${API_BASE}/api/messages/search-users?q=${encodeURIComponent(
          searchQuery
        )}`,
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

  // START NEW CONVERSATION
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

      if (!convo || !convo._id) {
        console.error("Invalid convo returned from API:", convo);
        return;
      }

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === convo._id);
        if (!exists) return [convo, ...prev];
        return prev;
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

  // SEND MESSAGE
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvo || !socketRef.current) return;

    const text = messageText.trim();
    const other = getOther(selectedConvo);
    if (!other?.uid) {
      console.error("No other uid in selectedConvo:", selectedConvo);
      return;
    }

    socketRef.current.emit("private_message", {
      toUid: other.uid,
      text,
    });

    setMessageText("");
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isMine = (msg) => msg.senderUid === myUid;

  return (
    <div className="min-vh-100 messages-container">
      {/* Background with violet tint and glass effect */}
      <div className="background-overlay"></div>
      
      <div className="container-fluid h-100 py-3">
        <div className="row h-100 g-0">
          {/* LEFT: Conversations + Search */}
          <div className="col-md-4 border-end border-violet">
            <div className="h-100 d-flex flex-column">
              <div className="p-3 border-bottom border-violet">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0 text-light">Messages</h4>
                  <button 
                    className="recent-chats-btn"
                    onClick={() => setShowRecentChats(!showRecentChats)}
                  >
                    <i className={`bi bi-chevron-${showRecentChats ? 'up' : 'down'} me-1`}></i>
                    Recent Chats
                  </button>
                </div>

                {/* WhatsApp-style search input */}
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-input-wrapper">
                    <input
                      className="search-input text-light"
                      placeholder="Search alumni by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      className="search-button" 
                      type="submit"
                      disabled={searchLoading}
                    >
                      {searchLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Fixed height search results area */}
              {searchResults.length > 0 && (
                <div className="search-results-container">
                  <div className="p-3 border-bottom border-violet">
                    <div className="small text-light mb-2">Search Results</div>
                  </div>
                  <div className="search-results-scroll">
                    {searchResults.map((alumni) => (
                      <div
                        key={alumni.uid}
                        className="p-3 border-bottom border-violet search-result-item"
                        onClick={() => startConversationWithAlumni(alumni)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold text-light">{alumni.name}</div>
                            <div className="small text-light opacity-75">
                              {alumni.department} • {alumni.graduationYear}
                            </div>
                          </div>
                          <span className="badge bg-violet">Message</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Chats Section - Only shows when toggled */}
              {showRecentChats && (
                <div className="recent-chats-container">
                  <div className="p-3 border-bottom border-violet">
                    <div className="small text-light mb-2">Recent Chats</div>
                  </div>
                  <div className="recent-chats-scroll">
                    {loadingConvos && (
                      <div className="text-center py-3">
                        <div className="spinner-border text-violet" role="status">
                          <span className="visually-hidden">Loading conversations...</span>
                        </div>
                      </div>
                    )}
                    {!loadingConvos && conversations.length === 0 && (
                      <div className="text-center py-3 text-light opacity-75">
                        No conversations yet. Start one from search.
                      </div>
                    )}

                    {conversations.map((convo) => {
                      const other = getOther(convo);
                      const isActive = selectedConvo && selectedConvo._id === convo._id;
                      return (
                        <div
                          key={convo._id}
                          className={`p-3 border-bottom border-violet conversation-item ${
                            isActive ? 'active-conversation' : ''
                          }`}
                          onClick={() => handleSelectConversation(convo)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="fw-bold text-truncate me-2 text-light">
                              {other?.name || other?.uid || "Unknown"}
                            </div>
                            <div className="small text-light opacity-75">
                              {convo.updatedAt && formatTime(convo.updatedAt)}
                            </div>
                          </div>
                          <div className="small text-truncate text-light opacity-75 mt-1">
                            {convo.lastMessage || "No messages yet"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main content area when recent chats are hidden */}
              {!showRecentChats && (
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                  <div className="text-center text-light opacity-75 p-4">
                    <i className="bi bi-chat-dots display-4 mb-3 opacity-50"></i>
                    <p>Click "Recent Chats" to view your conversations</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Chat window */}
          <div className="col-md-8 d-flex flex-column chat-window">
            {!selectedConvo ? (
              <div className="d-flex flex-grow-1 align-items-center justify-content-center text-light opacity-75 p-4">
                <div className="text-center">
                  <i className="bi bi-chat-dots display-4 mb-3 opacity-50"></i>
                  <p>Select a conversation or search an alumni to start chatting.</p>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column h-100">
                {/* Chat Header */}
                <div className="chat-header p-3 border-bottom border-violet">
                  <h5 className="mb-0 text-light">
                    <i className="bi bi-person-circle me-2"></i>
                    Chat with: {getOther(selectedConvo)?.name || "Unknown"}
                  </h5>
                </div>

                {/* Messages Area - Scrollable */}
                <div 
                  className="messages-scroll-container flex-grow-1"
                  ref={messagesContainerRef}
                >
                  {loadingMessages && (
                    <div className="text-center py-3">
                      <div className="spinner-border text-violet" role="status">
                        <span className="visually-hidden">Loading messages...</span>
                      </div>
                    </div>
                  )}
                  {!loadingMessages && messages.length === 0 && (
                    <div className="text-center py-5 text-light opacity-75">
                      <i className="bi bi-chat-quote display-4 mb-3 opacity-50"></i>
                      <p>No messages yet. Say hi 👋</p>
                    </div>
                  )}

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
                          <div className={`small ${isMine(msg) ? 'text-end' : ''} opacity-75 text-light`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* MESSAGE INPUT BAR - FIXED at bottom */}
                {/* MESSAGE INPUT BAR - FIXED at bottom */}
<div className="message-input-container p-3 border-top border-violet" style={{marginBottom: " 100px"}}>
  <form onSubmit={handleSendMessage} className="w-100">
    <div className="input-group align-items-center">
      <input
        type="text"
        className="form-control message-input text-light flex-grow-1"
        placeholder="Type your message here..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />
      <button 
        className="btn send-button flex-shrink-0"
        type="submit"
        disabled={!messageText.trim()}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  </form>
</div>
              </div>
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
        
        /* WhatsApp-style search input */
        .search-form {
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 12px 50px 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          backdrop-filter: blur(10px);
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
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
          right: 6px;
          background: linear-gradient(135deg, #8a2be2, #6a0dad);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.9;
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
        .search-results-container {
          max-height: 300px;
          border-bottom: 1px solid rgba(138, 43, 226, 0.3);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .search-results-scroll {
          flex-grow: 1;
          overflow-y: auto;
          max-height: 250px;
        }

        /* Recent Chats Section with scroll */
        .recent-chats-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .recent-chats-scroll {
          flex-grow: 1;
          overflow-y: auto;
          max-height: calc(100vh - 300px);
        }

        /* Chat window layout */
        .chat-window {
          height: 100vh;
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

       /* MESSAGE INPUT BAR - FIXED and VISIBLE */
.message-input-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  border-top: 1px solid rgba(138, 43, 226, 0.3) !important;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.input-group {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  width: 100% !important;
}

.message-input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(138, 43, 226, 0.3) !important;
  color: white !important;
  border-radius: 25px !important;
  padding: 12px 20px !important;
  flex: 1 !important;
  min-width: 0 !important; /* Important for flex shrinking */
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
  width: 50px !important;
  height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
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
        }
        
        .row {
          overflow: hidden;
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