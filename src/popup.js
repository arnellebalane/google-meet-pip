import { PAGE_ACTION } from './lib/constants';
import './popup.css';

chrome.runtime.sendMessage({ type: PAGE_ACTION.REQUEST_PARTICIPANTS_LIST }, (response) => {
  console.log(response);
});
