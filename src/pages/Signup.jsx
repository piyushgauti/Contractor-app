import { useState } from "react"

const specialtyOptions = [
  "Builder", "Mason", "Civil Contractor",
  "RCC Work", "Brickwork", "Plastering",
  "Waterproofing", "Flooring", "Painting",
  "Foundation Work", "Shuttering", "Concrete"
]

const statesOfIndia = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

function Signup({ onBack, onSuccess }) {
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    state: "",
    city: "",
    experience: "",
    about: "",
    specialties: [],
  })

  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const toggleSpecialty = (s) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s]
    }))
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Name is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email"
    if (!form.phone.trim()) e.phone = "Phone is required"
    else if (form.phone.length < 10) e.phone = "Enter a valid phone number"
    if (!form.password.trim()) e.password = "Password is required"
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    if (!form.state) e.state = "Please select a state"
    if (!form.city.trim()) e.city = "City is required"
    if (!form.experience) e.experience = "Experience is required"
    if (form.specialties.length === 0) e.specialties = "Select at least one specialty"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = () => {
    if (validateStep2()) {
      setStep(3)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      {/* Back button */}
      <button
        onClick={onBack}
        className="text-blue-600 text-sm mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Join as a contractor</h1>
      <p className="text-sm text-gray-500 mb-6">
        Create your free profile and get discovered by clients across India.
      </p>

      {/* Step indicator */}
      {step < 3 && (
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}>
                {s < step ? "✓" : s}
              </div>
              <span className={`text-xs ${s === step ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                {s === 1 ? "Account info" : "Work details"}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>
      )}

      {/* Step 1 — Account info */}
      {step === 1 && (
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full name</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar"
              value={form.name}
              onChange={e => update("name", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email address</label>
            <input
              type="email"
              placeholder="e.g. rajesh@email.com"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone number</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={e => update("phone", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={e => update("password", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.password ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-2"
          >
            Continue →
          </button>

        </div>
      )}

      {/* Step 2 — Work details */}
      {step === 2 && (
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
            <select
              value={form.state}
              onChange={e => update("state", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white ${
                errors.state ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            >
              <option value="">Select your state</option>
              {statesOfIndia.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
            <input
              type="text"
              placeholder="e.g. Faridabad"
              value={form.city}
              onChange={e => update("city", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.city ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Years of experience</label>
            <input
              type="number"
              placeholder="e.g. 8"
              min="0"
              max="50"
              value={form.experience}
              onChange={e => update("experience", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.experience ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Specialties
              <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.specialties.includes(s)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.specialties && <p className="text-xs text-red-500 mt-1">{errors.specialties}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              About you
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              placeholder="Describe your experience, past projects, and what makes you stand out..."
              value={form.about}
              onChange={e => update("about", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              Create profile
            </button>
          </div>

        </div>
      )}

      {/* Step 3 — Success */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile created!</h2>
          <p className="text-sm text-gray-500 mb-2">
            Welcome, {form.name.split(" ")[0]}! Your profile is now live.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Clients in {form.city}, {form.state} can now find and message you.
          </p>
          <button
            onClick={onSuccess}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            Go to home →
          </button>
        </div>
      )}

    </div>
  )
}

export default Signup