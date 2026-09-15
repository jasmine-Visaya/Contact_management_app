<template>
  <ion-item-sliding>
    <ion-item class="contact-item" button detail="false" @click="$emit('open', contact)">
      <div class="avatar-wrapper" slot="start">
        <div
          class="avatar-circle"
          :style="contact.avatar ? {} : { backgroundColor: getAvatarColor(contact.name) }"
        >
          <img
            v-if="contact.avatar"
            :src="getAvatarUrl(contact.avatar, 80)"
            :alt="contact.name"
            class="avatar-image"
            loading="lazy"
          />
          <span v-else>{{ getInitials(contact.name) }}</span>
        </div>
      </div>

      <ion-label class="contact-label">
        <h2 class="contact-name">{{ contact.name }}</h2>
      </ion-label>

      <div class="action-buttons" slot="end">
        <ion-button
          fill="clear"
          class="action-btn favorite-btn"
          :class="{ favorited: contact.favorite }"
          @click.stop="$emit('toggle-favorite', contact)"
        >
          <ion-icon :icon="contact.favorite ? star : starOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option color="primary" @click="$emit('edit', contact)">
        <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
      </ion-item-option>
      <ion-item-option color="danger" @click="$emit('delete', contact.id)">
        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
      </ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>

<script setup>
import {
  IonItemSliding, IonItem, IonItemOptions, IonItemOption,
  IonLabel, IonButton, IonIcon
} from '@ionic/vue';
import { star, starOutline, createOutline, trashOutline } from 'ionicons/icons';
import { getInitials, getAvatarColor } from '../utils/contactHelpers';
import { getTransformedUrl } from '../services/imagekit';

defineProps({ contact: { type: Object, required: true } });
defineEmits(['open', 'edit', 'delete', 'toggle-favorite']);

const getAvatarUrl = (url, size) =>
  getTransformedUrl(url, { width: size, height: size, quality: 80, format: 'auto' });
</script>

<style scoped>
.contact-item {
  --background: var(--card-bg);
  --border-radius: 18px;
  --padding-start: 12px;
  --padding-end: 8px;
  --inner-padding-end: 4px;
  --min-height: 64px;
  margin-bottom: 8px;
  border-radius: 18px;
  box-shadow: var(--card-shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease, --background 0.4s ease;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.avatar-wrapper {
  margin-right: 12px;
  position: relative;
}

.avatar-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
}

.contact-item:hover .avatar-circle {
  transform: scale(1.08) rotate(-4deg);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

.contact-label {
  padding: 4px 0;
}

.contact-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  --padding-start: 6px;
  --padding-end: 6px;
  --border-radius: 50%;
  margin: 0;
}

.favorite-btn {
  --color: var(--text-tertiary);
}

.favorite-btn.favorited {
  --color: var(--favorite-color);
}

.favorite-btn:hover {
  --background: var(--favorite-bg-hover);
  --color: var(--favorite-color);
}

@media (min-width: 768px) {
  .contact-item {
    --min-height: 68px;
  }

  .avatar-circle {
    width: 46px;
    height: 46px;
    font-size: 1.05rem;
  }
}
</style>