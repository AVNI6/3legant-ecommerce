"use client"

import { useMemo, useState, useEffect } from "react"
import { useToast } from "@/components/admin/Toast"
import Link from "next/link"
import { FiMessageSquare, FiUser, FiCalendar, FiClock, FiCheckCircle, FiSearch, FiTrash2, FiExternalLink, FiSend } from "react-icons/fi"
import { HiChevronDown, HiChevronUp } from "react-icons/hi"
import { useAdminQuestions, useSaveQuestionReply, useDeleteQuestion } from "@/hooks/admin/use-admin-queries"
import { TableSkeleton } from "@/components/ui/skeleton"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Question = {
  id: string
  product_id: number
  user_id: string
  question: string
  answer: string | null
  name: string | null
  created_at: string
  updated_at: string
  products?: { id: number; name: string; image: string }
}

type Filter = "all" | "pending" | "answered"

export default function AdminQuestionsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: questions = [], isLoading, refetch } = useAdminQuestions()
  const { mutate: saveReply, isPending: isSaving } = useSaveQuestionReply()
  const { mutate: deleteQuestion, isPending: isDeleting } = useDeleteQuestion()

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchesFilter = filter === "all" || (filter === "pending" ? !q.answer : !!q.answer)
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.name && q.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.products && q.products.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesFilter && matchesSearch
    })
  }, [questions, filter, searchQuery])

  const selectedQuestion = useMemo(() =>
    questions.find(q => q.id === selectedId) || null
    , [questions, selectedId])

  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  useEffect(() => {
    if (selectedQuestion) {
      setReplyText(selectedQuestion.answer || "")
    }
  }, [selectedQuestion])

  const handleReply = (questionId?: string, text?: string) => {
    const id = questionId || selectedId
    const content = text || replyText
    if (!id || !content.trim()) return
    saveReply({ questionId: id, answer: content }, {
      onSuccess: () => {
        toast("Reply saved successfully!")
        refetch()
      },
      onError: (err: any) => toast(err.message || "Failed to save reply", "error")
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteQuestion(deleteTarget, {
      onSuccess: () => {
        toast("Question deleted")
        if (selectedId === deleteTarget) setSelectedId(null)
        setDeleteTarget(null)
        refetch()
      },
      onError: (err: any) => toast(err.message || "Delete failed", "error")
    })
  }

  return (
    <div className="md:h-[calc(100vh-70px)] flex flex-col space-y-6 pb-6 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and respond to customer inquiries ({filtered.length})</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start">
          {(["all", "pending", "answered"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedId(null); setExpandedId(null) }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${filter === f
                ? "bg-gray-900 text-white shadow-md"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-2">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search questions or products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-[380px] bg-white border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex-1 flex gap-6">
          <div className="hidden md:block w-[380px] space-y-4"><TableSkeleton rows={6} columns={1} /></div>
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FiMessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto italic font-medium">Check back later for customer inquiries.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* List View (Sidebar on Desktop, Full Width on Mobile) */}
          <div className="w-full md:w-[380px] flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-24 custom-scrollbar">
              {filtered.map(q => (
                <div key={q.id} className="mt-3 relative group">
                  <button
                    onClick={() => {
                      setSelectedId(q.id)
                      setExpandedId(expandedId === q.id ? null : q.id)
                    }}
                    className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedId === q.id
                      ? "bg-white border-gray-900 shadow-xl shadow-gray-100 -translate-y-0.5"
                      : "bg-white border-transparent hover:bg-gray-50/50 shadow-sm"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${q.answer ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                        }`}>
                        {q.answer ? "Answered" : "Pending"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                        <HiChevronDown className={`md:hidden w-4 h-4 text-gray-700 transition-transform ${expandedId === q.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className={`text-sm font-bold text-gray-800 mb-2 line-clamp-2 leading-snug ${selectedId === q.id ? "text-gray-900" : ""}`}>
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      {q.products?.image && <img src={q.products.image} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-100" />}
                      <span className="text-[10px] font-black text-gray-400 truncate uppercase tracking-tight">{q.products?.name || "Unknown Product"}</span>
                    </div>
                  </button>

                  {/* Mobile Expanded Area */}
                  {expandedId === q.id && (
                    <div className="md:hidden mt-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer: {q.name || "Anonymous"}</span>
                          <button onClick={() => setDeleteTarget(q.id)} className="text-red-500 p-1"><FiTrash2 size={16} /></button>
                        </div>
                        <textarea
                          defaultValue={q.answer || ""}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your response..."
                          className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                        <button
                          onClick={() => handleReply(q.id)}
                          disabled={isSaving}
                          className="w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          {isSaving ? "SAVING..." : "SAVE REPLY"} <FiSend size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed View (Desktop Only) */}
          <div className="hidden md:flex flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex-col overflow-hidden relative">
            {!selectedQuestion ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <FiMessageSquare className="w-12 h-12 text-gray-100 mb-4" />
                <p className="text-gray-400 font-bold text-sm">Select a question to view details</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <FiUser className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{selectedQuestion.name || "Anonymous Customer"}</h3>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {new Date(selectedQuestion.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {new Date(selectedQuestion.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteTarget(selectedQuestion.id)}
                      className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>

                  <div className="bg-gray-50/50 rounded-3xl p-6 mb-8 border border-gray-50 relative">
                    <div className="absolute -top-3 left-6 bg-white border border-gray-50 px-2 py-0.5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">QUESTION</div>
                    <p className="text-lg font-bold text-gray-900 leading-relaxed italic">
                      "{selectedQuestion.question}"
                    </p>
                  </div>

                  {selectedQuestion.products && (
                    <div className="flex items-center justify-between bg-white border border-gray-50 p-3 rounded-2xl hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100">
                          <img src={selectedQuestion.products.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">RELATED PRODUCT</p>
                          <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase truncate max-w-[200px]">{selectedQuestion.products.name}</p>
                        </div>
                      </div>
                      <Link
                        href={`/pages/product/${selectedQuestion.product_id}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        STORE LINK <FiExternalLink />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8 bg-gray-50/20 flex flex-col overflow-hidden pb-12 md:pb-8">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedQuestion.answer ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
                        {selectedQuestion.answer ? "EDIT RESPONSE" : "WRITE RESPONSE"}
                      </h4>
                    </div>

                    <div className="relative flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Provide a detailed and helpful answer for the customer..."
                        className="w-full h-full bg-white border border-gray-50 rounded-[32px] p-8 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm resize-none placeholder:text-gray-300 leading-relaxed"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                        Responses are visible on the product page once saved.
                      </p>
                      <button
                        onClick={() => handleReply()}
                        disabled={isSaving || !replyText.trim()}
                        className="flex items-center justify-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-20 disabled:translate-y-0"
                      >
                        {isSaving ? "SAVING..." : (
                          <>
                            {selectedQuestion.answer ? "UPDATE RESPONSE" : "POST RESPONSE"}
                            <FiSend className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Question"
          message="Are you sure you want to permanently remove this customer question? This action cannot be reversed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
          confirmText="DELETE"
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
      `}</style>
    </div>
  )
}
