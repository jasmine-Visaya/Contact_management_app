import { ref, onMounted } from 'vue';

export function useTheme() {
  const isDarkMode = ref(false);

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
    isDarkMode.value = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(isDarkMode.value);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        isDarkMode.value = e.matches;
        applyTheme(isDarkMode.value);
      }
    });
  });

  return { isDarkMode, toggleTheme, applyTheme };
}