import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerAuth from "./pages/CustomerAuth";
import ContractorInbox from "./pages/ContractorInbox";
import CustomerInbox from "./pages/CustomerInbox";
import PostProject from "./pages/PostProject";
import MyProjects from "./pages/MyProjects";
import ProjectsFeed from "./pages/ProjectsFeed";
import { listenToAuthState } from "./firebase/authFunctions";
import Admin from "./pages/Admin";
import {
  fetchContractorById,
  listenToUnreadCount,
  markMessagesAsRead,
} from "./firebase/firestoreFunctions";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [previousPage, setPreviousPage] = useState("home");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unreadUnsub = null;
    const unsubscribe = listenToAuthState(async (user) => {
      if (user) {
        const contractorData = await fetchContractorById(user.uid);
        if (contractorData) {
          setCurrentUser({
            ...user,
            name: contractorData.name,
            type: "contractor",
          });
          setUserType("contractor");
        } else {
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("./firebase/config");
            const customerSnap = await getDoc(doc(db, "customers", user.uid));
            const customerName = customerSnap.exists()
              ? customerSnap.data().name
              : user.email;
            setCurrentUser({ ...user, name: customerName, type: "customer" });
          } catch {
            setCurrentUser({ ...user, name: user.email, type: "customer" });
          }
          setUserType("customer");
        }
        unreadUnsub = listenToUnreadCount(user.uid, setUnreadCount);
      } else {
        setCurrentUser(null);
        setUserType(null);
        setUnreadCount(0);
        if (unreadUnsub) unreadUnsub();
      }
      setAuthLoading(false);
    });
    return () => {
      unsubscribe();
      if (unreadUnsub) unreadUnsub();
    };
  }, []);

  const navigateTo = (page) => {
    setPreviousPage(currentPage);
    setCurrentPage(page);
  };

  const handleSelectContractor = (contractor) => {
    setSelectedContractor(contractor);
    navigateTo("profile");
  };

  const handleOpenChat = (otherId, otherName) => {
    setSelectedContractor((prev) => {
      if (
        prev &&
        (prev.uid === otherId || prev.id === otherId) &&
        prev.specialty
      )
        return prev;
      return {
        uid: otherId,
        id: otherId,
        name: otherName || "Contractor",
        specialty: "",
        location: "",
        available: true,
      };
    });
    navigateTo("chat");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentUser={currentUser}
        userType={userType}
        unreadCount={unreadCount}
        onHome={() => setCurrentPage("home")}
        onLoginClick={() => navigateTo("customerAuth")}
        onContractorLogin={() => navigateTo("login")}
        onDashboard={() => navigateTo("dashboard")}
        onInboxClick={() =>
          navigateTo(
            userType === "contractor" ? "contractorInbox" : "customerInbox",
          )
        }
        onProjectsClick={() => navigateTo(userType === "contractor" ? "projectsFeed" : "myProjects")}
        onAdminClick={() => navigateTo("admin")}
        
        onLogout={() => {
          setCurrentUser(null);
          setUserType(null);
          setUnreadCount(0);
          setCurrentPage("home");
        }}
      />

      {currentPage === "home" && (
        <Home
          onSelectContractor={handleSelectContractor}
          onJoinAsContractor={() => navigateTo("signup")}
        />
      )}
      {currentPage === "profile" && (
        <Profile
          contractor={selectedContractor}
          currentUser={currentUser}
          onBack={() => setCurrentPage("home")}
          onMessage={() => navigateTo("chat")}
        />
      )}

      {currentPage === "chat" && (
        <Chat
          contractor={selectedContractor}
          currentUser={currentUser}
          onBack={() =>
            setCurrentPage(
              previousPage === "dashboard"
                ? "dashboard"
                : previousPage === "contractorInbox"
                  ? "contractorInbox"
                  : previousPage === "customerInbox"
                    ? "customerInbox"
                    : previousPage === "projectsFeed"
                      ? "projectsFeed"
                      : "profile",
            )
          }
          onMarkRead={() => {
            if (currentUser && selectedContractor) {
              markMessagesAsRead(
                selectedContractor.uid || selectedContractor.id,
                currentUser.uid,
              );
            }
          }}
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
      {currentPage === "customerAuth" && (
        <CustomerAuth
          onBack={() => setCurrentPage("home")}
          onSuccess={(user) => {
            setCurrentUser({ ...user, name: user.name });
            setUserType("customer");
            setCurrentPage("home");
          }}
        />
      )}
      {currentPage === "dashboard" && (
        <Dashboard
          currentUser={currentUser}
          onBack={() => setCurrentPage("home")}
          onOpenChat={handleOpenChat}
        />
      )}
      {currentPage === "contractorInbox" && (
        <ContractorInbox
          currentUser={currentUser}
          onOpenChat={handleOpenChat}
          onBack={() => setCurrentPage("home")}
        />
      )}
      {currentPage === "customerInbox" && (
        <CustomerInbox
          currentUser={currentUser}
          onOpenChat={handleOpenChat}
          onBack={() => setCurrentPage("home")}
        />
      )}
      {currentPage === "postProject" && (
        <PostProject
          currentUser={currentUser}
          onBack={() => setCurrentPage("myProjects")}
          onSuccess={() => setCurrentPage("myProjects")}
        />
      )}
      {currentPage === "myProjects" && (
        <MyProjects
          currentUser={currentUser}
          onBack={() => setCurrentPage("home")}
          onPostProject={() => navigateTo("postProject")}
        />
      )}
      {currentPage === "projectsFeed" && (
        <ProjectsFeed
          currentUser={currentUser}
          onBack={() => setCurrentPage("home")}
          onMessageClient={handleOpenChat}
        />
      )}
      {currentPage === "admin" && (
        <Admin
          currentUser={currentUser}
          onBack={() => setCurrentPage("home")}
        />
      )}
    </div>
  );
}

export default App;
