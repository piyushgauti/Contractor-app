import { useState } from "react"
import { loginContractor } from "../firebase/authFunctions"

function Login({ onBack, onSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password")
      return
    }
    setLoading(true)
    setError("")
    const result = await loginContractor(email, password)
    setLoading(false)
    if (result.success) {
      onSuccess()
    } else {
      setError("Invalid email or password")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="text-blue-600 text-sm mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-8">Sign in to your contractor account</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Email address</label>
          <input
            type="email"
            placeholder="e.g. rajesh@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={onBack}
            className="text-blue-600 cursor-pointer"
          >
            Join as contractor
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login