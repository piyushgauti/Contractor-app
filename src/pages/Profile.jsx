import { useState, useEffect } from "react";
import ReviewForm from "../components/ReviewForm";
import { fetchContractorById } from "../firebase/firestoreFunctions";

function Profile({ contractor, onBack, onMessage, currentUser }) {
  const [activeTab, setActiveTab] = useState("overview");

  const gradeColor = {
    "A+": "bg-green-100 text-green-800",
    A: "bg-yellow-100 text-yellow-800",
    B: "bg-blue-100 text-blue-800",
  };

  const initials = contractor.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const photoSets = [
    [
      {
        bg: "bg-amber-50",
        icon: "🏗️",
        stage: "Foundation",
        label: "text-amber-700",
      },
      {
        bg: "bg-blue-50",
        icon: "🧱",
        stage: "Structure",
        label: "text-blue-700",
      },
      {
        bg: "bg-green-50",
        icon: "🪟",
        stage: "Finishing",
        label: "text-green-700",
      },
    ],
    [
      {
        bg: "bg-orange-50",
        icon: "⛏️",
        stage: "Site prep",
        label: "text-orange-700",
      },
      {
        bg: "bg-purple-50",
        icon: "🔩",
        stage: "Steel work",
        label: "text-purple-700",
      },
      {
        bg: "bg-teal-50",
        icon: "✅",
        stage: "Complete",
        label: "text-teal-700",
      },
    ],
    [
      {
        bg: "bg-rose-50",
        icon: "📐",
        stage: "Planning",
        label: "text-rose-700",
      },
      {
        bg: "bg-indigo-50",
        icon: "🏠",
        stage: "Framing",
        label: "text-indigo-700",
      },
      {
        bg: "bg-lime-50",
        icon: "🎨",
        stage: "Plastering",
        label: "text-lime-700",
      },
    ],
  ];

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <button
          onClick={onBack}
          className="text-blue-600 text-sm mb-4 flex items-center gap-1"
        >
          ← Back to listings
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                {contractor.name}
                {contractor.verified && (
                  <span
                    className="text-blue-500 text-base"
                    title="Verified by ContractorFind"
                  >
                    ✓
                  </span>
                )}
              </h1>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${gradeColor[contractor.grade]}`}
              >
                Grade {contractor.grade}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {contractor.specialty} · {contractor.location}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400 text-sm">
                {"★".repeat(Math.floor(contractor.rating))}
              </span>
              <span className="text-xs text-gray-500">
                {contractor.rating} rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-gray-900">
            {contractor.projects}
          </div>
          <div className="text-xs text-gray-500 mt-1">Projects</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-gray-900">
            {contractor.experience}
          </div>
          <div className="text-xs text-gray-500 mt-1">Yrs exp</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-gray-900">
            {contractor.rating}
          </div>
          <div className="text-xs text-gray-500 mt-1">Rating</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-blue-700">
            {contractor.rate
              ? `₹${Number(contractor.rate).toLocaleString("en-IN")}`
              : "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Per day</div>
        </div>
      </div>

      {/* Availability badge */}
      <div className="px-4 mb-4">
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            contractor.available
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {contractor.available
            ? "✓ Available for new projects"
            : "⏳ Currently busy"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4 mb-4">
        {["overview", "work history", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`mr-6 pb-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4">
        {/* Overview tab */}
        {activeTab === "overview" && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {contractor.about}
            </p>

            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {contractor.specialties.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100"
                >
                  {s}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
            <p className="text-sm text-gray-600 mb-6">
              {contractor.location}, {contractor.state}
            </p>
          </div>
        )}

        {/* Work history tab */}
        {activeTab === "work history" && (
          <div className="flex flex-col gap-4 pb-6">
            {contractor.workHistory.map((work, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Photo grid */}
                <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
                  {photoSets[index % photoSets.length].map((photo, i) => (
                    <div
                      key={i}
                      className={`${photo.bg} flex flex-col items-center justify-center h-24 text-2xl`}
                    >
                      <span>{photo.icon}</span>
                      <span
                        className={`text-xs font-medium mt-1 ${photo.label}`}
                      >
                        {photo.stage}
                      </span>
                    </div>
                  ))}
                  {/* Upload placeholder tile */}
                  <div className="bg-gray-50 flex flex-col items-center justify-center h-24 border border-dashed border-gray-300">
                    <span className="text-gray-300 text-2xl">📷</span>
                    <span className="text-xs text-gray-300 mt-1">
                      Add photo
                    </span>
                  </div>
                </div>

                {/* Work details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {work.title}
                    </h3>
                    <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {work.value}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{work.date}</p>
                  <p className="text-sm text-gray-500 mt-2 italic">
                    "{work.review}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-4 pb-6">
            <ReviewForm
              contractorId={contractor.uid || contractor.id}
              currentUser={currentUser}
              onReviewAdded={() => {}}
            />

            {/* Existing reviews */}
            {contractor.reviews && contractor.reviews.length > 0 ? (
              contractor.reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
                        {review.reviewerName?.[0] || "A"}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {review.reviewerName || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        )}
      </div>
      {/* ↑ tab content div closes here */}

      {/* Message button — sticky at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 mt-6">
        <button
          onClick={onMessage}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors"
        >
          Message {contractor.name.split(" ")[0]}
        </button>
      </div>
    </div>
    // ↑ outer max-w-xl div closes here
  );
}

export default Profile;
