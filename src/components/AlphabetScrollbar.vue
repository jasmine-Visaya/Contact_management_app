<template>
  <div v-if="groups.length > 0" class="alphabet-scrollbar">
    <button
      v-for="group in groups"
      :key="group.letter"
      class="alphabet-letter"
      :class="{ active: activeLetter === group.letter }"
      @click="$emit('select', group.letter)"
    >
      {{ group.letter }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  groups: { type: Array, default: () => [] },
  activeLetter: { type: String, default: '' }
});
defineEmits(['select']);
</script>

<style scoped>
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
</style>