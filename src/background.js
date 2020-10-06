const CONTENT_SCRIPT = {
  INITIALIZE: 'CONTENT_SCRIPT_INITIALIZE',
  REQUEST_PARTICIPANTS_LIST: 'CONTENT_SCRIPT_REQUEST_PARTICIPANTS_LIST',
};
const PAGE_ACTION = {
  REQUEST_PARTICIPANTS_LIST: 'PAGE_ACTION_REQUEST_PARTICIPANTS_LIST',
};

const STATUS_SUCCESS = 'SUCCESS';
const STATUS_FAILED = 'FAILED';
const ERROR_UNKNOWN_TYPE = 'ERROR_UNKNOWN_TYPE';
const ERROR_NO_ACTIVE_TAB = 'ERROR_NO_ACTIVE_TAB';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // It seems we can't use async functions to handle message events, otherwise
  // the connection to the sender will be closed prematurely. We're wrapping
  // the actual handler inside a new Promise in order to use async/await.
  new Promise(async (resolve, reject) => {
    switch (request.type) {
      case CONTENT_SCRIPT.INITIALIZE:
        return initializeExtensionForTab(sender.tab).then(resolve);
      case PAGE_ACTION.REQUEST_PARTICIPANTS_LIST:
        // Messages from page action script doesn't have a sender, so we need
        // to identify the active tab in the active window ourselves.
        const activeTab = await getActiveTab();
        if (!activeTab) {
          return reject(ERROR_NO_ACTIVE_TAB);
        }
        return getParticipantsList(activeTab).then(resolve, reject);
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

        // TODO: We additionally need to check if the user has already joined
        // the meeting, since the URL is going to be the same when they already
        // joined and when they are still about to join the meeting. But this
        // check can be done when the extension is activated by clicking on the
        // page action icon.
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
