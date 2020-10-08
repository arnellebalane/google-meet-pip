import {
  CONTENT_SCRIPT,
  PAGE_ACTION,
  STATUS_SUCCESS,
  STATUS_FAILED,
  ERROR_UNKNOWN_TYPE,
  ERROR_NO_ACTIVE_TAB,
} from './lib/constants';
import { createChromeMessageHandler } from './lib/chrome-runtime-utils';

createChromeMessageHandler(async (message, sender) => {
  switch (message.type) {
    case CONTENT_SCRIPT.INITIALIZE:
      return initializeExtensionForTab(sender.tab);

    case PAGE_ACTION.REQUEST_PARTICIPANTS_LIST:
    case PAGE_ACTION.ACTIVATE_PICTURE_IN_PICTURE:
      // Messages from page action script doesn't have a sender, so we need
      // to identify the active tab in the active window ourselves.
      const activeTab = await getActiveTab();
      if (!activeTab) {
        throw new Error(ERROR_NO_ACTIVE_TAB);
      }

      const handlers = {
        [PAGE_ACTION.REQUEST_PARTICIPANTS_LIST]: () => getParticipantsList(activeTab),
        [PAGE_ACTION.ACTIVATE_PICTURE_IN_PICTURE]: () => activatePictureInPicture(activeTab, message.data),
      };
      return handlers[message.type]();
  }

  throw new Error(ERROR_UNKNOWN_TYPE);
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
  return new Promise((resolve, reject) => {
    const message = { type: CONTENT_SCRIPT.REQUEST_PARTICIPANTS_LIST };
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      switch (response.status) {
        case STATUS_SUCCESS:
          return resolve(response.data);
        case STATUS_FAILED:
          return reject(response.error);
      }
    });
  });
}

function activatePictureInPicture(tab, data) {
  return new Promise((resolve, reject) => {
    const message = {
      type: CONTENT_SCRIPT.ACTIVATE_PICTURE_IN_PICTURE,
      data,
    };
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      switch (response.status) {
        case STATUS_SUCCESS:
          return resolve(response.data);
        case STATUS_FAILED:
          return reject(response.error);
      }
    });
  });
}
