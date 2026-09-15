import { ref } from 'vue';
import { uploadImage } from '../services/imagekit';

export function useAvatarUpload() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);

  const validateImage = (file) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!file) return { valid: false, error: 'No file selected.' };
    if (!ALLOWED.includes(file.type)) {
      return { valid: false, error: 'Please select a JPG, PNG, WEBP, or GIF image.' };
    }
    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'Image must be smaller than 5MB.' };
    }
    return { valid: true };
  };

  const upload = async (file, onSuccess) => {
    const { valid, error } = validateImage(file);
    if (!valid) {
      alert(error);
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    try {
      const result = await uploadImage(
        file,
        `avatar_${Date.now()}_${file.name}`,
        (progress) => { uploadProgress.value = progress; }
      );
      onSuccess(result.url);
      uploadProgress.value = 100;
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please check your connection and try again.');
      uploadProgress.value = 0;
    } finally {
      isUploading.value = false;
    }
  };

  return { isUploading, uploadProgress, upload };
}