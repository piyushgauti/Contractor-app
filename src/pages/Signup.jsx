import { useState } from "react"
import { registerContractor } from "../firebase/authFunctions"

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

const validate = {
  name: v => !v.trim() ? "Name is required" : "",
  email: v => !v.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(v) ? "Enter a valid email" : "",
  phone: v => !v.trim() ? "Phone is required" : v.length < 10 ? "Enter a valid 10-digit number" : "",
  password: v => !v.trim() ? "Password is required" : v.length < 6 ? "Minimum 6 characters" : "",
  state: v => !v ? "Please select a state" : "",
  city: v => !v.trim() ? "City is required" : "",
  experience: v => !v && v !== 0 ? "Experience is required" : "",
}

function Signup({ onBack, onSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    state: "", city: "", experience: "", about: "", specialties: [],
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [firebaseError, setFirebaseError] = useState("")

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validate[field]?.(value) || "" }))
    }
  }

  const touch = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    setErrors(prev => ({ ...prev, [field]: validate[field]?.(form[field]) || "" }))
  }

  const toggleSpecialty = (s) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s]
    }))
  }

  const step1Fields = ["name", "email", "phone", "password"]
  const step2Fields = ["state", "city", "experience"]

  const validateStep = (fields) => {
    const newErrors = {}
    const newTouched = {}
    fields.forEach(f => {
      newTouched[f] = true
      const err = validate[f]?.(form[f]) || ""
      if (err) newErrors[f] = err
    })
    setTouched(prev => ({ ...prev, ...newTouched }))
    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step1Fields)) setStep(2)
  }

  const handleSubmit = async () => {
    if (!validateStep(step2Fields)) return
    if (form.specialties.length === 0) {
      setErrors(prev => ({ ...prev, specialties: "Select at least one specialty" }))
      return
    }

    setLoading(true)
    setFirebaseError("")
    const result = await registerContractor(form)
    setLoading(false)

    if (result.success) {
      setStep(3)
    } else {
      if (result.error.includes("email-already-in-use")) {
        setStep(1)
        setErrors(prev => ({ ...prev, email: "This email is already registered" }))
        setTouched(prev => ({ ...prev, email: true }))
      } else {
        setFirebaseError(result.error)
      }
    }
  }

  const inputClass = (field) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
      errors[field] && touched[field]
        ? "border-red-400 bg-red-50"
        : touched[field] && !errors[field]
        ? "border-green-400 bg-green-50"
        : "border-gray-200 focus:border-blue-400"
    }`

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <button onClick={onBack} className="text-blue-600 text-sm mb-6 flex items-center gap-1">
        ← Back
      </button>

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
                s < step ? "bg-green-500 text-white"
                  : s === step ? "bg-blue-600 text-white"
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

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {[
            { field: "name", label: "Full name", type: "text", placeholder: "e.g. Rajesh Kumar" },
            { field: "email", label: "Email address", type: "email", placeholder: "e.g. rajesh@email.com" },
            { field: "phone", label: "Phone number", type: "tel", placeholder: "e.g. 9876543210" },
            { field: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[field]}
                onChange={e => update(field, e.target.value)}
                onBlur={() => touch(field)}
                className={inputClass(field)}
              />
              {errors[field] && touched[field] && (
                <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
              )}
              {!errors[field] && touched[field] && form[field] && (
                <p className="text-xs text-green-600 mt-1">✓ Looks good</p>
              )}
            </div>
          ))}

          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-2"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
            <select
              value={form.state}
              onChange={e => update("state", e.target.value)}
              onBlur={() => touch("state")}
              className={inputClass("state")}
            >
              <option value="">Select your state</option>
              {statesOfIndia.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && touched.state && (
              <p className="text-xs text-red-500 mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
            <input
              type="text"
              placeholder="e.g. Faridabad"
              value={form.city}
              onChange={e => update("city", e.target.value)}
              onBlur={() => touch("city")}
              className={inputClass("city")}
            />
            {errors.city && touched.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Daily rate (₹)</label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={form.rate}
              onChange={e => update("rate", Number(e.target.value))}
              onBlur={() => touch("rate")}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Your daily rate in rupees</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Years of experience</label>
            <input
              type="number"
              placeholder="e.g. 8"
              min="0" max="50"
              value={form.experience}
              onChange={e => update("experience", Number(e.target.value))}
              onBlur={() => touch("experience")}
              className={inputClass("experience")}
            />
            {errors.experience && touched.experience && (
              <p className="text-xs text-red-500 mt-1">{errors.experience}</p>
            )}
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
            {errors.specialties && (
              <p className="text-xs text-red-500 mt-1">{errors.specialties}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              About you <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Describe your experience and what makes you stand out..."
              value={form.about}
              onChange={e => update("about", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none resize-none"
            />
          </div>

          {firebaseError && (
            <p className="text-xs text-red-500 text-center">{firebaseError}</p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(1)}
              className="border border-gray-300 text-gray-600 py-3 px-6 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              {loading ? "Creating your profile..." : "Create profile →"}
            </button>
          </div>

        </div>
      )}

      {/* Step 3 — Success */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile created!</h2>
          <p className="text-sm text-gray-500 mb-2">
            Welcome, {form.name.split(" ")[0]}! Your profile is now live.
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Clients in {form.city}, {form.state} can now find and message you.
          </p>
          <p className="text-xs text-orange-500 mb-8">
            ⏳ Your profile is pending verification. An admin will review and verify it shortly.
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