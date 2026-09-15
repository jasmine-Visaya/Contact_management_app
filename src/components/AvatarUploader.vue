<template>
  <div class="avatar-upload-row">
    <div
      class="form-avatar-preview"
      :style="avatar ? {} : { backgroundColor: getAvatarColor(name || '?') }"
    >
      <img v-if="avatar" :src="getAvatarUrl(avatar, 120)" alt="Preview" class="avatar-image" />
      <span v-else>{{ getInitials(name || '?') }}</span>

      <div v-if="isUploading" class="upload-overlay">
        <div class="upload-spinner"></div>
        <span class="upload-progress-text">{{ uploadProgress }}%</span>
      </div>
    </div>

    <div class="avatar-upload-actions">
      <button type="button" class="avatar-upload-btn" @click="triggerUpload" :disabled="isUploading">
        <ion-icon :icon="cameraOutline"></ion-icon>
        {{ isUploading ? 'Uploading...' : (avatar ? 'Change Photo' : 'Upload Photo') }}
      </button>
      <button
        v-if="avatar"
        type="button"
        class="avatar-remove-btn"
        @click="$emit('remove')"
        :disabled="isUploading"
      >
        <ion-icon :icon="trashOutline"></ion-icon>
        Remove
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden-file-input"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { cameraOutline, trashOutline } from 'ionicons/icons';
import { getInitials, getAvatarColor } from '../utils/contactHelpers';
import { getTransformedUrl } from '../services/imagekit';
import { useAvatarUpload } from '../composables/useAvatarUpload';

const props = defineProps({
  avatar: { type: String, default: '' },
  name: { type: String, default: '' }
});

const emit = defineEmits(['update:avatar', 'remove']);

const { isUploading, uploadProgress, upload } = useAvatarUpload();
const fileInput = ref(null);

const getAvatarUrl = (url, size) =>
  getTransformedUrl(url, { width: size, height: size, quality: 80, format: 'auto' });

const triggerUpload = () => {
  if (!isUploading.value) fileInput.value?.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  await upload(file, (url) => {
    emit('update:avatar', url);
  });

  setTimeout(() => {
    if (fileInput.value) fileInput.value.value = '';
  }, 300);
};
</script>

<style scoped>
.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.form-avatar-preview {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.6rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

.avatar-upload-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.avatar-upload-btn,
.avatar-remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.avatar-upload-btn {
  background: var(--accent-gradient);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.35);
}

.avatar-upload-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(102, 126, 234, 0.5);
}

.avatar-upload-btn ion-icon,
.avatar-remove-btn ion-icon {
  font-size: 1rem;
}

.avatar-remove-btn {
  background: transparent;
  color: var(--delete-color);
  border: 1.5px solid var(--delete-color);
}

.avatar-remove-btn:hover:not(:disabled) {
  background: var(--delete-bg-hover);
}

.avatar-upload-btn:disabled,
.avatar-remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-file-input {
  display: none;
}

/* Upload progress overlay */
.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: inherit;
  z-index: 5;
}

.upload-spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-progress-text {
  font-size: 0.6rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

@media (min-width: 768px) {
  .form-avatar-preview {
    width: 88px;
    height: 88px;
    font-size: 1.8rem;
  }
}
</style>