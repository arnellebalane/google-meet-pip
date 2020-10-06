const CONTENT_SCRIPT = {
  INITIALIZE: 'CONTENT_SCRIPT_INITIALIZE',
  REQUEST_PARTICIPANTS_LIST: 'CONTENT_SCRIPT_REQUEST_PARTICIPANTS_LIST',
};

const STATUS_SUCCESS = 'SUCCESS';
const STATUS_FAILED = 'FAILED';

const ERROR_UNKNOWN_TYPE = 'ERROR_UNKNOWN_TYPE';
const ERROR_NOT_IN_MEETING = 'ERROR_NOT_IN_MEETING';

chrome.runtime.sendMessage({ type: CONTENT_SCRIPT.INITIALIZE });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // It seems we can't use async functions to handle message events, otherwise
  // the connection to the sender will be closed prematurely. We're wrapping
  // the actual handler inside a new Promise in order to use async/await.
  new Promise(async (resolve, reject) => {
    switch (message.type) {
      case CONTENT_SCRIPT.REQUEST_PARTICIPANTS_LIST:
        const participants = getParticipantsList();
        if (participants.length > 0) {
          return resolve(participants);
        }
        return reject(ERROR_NOT_IN_MEETING);
    }

    reject(ERROR_UNKNOWN_TYPE);
  })
    .then((data) => {
      const response = { status: STATUS_SUCCESS };
      if (data) {
        response.data = data;
      }
      sendResponse(response);
    })
    .catch((errorType) => {
      const response = { status: STATUS_FAILED };
      if (errorType) {
        response.error = errorType;
      }
      sendResponse(response);
    });

  // Since we need to wait for the promise above to get fulfilled in order to
  // send a response, we return true to indicate that we will send a response
  // at a later time.
  // https://github.com/mozilla/webextension-polyfill/issues/130
  return true;
});

function getParticipantsList() {
  const videos = [...document.querySelectorAll('video')];
  const participants = {};
  for (const video of videos) {
    const name = getParticipantNameForVideo(video);
    if (!name) {
      continue;
    } else if (!participants.hasOwnProperty(name)) {
      participants[name] = [];
    }
    participants[name].push(video);
  }

  const results = [];
  for (const name in participants) {
    const videos = participants[name];
    const active = videos.some(
      (video) =>
        /**
         * [1] Google Meet sometimes renders a hidden video element into the
         *     DOM. Not sure yet when this happens exactly, I suspect it's when
         *     switching the camera on and off and vice versa.
         * [2] When a participant's camera is off, a video is still rendered
         *     but without any metadata or data, hence can't be played.
         *
         * A participant must have a live video stream in order for them to be
         * eligible for display in a PiP window.
         */

        /* [1] */ video.style.display !== 'none' &&           // prettier-ignore
        /* [2] */ video.readyState === video.HAVE_ENOUGH_DATA // prettier-ignore
    );

    results.push({ name, active });
  }

  return results;
}

function getParticipantNameForVideo(video) {
  // First check if this video is displayed in the main grid.
  const ancestor = video.parentElement.parentElement;
  let name = ancestor.querySelector('[data-self-name]');
  if (!name) {
    // If not, check if this video is the self video at the top-right corner.
    const children = [...ancestor.parentElement.children];
    name = children.find((child) => 'selfName' in child.dataset);
  }
  return name ? name.textContent : null;
}
