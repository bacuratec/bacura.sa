/**
 * Utility functions for image upload to Supabase Storage
 */
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} bucket - Storage bucket name (default: 'images')
 * @param {string} folder - Folder path in bucket (default: 'partners' or 'customers')
 * @returns {Promise<string|null>} Public URL of uploaded image or null if failed
 */
export const uploadImageToStorage = async (
  file,
  bucket = "images",
  folder = "general"
) => {
  try {
    if (!file) {
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("الملف المحدد ليس صورة");
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return null;
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الصورة: " + error.message);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    toast.error("حدث خطأ أثناء رفع الصورة");
    return null;
  }
};

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 * @param {string} bucket - Storage bucket name (default: 'images')
 * @returns {Promise<boolean>} Success status
 */
export const deleteImageFromStorage = async (
  imageUrl,
  bucket = "images"
) => {
  try {
    if (!imageUrl) {
      return true; // No image to delete
    }

    // Extract file path from URL
    const urlParts = imageUrl.split(`/${bucket}/`);
    if (urlParts.length < 2) {
      return false;
    }

    const filePath = urlParts[1].split("?")[0]; // Remove query params

    // Delete file from Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Image delete error:", error);
    return false;
  }
};

/**
 * Convert File to base64 string (for preview)
 * @param {File} file - File to convert
 * @returns {Promise<string|null>} Base64 string or null
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

