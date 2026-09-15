import { ref, computed, onMounted } from 'vue';
import { db, ref as dbRef, push, set, onValue, update, remove } from '../firebase';
import { groupContacts } from '../utils/contactHelpers';

export function useContacts() {
  const contacts = ref([]);
  const searchQuery = ref('');

  onMounted(() => {
    const contactsRef = dbRef(db, 'contacts');
    onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      contacts.value = data
        ? Object.keys(data).map((key) => ({
            id: key,
            favorite: false,
            avatar: '',
            ...data[key]
          }))
        : [];
    });
  });

  const filteredContacts = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return contacts.value;
    return contacts.value.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  });

  const groupedContacts = computed(() => groupContacts(filteredContacts.value));

  const toggleFavorite = async (contact) => {
    const contactRef = dbRef(db, `contacts/${contact.id}`);
    await update(contactRef, { favorite: !contact.favorite });
    return !contact.favorite;
  };

  const saveContact = async (payload, editingId = null, favorite = false) => {
    if (editingId) {
      const contactRef = dbRef(db, `contacts/${editingId}`);
      await update(contactRef, { ...payload, favorite });
    } else {
      const contactsRef = dbRef(db, 'contacts');
      const newContactRef = push(contactsRef);
      await set(newContactRef, payload);
    }
  };

  const deleteContact = async (id) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      const contactRef = dbRef(db, `contacts/${id}`);
      await remove(contactRef);
    }
  };

  const updateAvatar = async (id, url) => {
    const contactRef = dbRef(db, `contacts/${id}`);
    await update(contactRef, { avatar: url });
  };

  return {
    contacts,
    searchQuery,
    filteredContacts,
    groupedContacts,
    toggleFavorite,
    saveContact,
    deleteContact,
    updateAvatar
  };
}