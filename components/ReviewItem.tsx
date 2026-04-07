"use client";

import { useState, useEffect, useRef } from "react";
import { FaStar, FaPencil, FaTrash } from "react-icons/fa6";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { supabase } from "@/lib/supabase/client";
import { useAppSelector } from "@/store/hooks";
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin";
import Modal from "./ui/Modal";

const StarIcons = ({ rating, size = "text-sm", onClick }: any) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} onClick={() => onClick?.(s)} disabled={!onClick}>
        <FaStar className={`${size} ${s <= rating ? "text-[#141718]" : "text-gray-200"}`} />
      </button>
    ))}
  </div>
);

const UserAvatar = ({ profile, name, size = "w-12 h-12" }: any) => {
  const url = profile?.avatar_url;
  const finalUrl = url?.startsWith('http') ? url : url ? supabase.storage.from("avatars").getPublicUrl(url).data.publicUrl : null;
  return finalUrl ? (
    <img src={finalUrl} className={`${size} rounded-full object-cover bg-gray-50 border border-gray-100`} alt={name} />
  ) : (
    <div className={`${size} rounded-full border flex items-center justify-center bg-gray-900 text-white font-bold`}>
      {(profile?.name || name || "U").charAt(0).toUpperCase()}
    </div>
  );
};

export default function ReviewItem({ review, onDelete, onUpdate }: any) {
  const { user } = useAppSelector((state: any) => state.auth);
  const { requireLogin, LoginModal } = useRequireLogin();
  const [likesCount, setLikesCount] = useState(review.review_likes?.[0]?.count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [replies, setReplies] = useState(review.review_replies || []);
  const [state, setState] = useState({ showReply: false, replyTxt: "", isSubmitting: false, isEditing: false, editTxt: review.comment, editStar: review.rating, isUpdating: false, profile: null as any, showDeleteModal: false });
  const replyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => replyRef.current && !replyRef.current.contains(e.target as Node) && setState(s => ({ ...s, showReply: false }));
    if (state.showReply) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [state.showReply]);

  useEffect(() => {
    if (user) {
      supabase.from("review_likes").select("id").eq("review_id", review.id).eq("user_id", user.id).maybeSingle().then(({ data }) => setIsLiked(!!data));
      supabase.from("profiles").select("name, avatar_url").eq("id", user.id).single().then(({ data }) => setState(s => ({ ...s, profile: data })));
    }
    const sub = supabase.channel(`rv-${review.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'review_likes', filter: `review_id=eq.${review.id}` }, (p) => {
      if (p.eventType === 'INSERT') { setLikesCount((v: number) => v + 1); if (p.new.user_id === user?.id) setIsLiked(true); }
      else if (p.eventType === 'DELETE') { setLikesCount((v: number) => Math.max(0, v - 1)); if (p.old?.user_id === user?.id) setIsLiked(false); }
    }).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'review_replies', filter: `review_id=eq.${review.id}` }, async (p) => {
      const { data } = await supabase.from("review_replies").select("*, profiles(name, avatar_url)").eq("id", p.new.id).single();
      if (data) setReplies((prev: any) => prev.some((r: any) => r.id === data.id) ? prev : [...prev, data]);
    }).subscribe();
    return () => { supabase.channel(`rv-${review.id}`).unsubscribe(); };
  }, [user, review.id]);

  const toggleLike = async () => {
    requireLogin(async () => {
      setIsLiked(!isLiked);
      isLiked ? await supabase.from("review_likes").delete().match({ review_id: review.id, user_id: user.id }) : await supabase.from("review_likes").insert({ review_id: review.id, user_id: user.id });
    }, user, "Please sign in to like this review.");
  };

  const handleReply = async () => {
    if (!user || !state.replyTxt.trim()) return;
    setState(s => ({ ...s, isSubmitting: true }));
    const { data } = await supabase.from("review_replies").insert({ review_id: review.id, user_id: user.id, content: state.replyTxt.trim() }).select("*, profiles(name, avatar_url)").single();
    if (data) { setReplies((p: any) => [...p, data]); setState(s => ({ ...s, replyTxt: "", showReply: false })); }
    setState(s => ({ ...s, isSubmitting: false }));
  };

  const handleUpdate = async () => {
    if (!state.editTxt.trim()) return;
    setState(s => ({ ...s, isUpdating: true }));
    const { error } = await supabase.from("reviews").update({ comment: state.editTxt.trim(), rating: state.editStar }).eq("id", review.id);
    if (!error) {
      setState(s => ({ ...s, isEditing: false }));
      onUpdate?.(review.id, { comment: state.editTxt, rating: state.editStar });
    }
    setState(s => ({ ...s, isUpdating: false }));
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
    if (!error) {
      onDelete?.(review.id);
    }
    setState(s => ({ ...s, showDeleteModal: false }));
  };

  return (
    <div className="border-b py-8 animate-in fade-in duration-500">
      <div className="flex gap-4 sm:gap-6">
        <UserAvatar profile={review.profiles} name={review.name} />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start relative">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h4 className="font-semibold text-xs sm:text-lg text-[#141718]">{review.profiles?.name || review.name}</h4>
              {user?.id === review.user_id && <div className="flex items-center gap-3"><span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase text-gray-500">You</span>
                {!state.isEditing && <div className="flex items-center gap-2 border-l pl-3 ml-1 border-gray-200">
                  <button onClick={() => setState(s => ({ ...s, isEditing: true }))} className="text-gray-400 hover:text-blue-500 p-1"><FaPencil size={12} /></button>
                  <button onClick={() => setState(s => ({ ...s, showDeleteModal: true }))} className="text-gray-400 hover:text-red-500 p-1"><FaTrash size={12} /></button>
                </div>}</div>}
            </div>
            <span className="text-xs text-gray-400 font-medium">{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {!state.isEditing ? (<><StarIcons rating={review.rating} /><p className="text-[#343839] text-[14px] sm:text-[16px] leading-[26px] py-1">{review.comment}</p></>) : (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <StarIcons rating={state.editStar} size="text-lg" onClick={(v: number) => setState(s => ({ ...s, editStar: v }))} />
              <textarea value={state.editTxt} onChange={e => setState(s => ({ ...s, editTxt: e.target.value }))} className="w-full border rounded-lg p-3 text-sm focus:outline-none min-h-[100px]" />
              <div className="flex gap-2"><button onClick={handleUpdate} disabled={state.isUpdating} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold">Save</button>
                <button onClick={() => setState(s => ({ ...s, isEditing: false }))} className="text-xs text-gray-500 underline">Cancel</button></div></div>)}
          <div className="flex items-center gap-6 pt-2">
            <button onClick={toggleLike} className={`flex items-center gap-2 text-xs font-bold ${isLiked ? "text-red-500" : "text-[#141718] hover:text-gray-500"}`}>{isLiked ? <GoHeartFill size={18} /> : <GoHeart size={18} />}<span>{likesCount || ""} Like</span></button>
            <button onClick={() => requireLogin(() => setState(s => ({ ...s, showReply: !s.showReply })), user, "Please sign in to reply.")} className="text-xs font-bold text-[#141718] hover:text-gray-500">Reply</button>
          </div>
          {state.showReply && (
            <div ref={replyRef} className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 animate-in slide-in-from-top-2">
              <div className="flex gap-3 mb-3"><UserAvatar profile={state.profile} name={user?.user_metadata?.name || user?.email} size="w-8 h-8" />
                <div className="flex-1"><span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Replying to {review.name}</span>
                  <textarea value={state.replyTxt} onChange={e => setState(s => ({ ...s, replyTxt: e.target.value }))} placeholder="Write reply..." className="w-full bg-transparent border-none text-sm focus:outline-none min-h-[60px]" autoFocus /></div></div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200/50">
                <button onClick={() => setState(s => ({ ...s, showReply: false }))} className="text-xs font-bold text-gray-400">Cancel</button>
                <button onClick={handleReply} disabled={state.isSubmitting || !state.replyTxt.trim()} className="bg-[#141718] text-white px-6 py-2 rounded-full text-xs font-bold">Post Reply</button>
              </div></div>)}
          {replies.length > 0 && (
            <div className="mt-6 space-y-6 pt-4 border-l-2 border-gray-100 pl-4 sm:pl-8">
              {replies.map((r: any) => (
                <div key={r.id} className="flex gap-3">
                  <UserAvatar profile={r.profiles} name={r.profiles?.name || "User"} size="w-8 h-8" />
                  <div className="space-y-1"><div className="flex items-center gap-2"><span className="font-bold text-sm text-[#141718]">{r.profiles?.name || "User"}</span>
                    <span className="text-[10px] text-gray-400 italic">{new Date(r.created_at).toLocaleDateString()}</span></div>
                    <p className="text-sm text-[#343839] leading-relaxed italic border-l-4 border-gray-50 pl-3">{r.content}</p></div></div>))}
            </div>)}
        </div>
      </div>
      <Modal
        isOpen={state.showDeleteModal}
        onClose={() => setState(s => ({ ...s, showDeleteModal: false }))}
        title="Delete Review"
      >
        <div className="space-y-6">
          <p className="text-gray-600 font-medium leading-relaxed">Are you sure you want to delete this review? This action cannot be undone.</p>
          <div className="flex gap-3 pt-4 justify-end">
            <button
              onClick={() => setState(s => ({ ...s, showDeleteModal: false }))}
              className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95"
            >
              Delete Now
            </button>
          </div>
        </div>
      </Modal>
      <LoginModal />
    </div>);
}
