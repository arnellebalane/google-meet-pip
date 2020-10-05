const INBOUND_INITIALIZE = 'INBOUND_INITIALIZE';

chrome.runtime.sendMessage({ type: INBOUND_INITIALIZE });
