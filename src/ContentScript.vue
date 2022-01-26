<template>
  <div ref="container" class="container">
    <button class="button" @click="toggle">Google Meet PiP</button>
    <UserSelection :open="open" :users="users" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { getParticipantsList } from './lib/google-meet';
import UserSelection from './UserSelection.vue';

export default defineComponent({
  components: {
    UserSelection,
  },

  setup() {
    const container = ref(null);
    const users = ref([]);
    const open = ref(false);

    const toggle = () => {
      users.value = getParticipantsList();
      open.value = !open.value;
    };

    const handleClickOutside = (event) => {
      if (!container.value.contains(event.target)) {
        open.value = false;
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        open.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    });
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    });

    return {
      container,
      users,
      open,
      toggle,
    };
  },
});
</script>

<style scoped>
.container {
  position: relative;
}

.button {
  position: relative;
  display: block;
  width: 40px;
  height: 40px;
  padding: 8px;
  border: none;
  border-radius: 100px;

  font-size: 0;
  background: var(--gm-tooltip-background-color) url('./images/icon.png') center center no-repeat;
  background-size: 24px 24px;
  cursor: pointer;
}

.button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;

  background-color: var(--mdc-ripple-color, #e8eaed);
  opacity: 0;
  transition: opacity 15ms linear;
  pointer-events: none;
}

.button:hover::before,
.button:focus::before {
  opacity: var(--mdc-ripple-hover-opacity, 0.04);
}
</style>
