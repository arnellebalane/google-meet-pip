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
