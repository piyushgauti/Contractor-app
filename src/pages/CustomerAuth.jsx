import { useState } from "react"
import { registerCustomer, loginCustomer } from "../firebase/authFunctions"

function CustomerAuth({ onBack, onSuccess }) {
  const [mode, setMode] = useState("login")

  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const update = (field, value) => {
    setForm(p => ({ ...p, [field]: value }))
    setError("")
  }

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please fill in all fields")
      return
    }
    if (mode === "signup" && !form.name.trim()) {
      setError("Please enter your name")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    const result = mode === "signup"
      ? await registerCustomer(form.name, form.email, form.password)
      : await loginCustomer(form.email, form.password)

    setLoading(false)

    if (result.success) {
      onSuccess({ uid: result.uid, name: result.name, email: form.email, type: "customer" })
    } else {
      if (result.error.includes("email-already-in-use")) {
        setError("This email is already registered. Please sign in.")
      } else if (result.error.includes("user-not-found") || result.error.includes("wrong-password") || result.error.includes("invalid-credential")) {
        setError("Invalid email or password.")
      } else {
        setError(result.error)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="text-blue-600 text-sm mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {mode === "login" ? "Welcome back" : "Create account"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {mode === "login"
          ? "Sign in to message contractors and leave reviews"
          : "Join to connect with trusted contractors across India"}
      </p>

      {/* Mode switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setMode("login"); setError("") }}
          className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
            mode === "login"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => { setMode("signup"); setError("") }}
          className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
            mode === "signup"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Create account
        </button>
      </div>

      <div className="flex flex-col gap-4">

        {mode === "signup" && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full name</label>
            <input
              type="text"
              placeholder="e.g. Amit Singh"
              value={form.name}
              onChange={e => update("name", e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Email address</label>
          <input
            type="email"
            placeholder="e.g. amit@email.com"
            value={form.email}
            onChange={e => update("email", e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={e => update("password", e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-1"
        >
          {loading
            ? (mode === "login" ? "Signing in..." : "Creating account...")
            : (mode === "login" ? "Sign in" : "Create account")}
        </button>

        <p className="text-center text-xs text-gray-400">
          {mode === "login" ? "Are you a contractor?" : "Already have an account?"}{" "}
          <span
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }}
            className="text-blue-600 cursor-pointer"
          >
            {mode === "login" ? "Join as contractor →" : "Sign in"}
          </span>
        </p>

      </div>
    </div>
  )
}

export default CustomerAuth