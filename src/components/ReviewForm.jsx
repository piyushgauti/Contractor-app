import { useState } from "react";
import { addReview } from "../firebase/firestoreFunctions";

function ReviewForm({ contractorId, currentUser, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setLoading(true);
    setError("");

    const result = await addReview(contractorId, {
      rating,
      comment: comment.trim(),
      reviewerName:
        currentUser?.name || currentUser?.email?.split("@")[0] || "Anonymous",
      reviewerId: currentUser?.uid || "guest",
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setRating(0);
      setComment("");
      if (onReviewAdded) onReviewAdded();
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 text-sm font-medium">
          ✓ Review submitted!
        </p>
        <p className="text-green-600 text-xs mt-1">
          Thank you for your feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-800 mb-3">Leave a review</h3>

      {/* Star rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span
              className={
                star <= (hovered || rating)
                  ? "text-yellow-400"
                  : "text-gray-200"
              }
            >
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-gray-400 self-center ml-2">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </span>
        )}
      </div>

      <textarea
        placeholder="Share your experience working with this contractor..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}

export default ReviewForm;
