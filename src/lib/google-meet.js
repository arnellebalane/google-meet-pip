export function getParticipantsList() {
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
  const ancestor = video.parentElement.parentElement.parentElement;
  const name = ancestor.querySelector('[data-self-name]');
  return name ? name.textContent : null;
}

export async function activatePictureInPicture(participant) {
  // Find the visible video with the matching data-gmpip-id attribute and
  // enable PiP for it.
  const videos = [...document.querySelectorAll(`video[data-gmpip-id="${participant.id}"]`)];
  const video = videos.find((video) => video.style.display !== 'none');

  try {
    await video.requestPictureInPicture();

    // Mark the video that is currently in PiP mode, so we can identify it
    // easily when participants list is requested again and when exiting PiP.
    video.dataset.gmpipActive = true;

    // When the video leaves PiP mode by directly closing the PiP window,
    // we need to unmark it as the active video.
    video.addEventListener('leavepictureinpicture', onLeavePictureInPicture);

    // https://web.dev/media-session/#video-conferencing-actions
    enableVideoConferencingControls();

    return { ...participant, active: true };
  } catch (error) {
    console.error('[google-meet-pip]', error);
    return false;
  }
}

export async function exitPictureInPicture() {
  const video = document.querySelector('[data-gmpip-active]');
  if (video) {
    video.removeEventListener('leavepictureinpicture', onLeavePictureInPicture);
    delete video.dataset.gmpipActive;
  }
  return document.exitPictureInPicture();
}

function onLeavePictureInPicture(event) {
  delete event.target.dataset.gmpipActive;
  disableVideoConferencingControls();
}

let disableMicrophoneControl;
let disableCameraControl;
let disableHangupControl;

function enableVideoConferencingControls() {
  if (!navigator.mediaSession) {
    return;
  }
  disableMicrophoneControl = enableMicrophoneControl();
  disableCameraControl = enableCameraControl();
  disableHangupControl = enableHangupControl();
}

function disableVideoConferencingControls() {
  if (typeof disableMicrophoneControl === 'function') {
    disableMicrophoneControl();
  }
  if (typeof disableCameraControl === 'function') {
    disableCameraControl();
  }
  if (typeof disableHangupControl === 'function') {
    disableHangupControl();
  }
}

function enableMicrophoneControl() {
  const control = getMicrophoneControl();

  navigator.mediaSession.setActionHandler('togglemicrophone', () => {
    control.click();
    setTimeout(() => syncMicrophoneState(control), 0);
  });
  syncMicrophoneState(control);

  let observer;
  if ('MutationObserver' in window) {
    observer = new MutationObserver(() => syncMicrophoneState(control));
    observer.observe(control, {
      attributes: true,
      attributeFilter: ['data-is-muted'],
    });
  }

  return () => {
    navigator.mediaSession.setActionHandler('togglemicrophone', null);
    if (observer) {
      observer.disconnect();
    }
  };
}

function getMicrophoneControl() {
  return document.querySelectorAll(`[aria-label][data-is-muted]`)[0];
}

function syncMicrophoneState(control) {
  navigator.mediaSession.setMicrophoneActive(isControlActive(control));
}

function enableCameraControl() {
  const control = getCameraControl();

  navigator.mediaSession.setActionHandler('togglecamera', () => {
    control.click();
    setTimeout(() => syncCameraState(control), 0);
  });
  syncCameraState(control);

  let observer;
  if ('MutationObserver' in window) {
    observer = new MutationObserver(() => syncCameraState(control));
    observer.observe(control, {
      attributes: true,
      attributeFilter: ['data-is-muted'],
    });
  }

  return () => {
    navigator.mediaSession.setActionHandler('togglecamera', null);
    if (observer) {
      observer.disconnect();
    }
  };
}

function getCameraControl() {
  return document.querySelectorAll(`[aria-label][data-is-muted]`)[1];
}

function syncCameraState(control) {
  if (isControlActive(control)) {
    navigator.mediaSession.setCameraActive(true);
  } else {
    navigator.mediaSession.setCameraActive(false);
    exitPictureInPicture();
  }
}

function enableHangupControl() {
  const control = getHangupControl();

  navigator.mediaSession.setActionHandler('hangup', () => {
    exitPictureInPicture();
    control.click();

    setTimeout(() => {
      const hangup = getHangupDialogControl();
      hangup.click();
    }, 500);
  });

  return () => {
    navigator.mediaSession.setActionHandler('hangup', null);
  };
}

function getHangupControl() {
  const icons = [...document.querySelectorAll('.google-material-icons')];
  return icons.find((icon) => icon.textContent === 'call_end').closest('button');
}

function getHangupDialogControl() {
  const dialog = document.querySelector('[role="dialog"]');
  return dialog.querySelector('button');
}

function isControlActive(control) {
  return !JSON.parse(control.dataset.isMuted);
}
