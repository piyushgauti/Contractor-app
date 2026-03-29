import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

const projectTypes = [
  "House Construction", "Villa", "Apartment Renovation",
  "Commercial Building", "Office Renovation", "Warehouse",
  "Shop Renovation", "Road Work", "Foundation Work", "Other"
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

function PostProject({ currentUser, onBack, onSuccess }) {
  const [form, setForm] = useState({
    title: "", type: "", description: "",
    budget: "", state: "", city: "", timeline: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = "Project title is required"
    if (!form.type) e.type = "Please select project type"
    if (!form.description.trim()) e.description = "Description is required"
    if (!form.budget.trim()) e.budget = "Budget is required"
    if (!form.state) e.state = "Please select state"
    if (!form.city.trim()) e.city = "City is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePost = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await addDoc(collection(db, "projects"), {
        ...form,
        postedBy: currentUser.uid,
        postedByName: currentUser.name || currentUser.email,
        status: "open",
        createdAt: serverTimestamp(),
        applicants: []
      })
      onSuccess()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const inputClass = (field) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
    }`

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <button onClick={onBack} className="text-blue-600 text-sm mb-6 flex items-center gap-1">
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a project</h1>
      <p className="text-sm text-gray-500 mb-6">
        Describe your project and contractors will reach out to you.
      </p>

      <div className="flex flex-col gap-4">

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Project title</label>
          <input
            type="text"
            placeholder="e.g. Build 3BHK house in Faridabad"
            value={form.title}
            onChange={e => update("title", e.target.value)}
            className={inputClass("title")}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Project type</label>
          <select
            value={form.type}
            onChange={e => update("type", e.target.value)}
            className={inputClass("type")}
          >
            <option value="">Select type</option>
            {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
          <textarea
            placeholder="Describe the work, plot size, number of floors, special requirements..."
            value={form.description}
            onChange={e => update("description", e.target.value)}
            rows={4}
            className={`${inputClass("description")} resize-none`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Budget (₹)</label>
            <input
              type="text"
              placeholder="e.g. 50L or 1.2Cr"
              value={form.budget}
              onChange={e => update("budget", e.target.value)}
              className={inputClass("budget")}
            />
            {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Timeline</label>
            <input
              type="text"
              placeholder="e.g. 6 months"
              value={form.timeline}
              onChange={e => update("timeline", e.target.value)}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
            <select
              value={form.state}
              onChange={e => update("state", e.target.value)}
              className={inputClass("state")}
            >
              <option value="">Select state</option>
              {statesOfIndia.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
            <input
              type="text"
              placeholder="e.g. Faridabad"
              value={form.city}
              onChange={e => update("city", e.target.value)}
              className={inputClass("city")}
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
        </div>

        <button
          onClick={handlePost}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-2"
        >
          {loading ? "Posting..." : "Post project →"}
        </button>

      </div>
    </div>
  )
}

export default PostProject