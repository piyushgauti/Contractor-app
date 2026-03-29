import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/config"

function MyProjects({ currentUser, onBack, onPostProject }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      where("postedBy", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(q, snap => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [currentUser.uid])

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My projects</h1>
          <p className="text-xs text-gray-400 mt-0.5">Projects you've posted</p>
        </div>
        <button onClick={onBack} className="text-sm text-blue-600">← Back</button>
      </div>

      <button
        onClick={onPostProject}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors mb-6"
      >
        + Post a new project
      </button>

      {loading && <p className="text-center text-gray-400 text-sm py-8">Loading...</p>}

      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">No projects posted yet</p>
          <p className="text-gray-400 text-xs mt-1">Post a project and contractors will reach out</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900">{project.title}</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {project.status}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{project.type}</span>
              <span className="text-xs text-gray-500">📍 {project.city}, {project.state}</span>
              <span className="text-xs text-gray-500">💰 {project.budget}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{project.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {project.applicants?.length || 0} contractor{project.applicants?.length !== 1 ? "s" : ""} applied
              </p>
              {project.applicants?.length > 0 && (
                <div className="text-xs text-blue-600 font-medium">
                  View applicants →
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default MyProjects