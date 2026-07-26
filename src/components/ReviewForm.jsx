import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { useCreateReview } from '../hooks/api/useReviews';

const ReviewForm = ({ orderId, productId, productName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    try {
      await createReview.mutateAsync({
        orderId,
        productId,
        rating,
        comment: comment.trim() || undefined,
      });
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch {
      // error handled by mutation
    }
  };

  if (createReview.isSuccess) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-sm text-center">
        <p className="text-sm text-green-700 font-medium">Thank you for your review!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-100 bg-gray-50/50">
      <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
        Review: {productName}
      </p>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-colors"
          >
            <Star
              size={20}
              className={
                star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
              }
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </span>
        )}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={3}
        maxLength={1000}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-luxury-gold resize-none"
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-[10px] text-gray-400">{comment.length}/1000</span>
        <button
          type="submit"
          disabled={rating === 0 || createReview.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-heritage-charcoal text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {createReview.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Submit Review
        </button>
      </div>
      {createReview.isError && (
        <p className="text-xs text-red-500 mt-2">
          {createReview.error?.message || 'Failed to submit review'}
        </p>
      )}
    </form>
  );
};

export default ReviewForm;
