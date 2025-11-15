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
  const myUid = currentUser?.uid;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]);

  const getOther = (convo) => convo?.other;

  // SOCKET.IO CONNECTION
  useEffect(() => {
    if (!currentUser) return;

    const setupSocket = async () => {
      const token = await currentUser.getIdToken();

      const socket = io(API_BASE, { auth: { token } });
      socketRef.current = socket;

      socket.on("connect", () => console.log("✅ Connected to chat socket"));

      // RECEIVE MESSAGE
      socket.on("private_message", (msg) => {
        console.log("📩 Incoming message", msg);

        // update messages in the open chat
        if (selectedConvo && msg.conversation === selectedConvo._id) {
          setMessages((prev) => [...prev, msg]);

          // ALSO update selectedConvo preview
          setSelectedConvo((prev) => ({
            ...prev,
            lastMessage: msg.text,
            updatedAt: msg.createdAt,
          }));
        }

        // update conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt }
              : c
          )
        );
      });

      // SENT MESSAGE CONFIRMATION
      socket.on("private_message_sent", (msg) => {
        console.log("📤 Sent confirmed", msg);

        if (selectedConvo && msg.conversation === selectedConvo._id) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === msg._id);
            return exists ? prev : [...prev, msg];
          });

          setSelectedConvo((prev) => ({
            ...prev,
            lastMessage: msg.text,
            updatedAt: msg.createdAt,
          }));
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
  }, [currentUser, selectedConvo]);

  // FETCH CONVERSATIONS
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
        console.error("Error fetching conversations", err);
      }

      setLoadingConvos(false);
    };

    fetchConversations();
  }, [currentUser]);

  // LOAD MESSAGES
  const loadMessages = async (convo) => {
    setLoadingMessages(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/messages/${convo._id}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  // SEARCH
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `${API_BASE}/api/messages/search-alumni?q=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error("Error searching alumni", err);
    }
    setSearchLoading(false);
  };

  // START NEW CHAT
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

      setConversations((prev) =>
        prev.some((c) => c._id === convo._id) ? prev : [convo, ...prev]
      );

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
    if (!messageText.trim() || !socketRef.current) return;
    const text = messageText.trim();

    socketRef.current.emit("private_message", {
      toUid: getOther(selectedConvo)?.uid,
      text,
    });

    setMessageText("");
  };

  // TIME
  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMine = (msg) => msg.senderUid === myUid;

  return (
    <div className="container-fluid min-vh-100 bg-dark text-light py-3">
      <div className="row h-100">
        {/* LEFT */}
        <div className="col-md-4 border-end border-secondary">
          <h4 className="mb-3">Messages</h4>

          {/* SEARCH */}
          <form className="d-flex mb-3" onSubmit={handleSearch}>
            <input
              className="form-control me-2 bg-dark text-light border-secondary"
              placeholder="Search alumni by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-light">
              {searchLoading ? "..." : "Search"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <ul className="list-group mb-2">
              {searchResults.map((al) => (
                <li
                  key={al.uid}
                  className="list-group-item bg-dark text-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => startConversationWithAlumni(al)}
                >
                  <strong>{al.name}</strong>
                  <br />
                  <span className="small text-muted">
                    {al.department} • {al.graduationYear}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <hr className="border-secondary" />

          {/* CONVERSATIONS */}
          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {conversations.map((convo) => {
              const other = getOther(convo);
              const active = selectedConvo?._id === convo._id;

              return (
                <div
                  key={convo._id}
                  className={`p-2 mb-1 rounded ${
                    active ? "bg-primary" : "bg-secondary bg-opacity-25"
                  }`}
                  onClick={() => handleSelectConversation(convo)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="fw-bold">
                    Chat with: {other?.name || other?.uid}
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

        {/* RIGHT */}
        <div className="col-md-8 d-flex flex-column">
          {!selectedConvo ? (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center text-muted">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <div className="py-2 border-bottom border-secondary">
                <h5 className="mb-0">Chat with: {selectedConvo.other?.name}</h5>
              </div>

              <div
                className="flex-grow-1 py-3"
                style={{ overflowY: "auto", maxHeight: "70vh" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`d-flex mb-2 ${
                      isMine(msg) ? "justify-content-end" : "justify-content-start"
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
                      <div className="small text-end opacity-75">
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
                  <button className="btn btn-primary">Send</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
