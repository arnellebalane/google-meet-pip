import { CONTENT_SCRIPT, ERROR_UNKNOWN_TYPE, ERROR_NOT_IN_MEETING } from './lib/constants';
import { createChromeMessageHandler } from './lib/chrome-message-handler';

createChromeMessageHandler(async (message, sender) => {
  switch (message.type) {
    case CONTENT_SCRIPT.REQUEST_PARTICIPANTS_LIST:
      const participants = getParticipantsList();
      if (participants.length > 0) {
        return participants;
      }
      throw new Error(ERROR_NOT_IN_MEETING);
  }
  throw new Error(ERROR_UNKNOWN_TYPE);
});

chrome.runtime.sendMessage({ type: CONTENT_SCRIPT.INITIALIZE });

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
