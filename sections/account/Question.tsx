const Question = () => {

  const questions = [
    {
      id: 1,
      question: "Is this product waterproof?",
      answer: "Yes, it is water resistant and suitable for outdoor use."
    },
    {
      id: 2,
      question: "Does it come with warranty?",
      answer: "Yes, it includes a 1 year manufacturer warranty."
    },
    {
      id: 3,
      question: "What materials are used?",
      answer: "It is made from premium cotton and stainless steel parts."
    }
  ];

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">Customer Questions & Answers</h3>

      <div className="space-y-5 pt-5">
        {questions.map((q) => (
          <div key={q.id} className="border-b border-gray-300 pb-4">
            <p className="font-semibold pb-3">{q.question}</p>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Answer:</span> {q.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Ask a Question</h4>
        <textarea
          className="w-full border border-gray-300 p-2 rounded-md mb-2"
          rows={3}
          placeholder="Type your question here..."
        />
        <button className="bg-black text-white px-4 py-2 rounded-md">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Question;