const INBOUND_INITIALIZE = 'INBOUND_INITIALIZE';
const STATUS_SUCCESS = 'SUCCESS';
const STATUS_FAILED = 'FAILED';
const ERR_UNKNOWN_TYPE = 'ERR_UNKNOWN_TYPE';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // It seems we can't use async functions to handle message events, otherwise
  // the connection to the sender will be closed prematurely. We're wrapping
  // the actual handler inside a new Promise in order to use async/await.
  new Promise(async (resolve, reject) => {
    if (request.type === INBOUND_INITIALIZE) {
      await enablePageActionForTab(sender.tab);
      return resolve();
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
      const response = {
        status: STATUS_FAILED,
        error: errorType,
      };
      sendResponse(response);
    });

  // Since we need to wait for the promise above to get fulfilled in order to
  // send a response, we return true to indicate that we will send a response
  // at a later time.
  // https://github.com/mozilla/webextension-polyfill/issues/130
  return true;
});

function enablePageActionForTab(tab) {
  return new Promise((resolve) => {
    chrome.pageAction.show(tab.id, resolve);
  });
}
