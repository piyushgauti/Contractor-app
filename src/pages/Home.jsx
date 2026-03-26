import { useState } from "react"
import ContractorCard from "../components/ContractorCard"
import contractors from "../data/contractors"

const topRated = contractors
  .filter(c => c.rating >= 4.8)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3)

function Home({ onSelectContractor, onJoinAsContractor }) {
  const [search, setSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filtered = contractors.filter(c => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Hero banner */}
      <div className="bg-blue-600 rounded-2xl px-6 py-8 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-2 leading-snug">
          Find trusted contractors <br /> across India
        </h1>
        <p className="text-blue-100 text-sm mb-5">
          Construction & Civil · Verified profiles · Real work history
        </p>

        {/* Search bar inside hero */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name, city, state or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-gray-700"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!search && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{contractors.length}+</div>
            <div className="text-xs text-gray-500 mt-1">Contractors</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {[...new Set(contractors.map(c => c.state))].length}
            </div>
            <div className="text-xs text-gray-500 mt-1">States covered</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contractors.filter(c => c.available).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Available now</div>
          </div>
        </div>
      )}

      {/* Search results */}
      {search && (
        <div>
          <p className="text-xs text-gray-400 mb-3">
            {filtered.length} contractor{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex flex-col gap-3">
            {filtered.map(contractor => (
              <ContractorCard
                key={contractor.id}
                contractor={contractor}
                onClick={() => onSelectContractor(contractor)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-gray-400 py-12 text-sm">
                No contractors found. Try a different search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Default view — no search */}
      {!search && (
        <div>

          {/* Featured contractors */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">⭐ Top rated</h2>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-600"
            >
              {showAll ? "Show less" : "View all"}
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {(showAll ? contractors : topRated).map(contractor => (
              <ContractorCard
                key={contractor.id}
                contractor={contractor}
                onClick={() => onSelectContractor(contractor)}
              />
            ))}
          </div>

          {/* Join as contractor banner */}
          <div className="bg-gray-900 rounded-2xl px-6 py-6 text-white flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-base mb-1">Are you a contractor?</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Create your free profile and get discovered by thousands of clients across India.
              </p>
            </div>
            <button
              onClick={onJoinAsContractor}
              className="bg-white text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              Join free →
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

export default Home