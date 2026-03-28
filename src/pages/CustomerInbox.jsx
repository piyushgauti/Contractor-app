import { useState, useEffect } from "react"
import { listenToCustomerChats } from "../firebase/firestoreFunctions"

function CustomerInbox({ currentUser, onOpenChat, onBack }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = listenToCustomerChats(currentUser.uid, (data) => {
      setChats(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [currentUser.uid])

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My conversations</h1>
          <p className="text-xs text-gray-400 mt-0.5">Contractors you've messaged</p>
        </div>
        <button onClick={onBack} className="text-sm text-blue-600">← Back</button>
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-sm py-12">Loading...</p>
      )}

      {!loading && chats.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Message a contractor to start a conversation
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {chats.map(chat => {
          const initials = (chat.receiverName || "C")
            .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

          return (
            <div
              key={chat.chatId}
              onClick={() => onOpenChat(chat.receiverId, chat.receiverName)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {chat.receiverName || "Contractor"}
                    </p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {chat.createdAt?.toDate
                        ? chat.createdAt.toDate().toLocaleDateString("en-IN", {
                            day: "numeric", month: "short"
                          })
                        : ""}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default CustomerInbox