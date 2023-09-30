<template>
    <div ref="container" class="container">
        <button class="button" @click="toggle">Google Meet PiP</button>
        <UserSelection :open="open" :users="participants" @select="select" @deselect="deselect" />
    </div>
</template>

<script setup>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { activatePictureInPicture, exitPictureInPicture, getParticipantsList } from './lib/google-meet';
import UserSelection from './UserSelection.vue';

const container = ref(null);
const participants = ref([]);
const open = ref(false);

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('enterpictureinpicture', handlePictureInPicture, { capture: true });
    document.addEventListener('leavepictureinpicture', handlePictureInPicture, { capture: true });
});
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscapeKey);
    document.removeEventListener('enterpictureinpicture', handlePictureInPicture, { capture: true });
    document.removeEventListener('leavepictureinpicture', handlePictureInPicture, { capture: true });
});

const toggle = () => {
    participants.value = getParticipantsList();
    open.value = !open.value;
};
const select = async (participant) => {
    await activatePictureInPicture(participant);
    participants.value = getParticipantsList();
};
const deselect = async () => {
    await exitPictureInPicture();
    participants.value = getParticipantsList();
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
const handlePictureInPicture = () => {
    setTimeout(() => (participants.value = getParticipantsList()), 0);
};
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
