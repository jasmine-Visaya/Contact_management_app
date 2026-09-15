<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary" class="modern-toolbar">
        <ion-title class="app-title">
          <ion-icon :icon="peopleOutline" class="title-icon"></ion-icon>
          Contact Management
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="theme-toggle-btn" @click="toggleTheme">
            <ion-icon :icon="isDarkMode ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content
      ref="contentRef"
      :fullscreen="true"
      class="modern-content"
      :class="{ 'dark-mode': isDarkMode }"
    >
      <div class="search-wrapper">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search by name, phone or category..."
          class="modern-searchbar"
          animated
          :debounce="150"
        ></ion-searchbar>
      </div>

      <ContactList
        :groups="groupedContacts"
        @open="openDetail"
        @edit="openModal"
        @delete="deleteContact"
        @toggle-favorite="toggleFavorite"
      />

      <AlphabetScrollbar
        :groups="groupedContacts"
        :active-letter="activeLetter"
        @select="scrollToLetter"
      />

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="add-fab">
        <ion-fab-button @click="openModal()" class="add-fab-button">
          <ion-icon :icon="addOutline" class="add-icon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <ContactDetailModal
      :is-open="isDetailOpen"
      :contact="selectedContact"
      @close="closeDetail"
      @edit="handleEditFromDetail"
      @delete="handleDeleteFromDetail"
      @toggle-favorite="handleToggleFavoriteDetail"
      @avatar-updated="handleAvatarUpdated"
    />

    <ContactFormModal
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :contact="editingContact"
      @close="closeModal"
      @save="handleSave"
    />
  </ion-page>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonSearchbar, IonFab, IonFabButton
} from '@ionic/vue';
import {
  addOutline, moonOutline, sunnyOutline, peopleOutline
} from 'ionicons/icons';

import ContactList from '../components/ContactList.vue';
import ContactDetailModal from '../components/ContactDetailModal.vue';
import ContactFormModal from '../components/ContactFormModal.vue';
import AlphabetScrollbar from '../components/AlphabetScrollbar.vue';

import { useTheme } from '../composables/useTheme';
import { useContacts } from '../composables/useContacts';

const { isDarkMode, toggleTheme } = useTheme();
const {
  searchQuery, groupedContacts,
  toggleFavorite, saveContact, deleteContact, updateAvatar
} = useContacts();

const contentRef = ref(null);
const activeLetter = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingContact = ref(null);
const isDetailOpen = ref(false);
const selectedContact = ref(null);

/* ---------- Scroll to letter ---------- */
const scrollToLetter = (letter) => {
  activeLetter.value = letter;
  const el = document.getElementById(`letter-${letter}`);
  if (!el) return;

  const ionContent = contentRef.value?.$el || document.querySelector('ion-content');

  if (ionContent && typeof ionContent.scrollToPoint === 'function') {
    const scrollEl = ionContent.shadowRoot
      ? ionContent.shadowRoot.querySelector('.inner-scroll')
      : ionContent.querySelector('.inner-scroll');

    if (scrollEl) {
      const containerTop = scrollEl.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const targetScroll = scrollEl.scrollTop + (elTop - containerTop) - 70;
      ionContent.scrollToPoint(0, Math.max(0, targetScroll), 350);
    } else {
      ionContent.scrollToPoint(0, Math.max(0, el.offsetTop - 70), 350);
    }
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setTimeout(() => (activeLetter.value = ''), 800);
};

/* ---------- Detail modal ---------- */
const openDetail = (contact) => {
  selectedContact.value = { ...contact, avatar: contact.avatar || '' };
  isDetailOpen.value = true;
};

const closeDetail = () => {
  if (!isDetailOpen.value) return;
  isDetailOpen.value = false;
  setTimeout(() => (selectedContact.value = null), 350);
};

const handleEditFromDetail = (contact) => {
  closeDetail();
  // wait for detail modal leave animation before opening form modal
  setTimeout(() => openModal(contact), 350);
};

const handleDeleteFromDetail = async (id) => {
  await deleteContact(id);
  closeDetail();
};

const handleToggleFavoriteDetail = async (contact) => {
  const newFav = await toggleFavorite(contact);
  if (selectedContact.value?.id === contact.id) {
    selectedContact.value = { ...selectedContact.value, favorite: newFav };
  }
};

const handleAvatarUpdated = async ({ id, url }) => {
  await updateAvatar(id, url);
  if (selectedContact.value?.id === id) {
    selectedContact.value = { ...selectedContact.value, avatar: url };
  }
};

/* ---------- Form modal ---------- */
const openModal = (contact = null) => {
  isEditing.value = !!contact;
  editingContact.value = contact;
  isModalOpen.value = true;
};

const closeModal = () => {
  if (!isModalOpen.value) return;
  isModalOpen.value = false;
  setTimeout(() => (editingContact.value = null), 350);
};

const handleSave = async (formData) => {
  const payload = {
    name: formData.name,
    phone: formData.phone,
    email: formData.email || '',
    address: formData.address || '',
    category: formData.category || 'Other',
    avatar: formData.avatar || ''
  };

  await saveContact(payload, isEditing.value ? formData.id : null, formData.favorite);
  closeModal();
};
</script>

<style scoped>
/* ---------- CSS variables (global) ---------- */
:global(:root),
:global(:host) {
  --app-bg: #f4f6fb;
  --card-bg: #ffffff;
  --card-shadow: 0 4px 16px rgba(102, 126, 234, 0.08);
  --card-shadow-hover: 0 8px 24px rgba(102, 126, 234, 0.18);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --text-tertiary: #a0aec0;
  --separator-color: #cbd5e0;
  --accent: #667eea;
  --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --search-bg: #ffffff;
  --search-placeholder: #9aa5b8;
  --search-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
  --search-shadow-hover: 0 6px 20px rgba(102, 126, 234, 0.2);
  --form-bg: #f9fafc;
  --form-item-bg: #ffffff;
  --form-shadow: 0 2px 10px rgba(102, 126, 234, 0.06);
  --form-shadow-focus: 0 4px 20px rgba(102, 126, 234, 0.2);
  --edit-color: #667eea;
  --edit-bg-hover: rgba(102, 126, 234, 0.1);
  --delete-color: #fc8181;
  --delete-bg-hover: rgba(252, 129, 129, 0.1);
  --favorite-color: #f6ad55;
  --favorite-bg-hover: rgba(246, 173, 85, 0.12);
  --letter-header-color: #667eea;
  --detail-info-bg: #ffffff;
}

:global(html.dark-theme) {
  --app-bg: #0f1117;
  --card-bg: #1c212e;
  --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.5);
  --text-primary: #e8ecf3;
  --text-secondary: #a9b4c7;
  --text-tertiary: #6b7689;
  --separator-color: #3a4356;
  --accent: #8b9af5;
  --accent-gradient: linear-gradient(135deg, #5b6fd4 0%, #8b5fb8 100%);
  --search-bg: #1c212e;
  --search-placeholder: #6b7689;
  --search-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  --search-shadow-hover: 0 6px 20px rgba(139, 154, 245, 0.2);
  --form-bg: #161a24;
  --form-item-bg: #1c212e;
  --form-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  --form-shadow-focus: 0 4px 20px rgba(139, 154, 245, 0.25);
  --edit-color: #8b9af5;
  --edit-bg-hover: rgba(139, 154, 245, 0.15);
  --delete-color: #fc8181;
  --delete-bg-hover: rgba(252, 129, 129, 0.15);
  --favorite-color: #f6ad55;
  --favorite-bg-hover: rgba(246, 173, 85, 0.18);
  --letter-header-color: #8b9af5;
  --detail-info-bg: #1c212e;
}

/* ---------- Toolbar ---------- */
.modern-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #ffffff;
  --min-height: 64px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

:global(html.dark-theme) .modern-toolbar {
  --background: linear-gradient(135deg, #4a56b8 0%, #6a4090 100%);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.app-title {
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 1.4rem;
  animation: wave 2s infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-10deg); }
}

.theme-toggle-btn {
  --color: #ffffff;
  --background-hover: rgba(255, 255, 255, 0.15);
  --border-radius: 50%;
  margin-right: 6px;
  width: 44px;
  height: 44px;
  transition: transform 0.3s ease;
}

.theme-toggle-btn:hover {
  transform: rotate(20deg) scale(1.1);
}

.theme-toggle-btn ion-icon {
  font-size: 1.5rem;
}

/* ---------- Content + Search ---------- */
.modern-content {
  --background: var(--app-bg);
}

.search-wrapper {
  padding: 12px 16px 4px;
  background: transparent;
}

.modern-searchbar {
  --background: var(--search-bg);
  --border-radius: 16px;
  --box-shadow: var(--search-shadow);
  --placeholder-color: var(--search-placeholder);
  --icon-color: var(--accent);
  --color: var(--text-primary);
  --clear-button-color: var(--text-secondary);
  padding: 0;
}

/* ---------- FAB (safe-area aware) ---------- */
.add-fab {
  margin: 0 calc(16px + env(safe-area-inset-right, 0px))
          calc(16px + env(safe-area-inset-bottom, 0px))
          0;
}

.add-fab-button {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --background-activated: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  --box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  --border-radius: 50%;
  --color: #ffffff;
  width: 60px;
  height: 60px;
  transition: transform 0.3s ease;
}

.add-fab-button:hover {
  transform: scale(1.1) rotate(90deg);
}

.add-icon {
  font-size: 1.8rem;
  color: #ffffff !important;
}
</style>