<template>
  <transition name="modal-fade">
    <div v-if="isOpen && contact" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card detail-card">
        <div class="detail-header">
          <button class="detail-back-btn" @click="$emit('close')">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </button>
          <h2 class="detail-header-title">Contact Details</h2>
          <button
            class="detail-fav-btn"
            :class="{ favorited: contact.favorite }"
            @click="$emit('toggle-favorite', contact)"
          >
            <ion-icon :icon="contact.favorite ? star : starOutline"></ion-icon>
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-hero">
            <div class="detail-avatar-wrapper">
              <div
                class="detail-avatar"
                :style="contact.avatar ? {} : { backgroundColor: getAvatarColor(contact.name) }"
              >
                <img
                  v-if="contact.avatar"
                  :src="getAvatarUrl(contact.avatar, 200)"
                  :alt="contact.name"
                  class="avatar-image"
                />
                <span v-else>{{ getInitials(contact.name) }}</span>

                <div v-if="isUploading" class="upload-overlay">
                  <div class="upload-spinner"></div>
                  <span class="upload-progress-text">{{ uploadProgress }}%</span>
                </div>
              </div>
              <button
                class="avatar-edit-btn"
                @click="triggerDetailAvatarUpload"
                :disabled="isUploading"
                title="Change photo"
              >
                <ion-icon :icon="cameraOutline"></ion-icon>
              </button>
              <input
                ref="detailAvatarInput"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="handleDetailAvatarChange"
              />
            </div>
            <h3 class="detail-name">{{ contact.name }}</h3>
            <ion-badge :color="getCategoryColor(contact.category)" class="detail-category-badge">
              {{ contact.category }}
            </ion-badge>
          </div>

          <div class="detail-info-list">
            <div class="detail-info-item">
              <div class="detail-info-icon"><ion-icon :icon="callOutline"></ion-icon></div>
              <div class="detail-info-content">
                <span class="detail-info-label">Phone</span>
                <span class="detail-info-value">{{ contact.phone }}</span>
              </div>
            </div>

            <div v-if="contact.email" class="detail-info-item">
              <div class="detail-info-icon"><ion-icon :icon="mailOutline"></ion-icon></div>
              <div class="detail-info-content">
                <span class="detail-info-label">Email</span>
                <span class="detail-info-value">{{ contact.email }}</span>
              </div>
            </div>

            <div class="detail-info-item">
              <div class="detail-info-icon"><ion-icon :icon="locationOutline"></ion-icon></div>
              <div class="detail-info-content">
                <span class="detail-info-label">Address</span>
                <span class="detail-info-value">{{ contact.address || 'No address' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-actions">
            <button class="detail-action-btn edit-btn-full" @click="$emit('edit', contact)">
              <ion-icon :icon="createOutline"></ion-icon>
              Edit Contact
            </button>
            <button class="detail-action-btn delete-btn-full" @click="$emit('delete', contact.id)">
              <ion-icon :icon="trashOutline"></ion-icon>
              Delete Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { IonBadge, IonIcon } from '@ionic/vue';
import {
  arrowBackOutline, star, starOutline, callOutline, mailOutline,
  locationOutline, createOutline, trashOutline, cameraOutline
} from 'ionicons/icons';
import { getInitials, getAvatarColor, getCategoryColor } from '../utils/contactHelpers';
import { getTransformedUrl } from '../services/imagekit';
import { useAvatarUpload } from '../composables/useAvatarUpload';

const props = defineProps({
  isOpen: Boolean,
  contact: { type: Object, default: null }
});

const emit = defineEmits(['close', 'edit', 'delete', 'toggle-favorite', 'avatar-updated']);

const { isUploading, uploadProgress, upload } = useAvatarUpload();
const detailAvatarInput = ref(null);

const getAvatarUrl = (url, size) =>
  getTransformedUrl(url, { width: size, height: size, quality: 80, format: 'auto' });

const triggerDetailAvatarUpload = () => {
  if (!isUploading.value) detailAvatarInput.value?.click();
};

const handleDetailAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file || !props.contact) return;

  await upload(file, (url) => {
    emit('avatar-updated', { id: props.contact.id, url });
  });

  setTimeout(() => {
    if (detailAvatarInput.value) detailAvatarInput.value.value = '';
  }, 300);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: stretch;
  justify-content: center;
}

@media (min-width: 768px) {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.45);
    align-items: center;
    padding: 24px;
  }
}

:global(html.dark-theme) .modal-overlay {
  background: rgba(0, 0, 0, 0);
}

@media (min-width: 768px) {
  :global(html.dark-theme) .modal-overlay {
    background: rgba(0, 0, 0, 0.75);
  }
}

.modal-card {
  width: 100%;
  height: 100%;
  max-height: 100%;
  background: #f9fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
}

:global(html.dark-theme) .modal-card {
  background: #161a24;
}

@media (min-width: 768px) {
  .modal-card {
    width: 100%;
    max-width: 520px;
    height: auto;
    max-height: 90vh;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25);
  }

  :global(html.dark-theme) .modal-card {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  }
}

/* Detail-specific card */
.detail-card {
  background: var(--app-bg);
}

:global(html.dark-theme) .detail-card {
  background: #0f1117;
}

/* Detail header */
.detail-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

:global(html.dark-theme) .detail-header {
  background: linear-gradient(135deg, #4a56b8 0%, #6a4090 100%);
}

@media (min-width: 768px) {
  .detail-header {
    border-radius: 24px 24px 0 0;
  }
}

.detail-header-title {
  flex: 1;
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  text-align: center;
}

.detail-back-btn,
.detail-fav-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.3rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.detail-back-btn:hover,
.detail-fav-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.detail-fav-btn {
  color: rgba(255, 255, 255, 0.7);
}

.detail-fav-btn.favorited {
  color: #f6ad55;
  transform: scale(1.1);
}

/* Body */
.detail-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 24px 20px 32px;
}

.detail-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0 28px;
}

.detail-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 2.2rem;
  letter-spacing: 1px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  position: relative;
  overflow: hidden;
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.detail-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid var(--app-bg);
  background: var(--accent-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.avatar-edit-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 18px rgba(102, 126, 234, 0.55);
}

.avatar-edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

:global(html.dark-theme) .avatar-edit-btn {
  border-color: #0f1117;
}

.detail-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  word-break: break-word;
}

.detail-category-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Info list */
.detail-info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.detail-info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--detail-info-bg);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: var(--form-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.4s ease;
}

.detail-info-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.detail-info-icon {
  font-size: 1.3rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--edit-bg-hover);
  border-radius: 12px;
  flex-shrink: 0;
  color: var(--accent);
}

.detail-info-icon ion-icon {
  font-size: 1.3rem;
}

.detail-info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.detail-info-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-info-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.4;
}

/* Detail action buttons */
.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: transform 0.2s ease, box-shadow 0.3s ease, background-color 0.2s ease;
}

.detail-action-btn ion-icon {
  font-size: 1.15rem;
}

.detail-action-btn:hover {
  transform: translateY(-2px);
}

.detail-action-btn:active {
  transform: translateY(0);
}

.edit-btn-full {
  background: var(--accent-gradient);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.edit-btn-full:hover {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.55);
}

.delete-btn-full {
  background: transparent;
  color: var(--delete-color);
  border: 1.5px solid var(--delete-color);
}

.delete-btn-full:hover {
  background: var(--delete-bg-hover);
}

/* Upload progress overlay */
.hidden-file-input {
  display: none;
}

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

/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

@media (min-width: 768px) {
  .detail-avatar {
    width: 110px;
    height: 110px;
    font-size: 2.5rem;
  }
}
</style>