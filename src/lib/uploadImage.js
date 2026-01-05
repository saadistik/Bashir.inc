import { supabase } from './supabase'

/**
 * Upload an image file to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name (default: 'tussle-images')
 * @returns {Promise<{url: string | null, error: Error | null}>}
 */
export const uploadImage = async (file, bucket = 'tussle-images') => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { url: null, error }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - The public URL of the image
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{success: boolean, error: Error | null}>}
 */
export const deleteImage = async (imageUrl, bucket = 'tussle-images') => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`/${bucket}/`)
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL')
    }
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false, error }
  }
}

/**
 * Upload a receipt file to Supabase Storage
 * @param {File} file - The receipt file to upload
 * @returns {Promise<{url: string | null, error: Error | null}>}
 */
export const uploadReceipt = async (file) => {
  return uploadImage(file, 'receipts')
}
