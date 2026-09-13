<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary" class="modern-toolbar">
        <ion-title class="app-title">
          <ion-icon :icon="peopleOutline" class="title-icon"></ion-icon> Contact Management
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="theme-toggle-btn" @click="toggleTheme">
            <ion-icon :icon="isDarkMode ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" :fullscreen="true" class="modern-content" :class="{ 'dark-mode': isDarkMode }">
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

      <!-- Contact List grouped alphabetically -->
      <div v-if="groupedContacts.length > 0" class="contact-list">
        <template v-for="group in groupedContacts" :key="group.letter">
          <div class="letter-header" :id="`letter-${group.letter}`">
            <span class="letter-label">{{ group.letter }}</span>
          </div>
          <ion-list class="contact-list-inner">
            <ion-item-sliding v-for="contact in group.contacts" :key="contact.id">
              <ion-item
                class="contact-item"
                button
                detail="false"
                @click="openDetail(contact)"
              >
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
                    :class="{ 'favorited': contact.favorite }"
                    @click.stop="toggleFavorite(contact)"
                  >
                    <ion-icon :icon="contact.favorite ? star : starOutline" slot="icon-only"></ion-icon>
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
        </template>
      </div>

      <div v-else class="empty-state ion-padding ion-text-center">
        <div class="empty-illustration">
          <ion-icon :icon="mailOpenOutline"></ion-icon>
        </div>
        <h3 class="empty-title">No contacts yet</h3>
        <p class="empty-message">Tap the <strong>+</strong> button below to add your first contact!</p>
      </div>

      <!-- Alphabet Scroll Bar (mobile) -->
      <div v-if="groupedContacts.length > 0" class="alphabet-scrollbar">
        <button
          v-for="group in groupedContacts"
          :key="group.letter"
          class="alphabet-letter"
          :class="{ active: activeLetter === group.letter }"
          @click="scrollToLetter(group.letter)"
        >
          {{ group.letter }}
        </button>
      </div>

      <!-- Floating Add Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="add-fab">
        <ion-fab-button @click="openModal()" class="add-fab-button">
          <ion-icon :icon="addOutline" class="add-icon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- ========== CONTACT DETAIL MODAL ========== -->
    <transition name="modal-fade">
      <div v-if="isDetailOpen && selectedContact" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-card detail-card">
          <!-- Detail Header -->
          <div class="detail-header">
            <button class="detail-back-btn" @click="closeDetail">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
            </button>
            <h2 class="detail-header-title">Contact Details</h2>
            <button
              class="detail-fav-btn"
              :class="{ 'favorited': selectedContact.favorite }"
              @click="toggleFavorite(selectedContact)"
            >
              <ion-icon :icon="selectedContact.favorite ? star : starOutline"></ion-icon>
            </button>
          </div>

          <!-- Detail Body -->
          <div class="detail-body">
            <div class="detail-hero">
              <div class="detail-avatar-wrapper">
                <div
                  class="detail-avatar"
                  :style="selectedContact.avatar ? {} : { backgroundColor: getAvatarColor(selectedContact.name) }"
                >
                  <img
                    v-if="selectedContact.avatar"
                    :src="getAvatarUrl(selectedContact.avatar, 200)"
                    :alt="selectedContact.name"
                    class="avatar-image"
                  />
                  <span v-else>{{ getInitials(selectedContact.name) }}</span>

                  <!-- Upload progress overlay -->
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
              <h3 class="detail-name">{{ selectedContact.name }}</h3>
              <ion-badge :color="getCategoryColor(selectedContact.category)" class="detail-category-badge">
                {{ selectedContact.category }}
              </ion-badge>
            </div>

            <div class="detail-info-list">
              <div class="detail-info-item">
                <div class="detail-info-icon">
                  <ion-icon :icon="callOutline"></ion-icon>
                </div>
                <div class="detail-info-content">
                  <span class="detail-info-label">Phone</span>
                  <span class="detail-info-value">{{ selectedContact.phone }}</span>
                </div>
              </div>

              <div v-if="selectedContact.email" class="detail-info-item">
                <div class="detail-info-icon">
                  <ion-icon :icon="mailOutline"></ion-icon>
                </div>
                <div class="detail-info-content">
                  <span class="detail-info-label">Email</span>
                  <span class="detail-info-value">{{ selectedContact.email }}</span>
                </div>
              </div>

              <div class="detail-info-item">
                <div class="detail-info-icon">
                  <ion-icon :icon="locationOutline"></ion-icon>
                </div>
                <div class="detail-info-content">
                  <span class="detail-info-label">Address</span>
                  <span class="detail-info-value">{{ selectedContact.address || 'No address' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <button class="detail-action-btn edit-btn-full" @click="openModal(selectedContact); closeDetail()">
                <ion-icon :icon="createOutline"></ion-icon>
                Edit Contact
              </button>
              <button class="detail-action-btn delete-btn-full" @click="deleteContact(selectedContact.id); closeDetail()">
                <ion-icon :icon="trashOutline"></ion-icon>
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ========== ADD/EDIT MODAL ========== -->
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">
              <ion-icon :icon="isEditing ? createOutline : addCircleOutline" class="modal-title-icon"></ion-icon>
              {{ isEditing ? 'Edit Contact' : 'Add New Contact' }}
            </h2>
            <button class="cancel-button" @click="closeModal">Cancel</button>
          </div>

          <div class="modal-body">
            <div class="form-container">
              <!-- Avatar Upload -->
              <div class="form-item avatar-form-item">
                <label class="form-label">Profile Picture</label>
                <div class="avatar-upload-row">
                  <div
                    class="form-avatar-preview"
                    :style="form.avatar ? {} : { backgroundColor: getAvatarColor(form.name || '?') }"
                  >
                    <img
                      v-if="form.avatar"
                      :src="getAvatarUrl(form.avatar, 120)"
                      alt="Preview"
                      class="avatar-image"
                    />
                    <span v-else>{{ getInitials(form.name || '?') }}</span>

                    <!-- Upload progress overlay -->
                    <div v-if="isUploading" class="upload-overlay">
                      <div class="upload-spinner"></div>
                      <span class="upload-progress-text">{{ uploadProgress }}%</span>
                    </div>
                  </div>
                  <div class="avatar-upload-actions">
                    <button
                      type="button"
                      class="avatar-upload-btn"
                      @click="triggerAvatarUpload"
                      :disabled="isUploading"
                    >
                      <ion-icon :icon="cameraOutline"></ion-icon>
                      {{ isUploading ? 'Uploading...' : (form.avatar ? 'Change Photo' : 'Upload Photo') }}
                    </button>
                    <button
                      v-if="form.avatar"
                      type="button"
                      class="avatar-remove-btn"
                      @click="removeAvatar"
                      :disabled="isUploading"
                    >
                      <ion-icon :icon="trashOutline"></ion-icon>
                      Remove
                    </button>
                  </div>
                  <input
                    ref="avatarFileInput"
                    type="file"
                    accept="image/*"
                    class="hidden-file-input"
                    @change="handleAvatarFileChange"
                  />
                </div>
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

              <button class="save-button" @click="saveContact">
                <ion-icon :icon="isEditing ? checkmarkCircleOutline : addCircleOutline"></ion-icon>
                {{ isEditing ? 'Update Contact' : 'Save Contact' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </ion-page>
</template>

<script setup>
import { ref as vueRef, computed, onMounted, watch } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon,
  IonFab, IonFabButton, IonSearchbar,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/vue';
import {
  addOutline, trashOutline, createOutline, moonOutline, sunnyOutline,
  star, starOutline, arrowBackOutline,
  peopleOutline, mailOpenOutline, callOutline, mailOutline,
  locationOutline, addCircleOutline, checkmarkCircleOutline,
  cameraOutline
} from 'ionicons/icons';
import { db, ref, push, set, onValue, update, remove } from '../firebase';
import { uploadImage, getTransformedUrl } from '../services/imagekit';

// Reactive States
const contacts = vueRef([]);
const searchQuery = vueRef('');
const isModalOpen = vueRef(false);
const isEditing = vueRef(false);
const editingId = vueRef(null);
const activeLetter = vueRef('');

// Content ref for programmatic scrolling
const contentRef = vueRef(null);

// Detail modal state
const isDetailOpen = vueRef(false);
const selectedContact = vueRef(null);

// Avatar upload state
const avatarFileInput = vueRef(null);
const detailAvatarInput = vueRef(null);
const isUploading = vueRef(false);
const uploadProgress = vueRef(0);

const form = vueRef({
  name: '',
  phone: '',
  email: '',
  address: '',
  category: 'Friend',
  favorite: false,
  avatar: ''
});

// ========== THEME MANAGEMENT ==========
const isDarkMode = vueRef(false);

const applyTheme = (dark) => {
  document.documentElement.classList.toggle('dark-theme', dark);
  document.documentElement.classList.toggle('ion-palette-dark', dark);
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  applyTheme(isDarkMode.value);
};

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    isDarkMode.value = saved === 'dark';
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyTheme(isDarkMode.value);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches;
      applyTheme(isDarkMode.value);
    }
  });
});

// ========== FIREBASE ==========
onMounted(() => {
  const contactsRef = ref(db, 'contacts');
  onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      contacts.value = Object.keys(data).map((key) => ({
        id: key,
        favorite: false,
        avatar: '',
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

// Group contacts alphabetically, favorites first
const groupedContacts = computed(() => {
  const favs = filteredContacts.value.filter(c => c.favorite);
  const others = filteredContacts.value.filter(c => !c.favorite);

  const groups = new Map();

  if (favs.length > 0) {
    const sortedFavs = [...favs].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    groups.set('★', sortedFavs);
  }

  const sortedOthers = [...others].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  for (const contact of sortedOthers) {
    const letter = (contact.name || '#').trim().charAt(0).toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(contact);
  }

  const result = [];
  if (groups.has('★')) {
    result.push({ letter: '★', contacts: groups.get('★') });
  }
  const letters = [...groups.keys()].filter(k => k !== '★').sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });
  for (const letter of letters) {
    result.push({ letter, contacts: groups.get(letter) });
  }

  return result;
});

// ========== SCROLL TO LETTER (FIXED) ==========
const scrollToLetter = (letter) => {
  activeLetter.value = letter;

  const el = document.getElementById(`letter-${letter}`);
  if (!el) return;

  const ionContent = contentRef.value?.$el || document.querySelector('ion-content');

  if (ionContent && typeof ionContent.scrollToPoint === 'function') {
    // Access the inner scroll element inside the shadow DOM of ion-content
    const scrollEl = ionContent.shadowRoot
      ? ionContent.shadowRoot.querySelector('.inner-scroll')
      : ionContent.querySelector('.inner-scroll');

    if (scrollEl) {
      const containerTop = scrollEl.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      // Offset by ~70px so the letter lands just below the sticky header
      const targetScroll = scrollEl.scrollTop + (elTop - containerTop) - 70;

      ionContent.scrollToPoint(0, Math.max(0, targetScroll), 350);
    } else {
      // Fallback: use offsetTop relative to the scroll content
      const fallbackY = Math.max(0, el.offsetTop - 70);
      ionContent.scrollToPoint(0, fallbackY, 350);
    }
  } else {
    // Absolute fallback for non-Ionic environments
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setTimeout(() => {
    activeLetter.value = '';
  }, 800);
};

// Open/close detail modal
const openDetail = (contact) => {
  selectedContact.value = { ...contact, avatar: contact.avatar || '' };
  isDetailOpen.value = true;
};

const closeDetail = () => {
  isDetailOpen.value = false;
  setTimeout(() => {
    selectedContact.value = null;
  }, 250);
};

// UI Helpers
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

// ========== IMAGEKIT HELPERS ==========
const getAvatarUrl = (url, size = 100) => {
  return getTransformedUrl(url, {
    width: size,
    height: size,
    quality: 80,
    format: 'auto'
  });
};

const triggerAvatarUpload = () => {
  if (isUploading.value) return;
  avatarFileInput.value?.click();
};

const triggerDetailAvatarUpload = () => {
  if (isUploading.value) return;
  detailAvatarInput.value?.click();
};

const validateImage = (file) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
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

const handleImageUpload = async (file, onSuccess) => {
  const { valid, error } = validateImage(file);
  if (!valid) {
    alert(error);
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const result = await uploadImage(file, `avatar_${Date.now()}_${file.name}`, (progress) => {
      uploadProgress.value = progress;
    });
    onSuccess(result.url);
    uploadProgress.value = 100;
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Failed to upload image. Please check your connection and try again.');
    uploadProgress.value = 0;
  } finally {
    isUploading.value = false;
    setTimeout(() => {
      if (avatarFileInput.value) avatarFileInput.value.value = '';
      if (detailAvatarInput.value) detailAvatarInput.value.value = '';
    }, 300);
  }
};

const handleAvatarFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  await handleImageUpload(file, (url) => {
    form.value.avatar = url;
  });
};

const handleDetailAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file || !selectedContact.value) return;

  const contactId = selectedContact.value.id;

  await handleImageUpload(file, async (url) => {
    selectedContact.value = { ...selectedContact.value, avatar: url };
    const contactRef = ref(db, `contacts/${contactId}`);
    await update(contactRef, { avatar: url });
  });
};

const removeAvatar = () => {
  form.value.avatar = '';
};

// Toggle favorite
const toggleFavorite = async (contact) => {
  const contactRef = ref(db, `contacts/${contact.id}`);
  await update(contactRef, { favorite: !contact.favorite });
  if (selectedContact.value && selectedContact.value.id === contact.id) {
    selectedContact.value = { ...selectedContact.value, favorite: !contact.favorite };
  }
};

// Open Modal for Add or Edit
const openModal = (contact = null) => {
  if (contact) {
    isEditing.value = true;
    editingId.value = contact.id;
    form.value = {
      ...contact,
      favorite: contact.favorite || false,
      avatar: contact.avatar || ''
    };
  } else {
    isEditing.value = false;
    editingId.value = null;
    form.value = {
      name: '',
      phone: '',
      email: '',
      address: '',
      category: 'Friend',
      favorite: false,
      avatar: ''
    };
  }
  uploadProgress.value = 0;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// Lock body scroll when any modal is open
watch([isModalOpen, isDetailOpen], ([modal, detail]) => {
  document.documentElement.classList.toggle('modal-open', modal || detail);
});

// CREATE & UPDATE logic
const saveContact = async () => {
  if (!form.value.name || !form.value.phone) {
    alert('Please fill out Name and Phone number.');
    return;
  }

  const payload = {
    name: form.value.name,
    phone: form.value.phone,
    email: form.value.email || '',
    address: form.value.address || '',
    category: form.value.category || 'Other',
    avatar: form.value.avatar || ''
  };

  if (isEditing.value && editingId.value) {
    const contactRef = ref(db, `contacts/${editingId.value}`);
    await update(contactRef, {
      ...payload,
      favorite: form.value.favorite || false
    });
  } else {
    const contactsRef = ref(db, 'contacts');
    const newContactRef = push(contactsRef);
    await set(newContactRef, payload);
  }

  closeModal();
};

// DELETE logic
const deleteContact = async (id) => {
  if (confirm('Are you sure you want to delete this contact?')) {
    const contactRef = ref(db, `contacts/${id}`);
    await remove(contactRef);
  }
};
</script>

<style scoped>

:global(:root),
:global(:host){
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

:global(html.modal-open),
:global(html.modal-open body) {
  overflow: hidden !important;
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
  transition: box-shadow 0.3s ease, --background 0.4s ease;
}

.modern-searchbar:hover {
  --box-shadow: var(--search-shadow-hover);
}

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

/* ========== MINIMAL CONTACT ROW ========== */
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
}

.contact-item:hover .avatar-circle {
  transform: scale(1.08) rotate(-4deg);
}

.favorite-star {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.8rem;
  background: var(--card-bg);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.favorite-star ion-icon {
  font-size: 0.75rem;
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

/* ========== ALPHABET SCROLL BAR (FIXED) ========== */
.alphabet-scrollbar {
  position: fixed;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  touch-action: none;
}

:global(html.dark-theme) .alphabet-scrollbar {
  background: rgba(28, 33, 46, 0.7);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.alphabet-letter {
  background: transparent;
  border: none;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-tertiary);
  width: 22px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  pointer-events: auto;
  position: relative;
  z-index: 1000;
  user-select: none;
}

.alphabet-letter:hover,
.alphabet-letter.active {
  color: var(--accent);
  background: var(--edit-bg-hover);
  transform: scale(1.3);
}

@media (min-width: 768px) {
  .alphabet-scrollbar {
    display: none;
  }
}

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

.add-fab {
  margin: 0 16px 16px 0;
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

/* ===================================================== */
/* ========== DETAIL MODAL ============================= */
/* ===================================================== */

.detail-card {
  background: var(--app-bg);
}

:global(html.dark-theme) .detail-card {
  background: #0f1117;
}

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

.detail-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 24px 20px 32px;
}

/* Hero section */
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
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
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

/* ===================================================== */
/* ========== ADD/EDIT MODAL =========================== */
/* ===================================================== */

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

.favorite-form-item {
  cursor: default;
}

.favorite-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
  transition: opacity 0.2s ease;
}

.favorite-toggle:hover {
  opacity: 0.8;
}

.favorite-toggle-icon {
  font-size: 1.3rem;
  line-height: 1;
  color: var(--text-tertiary);
  transition: color 0.2s ease;
}

.favorite-toggle-icon.active {
  color: var(--favorite-color);
}

.favorite-toggle-text {
  font-size: 0.95rem;
  color: var(--text-primary);
}

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

/* ===================================================== */
/* ========== TRANSITIONS ============================== */
/* ===================================================== */

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

/* ===================================================== */
/* ========== AVATAR IMAGE STYLES ====================== */
/* ===================================================== */

.avatar-circle,
.detail-avatar,
.form-avatar-preview {
  position: relative;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

.detail-avatar-wrapper {
  position: relative;
  display: inline-block;
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

/* ===================================================== */
/* ========== FORM AVATAR UPLOAD ======================= */
/* ===================================================== */

.avatar-form-item {
  padding: 16px;
}

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

/* ===================================================== */
/* ========== UPLOAD PROGRESS OVERLAY ================== */
/* ===================================================== */

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
  .contact-list {
    padding: 12px 24px 100px;
  }

  .contact-item {
    --min-height: 68px;
  }

  .avatar-circle {
    width: 46px;
    height: 46px;
    font-size: 1.05rem;
  }

  .detail-avatar {
    width: 110px;
    height: 110px;
    font-size: 2.5rem;
  }

  .form-avatar-preview {
    width: 88px;
    height: 88px;
    font-size: 1.8rem;
  }
}
</style>