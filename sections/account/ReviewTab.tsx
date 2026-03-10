

import { FaArrowRight, FaStar } from "react-icons/fa6";
import { useState } from "react";
type Review = {
    id: number;
    name: string;
    date: string;
    comment: string;
};

const ReviewTab = () => {
    const reviews: Review[] = [
        {
            id: 1,
            name: "Sofia Rivera",
            date: "2024-03-10",
            comment: "Amazing product and very comfortable."
        },
        {
            id: 2,
            name: "Nicolas Jensen",
            date: "2024-02-11",
            comment: "Great quality and beautiful design."
        },
        {
            id: 3,
            name: "Emily Clark",
            date: "2024-02-01",
            comment: "Worth every penny."
        },
        {
            id: 4,
            name: "James Smith",
            date: "2024-01-15",
            comment: "Perfect for my living room."
        },
        {
            id: 5,
            name: "Olivia Brown",
            date: "2024-01-05",
            comment: "Fast delivery and great packaging."
        }
    ];


    const [visibleReviews, setVisibleReviews] = useState(2);
    const [sort, setSort] = useState("newest");

    const sortedReviews =
        sort === "newest"
            ? [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            : [...reviews].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return (
        <>
            <div className="mt-6">
                <h1>Customer reviews</h1>
                <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} />
                    ))}
                    <h2 className="text-sm font-medium">{reviews.length} Reviews</h2>
                </div>

                <div className="flex items-center border-2 border-gray-300 rounded-2xl w-full my-10 p-3 gap-3">
                    <textarea
                        rows={3}
                        placeholder="Share your thoughts"
                        className="flex-1 outline-none resize-none w-full"
                    ></textarea>

                    <div>
                        <button className="bg-black text-white px-3 md:px-6 h-10 self-end rounded-full md:rounded-xl hover:opacity-90 transition flex items-center justify-center">
                            <span className="hidden sm:block">Write Review</span>
                            <span className="block sm:hidden">
                                <FaArrowRight />
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-6">
                    <h2 className="text-3xl font-medium">{reviews.length} Reviews</h2>
                    <select onChange={(e) => setSort(e.target.value)} className="border rounded border-gray-300 py-1 w-full md:w-50 focus:outline-none">
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>

                {sortedReviews.slice(0, visibleReviews).map((review) => (
                    <div key={review.id} className="flex gap-4 border-b border-gray-300 py-4">

                    
                            <img src='/avatar.png' className="w-15 h-15"/>
                            <div className="flex-1">
                                <h4 className=" font-semibold">{review.name}</h4>
                                <div className="flex gap-1 my-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} />
                                    ))}
                                </div>
                                 <p className="text-gray-600 text-sm">{review.comment}</p>
                                 <div className="text-[#23262F] text-[14px] font-medium flex gap-5 pl-30 mt-5">
                            <h1>Like</h1>
                            <h1>Reply</h1>
                        </div>
                            </div>
                    </div>
                ))}

                {visibleReviews < reviews.length && (
                    <div className="text-center my-6">
                        <button
                            onClick={() => setVisibleReviews(visibleReviews + 2)}
                            className="border rounded-full px-10 py-2" >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default ReviewTab;