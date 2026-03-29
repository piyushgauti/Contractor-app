import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore"
import { db } from "../firebase/config"

function ProjectsFeed({ currentUser, onBack, onMessageClient }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, snap => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleApply = async (project) => {
    try {
      await updateDoc(doc(db, "projects", project.id), {
        applicants: arrayUnion({
          contractorId: currentUser.uid,
          contractorName: currentUser.name,
          appliedAt: new Date().toISOString()
        })
      })
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.state?.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase())
  )

  const hasApplied = (project) =>
    project.applicants?.some(a => a.contractorId === currentUser.uid)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Open projects</h1>
          <p className="text-xs text-gray-400 mt-0.5">Projects posted by clients</p>
        </div>
        <button onClick={onBack} className="text-sm text-blue-600">← Back</button>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 mb-4">
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search by title, city or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm outline-none flex-1 text-gray-700"
        />
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-sm py-12">Loading projects...</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">No open projects yet</p>
          <p className="text-gray-400 text-xs mt-1">Check back soon!</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map(project => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-4">

            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900">{project.title}</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                {project.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {project.type}
              </span>
              <span className="text-xs text-gray-500">
                📍 {project.city}, {project.state}
              </span>
              {project.budget && (
                <span className="text-xs text-gray-500">💰 {project.budget}</span>
              )}
              {project.timeline && (
                <span className="text-xs text-gray-500">⏱ {project.timeline}</span>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {project.description}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">
                  Posted by {project.postedByName}
                </p>
                {project.applicants?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {project.applicants.length} contractor{project.applicants.length !== 1 ? "s" : ""} applied
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onMessageClient(project.postedBy, project.postedByName)}
                  className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Message
                </button>
                <button
                  onClick={() => handleApply(project)}
                  disabled={hasApplied(project)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    hasApplied(project)
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {hasApplied(project) ? "✓ Applied" : "Apply"}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default ProjectsFeed