import { useState } from "react"

function Chat({ contractor, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I'm interested in your work. Are you available for a project?`,
      sender: "user",
      time: "10:00 AM"
    },
    {
      id: 2,
      text: `Hello! Yes I'm available. What kind of project do you have in mind?`,
      sender: "contractor",
      time: "10:01 AM"
    },
    {
      id: 3,
      text: `I want to build a 2BHK house. Can we discuss the details?`,
      sender: "user",
      time: "10:02 AM"
    },
    {
      id: 4,
      text: `Sure! Please share the plot size and your budget. I'll give you an estimate.`,
      sender: "contractor",
      time: "10:03 AM"
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  const initials = contractor.name
    .split(" ")
    .map(n => n[0])
    .join("")

  const handleSend = () => {
    // don't send empty messages
    if (!newMessage.trim()) return

    // add user message
    const userMsg = {
      id: messages.length + 1,
      text: newMessage.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, userMsg])
    setNewMessage("")

    // simulate contractor reply after 1 second
    setTimeout(() => {
      const replies = [
        "Sure, I can help with that!",
        "That sounds good. Let me check my schedule.",
        "Can you share more details about the project?",
        "I have experience with similar projects.",
        "Let's schedule a site visit this week.",
      ]
      const randomReply = replies[Math.floor(Math.random() * replies.length)]

      const contractorMsg = {
        id: messages.length + 2,
        text: randomReply,
        sender: "contractor",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }

      setMessages(prev => [...prev, contractorMsg])
    }, 1000)
  }

  const handleKeyDown = (e) => {
    // send message when Enter is pressed
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-57px)]">

      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-blue-600 text-sm mr-1"
        >
          ←
        </button>

        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{contractor.name}</p>
          <p className="text-xs text-gray-400">{contractor.specialty} · {contractor.location}</p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          contractor.available
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700"
        }`}>
          {contractor.available ? "Online" : "Busy"}
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Contractor avatar for incoming messages */}
            {msg.sender === "contractor" && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs mr-2 flex-shrink-0 self-end">
                {initials}
              </div>
            )}

            <div className={`max-w-[75%] ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 px-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
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
  )
}

export default Chat