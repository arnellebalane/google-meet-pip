import { CONTENT_SCRIPT, ERROR } from './lib/constants';
import { onMessageChromeRuntime, sendMessageToBackgroundScript } from './lib/extension-utils';

sendMessageToBackgroundScript(CONTENT_SCRIPT.PICTURE_IN_PICTURE_SUPPORT, {
  supported: Boolean(document.pictureInPictureEnabled),
});
sendMessageToBackgroundScript(CONTENT_SCRIPT.INITIALIZE);

if (document.pictureInPictureEnabled) {
  onMessageChromeRuntime(async (message, sender) => {
    switch (message.type) {
      case CONTENT_SCRIPT.REQUEST_PARTICIPANTS_LIST:
        const participants = getParticipantsList();
        if (participants.length > 0) {
          return participants;
        }
        throw new Error(ERROR.NOT_IN_MEETING);

      case CONTENT_SCRIPT.ACTIVATE_PICTURE_IN_PICTURE:
        const result = await activatePictureInPicture(message.data.participant);
        if (result) {
          return result;
        }
        throw new Error(ERROR.OPERATION_FAILED);

      case CONTENT_SCRIPT.EXIT_PICTURE_IN_PICTURE:
        return exitPictureInPicture();
    }

    throw new Error(ERROR.UNKNOWN_TYPE);
  });
}

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

    // A participant is active if they are the one currently in PiP mode.
    const active = videos.some((video) => video.dataset.gmpipActive);

    // A participant is available if they have a video enabled.
    const available = videos.some(
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

    // We assign an identifier to each participant's videos so we can easily
    // query them later. Since the names are unique in this case (can be
    // improved later), using the base64 of the names should be enough for now.
    const id = btoa(name);
    videos.forEach((video) => (video.dataset.gmpipId = id));

    results.push({ id, name, active, available });
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

async function activatePictureInPicture(participant) {
  // Find the visible video with the matching data-gmpip-id attribute and
  // enable PiP for it.
  const videos = [...document.querySelectorAll(`video[data-gmpip-id="${participant}"]`)];
  const video = videos.find((video) => video.style.display !== 'none');

  try {
    await video.requestPictureInPicture();

    // Mark the video that is currently in PiP mode, so we can identify it
    // easily when participants list is requested again and when exiting PiP.
    video.dataset.gmpipActive = true;

    // When the video leaves PiP mode by directly closing the PiP window,
    // we need to unmark it as the active video.
    video.addEventListener('leavepictureinpicture', onLeavePictureInPicture);

    return {
      id: participant,
      name: getParticipantNameForVideo(video),
      active: true,
      available: true,
    };
  } catch (error) {
    console.error('[google-meet-pip]', error);
    return false;
  }
}

function exitPictureInPicture() {
  const video = document.querySelector('[data-gmpip-active]');
  if (video) {
    video.removeEventListener('leavepictureinpicture', onLeavePictureInPicture);
    delete video.dataset.gmpipActive;
  }
  return document.exitPictureInPicture();
}

function onLeavePictureInPicture(event) {
  delete event.target.dataset.gmpipActive;
}
