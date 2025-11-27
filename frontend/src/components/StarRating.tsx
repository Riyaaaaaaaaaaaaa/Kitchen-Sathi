import React, { useState } from 'react';

interface StarRatingProps {
  rating: number | undefined;
  onRate?: (rating: number | null) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarRating({ rating, onRate, readonly = false, size = 'md', showLabel = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const displayRating = hoverRating ?? rating ?? 0;

  const handleClick = (star: number) => {
    if (readonly || !onRate) return;
    
    // If clicking the same star that's already selected, clear the rating
    if (rating === star) {
      onRate(null);
    } else {
      onRate(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!readonly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${sizeClasses[size]}
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-transform
              ${readonly ? '' : 'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded'}
            `}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            {star <= displayRating ? (
              <span className="text-yellow-500">★</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 ml-1">
          {rating ? `${rating}/5` : 'Not rated'}
        </span>
      )}
    </div>
  );
}

