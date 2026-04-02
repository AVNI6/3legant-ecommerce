"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiCamera } from "react-icons/fi";
import { toast } from "react-toastify";

interface AvatarProps {
  uid: string;
  url: string | null;
  size?: number;
  onUpload?: (url: string) => void;
  editable?: boolean;
  fallbackName?: string;
}

export default function Avatar({ uid, url, size = 100, onUpload, editable = true, fallbackName }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(url);
      setAvatarUrl(data.publicUrl);
    } else {
      setAvatarUrl(null);
    }
  }, [url]);

  async function uploadAvatar(event: any) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${uid}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: filePath },
      });

      if (updateError) {
        throw updateError;
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ 
          id: uid,
          avatar_url: filePath 
        });

      if (profileError) {
        console.warn("Failed to update public profile:", profileError);
      }

      onUpload?.(filePath);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteAvatar() {
    try {
      setUploading(true);

      if (!url) return;

      const { error: deleteError } = await supabase.storage.from("avatars").remove([url]);

      if (deleteError) {
        throw deleteError;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      if (updateError) {
        throw updateError;
      }

      // 4. Clear public profile entry
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ 
          id: uid,
          avatar_url: null 
        });

      if (profileError) {
        console.warn("Failed to clear public profile:", profileError);
      }

      onUpload?.("");
      setAvatarUrl(null);
      toast.success("Profile picture removed");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative group/avatar inline-block">
      <div 
        className="bg-[#141718] text-white rounded-full flex items-center justify-center font-bold shadow-lg overflow-hidden border-4 border-white ring-1 ring-gray-100"
        style={{ height: size, width: size, fontSize: size / 3 }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="uppercase tracking-tighter opacity-80">
            {fallbackName?.charAt(0).toUpperCase() || "A"}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {editable && (
        <div className="absolute -bottom-1 -right-1 flex gap-1 items-center">
          <label className="bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-all border border-gray-100 group-hover/avatar:scale-110 active:scale-95">
            <FiCamera className="text-gray-700 text-sm" />
            <input
              type="file"
              id="single"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
