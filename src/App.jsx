import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Chat from "./pages/Chat"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import { listenToAuthState } from "./firebase/authFunctions"

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedContractor, setSelectedContractor] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = listenToAuthState((user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSelectContractor = (contractor) => {
    setSelectedContractor(contractor)
    setCurrentPage("profile")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentUser={currentUser}
        onLoginClick={() => setCurrentPage("login")}
        onLogout={() => {
          setCurrentUser(null)
          setCurrentPage("home")
        }}
      />

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
          currentUser={currentUser}
          onBack={() => setCurrentPage("profile")}
        />
      )}

      {currentPage === "signup" && (
        <Signup
          onBack={() => setCurrentPage("home")}
          onSuccess={() => setCurrentPage("home")}
        />
      )}

      {currentPage === "login" && (
        <Login
          onBack={() => setCurrentPage("home")}
          onSuccess={() => setCurrentPage("home")}
        />
      )}

    </div>
  )
}

export default App