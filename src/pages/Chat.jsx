import { useState, useEffect, useRef, useMemo } from "react";
import { sendMessage, listenToMessages } from "../firebase/firestoreFunctions";
// generate guest ID once when file loads — outside component
if (!sessionStorage.getItem("guestId")) {
  sessionStorage.setItem("guestId", "guest_" + Date.now().toString(36));
}
function Chat({ contractor, currentUser, onBack, onMarkRead }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const initials = contractor.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // compute these once and keep them stable
  const senderId = useMemo(() => {
    if (currentUser?.uid) return currentUser.uid;
    return sessionStorage.getItem("guestId") || "guest_user";
  }, [currentUser]);
  const contractorId = useMemo(
    () => contractor.uid || contractor.id?.toString(),
    [contractor],
  );

  useEffect(() => {
    const unsubscribe = listenToMessages(senderId, contractorId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      if (onMarkRead) onMarkRead();
    });
    return () => unsubscribe();
  }, [senderId, contractorId]);

  // auto scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage("");
    const senderName =
      currentUser?.name && !currentUser.name.includes("@")
        ? currentUser.name
        : currentUser?.email?.split("@")[0] || "Guest";
    const receiverName = contractor?.name || "Contractor";
    await sendMessage(senderId, contractorId, text, senderName, receiverName);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-57px)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={onBack} className="text-blue-600 text-sm mr-1">
          ←
        </button>

        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{contractor.name}</p>
          <p className="text-xs text-gray-400">
            {contractor.specialty} · {contractor.location}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            contractor.available
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {contractor.available ? "Online" : "Busy"}
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">
            Loading messages...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No messages yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Send a message to start the conversation
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === senderId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs mr-2 flex-shrink-0 self-end">
                  {initials}
                </div>
              )}

              <div
                className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
            newMessage.trim()
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-300"
          }`}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;
