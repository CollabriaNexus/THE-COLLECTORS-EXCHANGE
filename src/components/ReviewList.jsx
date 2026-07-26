import { Star, User } from 'lucide-react';

const ReviewList = ({ reviews = [], total = 0 }) => {
  if (total === 0 && reviews.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No reviews yet</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-heritage-cream flex items-center justify-center shrink-0">
                <User size={14} className="text-heritage-charcoal" />
              </div>
              <div>
                <p className="text-sm font-medium text-heritage-charcoal">
                  {review.user?.name || 'Anonymous'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">
              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          {review.product?.title && (
            <p className="text-[10px] text-gray-400 mt-1 ml-11">on {review.product.title}</p>
          )}
          {review.comment && (
            <p className="text-sm text-gray-600 mt-2 ml-11 leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
