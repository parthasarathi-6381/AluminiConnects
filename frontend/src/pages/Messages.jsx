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
  const messagesEndRef = useRef(null);
  const selectedConvoRef = useRef(null);

  const myUid = currentUser?.uid;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
  };

  // SEARCH ALUMNI
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      /*const searchUrl =
               currentUser?.role === "alumni"
               ? "/api/messages/search-students"
               : "/api/messages/search-alumni";*/

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
    <div className="container-fluid min-vh-100 bg-dark text-light py-3">
      <div className="row h-100">
        {/* LEFT: Conversations + Search */}
        <div className="col-md-4 border-end border-secondary">
          <h4 className="mb-3">Messages</h4>

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

          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {loadingConvos && (
              <div className="small">Loading conversations...</div>
            )}
            {!loadingConvos && conversations.length === 0 && (
              <div className="small text-muted">
                No conversations yet. Start one from search.
              </div>
            )}

            {conversations.map((convo) => {
              const other = getOther(convo);
              const isActive = selectedConvo && selectedConvo._id === convo._id;
              return (
                <div
                  key={convo._id}
                  className={`p-2 mb-1 rounded ${
                    isActive ? "bg-primary" : "bg-secondary bg-opacity-25"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelectConversation(convo)}
                >
                  <div className="fw-bold">
                    Chat with: {other?.name || other?.uid || "Unknown"}
                  </div>
                  <div className="small text-truncate">
                    {convo.lastMessage || "No messages yet"}
                  </div>
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
              <div className="py-2 border-bottom border-secondary">
                <h5 className="mb-0">
                  Chat with: {getOther(selectedConvo)?.name || "Unknown"}
                </h5>
              </div>

              <div
                className="flex-grow-1 py-3"
                style={{ overflowY: "auto", maxHeight: "70vh" }}
              >
                {loadingMessages && (
                  <div className="small">Loading messages...</div>
                )}
                {!loadingMessages && messages.length === 0 && (
                  <div className="small text-muted text-center">
                    No messages yet. Say hi 👋
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`d-flex mb-2 ${
                      isMine(msg)
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-4 ${
                        isMine(msg)
                          ? "bg-primary text-white"
                          : "bg-secondary bg-opacity-50"
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
                <div ref={messagesEndRef} />
              </div>

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
2