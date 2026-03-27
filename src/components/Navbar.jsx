import { logoutContractor } from "../firebase/authFunctions"

function Navbar({ currentUser, onLoginClick, onLogout }) {

  const handleLogout = async () => {
    await logoutContractor()
    onLogout()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold text-blue-600">
        ContractorFind
      </div>

      <div className="flex items-center gap-3">
        {currentUser ? (
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Contractor login
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar