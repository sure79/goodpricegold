import { supabase } from './client'

export async function uploadImage(file: File, bucket: string = 'customer-images'): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) {
      throw error
    }

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('이미지 업로드 실패:', error)
    throw error
  }
}

export async function uploadMultipleImages(files: File[], bucket: string = 'customer-images'): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('다중 이미지 업로드 실패:', error)
    throw error
  }
}

export async function deleteImage(url: string, bucket: string = 'customer-images'): Promise<void> {
  try {
    // URL에서 파일 경로 추출
    const fileName = url.split('/').pop()
    if (!fileName) {
      throw new Error('잘못된 이미지 URL입니다.')
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('이미지 삭제 실패:', error)
    throw error
  }
}

export async function deleteMultipleImages(urls: string[], bucket: string = 'customer-images'): Promise<void> {
  try {
    const deletePromises = urls.map(url => deleteImage(url, bucket))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('다중 이미지 삭제 실패:', error)
    throw error
  }
}