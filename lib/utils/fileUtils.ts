
export interface UploadResult {
  url: string
  error?: string
}

export const uploadFile = async (file: File, target: "image" | "thumbnails" | { variantKey: string }): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append("file", file)
  
  try {
    const response = await fetch("/api/admin/upload", { 
      method: "POST", 
      body: formData 
    })
    
    const json = await response.json()
    
    if (!response.ok || json.error) {
      return { url: "", error: json.error ?? "Unknown upload error" }
    }
    
    return { url: json.url }
  } catch (error) {
    return { 
      url: "", 
      error: error instanceof Error ? error.message : "Upload failed" 
    }
  }
}

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!isImageFile(file)) {
    return { isValid: false, error: "File must be an image" }
  }
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: "Image size must be less than 5MB" }
  }
  
  return { isValid: true }
}
