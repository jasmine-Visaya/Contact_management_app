<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">
            <ion-icon
              :icon="isEditing ? createOutline : addCircleOutline"
              class="modal-title-icon"
            ></ion-icon>
            {{ isEditing ? 'Edit Contact' : 'Add New Contact' }}
          </h2>
          <button class="cancel-button" @click="$emit('close')">Cancel</button>
        </div>

        <div class="modal-body">
          <div class="form-container">
            <div class="form-item avatar-form-item">
              <label class="form-label">Profile Picture</label>
              <AvatarUploader
                :avatar="form.avatar"
                :name="form.name"
                @update:avatar="form.avatar = $event"
                @remove="form.avatar = ''"
              />
            </div>

            <div class="form-item">
              <label class="form-label">Name *</label>
              <input v-model="form.name" type="text" placeholder="John Doe" class="form-input" />
            </div>

            <div class="form-item">
              <label class="form-label">Phone Number *</label>
              <input v-model="form.phone" type="tel" placeholder="09123456789" class="form-input" />
            </div>

            <div class="form-item">
              <label class="form-label">Email Address</label>
              <input v-model="form.email" type="email" placeholder="john@example.com" class="form-input" />
            </div>

            <div class="form-item">
              <label class="form-label">Address</label>
              <input v-model="form.address" type="text" placeholder="123 Street, City" class="form-input" />
            </div>

            <div class="form-item">
              <label class="form-label">Category / Relationship *</label>
              <select v-model="form.category" class="form-select">
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button class="save-button" @click="handleSave">
              <ion-icon :icon="isEditing ? checkmarkCircleOutline : addCircleOutline"></ion-icon>
              {{ isEditing ? 'Update Contact' : 'Save Contact' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  createOutline, addCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import AvatarUploader from './AvatarUploader.vue';

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  contact: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '', phone: '', email: '', address: '',
  category: 'Friend', favorite: false, avatar: ''
});

watch(
  () => [props.isOpen, props.contact],
  () => {
    if (!props.isOpen) return;
    if (props.contact) {
      form.value = {
        ...props.contact,
        favorite: props.contact.favorite || false,
        avatar: props.contact.avatar || ''
      };
    } else {
      form.value = {
        name: '', phone: '', email: '', address: '',
        category: 'Friend', favorite: false, avatar: ''
      };
    }
  },
  { immediate: true }
);

const handleSave = () => {
  if (!form.value.name || !form.value.phone) {
    alert('Please fill out Name and Phone number.');
    return;
  }
  emit('save', { ...form.value });
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

/* Header */
.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 0;
}

:global(html.dark-theme) .modal-header {
  background: linear-gradient(135deg, #4a56b8 0%, #6a4090 100%);
}

@media (min-width: 768px) {
  .modal-header {
    border-radius: 24px 24px 0 0;
  }
}

.modal-title {
  font-weight: 700;
  font-size: 1.15rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
}

.modal-title-icon {
  font-size: 1.2rem;
}

.cancel-button {
  background: transparent;
  border: none;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  font-family: inherit;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Body */
.modal-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  background: var(--form-bg);
}

:global(html.dark-theme) .modal-body {
  background: #161a24;
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
}

.form-item {
  background: var(--form-item-bg);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 14px;
  box-shadow: var(--form-shadow);
  transition: box-shadow 0.3s ease, transform 0.2s ease, background-color 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item:focus-within {
  box-shadow: var(--form-shadow-focus);
  transform: translateY(-2px);
}

.form-label {
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--accent);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.form-input,
.form-select {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-family: inherit;
  padding: 4px 0;
}

.form-input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.7;
}

:global(html.dark-theme) .form-input::placeholder {
  color: #6b7689;
  opacity: 1;
}

:global(html.dark-theme) .form-input,
:global(html.dark-theme) .form-select {
  color: #e8ecf3;
}

.form-select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 18px;
  padding-right: 24px;
}

:global(html.dark-theme) .form-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a9b4c7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
}

.form-select option {
  background: var(--form-item-bg);
  color: var(--text-primary);
}

:global(html.dark-theme) .form-select option {
  background: #1c212e;
  color: #e8ecf3;
}

.avatar-form-item {
  padding: 16px;
}

/* Save button */
.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: var(--accent-gradient);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  height: 52px;
  cursor: pointer;
  font-family: inherit;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.55);
}

.save-button ion-icon {
  font-size: 1.2rem;
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
</style>