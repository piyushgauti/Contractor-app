function ContractorCard({ contractor, onClick }) {
  const gradeColor = {
    "A+": "bg-green-100 text-green-800",
    "A": "bg-yellow-100 text-yellow-800",
    "B": "bg-blue-100 text-blue-800",
    "Unverified": "bg-gray-100 text-gray-500",
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
          {contractor.name.split(" ").map(n => n[0]).join("")}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900 text-sm">{contractor.name}</span>
              {contractor.verified && (
                <span title="Verified contractor" className="text-blue-500 text-sm">✓</span>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gradeColor[contractor.grade] || "bg-gray-100 text-gray-500"}`}>
              {contractor.grade === "Unverified" ? "Pending" : `Grade ${contractor.grade}`}
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-1">
            {contractor.specialty} · {contractor.location}
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            {contractor.rating > 0 ? (
              <>
                <span className="text-yellow-400 text-xs">{"★".repeat(Math.floor(contractor.rating))}</span>
                <span className="text-xs text-gray-500">{contractor.rating} · {contractor.projects} projects</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">No ratings yet</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-gray-400">
              {contractor.experience} yrs exp ·{" "}
              <span className={contractor.available ? "text-green-600" : "text-orange-500"}>
                {contractor.available ? "Available" : "Busy"}
              </span>
            </span>
            {contractor.rate > 0 && (
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                ₹{contractor.rate.toLocaleString("en-IN")}/day
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default ContractorCard