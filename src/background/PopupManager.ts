// size of the popup

import { browser } from 'webextension-polyfill-ts';

export type openPurpose =
  | 'connect'
  | 'signDeploy'
  | 'signMessage'
  | 'importAccount'
  | 'noAccount';

const normalPopupWidth = 300;
const normalPopupHeight = 480;
const expandedPopupHeight = 820;
// Pads around popup window
const popupBuffer = {
  right: 20,
  top: 40
};
/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export default class PopupManager {
  openPopup(openFor: openPurpose) {
    browser.windows
      .getCurrent()
      .then(window => {
        let windowWidth =
          window.width === undefined || null ? normalPopupWidth : window.width;
        let xOffset = window.left === undefined || null ? 0 : window.left;
        let yOffset = window.top === undefined || null ? 0 : window.top;
        browser.windows.create({
          url:
            openFor === 'importAccount'
              ? 'index.html?#/import'
              : 'index.html?#/',
          type: 'popup',
          height:
            openFor === 'signDeploy' ? expandedPopupHeight : normalPopupHeight,
          width: normalPopupWidth,
          left: windowWidth + xOffset - normalPopupWidth - popupBuffer.right,
          top: yOffset + popupBuffer.top
        });
      })
      .catch(() => {
        let title, message;
        if (openFor === 'connect') {
          title = 'Connection Request';
          message = 'Open Signer to Approve or Reject Connection';
        } else if (openFor === 'signDeploy' || openFor === 'signMessage') {
          title = 'Signature Request';
          message = 'Open Signer to Approve or Cancel Signing';
        } else {
          throw new Error('Purpose for alert message not found!');
        }
        browser.notifications.create({
          title: title,
          iconUrl: browser.extension.getURL('logo64.png'),
          message: message,
          type: 'basic'
        });
      });
  }

  closePopup() {
    browser.windows
      .getCurrent()
      .then(window => {
        if (window.type === 'popup' && window.id !== undefined) {
          browser.windows.remove(window.id);
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error('Unable to close popup!');
      });
  }
}
