<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary" class="modern-toolbar">
        <ion-title class="app-title">
          <span class="title-emoji">📇</span> Contact Management
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="theme-toggle-btn" @click="toggleTheme">
            <ion-icon :icon="isDarkMode ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="modern-content" :class="{ 'dark-mode': isDarkMode }">
      <!-- Search / Filter Bar -->
      <div class="search-wrapper">
        <ion-searchbar 
          v-model="searchQuery" 
          placeholder="Search by name, phone or category..." 
          class="modern-searchbar"
          animated
          :debounce="150"
        ></ion-searchbar>
      </div>

      <!-- Contact List -->
      <ion-list v-if="filteredContacts.length > 0" class="contact-list">
        <ion-item-sliding v-for="contact in filteredContacts" :key="contact.id">
          <ion-item class="contact-item">
            <div class="avatar-wrapper" slot="start">
              <div class="avatar-circle" :style="{ backgroundColor: getAvatarColor(contact.name) }">
                {{ getInitials(contact.name) }}
              </div>
            </div>
            <ion-label class="contact-label">
              <h2 class="contact-name">{{ contact.name }}</h2>
              <div class="contact-details">
                <p class="detail-line">
                  <span class="detail-icon">📞</span> {{ contact.phone }}
                  <span v-if="contact.email" class="separator">|</span>
                  <span v-if="contact.email" class="detail-icon">✉️</span> {{ contact.email }}
                </p>
                <p class="detail-line address-line">
                  <span class="detail-icon">📍</span> {{ contact.address || 'No address' }}
                </p>
              </div>
              <ion-badge :color="getCategoryColor(contact.category)" class="category-badge">
                {{ contact.category }}
              </ion-badge>
            </ion-label>
            <div class="action-buttons" slot="end">
              <ion-button fill="clear" class="action-btn edit-btn" @click="openModal(contact)">
                <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button fill="clear" class="action-btn delete-btn" @click="deleteContact(contact.id)">
                <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="openModal(contact)">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="deleteContact(contact.id)">
              <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <div v-else class="empty-state ion-padding ion-text-center">
        <div class="empty-illustration">📭</div>
        <h3 class="empty-title">No contacts yet</h3>
        <p class="empty-message">Tap the <strong>+</strong> button below to add your first contact!</p>
      </div>

      <!-- Floating Add Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="add-fab">
        <ion-fab-button @click="openModal()" class="add-fab-button">
          <ion-icon :icon="addOutline" class="add-icon"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Add / Edit Contact Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="modern-modal">
        <ion-header>
          <ion-toolbar color="primary" class="modal-toolbar">
            <ion-title class="modal-title">
              <span class="modal-title-emoji">{{ isEditing ? '✏️' : '✨' }}</span>
              {{ isEditing ? 'Edit Contact' : 'Add New Contact' }}
            </ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal" class="cancel-button">Cancel</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding modal-content">
          <div class="form-container">
            <ion-item class="form-item">
              <ion-label position="stacked" class="form-label">Name *</ion-label>
              <ion-input v-model="form.name" placeholder="John Doe" class="form-input"></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-label position="stacked" class="form-label">Phone Number *</ion-label>
              <ion-input v-model="form.phone" type="tel" placeholder="09123456789" class="form-input"></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-label position="stacked" class="form-label">Email Address</ion-label>
              <ion-input v-model="form.email" type="email" placeholder="john@example.com" class="form-input"></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-label position="stacked" class="form-label">Address</ion-label>
              <ion-input v-model="form.address" placeholder="123 Street, City" class="form-input"></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-label position="stacked" class="form-label">Category / Relationship *</ion-label>
              <ion-select v-model="form.category" placeholder="Select category" class="form-select">
                <ion-select-option value="Family">👨‍👩‍👧‍👦 Family</ion-select-option>
                <ion-select-option value="Friend">🤝 Friend</ion-select-option>
                <ion-select-option value="Work">💼 Work</ion-select-option>
                <ion-select-option value="Other">🌟 Other</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-button expand="block" color="primary" class="ion-margin-top save-button" @click="saveContact">
              <ion-icon :icon="isEditing ? 'checkmark-circle-outline' : 'add-circle-outline'" slot="start"></ion-icon>
              {{ isEditing ? 'Update Contact' : 'Save Contact' }}
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref as vueRef, computed, onMounted, watch } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon,
  IonFab, IonFabButton, IonModal, IonButtons, IonInput, IonSelect, IonSelectOption, IonSearchbar,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/vue';
import { addOutline, trashOutline, createOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { db, ref, push, set, onValue, update, remove } from '../firebase';

// Reactive States
const contacts = vueRef([]);
const searchQuery = vueRef('');
const isModalOpen = vueRef(false);
const isEditing = vueRef(false);
const editingId = vueRef(null);

const form = vueRef({
  name: '',
  phone: '',
  email: '',
  address: '',
  category: 'Friend'
});

// ========== THEME MANAGEMENT ==========
const isDarkMode = vueRef(false);

const applyTheme = (dark) => {
  // Apply to the html element so it cascades everywhere (including modals)
  document.documentElement.classList.toggle('dark-theme', dark);
  // Also toggle Ionic's built-in dark palette class for native components
  document.documentElement.classList.toggle('ion-palette-dark', dark);
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  applyTheme(isDarkMode.value);
};

onMounted(() => {
  // Load saved theme preference, or fall back to system preference
  const saved = localStorage.getItem('theme');
  if (saved) {
    isDarkMode.value = saved === 'dark';
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyTheme(isDarkMode.value);

  // Optional: react to system theme changes when user hasn't chosen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches;
      applyTheme(isDarkMode.value);
    }
  });
});

// ========== FIREBASE (unchanged) ==========
onMounted(() => {
  const contactsRef = ref(db, 'contacts');
  onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      contacts.value = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));
    } else {
      contacts.value = [];
    }
  });
});

// Computed Search Filter
const filteredContacts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return contacts.value;
  return contacts.value.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.category.toLowerCase().includes(query) ||
    c.phone.includes(query)
  );
});

// UI Helpers (visual only)
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getCategoryColor = (category) => {
  const map = {
    'Family': 'success',
    'Friend': 'tertiary',
    'Work': 'warning',
    'Other': 'medium'
  };
  return map[category] || 'medium';
};

// Open Modal for Add or Edit
const openModal = (contact = null) => {
  if (contact) {
    isEditing.value = true;
    editingId.value = contact.id;
    form.value = { ...contact };
  } else {
    isEditing.value = false;
    editingId.value = null;
    form.value = { name: '', phone: '', email: '', address: '', category: 'Friend' };
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// CREATE & UPDATE logic (unchanged)
const saveContact = async () => {
  if (!form.value.name || !form.value.phone) {
    alert('Please fill out Name and Phone number.');
    return;
  }

  if (isEditing.value && editingId.value) {
    const contactRef = ref(db, `contacts/${editingId.value}`);
    await update(contactRef, {
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email || '',
      address: form.value.address || '',
      category: form.value.category || 'Other'
    });
  } else {
    const contactsRef = ref(db, 'contacts');
    const newContactRef = push(contactsRef);
    await set(newContactRef, {
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email || '',
      address: form.value.address || '',
      category: form.value.category || 'Other'
    });
  }

  closeModal();
};

// DELETE logic (unchanged)
const deleteContact = async (id) => {
  if (confirm('Are you sure you want to delete this contact?')) {
    const contactRef = ref(db, `contacts/${id}`);
    await remove(contactRef);
  }
};
</script>

<style scoped>

:root,
:host {
  --app-bg: #f4f6fb;
  --app-bg-gradient: linear-gradient(135deg, #f4f6fb 0%, #eef1f9 100%);
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
}

:global(html.dark-theme) {
  --app-bg: #0f1117;
  --app-bg-gradient: linear-gradient(135deg, #0f1117 0%, #161a24 100%);
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
}

.modern-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #ffffff;
  --min-height: 64px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: box-shadow 0.4s ease;
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

.title-emoji {
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
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.theme-toggle-btn:active ion-icon {
  transform: rotate(180deg);
}

.modern-content {
  --background: var(--app-bg);
  transition: --background 0.4s ease;
}

:global(html.dark-theme) .modern-content {
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
  transition: box-shadow 0.3s ease, --background 0.4s ease;
}

.modern-searchbar:hover {
  --box-shadow: var(--search-shadow-hover);
}

.contact-list {
  padding: 8px 12px 100px;
  background: transparent;
}

.contact-item {
  --background: var(--card-bg);
  --border-radius: 18px;
  --padding-start: 12px;
  --padding-end: 8px;
  --inner-padding-end: 4px;
  --min-height: 90px;
  margin-bottom: 12px;
  border-radius: 18px;
  box-shadow: var(--card-shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease, --background 0.4s ease;
}

.contact-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-shadow-hover);
}

.avatar-wrapper {
  margin-right: 12px;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

:global(html.dark-theme) .avatar-circle {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  filter: brightness(0.9) saturate(1.1);
}

.contact-item:hover .avatar-circle {
  transform: scale(1.1) rotate(-5deg);
}

.contact-label {
  padding: 4px 0;
}

.contact-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  transition: color 0.4s ease;
}

.contact-details {
  margin: 0;
}

.detail-line {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 2px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  transition: color 0.4s ease;
}

.detail-icon {
  font-size: 0.85rem;
}

.separator {
  color: var(--separator-color);
  margin: 0 2px;
}

.address-line {
  color: var(--text-tertiary);
}

.category-badge {
  margin-top: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  transition: transform 0.2s ease;
}

.contact-item:hover .category-badge {
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}

.action-btn {
  --padding-start: 6px;
  --padding-end: 6px;
  --border-radius: 50%;
  margin: 0;
  transition: transform 0.2s ease, --background 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.15);
}

.edit-btn {
  --color: var(--edit-color);
}

.edit-btn:hover {
  --background: var(--edit-bg-hover);
}

.delete-btn {
  --color: var(--delete-color);
}

.delete-btn:hover {
  --background: var(--delete-bg-hover);
}

.empty-state {
  padding: 60px 24px;
  animation: fadeIn 0.6s ease;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
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
  transition: color 0.4s ease;
}

.empty-message {
  color: var(--text-tertiary);
  font-size: 0.95rem;
  line-height: 1.5;
  transition: color 0.4s ease;
}

.add-fab {
  margin: 0 16px 16px 0;
}

.add-fab-button {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --background-activated: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  --background-hover: linear-gradient(135deg, #7a8ef0 0%, #8658b0 100%);
  --box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  --border-radius: 50%;
  --color: #ffffff;
  width: 60px;
  height: 60px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.add-fab-button:hover {
  transform: scale(1.1) rotate(90deg);
  --box-shadow: 0 8px 28px rgba(102, 126, 234, 0.7);
}

.add-icon {
  font-size: 1.8rem;
  color: #ffffff !important;
  --color: #ffffff;
}

:global(html.dark-theme) .add-fab-button {
  --background: linear-gradient(135deg, #5b6fd4 0%, #8b5fb8 100%);
  --background-activated: linear-gradient(135deg, #4a5cc0 0%, #7a4fa8 100%);
  --background-hover: linear-gradient(135deg, #6b7fe4 0%, #9b6fc8 100%);
  --box-shadow: 0 6px 24px rgba(139, 154, 245, 0.45);
}

:global(html.dark-theme) .add-fab-button:hover {
  --box-shadow: 0 8px 32px rgba(139, 154, 245, 0.65);
}

:global(html.dark-theme) .add-icon {
  color: #ffffff !important;
}

.modern-modal {
  --border-radius: 24px;
  --backdrop-opacity: 0.5;
  --width: 90%;
  --max-width: 520px;
}

ion-modal.modern-modal::part(content) {
  background: #f9fafc;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25);
}

:global(html.dark-theme) ion-modal.modern-modal::part(content) {
  background: #161a24;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

ion-modal.modern-modal::part(backdrop) {
  background: #000000;
  opacity: 0.4;
}

:global(html.dark-theme) ion-modal.modern-modal::part(backdrop) {
  background: #000000;
  opacity: 0.75;
}

.modal-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #ffffff;
  --border-radius: 24px 24px 0 0;
}

:global(html.dark-theme) .modal-toolbar {
  --background: linear-gradient(135deg, #4a56b8 0%, #6a4090 100%);
}

.modal-title {
  font-weight: 700;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title-emoji {
  font-size: 1.2rem;
}

.cancel-button {
  --color: #ffffff;
  --background-hover: rgba(255, 255, 255, 0.15);
  font-weight: 600;
  text-transform: none;
  font-size: 0.95rem;
}

.modal-content {
  --background: var(--form-bg);
  --padding-top: 16px;
  --padding-bottom: 0; /* CHANGED: Removes the extra space at the bottom */
  --padding-start: 16px;
  --padding-end: 16px;
  transition: --background 0.4s ease;

    /* ADD THESE LINES */
  flex: 0 1 auto; 
  display: flex;
  flex-direction: column;
}

:global(html.dark-theme) .modal-content {
  --background: #161a24;
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding-bottom: 16px; /* ADDED: Gives just a small breathing room below the button */
  height: auto; /* Ensures it only takes up the space it needs */
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-item {
  --background: var(--form-item-bg);
  --border-radius: 14px;
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 64px;
  margin-bottom: 14px;
  border-radius: 14px;
  box-shadow: var(--form-shadow);
  transition: box-shadow 0.3s ease, transform 0.2s ease, --background 0.4s ease;
}

.form-item:focus-within {
  box-shadow: var(--form-shadow-focus);
  transform: translateY(-2px);
}

.form-label {
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--accent);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 4px;
  transition: color 0.4s ease;
}

.form-input {
  --padding-top: 8px;
  --padding-bottom: 8px;
  --color: var(--text-primary);
  --placeholder-color: var(--text-tertiary);
  --placeholder-opacity: 0.7;
  font-size: 0.95rem;
}

:global(html.dark-theme) .form-input {
  --color: #e8ecf3;
  --placeholder-color: #6b7689;
  --placeholder-opacity: 1;
}

:global(html.dark-theme) .form-input::part(native) {
  color: #e8ecf3 !important;
}

:global(html.dark-theme) .form-input::part(native)::placeholder {
  color: #6b7689 !important;
  opacity: 1;
}

.form-select {
  --padding-top: 8px;
  --padding-bottom: 8px;
  --color: var(--text-primary);
  --placeholder-color: var(--text-tertiary);
  color: var(--text-primary) !important;
  font-size: 0.95rem;
}

.form-select::part(text) {
  color: var(--text-primary) !important;
}

.form-select::part(placeholder) {
  color: var(--text-tertiary) !important;
  opacity: 0.8;
}

.form-select::part(icon) {
  color: var(--text-secondary) !important;
  opacity: 1;
}

:global(html.dark-theme) .form-select {
  --color: #e8ecf3;
  color: #e8ecf3 !important;
}

:global(html.dark-theme) .form-select::part(text) {
  color: #e8ecf3 !important;
}

:global(html.dark-theme) .form-select::part(placeholder) {
  color: #6b7689 !important;
}

:global(html.dark-theme) .form-select::part(icon) {
  color: #a9b4c7 !important;
}

:global(html.dark-theme) ion-select-popup,
:global(html.dark-theme) ion-popover {
  --background: #1c212e;
  --color: #e8ecf3;
}

:global(html.dark-theme) ion-select-popup ion-item,
:global(html.dark-theme) ion-popover ion-item {
  --background: #1c212e;
  --color: #e8ecf3;
}

:global(html.dark-theme) ion-select-popup ion-radio,
:global(html.dark-theme) ion-popover ion-radio {
  --color: #a9b4c7;
  --color-checked: #8b9af5;
}

:global(html.dark-theme) ion-select-popup ion-radio-group ion-item ion-label,
:global(html.dark-theme) ion-popover ion-radio-group ion-item ion-label {
  color: #e8ecf3 !important;
}

.save-button {
  --background: var(--accent-gradient);
  --border-radius: 14px;
  --box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  font-weight: 700;
  font-size: 1rem;
  height: 52px;
  letter-spacing: 0.4px;
  text-transform: none;
  transition: transform 0.2s ease, box-shadow 0.3s ease, --background 0.4s ease;
  margin-top: 8px;

}

:global(html.dark-theme) .save-button {
  --box-shadow: 0 4px 20px rgba(139, 154, 245, 0.35);
}

.save-button:hover {
  transform: translateY(-2px);
  --box-shadow: 0 8px 24px rgba(102, 126, 234, 0.55);
}

.save-button:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

ion-item-sliding {
  animation: fadeIn 0.4s ease forwards;
}

ion-item-sliding:nth-child(1) { animation-delay: 0.05s; }
ion-item-sliding:nth-child(2) { animation-delay: 0.1s; }
ion-item-sliding:nth-child(3) { animation-delay: 0.15s; }
ion-item-sliding:nth-child(4) { animation-delay: 0.2s; }
ion-item-sliding:nth-child(5) { animation-delay: 0.25s; }

.modern-content,
.contact-item,
.form-item,
.form-input,
.form-select,
.contact-name,
.detail-line,
.empty-title,
.empty-message {
  transition: background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;
}

@media (min-width: 768px) {
  .contact-list {
    padding: 12px 24px 100px;
  }

  .contact-item {
    --min-height: 96px;
  }

  .avatar-circle {
    width: 56px;
    height: 56px;
    font-size: 1.2rem;
  }
}
</style>