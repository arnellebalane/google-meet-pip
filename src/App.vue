<template>
  <div v-if="state === STATE.LOADING" class="loading-screen"></div>

  <div v-if="state === STATE.SELECTION" class="selection-screen">
    <p>Choose the participant to place in Picture-in-Picture window</p>
    <small>Only the participants that are visible on your screen can be selected</small>
    <ul>
      <li
        v-for="participant in participants"
        :key="participant.name"
        :class="{ disabled: !participant.active }"
        @click="activatePictureInPicture(participant)"
      >
        {{ participant.name }}
      </li>
    </ul>
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
import { PAGE_ACTION } from './lib/constants';
import { sendChromeRuntimeMessage } from './lib/extension-utils';

const STATE = {
  LOADING: 'LOADING',
  SELECTION: 'SELECTION',
  ERROR: 'ERROR',
};

export default {
  setup() {
    let state = ref(STATE.LOADING);

    let participants = ref([]);
    const fetchParticipantsList = async () => {
      try {
        participants.value = await sendChromeRuntimeMessage(PAGE_ACTION.REQUEST_PARTICIPANTS_LIST);
        state.value = STATE.SELECTION;
      } catch (error) {
        state.value = STATE.ERROR;
      }
    };

    const activatePictureInPicture = async (participant) => {
      if (participant.active) {
        try {
          await sendChromeRuntimeMessage(PAGE_ACTION.ACTIVATE_PICTURE_IN_PICTURE, { participant: participant.id });
        } catch (error) {
          console.error(error);
        }
      }
    };

    onMounted(fetchParticipantsList);

    return {
      STATE,
      state,
      participants,
      activatePictureInPicture,
    };
  },
};
</script>
