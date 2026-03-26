function ContractorCard({ contractor, onClick }) {

  const gradeColor = {
    "A+": "bg-green-100 text-green-800",
    "A": "bg-yellow-100 text-yellow-800",
    "B": "bg-blue-100 text-blue-800",
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
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{contractor.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${gradeColor[contractor.grade]}`}>
              Grade {contractor.grade}
            </span>
          </div>

          <div className="text-sm text-gray-500 mt-1">
            {contractor.specialty} · {contractor.location}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-400 text-sm">{"★".repeat(Math.floor(contractor.rating))}</span>
            <span className="text-xs text-gray-500">{contractor.rating} · {contractor.projects} projects</span>
          </div>

          <div className="text-xs text-gray-400 mt-1">
            {contractor.experience} yrs exp ·{" "}
            <span className={contractor.available ? "text-green-600" : "text-orange-500"}>
              {contractor.available ? "Available now" : "Currently busy"}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ContractorCard