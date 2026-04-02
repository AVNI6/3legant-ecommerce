import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { type QuestionType } from '@/types/index'
import { QuestionSkeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";


const Question = ({ productId }: { productId: number }) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const { user } = useAppSelector((state: any) => state.auth);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const lastFetchedProductIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (productId && productId !== lastFetchedProductIdRef.current) {
      const fetchQuestions = async () => {
        setLoading(true);
        lastFetchedProductIdRef.current = productId;
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setQuestions(data);
        }
        setLoading(false);
      };

      fetchQuestions();
    }
  }, [productId]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleSubmit = async () => {
    if (!newQuestion.trim()) return;

    if (!user) {
      setShowModal(true);
      return;
    }

    const { data, error } = await supabase
      .from("questions")
      .insert([
        {
          product_id: productId,
          user_id: user.id,
          name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Anonymous",
          question: newQuestion,
          answer: null
        }
      ])
      .select()
      .single();

    if (error) {
      toast.error("Error submitting question: " + error.message);
    } else if (data) {
      setQuestions([data, ...questions]);
      setNewQuestion("");
      toast.success("Your question has been submitted and is awaiting an answer.");
    }
  };

  const handleSignIn = () => {
    setShowModal(false);
    // Redirect to sign in page
    window.location.href = "/pages/signin";
  };

  if (loading) return <QuestionSkeleton />;

  return (
    <div className="my-6">
      <h3 className="font-semibold text-lg mb-4">Customer Questions & Answers</h3>

      <div className="space-y-3 pt-5">
        {questions.length === 0 ? (
          <p className="text-gray-500 italic">No questions asked yet for this product.</p>
        ) : (
          questions.map((q) => {
            const isExpanded = expandedItems.has(q.id);
            
            return (
              <div key={q.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpanded(q.id)}
                  className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
                >
                  <span className="font-medium text-gray-900">{q.question}</span>
                  {isExpanded ? (
                    <FiChevronUp className="text-gray-500" />
                  ) : (
                    <FiChevronDown className="text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 py-3 bg-white border-t border-gray-200">
                    <div className="flex items-start gap-2 mb-2">
                       <span className="font-semibold text-gray-700">Answer:</span>
                      {q.answer ? (
                        <p className="text-gray-600 flex-1">{q.answer}</p>
                      ) : (
                        <p className="text-gray-400 italic flex-1">Awaiting answer from the team...</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Asked by {q.name} • {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="product-question" className="font-semibold mb-2 block">Ask a Question</label>
        <textarea
          id="product-question"
          name="productQuestion"
          autoComplete="off"
          className={`w-full border rounded-lg px-4 py-3 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all duration-200 ${
            user 
              ? "border-gray-200 bg-white" 
              : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          rows={3}
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={user ? "Type your question here..." : "Please sign in to ask a question"}
          disabled={!user}
        />
        <button
          onClick={handleSubmit}
          disabled={!user || !newQuestion.trim()}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            user 
              ? (newQuestion.trim() 
                ? "bg-black text-white hover:bg-gray-800 active:scale-95" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed")
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </div>

      {/* Sign In Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to ask a question about this product.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;