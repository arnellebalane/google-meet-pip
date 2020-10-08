import { CONTENT_SCRIPT, ERROR } from './lib/constants';
import { createChromeMessageHandler, sendChromeRuntimeMessage } from './lib/extension-utils';

createChromeMessageHandler(async (message, sender) => {
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
  }
  throw new Error(ERROR.UNKNOWN_TYPE);
});

sendChromeRuntimeMessage(CONTENT_SCRIPT.INITIALIZE);

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

    // We assign an identifier to each participant's videos so we can easily
    // query them later on. Since the names are unique in this case (can be
    // improved later), using the base64 of the names should be enough.
    const id = btoa(name);
    videos.forEach((video) => (video.dataset.gmpipId = id));

    results.push({ id, name, active });
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
  // enable Picture-in-Picture for it.
  const videos = [...document.querySelectorAll(`video[data-gmpip-id="${participant}"]`)];
  const video = videos.find((video) => video.style.display !== 'none');
  try {
    await video.requestPictureInPicture();
    return {
      id: participant,
      name: getParticipantNameForVideo(video),
    };
  } catch (error) {
    console.error('[google-meet-pip]', error);
    return false;
  }
}
