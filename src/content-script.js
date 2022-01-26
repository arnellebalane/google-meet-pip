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
