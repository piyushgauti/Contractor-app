import { useState } from "react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Chat from "./pages/Chat"
import Signup from "./pages/Signup"

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedContractor, setSelectedContractor] = useState(null)

  const handleSelectContractor = (contractor) => {
    setSelectedContractor(contractor)
    setCurrentPage("profile")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {currentPage === "home" && (
        <Home
          onSelectContractor={handleSelectContractor}
          onJoinAsContractor={() => setCurrentPage("signup")}
        />
      )}

      {currentPage === "profile" && (
        <Profile
          contractor={selectedContractor}
          onBack={() => setCurrentPage("home")}
          onMessage={() => setCurrentPage("chat")}
        />
      )}

      {currentPage === "chat" && (
        <Chat
          contractor={selectedContractor}
          onBack={() => setCurrentPage("profile")}
        />
      )}

      {currentPage === "signup" && (
        <Signup
          onBack={() => setCurrentPage("home")}
          onSuccess={() => setCurrentPage("home")}
        />
      )}

    </div>
  )
}

export default App