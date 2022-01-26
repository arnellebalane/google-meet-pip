import { createApp, h } from 'vue';
import ContentScript from './ContentScript.vue';
import { CONTENT_SCRIPT } from './lib/constants';
import { sendMessageToBackgroundScript } from './lib/extension-utils';

sendMessageToBackgroundScript(CONTENT_SCRIPT.INITIALIZE);

function waitUntilJoinCall() {
  return new Promise((resolve) => {
    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        if (change.target.classList.contains('google-material-icons')) {
          for (const node of change.addedNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.data === 'call_end') {
              observer.disconnect();
              return resolve();
            }
          }
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}

function createRootElement() {
  const root = document.createElement('div');
  root.classList.add('google-meet-pip-root');
  root.style.display = 'inline-block';
  root.style.width = '40px';
  root.style.height = '40px';
  root.style.margin = '0 6px';
  root.style.verticalAlign = 'middle';

  const moreButton = [...document.querySelectorAll('.google-material-icons')].find(
    (icon) => icon.textContent === 'more_vert'
  );
  const insertPoint = moreButton.closest('div').parentElement.parentElement.parentElement;
  insertPoint.parentElement.insertBefore(root, insertPoint);

  return root;
}

(async () => {
  await waitUntilJoinCall();

  const root = createRootElement();
  const app = createApp({
    render: () => h(ContentScript),
  });
  app.mount(root);
})();

// if (document.pictureInPictureEnabled) {
//   onMessageChromeRuntime(async (message, sender) => {
//     switch (message.type) {
//       case CONTENT_SCRIPT.REQUEST_PARTICIPANTS_LIST:
//         const participants = getParticipantsList();
//         if (participants.length > 0) {
//           return participants;
//         }
//         throw new Error(ERROR.NOT_IN_MEETING);

//       case CONTENT_SCRIPT.ACTIVATE_PICTURE_IN_PICTURE:
//         const result = await activatePictureInPicture(message.data.participant);
//         if (result) {
//           return result;
//         }
//         throw new Error(ERROR.OPERATION_FAILED);

//       case CONTENT_SCRIPT.EXIT_PICTURE_IN_PICTURE:
//         return exitPictureInPicture();
//     }

//     throw new Error(ERROR.UNKNOWN_TYPE);
//   });
// }

// function getParticipantsList() {
//   const videos = [...document.querySelectorAll('video')];
//   const participants = {};
//   for (const video of videos) {
//     const name = getParticipantNameForVideo(video);
//     if (!name) {
//       continue;
//     } else if (!participants.hasOwnProperty(name)) {
//       participants[name] = [];
//     }
//     participants[name].push(video);
//   }

//   const results = [];
//   for (const name in participants) {
//     const videos = participants[name];

//     // A participant is active if they are the one currently in PiP mode.
//     const active = videos.some((video) => video.dataset.gmpipActive);

//     // A participant is available if they have a video enabled.
//     const available = videos.some(
//       (video) =>
//         /**
//          * [1] Google Meet sometimes renders a hidden video element into the
//          *     DOM. Not sure yet when this happens exactly, I suspect it's when
//          *     switching the camera on and off and vice versa.
//          * [2] When a participant's camera is off, a video is still rendered
//          *     but without any metadata or data, hence can't be played.
//          *
//          * A participant must have a live video stream in order for them to be
//          * eligible for display in a PiP window.
//          */

//         /* [1] */ video.style.display !== 'none' &&           // prettier-ignore
//         /* [2] */ video.readyState === video.HAVE_ENOUGH_DATA // prettier-ignore
//     );

//     // We assign an identifier to each participant's videos so we can easily
//     // query them later. Since the names are unique in this case (can be
//     // improved later), using the base64 of the names should be enough for now.
//     const id = btoa(name);
//     videos.forEach((video) => (video.dataset.gmpipId = id));

//     results.push({ id, name, active, available });
//   }

//   return results;
// }

// function getParticipantNameForVideo(video) {
//   // First check if this video is displayed in the main grid.
//   const ancestor = video.parentElement.parentElement;
//   let name = ancestor.querySelector('[data-self-name]');
//   if (!name) {
//     // If not, check if this video is the self video at the top-right corner.
//     const children = [...ancestor.parentElement.children];
//     name = children.find((child) => 'selfName' in child.dataset);
//   }
//   return name ? name.textContent : null;
// }

// async function promptUserToEnterPictureInPicture(participantName) {
//   return new Promise((resolve, reject) => {
//     // NOTE: TEMPORARY FIX
//     // The proper solution to this should be #17 (https://github.com/arnellebalane/google-meet-pip/issues/17)
//     // which is to move the user selection into an in-page UI instead of the
//     // extension popup UI
//     const currentPopup = document.querySelector('.google-meet-pip-popup');
//     if (currentPopup) {
//       currentPopup.remove();
//     }

//     const popup = document.createElement('div');
//     popup.classList.add('google-meet-pip-popup');
//     popup.style.padding = '24px 24px 16px 24px';
//     popup.style.borderRadius = '8px';
//     popup.style.position = 'absolute';
//     popup.style.top = '16px';
//     popup.style.left = '50%';
//     popup.style.zIndex = '10';
//     popup.style.minWidth = '480px';
//     popup.style.maxWidth = '520px';
//     popup.style.fontFamily = '"Google Sans", Roboto, Arial, sans-serif';
//     popup.style.fontSize = '16px';
//     popup.style.backgroundColor = '#fff';
//     popup.style.transform = 'translateX(-50%)';

//     const message = document.createElement('p');
//     message.textContent = `Show "${participantName}" in a Picture-in-Picture window?`;
//     message.style.margin = '0';

//     const allow = document.createElement('button');
//     allow.textContent = 'Show';
//     allow.style.padding = '8px';
//     allow.style.border = 'none';
//     allow.style.font = 'inherit';
//     allow.style.fontSize = '14px';
//     allow.style.fontWeight = '500';
//     allow.style.letterSpacing = '0.25px';
//     allow.style.color = '#1a73e8';
//     allow.style.background = 'none';
//     allow.style.cursor = 'pointer';

//     const cancel = document.createElement('button');
//     cancel.textContent = 'Cancel';
//     cancel.style.padding = '8px';
//     cancel.style.border = 'none';
//     cancel.style.font = 'inherit';
//     cancel.style.fontSize = '14px';
//     cancel.style.fontWeight = '500';
//     cancel.style.letterSpacing = '0.25px';
//     cancel.style.color = '#1a73e8';
//     cancel.style.background = 'none';
//     cancel.style.cursor = 'pointer';

//     const actions = document.createElement('div');
//     actions.style.display = 'flex';
//     actions.style.justifyContent = 'flex-end';
//     actions.style.paddingTop = '16px';

//     actions.appendChild(allow);
//     actions.appendChild(cancel);
//     popup.appendChild(message);
//     popup.appendChild(actions);
//     document.body.appendChild(popup);

//     allow.addEventListener('click', () => {
//       popup.remove();
//       resolve();
//     });

//     cancel.addEventListener('click', () => {
//       popup.remove();
//       reject('Operation cancelled.');
//     });
//   });
// }

// async function activatePictureInPicture(participant) {
//   // Find the visible video with the matching data-gmpip-id attribute and
//   // enable PiP for it.
//   const videos = [...document.querySelectorAll(`video[data-gmpip-id="${participant}"]`)];
//   const video = videos.find((video) => video.style.display !== 'none');

//   try {
//     const participantName = getParticipantNameForVideo(video);

//     // Browsers now require a user gesture to open a PiP window.
//     await promptUserToEnterPictureInPicture(participantName);
//     await video.requestPictureInPicture();

//     // Mark the video that is currently in PiP mode, so we can identify it
//     // easily when participants list is requested again and when exiting PiP.
//     video.dataset.gmpipActive = true;

//     // When the video leaves PiP mode by directly closing the PiP window,
//     // we need to unmark it as the active video.
//     video.addEventListener('leavepictureinpicture', onLeavePictureInPicture);

//     // https://web.dev/media-session/#video-conferencing-actions
//     enableVideoConferencingControls();

//     return {
//       id: participant,
//       name: participantName,
//       active: true,
//       available: true,
//     };
//   } catch (error) {
//     console.error('[google-meet-pip]', error);
//     return false;
//   }
// }

// function exitPictureInPicture() {
//   const video = document.querySelector('[data-gmpip-active]');
//   if (video) {
//     video.removeEventListener('leavepictureinpicture', onLeavePictureInPicture);
//     delete video.dataset.gmpipActive;
//   }
//   return document.exitPictureInPicture();
// }

// function onLeavePictureInPicture(event) {
//   delete event.target.dataset.gmpipActive;
//   disableVideoConferencingControls();
// }

// let disableMicrophoneControl;
// let disableCameraControl;
// let disableHangupControl;

// function enableVideoConferencingControls() {
//   if (!navigator.mediaSession) {
//     return;
//   }
//   disableMicrophoneControl = enableMicrophoneControl();
//   disableCameraControl = enableCameraControl();
//   disableHangupControl = enableHangupControl();
// }

// function disableVideoConferencingControls() {
//   if (typeof disableMicrophoneControl === 'function') {
//     disableMicrophoneControl();
//   }
//   if (typeof disableCameraControl === 'function') {
//     disableCameraControl();
//   }
//   if (typeof disableHangupControl === 'function') {
//     disableHangupControl();
//   }
// }

// function enableMicrophoneControl() {
//   const control = getMicrophoneControl();

//   navigator.mediaSession.setActionHandler('togglemicrophone', () => {
//     control.click();
//     setTimeout(() => syncMicrophoneState(control), 0);
//   });
//   syncMicrophoneState(control);

//   let observer;
//   if ('MutationObserver' in window) {
//     observer = new MutationObserver(() => syncMicrophoneState(control));
//     observer.observe(control, {
//       attributes: true,
//       attributeFilter: ['data-is-muted'],
//     });
//   }

//   return () => {
//     navigator.mediaSession.setActionHandler('togglemicrophone', null);
//     if (observer) {
//       observer.disconnect();
//     }
//   };
// }

// function getMicrophoneControl() {
//   return document.querySelectorAll(`[aria-label][data-is-muted]`)[0];
// }

// function syncMicrophoneState(control) {
//   navigator.mediaSession.setMicrophoneActive(isControlActive(control));
// }

// function enableCameraControl() {
//   const control = getCameraControl();

//   navigator.mediaSession.setActionHandler('togglecamera', () => {
//     control.click();
//     setTimeout(() => syncCameraState(control), 0);
//   });
//   syncCameraState(control);

//   let observer;
//   if ('MutationObserver' in window) {
//     observer = new MutationObserver(() => syncCameraState(control));
//     observer.observe(control, {
//       attributes: true,
//       attributeFilter: ['data-is-muted'],
//     });
//   }

//   return () => {
//     navigator.mediaSession.setActionHandler('togglecamera', null);
//     if (observer) {
//       observer.disconnect();
//     }
//   };
// }

// function getCameraControl() {
//   return document.querySelectorAll(`[aria-label][data-is-muted]`)[1];
// }

// function syncCameraState(control) {
//   if (isControlActive(control)) {
//     navigator.mediaSession.setCameraActive(true);
//   } else {
//     navigator.mediaSession.setCameraActive(false);
//     exitPictureInPicture();
//   }
// }

// function enableHangupControl() {
//   const control = getHangupControl();
//   console.log(control);

//   navigator.mediaSession.setActionHandler('hangup', () => {
//     exitPictureInPicture();
//     control.click();

//     setTimeout(() => {
//       const hangup = getHangupDialogControl();
//       hangup.click();
//     }, 500);
//   });

//   return () => {
//     navigator.mediaSession.setActionHandler('hangup', null);
//   };
// }

// function getHangupControl() {
//   const icons = [...document.querySelectorAll('.google-material-icons')];
//   return icons.find((icon) => icon.textContent === 'call_end').closest('button');
// }

// function getHangupDialogControl() {
//   const dialog = document.querySelector('[role="dialog"]');
//   return dialog.querySelector('button');
// }

// function isControlActive(control) {
//   return !JSON.parse(control.dataset.isMuted);
// }
