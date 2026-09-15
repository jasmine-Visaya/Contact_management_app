<template>
  <div v-if="groups.length > 0" class="contact-list">
    <template v-for="group in groups" :key="group.letter">
      <div class="letter-header" :id="`letter-${group.letter}`">
        <span class="letter-label">{{ group.letter }}</span>
      </div>
      <ion-list class="contact-list-inner">
        <ContactListItem
          v-for="contact in group.contacts"
          :key="contact.id"
          :contact="contact"
          @open="$emit('open', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @toggle-favorite="$emit('toggle-favorite', $event)"
        />
      </ion-list>
    </template>
  </div>

  <div v-else class="empty-state ion-padding ion-text-center">
    <div class="empty-illustration">
      <ion-icon :icon="mailOpenOutline"></ion-icon>
    </div>
    <h3 class="empty-title">No contacts yet</h3>
    <p class="empty-message">
      Tap the <strong>+</strong> button below to add your first contact!
    </p>
  </div>
</template>

<script setup>
import { IonList, IonIcon } from '@ionic/vue';
import { mailOpenOutline } from 'ionicons/icons';
import ContactListItem from './ContactListItem.vue';

defineProps({ groups: { type: Array, default: () => [] } });
defineEmits(['open', 'edit', 'delete', 'toggle-favorite']);
</script>

<style scoped>
.contact-list {
  padding: 8px 12px 100px;
  background: transparent;
}

.contact-list-inner {
  background: transparent;
  padding: 0;
}

.letter-header {
  padding: 12px 8px 4px;
  position: sticky;
  top: 0;
  z-index: 5;
  background: transparent;
  pointer-events: none;
}

.letter-label {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--letter-header-color);
  letter-spacing: 1px;
  padding: 2px 10px;
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: var(--card-shadow);
}

/* Empty state */
.empty-state {
  padding: 60px 24px;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
  color: var(--accent);
}

.empty-illustration ion-icon {
  font-size: 4rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-message {
  color: var(--text-tertiary);
  font-size: 0.95rem;
}

/* Staggered fade-in for rows */
:deep(ion-item-sliding) {
  animation: fadeIn 0.4s ease forwards;
}

:deep(ion-item-sliding:nth-child(1)) { animation-delay: 0.05s; }
:deep(ion-item-sliding:nth-child(2)) { animation-delay: 0.1s; }
:deep(ion-item-sliding:nth-child(3)) { animation-delay: 0.15s; }
:deep(ion-item-sliding:nth-child(4)) { animation-delay: 0.2s; }
:deep(ion-item-sliding:nth-child(5)) { animation-delay: 0.25s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
  .contact-list {
    padding: 12px 24px 100px;
  }
}
</style>