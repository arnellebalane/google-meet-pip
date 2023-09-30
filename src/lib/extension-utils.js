import { STATUS } from './constants';

export function onMessageChromeRuntime(handler) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // It seems we can't use async functions to handle message events, otherwise
        // the connection to the sender will be closed prematurely. We're wrapping
        // the actual handler inside an IIFE in order to use async/await.
        (async () => {
            try {
                const result = await handler(message, sender);
                const response = { status: STATUS.SUCCESS };
                if (result) {
                    response.data = result;
                }
                sendResponse(response);
            } catch (error) {
                const response = { status: STATUS.FAIL };
                if (error) {
                    // Handle both Error objects and error strings.
                    response.error = error.message || error;
                }
                sendResponse(response);
            }
        })();

        // Since we need to wait for the promise above to get fulfilled in order to
        // send a response, we return true to indicate that we will send a response
        // at a later time.
        // https://github.com/mozilla/webextension-polyfill/issues/130
        return true;
    });
}

export function sendMessageToBackgroundScript(type, data = null) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, data }, (response) => {
            switch (response.status) {
                case STATUS.SUCCESS:
                    return resolve(response.data);
                case STATUS.FAIL:
                    return reject(response.error);
            }
        });
    });
}

export function sendMessageToContentScript(tabId, type, data = null) {
    return new Promise((resolve, reject) => {
        const message = { type, data };
        chrome.tabs.sendMessage(tabId, message, (response) => {
            switch (response.status) {
                case STATUS.SUCCESS:
                    return resolve(response.data);
                case STATUS.FAIL:
                    return reject(response.error);
            }
        });
    });
}
