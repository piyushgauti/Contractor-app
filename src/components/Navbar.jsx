import { logoutContractor } from "../firebase/authFunctions";

function Navbar({
  currentUser,
  userType,
  unreadCount,
  onHome,
  onLoginClick,
  onContractorLogin,
  onDashboard,
  onInboxClick,
  onProjectsClick,
  onAdminClick,
  onLogout,
}) {
  const handleLogout = async () => {
    await logoutContractor();
    onLogout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div
        onClick={onHome}
        className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
      >
        ContractorFind
      </div>

      <div className="flex items-center gap-2">
        {currentUser ? (
          <>
            <span className="text-xs text-gray-500 hidden sm:block max-w-[100px] truncate">
              {userType === "contractor" ? "👷" : "👤"} {currentUser.name}
            </span>

            {/* Projects button */}
            <button
              onClick={onProjectsClick}
              className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block"
            >
              {userType === "contractor" ? "Projects" : "My projects"}
            </button>

            {/* Chat icon with unread badge */}
            <div className="relative">
              <button
                onClick={onInboxClick}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="Messages"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
              )}
            </div>

            {userType === "contractor" && (
              <button
                onClick={onDashboard}
                className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Dashboard
              </button>
            )}

            {currentUser?.email === "admin@contractorfind.com" && (
              <button
                onClick={onAdminClick}
                className="text-xs text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLoginClick}
              className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              User login
            </button>
            <button
              onClick={onContractorLogin}
              className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Contractor login
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
