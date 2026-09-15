export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getAvatarColor = (name) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getCategoryColor = (category) => {
  const map = {
    Family: 'success',
    Friend: 'tertiary',
    Work: 'warning',
    Other: 'medium'
  };
  return map[category] || 'medium';
};

export const groupContacts = (contacts) => {
  const favs = contacts.filter(c => c.favorite);
  const others = contacts.filter(c => !c.favorite);
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
  if (groups.has('★')) result.push({ letter: '★', contacts: groups.get('★') });

  const letters = [...groups.keys()]
    .filter(k => k !== '★')
    .sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)));

  for (const letter of letters) {
    result.push({ letter, contacts: groups.get(letter) });
  }

  return result;
};