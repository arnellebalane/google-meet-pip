<template>
  <div v-if="state === STATE.LOADING" class="loading-screen"></div>

  <div v-if="state === STATE.SELECTION" class="selection-screen">
    <ul>
      <li v-for="participant in participants" :key="participant.name">
        {{ participant.name }}
      </li>
    </ul>
  </div>

  <div v-if="state === STATE.ERROR" class="error-screen">
    <h1>Error!</h1>
  </div>
</template>

<script>
import { PAGE_ACTION, STATUS_SUCCESS, STATUS_FAILED } from './lib/constants';

const STATE = {
  LOADING: 'LOADING',
  SELECTION: 'SELECTION',
  ERROR: 'ERROR',
};

export default {
  data() {
    return {
      STATE,
      state: STATE.LOADING,
      participants: null,
      error: null,
    };
  },

  async mounted() {
    await this.fetchParticipantsList();
  },

  methods: {
    async fetchParticipantsList() {
      return new Promise(async (resolve) => {
        chrome.runtime.sendMessage({ type: PAGE_ACTION.REQUEST_PARTICIPANTS_LIST }, (response) => {
          if (response.status === STATUS_SUCCESS) {
            this.participants = response.data;
            this.state = STATE.SELECTION;
          } else if (response.status === STATUS_FAILED) {
            this.error = response.error;
            this.state = STATE.ERROR;
          }
          resolve();
        });
      });
    },
  },
};
</script>
