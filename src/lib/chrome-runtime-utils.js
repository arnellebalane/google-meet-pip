import { STATUS_SUCCESS, STATUS_FAILED } from './constants';

export function createChromeMessageHandler(handler) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // It seems we can't use async functions to handle message events, otherwise
    // the connection to the sender will be closed prematurely. We're wrapping
    // the actual handler inside a new Promise in order to use async/await.
    new Promise(async (resolve, reject) => {
      try {
        const response = await handler(message, sender);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    })
      .then((data) => {
        const response = { status: STATUS_SUCCESS };
        if (data) {
          response.data = data;
        }
        sendResponse(response);
      })
      .catch((error) => {
        const response = { status: STATUS_FAILED };
        if (error) {
          // Handle both Error objects and error strings.
          response.error = error.message || error;
        }
        sendResponse(response);
      });

    // Since we need to wait for the promise above to get fulfilled in order to
    // send a response, we return true to indicate that we will send a response
    // at a later time.
    // https://github.com/mozilla/webextension-polyfill/issues/130
    return true;
  });
}

export function sendChromeRuntimeMessage(type, data = null) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, data }, (response) => {
      switch (response.status) {
        case STATUS_SUCCESS:
          return resolve(response.data);
        case STATUS_FAILED:
          return reject(response.error);
      }
    });
  });
}
