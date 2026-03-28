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
import { listenToAuthState } from "./firebase/authFunctions";
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
          // fetch customer name from Firestore
          const { getDoc, doc } = await import("firebase/firestore");
          const { db } = await import("./firebase/config");
          const customerSnap = await getDoc(doc(db, "customers", user.uid));
          const customerName = customerSnap.exists()
            ? customerSnap.data().name
            : user.email;
          setCurrentUser({ ...user, name: customerName, type: "customer" });
          setUserType("customer");
        }
        unreadUnsub = listenToUnreadCount(user.uid, (count) => {
          setUnreadCount(count);
        });
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
      // if we already have full contractor data keep it
      if (
        prev &&
        (prev.uid === otherId || prev.id === otherId) &&
        prev.specialty
      ) {
        return prev;
      }
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
        onLoginClick={() => navigateTo("customerAuth")}
        onContractorLogin={() => navigateTo("login")}
        onDashboard={() => navigateTo("dashboard")}
        onInboxClick={() =>
          navigateTo(
            userType === "contractor" ? "contractorInbox" : "customerInbox",
          )
        }
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
                    : "profile",
            )
          }
          onMarkRead={() => {
            if (currentUser && selectedContractor) {
              const otherId = selectedContractor.uid || selectedContractor.id;
              markMessagesAsRead(otherId, currentUser.uid);
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
    </div>
  );
}

export default App;
