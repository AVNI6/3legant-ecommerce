"use client"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/admin/Toast"
import { useAdminBlogs, useSaveBlog, useDeleteBlog } from "@/hooks/admin/use-admin-queries"
import { HiPlus, HiOutlinePhotograph, HiOutlineDocumentText, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineEye, HiOutlineCheckCircle, HiOutlineClock, HiChevronDown, HiChevronUp } from "react-icons/hi"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  status: "draft" | "published";
  created_at: string;
  author_name: string;
  author_image?: string;
  category: string;
}

export default function CMSPage() {
  const { toast } = useToast()
  const [editBlog, setEditBlog] = useState<Partial<Blog> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [expandedBlogId, setExpandedBlogId] = useState<number | null>(null)

  const { data: blogs = [], isLoading: isLoadingBlogs, refetch: refetchBlogs } = useAdminBlogs()

  const { mutate: saveBlog, isPending: isSavingBlog } = useSaveBlog()
  const { mutate: deleteBlogMutation, isPending: isDeletingBlog } = useDeleteBlog()

  const handleUpload = async (file: File, type: "author" | "cover") => {
    setUploading(type)
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form })
      const json = await res.json()
      if (res.ok && json.url) {
        if (type === "author") setEditBlog(prev => prev ? { ...prev, author_image: json.url } : null)
        if (type === "cover") setEditBlog(prev => prev ? { ...prev, cover_image: json.url } : null)
        toast("Image uploaded successfully")
      } else {
        toast(json.error || "Upload failed", "error")
      }
    } catch (error) {
      toast("Upload failed", "error")
    } finally {
      setUploading(null)
    }
  }

  const onSaveBlog = () => {
    if (!editBlog?.title || !editBlog?.content) {
      return toast("Title and content required", "error")
    }
    const slug = editBlog.slug || editBlog.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const excerpt = editBlog.excerpt || editBlog.content.replace(/[#*`>]/g, "").replace(/\n/g, " ").slice(0, 160)
    const payload = { ...editBlog, slug, excerpt }

    saveBlog({ id: editBlog.id, payload }, {
      onSuccess: () => {
        toast("Blog post saved")
        setEditBlog(null)
        refetchBlogs()
      },
      onError: (err: any) => toast(err.message || "Failed to save blog", "error")
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteBlogMutation(deleteTarget, {
      onSuccess: () => {
        toast("Blog post removed")
        setDeleteTarget(null)
        refetchBlogs()
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Editorial Management</h1>
          <p className="text-sm text-gray-500 mt-1">Design your storefront and publish editorial content</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Blog Posts</h2>
          <button
            onClick={() => setEditBlog({ status: "draft", category: "Blog", author_name: "Admin" })}
            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <HiPlus className="w-4 h-4" /> New Blog Post
          </button>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          {isLoadingBlogs ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-20 text-center text-gray-400 italic font-bold">No articles yet.</div>
          ) : (
            <>
              {/* Desktop Blogs Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Article</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Metrics</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {blogs.map(blog => (
                      <tr key={blog.id} className="group hover:bg-gray-50/50 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-50 border border-gray-100">
                              {blog.cover_image && <img src={blog.cover_image} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-sm uppercase tracking-tight truncate max-w-[300px]">{blog.title}</p>
                              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-2 mt-0.5">
                                <span className="bg-gray-100 px-1 py-0.5 rounded text-[8px]">{blog.author_name || "Admin"}</span>
                                <HiOutlineCheckCircle className="w-3 h-3 ml-1" /> /{blog.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <BlogStatusBadge status={blog.status} />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Created</span>
                            <span className="text-[10px] font-bold text-gray-900">{new Date(blog.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <BlogActions
                            blog={blog}
                            setEditBlog={setEditBlog}
                            setDeleteTarget={setDeleteTarget}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Blogs Cards */}
              <div className="lg:hidden divide-y divide-gray-50">
                {blogs.map(blog => (
                  <div key={blog.id} className={`p-4 transition-colors ${expandedBlogId === blog.id ? "bg-blue-50/30" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-50 border border-gray-100">
                          {blog.cover_image && <img src={blog.cover_image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 text-sm uppercase tracking-tight truncate max-w-[200px]">{blog.title}</p>
                          <p className="text-[9px] font-bold text-gray-400">/{blog.slug}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedBlogId(expandedBlogId === blog.id ? null : blog.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                      >
                        {expandedBlogId === blog.id ? <HiChevronUp /> : <HiChevronDown />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <BlogStatusBadge status={blog.status} />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>

                    {expandedBlogId === blog.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex justify-end bg-gray-50/50 p-2 rounded-xl">
                          <BlogActions
                            blog={blog}
                            setEditBlog={setEditBlog}
                            setDeleteTarget={setDeleteTarget}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blog Modal */}
      {editBlog && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col border border-white/20">
            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-white relative z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{editBlog.id ? "Edit Article" : "Compose Editorial"}</h2>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-0.5">Publish rich markdown content to your storefront</p>
              </div>
              <button onClick={() => setEditBlog(null)} className="p-3 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all font-light text-2xl">✕</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-[380px] border-r border-gray-50 p-10 space-y-8 overflow-y-auto custom-scrollbar bg-gray-50/30">
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Article Title</label>
                    <textarea value={editBlog.title || ""} onChange={e => setEditBlog({ ...editBlog, title: e.target.value })} className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-black outline-none transition-all resize-none h-24" placeholder="How to style your living room" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                      <select value={editBlog.category || "Blog"} onChange={e => setEditBlog({ ...editBlog, category: e.target.value })} className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                        <option value="Blog">General</option>
                        <option value="Featured">Featured</option>
                        <option value="Tutorial">Tutorial</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                      <select value={editBlog.status || "draft"} onChange={e => setEditBlog({ ...editBlog, status: e.target.value as any })} className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                        <option value="draft">Draft</option>
                        <option value="published">Live</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cover Asset</label>
                    <div
                      className={`aspect-[16/10] bg-white border-2 border-dashed rounded-3xl overflow-hidden relative group cursor-pointer transition-all ${uploading === "cover" ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:border-gray-300"}`}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50") }}
                      onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50") }}
                      onDrop={e => {
                        e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
                        const file = e.dataTransfer.files[0]
                        if (file) handleUpload(file, "cover")
                      }}
                      onClick={() => document.getElementById('cover-asset')?.click()}
                    >
                      {editBlog.cover_image ? (
                        <img src={editBlog.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                          <HiOutlinePhotograph className="w-8 h-8 mb-2" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Select or Drag Cover</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">CHANGE ASSET</span>
                      </div>
                      <input id="cover-asset" type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(file, "cover")
                      }} />
                    </div>
                    <input
                      value={editBlog.cover_image || ""}
                      onChange={e => setEditBlog({ ...editBlog, cover_image: e.target.value })}
                      className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-black outline-none placeholder:text-gray-300"
                      placeholder="Or paste asset URL here..."
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Author Identity</label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border relative group cursor-pointer transition-all ${uploading === "author" ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:border-gray-300"}`}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50") }}
                          onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50") }}
                          onDrop={e => {
                            e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
                            const file = e.dataTransfer.files[0]
                            if (file) handleUpload(file, "author")
                          }}
                          onClick={() => document.getElementById('author-asset')?.click()}
                        >
                          {editBlog.author_image ? <img src={editBlog.author_image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">PF</div>}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <HiOutlinePhotograph className="w-4 h-4 text-white" />
                          </div>
                          <input id="author-asset" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "author")} />
                        </div>
                        <div className="flex-1">
                          <input value={editBlog.author_name || ""} onChange={e => setEditBlog({ ...editBlog, author_name: e.target.value })} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-1 focus:ring-black outline-none" placeholder="Author Name" />
                        </div>
                      </div>
                      <input
                        value={editBlog.author_image || ""}
                        onChange={e => setEditBlog({ ...editBlog, author_image: e.target.value })}
                        className="w-full mt-2 p-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-black outline-none"
                        placeholder="Author Image URL"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={onSaveBlog} disabled={isSavingBlog} className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200">
                  {isSavingBlog ? "SAVING..." : editBlog.id ? "UPDATE ARTICLE" : "COMMIT ARTICLE"}
                </button>
              </div>

              <div className="flex-1 flex flex-col p-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Article Body Content (Markdown Supported)</h3>
                  <div className="flex gap-4">
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Live Preview</span>
                  </div>
                </div>
                <textarea
                  value={editBlog.content || ""}
                  onChange={e => setEditBlog({ ...editBlog, content: e.target.value })}
                  className="flex-1 w-full p-10 bg-gray-50/50 border-none rounded-[40px] text-gray-800 text-base leading-relaxed font-medium focus:ring-0 outline-none custom-scrollbar"
                  placeholder="# Start writing..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Remove Post`}
          message="This action is irreversible. The content will be permanently purged from the storefront immediately."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeletingBlog}
          confirmText="PURGE CONTENT"
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

function BlogStatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status === "published" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
      }`}>
      {status === "published" ? <><HiOutlineCheckCircle className="w-3 h-3" /> Published</> : <><HiOutlineClock className="w-3 h-3" /> Draft</>}
    </span>
  )
}

function BlogActions({ blog, setEditBlog, setDeleteTarget }: { blog: Blog, setEditBlog: (b: Blog) => void, setDeleteTarget: (id: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
      <Link href={`/pages/blog/${blog.slug}`} target="_blank" className="p-2 hover:bg-white rounded-xl text-gray-300 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
        <HiOutlineEye className="w-5 h-5" />
      </Link>
      <button onClick={() => setEditBlog(blog)} className="p-2 hover:bg-white rounded-xl text-gray-300 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
        <HiOutlinePencilAlt className="w-5 h-5" />
      </button>
      <button onClick={() => setDeleteTarget(blog.id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
        <HiOutlineTrash className="w-5 h-5" />
      </button>
    </div>
  )
}
