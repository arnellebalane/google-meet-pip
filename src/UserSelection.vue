<template>
    <aside class="popup" :class="{ open }">
        <header class="header">
            <h2 class="heading">Google Meet PiP</h2>
            <p class="subheading">Select the participant to show in a Picture-in-Picture window</p>
        </header>

        <ul class="users">
            <li
                v-for="user in users"
                :key="user.id"
                class="user"
                :class="{ active: user.active, available: user.available }"
                @click="select(user)"
            >
                <span class="user-name">{{ user.name }}</span>
                <span v-if="user.active" class="user-active">Currently in Picture-in-Picture</span>
            </li>
        </ul>
    </aside>
</template>

<script setup>
const props = defineProps({
    open: Boolean,
    users: Array,
});
const emit = defineEmits(['select', 'deselect']);

const select = (user) => {
    if (user.active) {
        emit('deselect', user);
    } else if (user.available) {
        emit('select', user);
    }
};
</script>

<style scoped>
.popup {
    position: absolute;
    left: 0;
    bottom: calc(100% + 16px);

    display: none;
    width: 260px;
    border-radius: 4px;

    background-color: var(--mdc-theme-surface, #fff);
}

.popup,
.popup * {
    box-sizing: border-box;
}

.popup.open {
    display: block;
}

.header {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    text-align: left;
}

.heading {
    margin: 0;
    margin-bottom: 8px;

    font-family: 'Google Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #00796b;
}

.subheading {
    margin: 0;

    font-family: 'Google Sans', sans-serif;
    font-size: 12px;
    white-space: pre-wrap;
    color: #5f6368;
}

.users {
    padding: 8px 0;
    margin: 0;

    list-style: none;
}

.user {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 40px;
    padding: 8px 16px;

    font-family: 'Google Sans', sans-serif;
    font-size: 14px;
    text-align: left;
    white-space: pre-wrap;
    color: var(--mdc-theme-on-surface, #000);
    cursor: pointer;
}

.user::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background-color: #000;
    opacity: 0;
    transition: opacity 15ms linear;
}

.user.available:hover::before {
    opacity: var(--mdc-ripple-hover-opacity, 0.04);
}

.user:not(.available) {
    opacity: 0.5;
    cursor: not-allowed;
}

.user.active {
    color: #00796b;
}

.user.active:hover {
    color: #fff;
}

.user.active:hover::before {
    background-color: #00796b;
    opacity: 1;
}

.user-name {
    position: relative;
}

.user.active .user-name {
    font-weight: 500;
}

.user-active {
    position: relative;
    font-size: 12px;
}
</style>
