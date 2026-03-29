import { useState, useEffect } from "react"
import {
  fetchAllContractors,
  fetchAllCustomers,
  fetchAllProjects,
  verifyContractor,
  unverifyContractor,
  deleteContractor
} from "../firebase/firestoreFunctions"

const ADMIN_EMAIL = "admin@contractorfind.com"

const grades = ["A+", "A", "B"]

function Admin({ currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState("contractors")
  const [contractors, setContractors] = useState([])
  const [customers, setCustomers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedGrade, setSelectedGrade] = useState({})
  const [actionMsg, setActionMsg] = useState("")

  // gate — only admin email can access
  const isAdmin = currentUser?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isAdmin) return
    loadAll()
  }, [isAdmin])

  const loadAll = async () => {
    setLoading(true)
    const [c, u, p] = await Promise.all([
      fetchAllContractors(),
      fetchAllCustomers(),
      fetchAllProjects()
    ])
    setContractors(c)
    setCustomers(u)
    setProjects(p)
    setLoading(false)
  }

  const showMsg = (msg) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(""), 3000)
  }

  const handleVerify = async (uid) => {
    const grade = selectedGrade[uid] || "B"
    const result = await verifyContractor(uid, grade)
    if (result.success) {
      setContractors(prev => prev.map(c =>
        c.id === uid ? { ...c, verified: true, grade } : c
      ))
      showMsg("Contractor verified successfully!")
    }
  }

  const handleUnverify = async (uid) => {
    const result = await unverifyContractor(uid)
    if (result.success) {
      setContractors(prev => prev.map(c =>
        c.id === uid ? { ...c, verified: false, grade: "Unverified" } : c
      ))
      showMsg("Contractor unverified.")
    }
  }

  const handleDelete = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this contractor?")) return
    const result = await deleteContractor(uid)
    if (result.success) {
      setContractors(prev => prev.filter(c => c.id !== uid))
      showMsg("Contractor deleted.")
    }
  }

  const filteredContractors = contractors.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access denied</h1>
        <p className="text-sm text-gray-500 mb-6">
          You don't have permission to access the admin panel.
        </p>
        <button
          onClick={onBack}
          className="text-blue-600 text-sm"
        >
          ← Go back home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin panel</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage contractors, users and projects</p>
        </div>
        <div className="flex items-center gap-3">
          {actionMsg && (
            <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              {actionMsg}
            </span>
          )}
          <button onClick={onBack} className="text-sm text-blue-600">← Home</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{contractors.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total contractors</div>
          <div className="text-xs text-green-600 mt-0.5">
            {contractors.filter(c => c.verified).length} verified
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total projects</div>
          <div className="text-xs text-green-600 mt-0.5">
            {projects.filter(p => p.status === "open").length} open
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 mb-4">
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search by name, email or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm outline-none flex-1 text-gray-700"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["contractors", "users", "projects"].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch("") }}
            className={`mr-6 pb-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {tab === "contractors" ? contractors.length
                : tab === "users" ? customers.length
                : projects.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Loading data...</p>
      ) : (
        <>

          {/* Contractors tab */}
          {activeTab === "contractors" && (
            <div className="flex flex-col gap-3">

              {/* Pending verification */}
              {filteredContractors.filter(c => !c.verified).length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-2">
                  <p className="text-xs font-medium text-orange-700">
                    ⏳ {filteredContractors.filter(c => !c.verified).length} contractor{filteredContractors.filter(c => !c.verified).length !== 1 ? "s" : ""} pending verification
                  </p>
                </div>
              )}

              {filteredContractors.map(contractor => (
                <div
                  key={contractor.id}
                  className={`bg-white border rounded-xl p-4 ${
                    !contractor.verified ? "border-orange-200" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                      {contractor.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{contractor.name}</p>
                        {contractor.verified ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ Verified · Grade {contractor.grade}
                          </span>
                        ) : (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{contractor.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {contractor.specialty} · {contractor.city}, {contractor.state} · {contractor.experience} yrs
                      </p>
                      {contractor.rate > 0 && (
                        <p className="text-xs text-blue-600 mt-0.5">₹{Number(contractor.rate).toLocaleString("en-IN")}/day</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                    {!contractor.verified ? (
                      <>
                        <select
                          value={selectedGrade[contractor.id] || "B"}
                          onChange={e => setSelectedGrade(prev => ({ ...prev, [contractor.id]: e.target.value }))}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                        >
                          {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                        <button
                          onClick={() => handleVerify(contractor.id)}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✓ Verify contractor
                        </button>
                      </>
                    ) : (
                      <>
                        <select
                          value={selectedGrade[contractor.id] || contractor.grade}
                          onChange={async e => {
                            const newGrade = e.target.value
                            setSelectedGrade(prev => ({ ...prev, [contractor.id]: newGrade }))
                            await verifyContractor(contractor.id, newGrade)
                            setContractors(prev => prev.map(c =>
                              c.id === contractor.id ? { ...c, grade: newGrade } : c
                            ))
                            showMsg("Grade updated!")
                          }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                        >
                          {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                        <button
                          onClick={() => handleUnverify(contractor.id)}
                          className="text-xs border border-orange-200 text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Unverify
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(contractor.id)}
                      className="text-xs border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {filteredContractors.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No contractors found</p>
              )}
            </div>
          )}

          {/* Users tab */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-3">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold flex-shrink-0">
                      {customer.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Joined {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No users found</p>
              )}
            </div>
          )}

          {/* Projects tab */}
          {activeTab === "projects" && (
            <div className="flex flex-col gap-3">
              {projects.map(project => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{project.title}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {project.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{project.type}</span>
                    <span className="text-xs text-gray-500">📍 {project.city}, {project.state}</span>
                    <span className="text-xs text-gray-500">💰 {project.budget}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      By {project.postedByName} · {project.applicants?.length || 0} applicants
                    </p>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No projects found</p>
              )}
            </div>
          )}

        </>
      )}
    </div>
  )
}

export default Admin