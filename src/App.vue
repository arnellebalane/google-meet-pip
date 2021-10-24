<template>
  <div v-if="state === STATE.LOADING" class="loading-screen"></div>

  <div v-if="state === STATE.SELECTION" class="selection-screen">
    <div class="header">
      <img v-bind:src="'../assets/icon-128.png'" class="logo" />
      <h1>Google Meet PiP</h1>
    </div>
    <div class="hr"></div>
    <div class="instructions">
      <p>Choose the participant to place in Picture-in-Picture window</p>
      <small>Only the participants that are visible on your screen can be selected</small>
    </div>
    <div class="hr"></div>
    <ul>
      <li
        v-for="participant in participants"
        :key="participant.id"
        v-bind:class="{ disabled: !participant.available, active: participant.active }"
        @click="handleParticipantClick(participant)"
      >
        <span class="name">{{ participant.name }}</span>

        <div v-if="!participant.active" class="enter">
          <span class="caption">click to open</span>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#00796b"
              d="M19,11H11V17H19V11M23,19V5C23,3.88 22.1,3 21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19M21,19H3V4.97H21V19Z"
            />
          </svg>
        </div>

        <div v-if="participant.active" class="exit">
          <span class="caption">click to exit</span>
        </div>
      </li>
    </ul>
  </div>

  <div v-if="state === STATE.NOT_SUPPORTED" class="not-supported-screen">
    <svg width="40" height="40" viewBox="0 0 24 24">
      <path
        fill="#c84031"
        d="M19,11H11V17H19V11M23,19V5C23,3.88 22.1,3 21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19M21,19H3V4.97H21V19Z"
      />
    </svg>
    <p>Picture-in-Picture is currently not supported by your browser</p>
  </div>

  <div v-if="state === STATE.ERROR" class="error-screen">
    <svg width="40" height="40" viewBox="0 0 24 24">
      <path
        fill="#c84031"
        d="M3.41,1.86L2,3.27L4.73,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16C16.21,18 16.39,17.92 16.55,17.82L19.73,21L21.14,19.59L12.28,10.73L3.41,1.86M5,16V8H6.73L14.73,16H5M15,8V10.61L21,16.61V6.5L17,10.5V7A1,1 0 0,0 16,6H10.39L12.39,8H15Z"
      />
    </svg>
    <p>Unable to get meeting participants</p>
    <p>Please make sure that you have joined the Google Meet meeting and try again</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { PAGE_ACTION, ERROR } from './lib/constants';
import { sendMessageToBackgroundScript } from './lib/extension-utils';

const STATE = {
  LOADING: 'LOADING',
  SELECTION: 'SELECTION',
  ERROR: 'ERROR',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
};

export default {
  setup() {
    let state = ref(STATE.LOADING);

    let participants = ref([]);
    const fetchParticipantsList = async () => {
      try {
        participants.value = await sendMessageToBackgroundScript(PAGE_ACTION.REQUEST_PARTICIPANTS_LIST);
        state.value = STATE.SELECTION;
      } catch (error) {
        if (error === ERROR.NOT_SUPPORTED) {
          state.value = STATE.NOT_SUPPORTED;
        } else {
          state.value = STATE.ERROR;
        }
      }
    };

    const handleParticipantClick = (participant) => {
      if (participant.active) {
        return exitPictureInPicture();
      } else if (participant.available) {
        return activatePictureInPicture(participant);
      }
    };

    const activatePictureInPicture = async (participant) => {
      try {
        const result = await sendMessageToBackgroundScript(PAGE_ACTION.ACTIVATE_PICTURE_IN_PICTURE, {
          participant: participant.id,
        });
        participants.value = participants.value.map((participant) =>
          participant.id === result.id ? result : { ...participant, active: false }
        );
      } catch (error) {
        console.error(error);
      }
    };

    const exitPictureInPicture = async () => {
      try {
        await sendMessageToBackgroundScript(PAGE_ACTION.EXIT_PICTURE_IN_PICTURE);
        participants.value = participants.value.map((participant) => ({ ...participant, active: false }));
      } catch (error) {
        console.error(error);
      }
    };

    onMounted(fetchParticipantsList);

    return {
      STATE,
      state,
      participants,
      handleParticipantClick,
    };
  },
};
</script>
