/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */
import log from 'electron-log';

const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

let updater;
autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
    dialog.showErrorBox(
        'Error: ',
        error == null ? 'unknown' : (error.stack || error).toString()
    );
});

autoUpdater.on('update-available', () => {
    dialog
        .showMessageBox({
            type: 'info',
            title: 'Found Updates',
            message: 'Found updates, do you want update now?',
            buttons: ['Sure', 'No'],
        })
        .then((buttonIndex) => {
            if (buttonIndex.response === 0) {
                log.info('Downloading update...');
                log.info(autoUpdater.downloadUpdate());
            } else {
                log.info('User cancel update');
                updater.enabled = true;
                updater = null;
            }
        })
        .catch((error) => {
            dialog.showErrorBox(
                'Error: ',
                error == null ? 'unknown' : (error.stack || error).toString()
            );
            log.error(error);
        });
});

autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
        title: 'No Updates',
        message: 'Current version is up-to-date.',
    });
    updater.enabled = true;
    updater = null;
});

autoUpdater.on('update-downloaded', () => {
    dialog
        .showMessageBox({
            title: 'Install Updates',
            message:
                'Updates downloaded, application will be quit for update...',
        })
        .then(() => {
            setImmediate(() => autoUpdater.quitAndInstall());
        })
        .catch((e) => {
            log.error('Error: ', 'Update downloaded but failed to install.');
            log.error('Error: ', e);
        });
});

// export this to MenuItem click callback
function checkForUpdates(menuItem, focusedWindow, event) {
    updater = menuItem;
    updater.enabled = false;
    autoUpdater.checkForUpdates();
}
export default checkForUpdates;
