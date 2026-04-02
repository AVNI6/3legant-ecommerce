import StarRating from "./StarRating";

type Props = {
  rating: number;
  count: number;
};

const ReviewSummary = ({ rating, count }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} />
      <span className="text-sm text-gray-600">
        {count} {count === 1 ? "Review" : "Reviews"}
      </span>
    </div>
  );
};

export default ReviewSummary;