import { FaStar, FaStarHalfStroke, FaRegStar } from "react-icons/fa6";

type Props = {
  rating: number;
  size?: number;
};

const StarRating = ({ rating, size = 16 }: Props) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;

        if (rating >= starValue) {
          return <FaStar key={i} size={size} className="text-black" />;
        }

        if (rating >= starValue - 0.5) {
          return <FaStarHalfStroke key={i} size={size} className="text-black" />;
        }

        return <FaRegStar key={i} size={size} className="text-gray-300" />;
      })}
    </div>
  );
};

export default StarRating;