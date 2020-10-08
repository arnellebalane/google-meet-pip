import { CONTENT_SCRIPT, PAGE_ACTION, ERROR } from './lib/constants';
import { onMessageChromeRuntime, sendMessageToContentScript } from './lib/extension-utils';

onMessageChromeRuntime(async (message, sender) => {
  switch (message.type) {
    case CONTENT_SCRIPT.INITIALIZE:
      return initializeExtensionForTab(sender.tab);

    case PAGE_ACTION.REQUEST_PARTICIPANTS_LIST:
    case PAGE_ACTION.ACTIVATE_PICTURE_IN_PICTURE:
    case PAGE_ACTION.EXIT_PICTURE_IN_PICTURE:
      // Messages from page action script doesn't have a sender, so we need
      // to identify the active tab in the active window ourselves.
      const activeTab = await getActiveTab();
      if (!activeTab) {
        throw new Error(ERROR.NO_ACTIVE_TAB);
      }

      const handlers = {
        [PAGE_ACTION.REQUEST_PARTICIPANTS_LIST]: () => getParticipantsList(activeTab),
        [PAGE_ACTION.ACTIVATE_PICTURE_IN_PICTURE]: () => activatePictureInPicture(activeTab, message.data),
        [PAGE_ACTION.EXIT_PICTURE_IN_PICTURE]: () => exitPictureInPicture(activeTab),
      };
      return handlers[message.type]();
  }

  throw new Error(ERROR.UNKNOWN_TYPE);
});

function initializeExtensionForTab(tab) {
  return new Promise((resolve) => {
    // We're listening for tab updates in the background script instead of the
    // content script because the latter cannot directly access the info about
    // its current tab.
    const onUpdatedListener = async (tabId, changeInfo, changedTab) => {
      const TAB_STATUS_COMPLETE = 'complete';
      if (tab.id === tabId && changedTab.status === TAB_STATUS_COMPLETE) {
        // Google Meet meeting URLs are in the format "https://meet.google.com/abc-defg-hij".
        // We want the plugin to be available only in a meeting.
        const pattern = /meet\.google\.com\/(\w+)\-(\w+)\-(\w+)/;
        if (pattern.test(changedTab.url)) {
          await enablePageActionForTab(tab);
          chrome.tabs.onUpdated.removeListener(onUpdatedListener);
          resolve();
        }
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdatedListener);
  });
}

function enablePageActionForTab(tab) {
  return new Promise((resolve) => {
    chrome.pageAction.show(tab.id, resolve);
  });
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

function getParticipantsList(tab) {
  return sendMessageToContentScript(tab.id, CONTENT_SCRIPT.REQUEST_PARTICIPANTS_LIST);
}

function activatePictureInPicture(tab, data) {
  return sendMessageToContentScript(tab.id, CONTENT_SCRIPT.ACTIVATE_PICTURE_IN_PICTURE, data);
}

function exitPictureInPicture(tab) {
  return sendMessageToContentScript(tab.id, CONTENT_SCRIPT.EXIT_PICTURE_IN_PICTURE);
}
