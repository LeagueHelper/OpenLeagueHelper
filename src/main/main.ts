/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
    app,
    BrowserWindow,
    shell,
    ipcMain,
    protocol,
    Menu,
    dialog,
    Tray,
} from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import unhandled from 'electron-unhandled';
import {
    authenticate,
    request,
    connect,
    LeagueClient,
    Credentials,
} from 'league-connect';
import { FrontendMessage } from 'api/MessageTypes/FrontendMessage';
import { RawChampion } from 'api/entities/RawChampion';
import { Summoner } from 'api/entities/Summoner';
import {
    ChampionsMessage,
    SummonerMessage,
} from 'api/MessageTypes/InitialMessage';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { createWriteStream } from 'node:fs';
import fs from 'fs';
import { AutopickPreferences } from 'api/entities/AutopickPreferences';
import AutoLaunch from 'easy-auto-launch';
import { checkForUpdates } from './updater';
import {
    AUTOACCEPT_STATE,
    AUTOPICK_PREFERENCES,
    AUTOPICK_STATE,
    GET_AUTO_START,
    RAWCHAPIONS,
    SET_AUTO_START,
    SUMMONER,
} from '../common/constants';
import LoLApi from '../api/LolApi';
import { resolveHtmlPath } from './util';
import Role from '../api/entities/Role';

const gotTheLock = app.requestSingleInstanceLock();
let tray: Tray | null = null;
let isQuitting = false;

let mainWindow: BrowserWindow | null = null;

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

const streamPipeline = promisify(pipeline);
const autoLauncher = new AutoLaunch({
    name: 'LoL Auto Picker',
});

const emptyAutopickPreferences: AutopickPreferences = {
    [Role.Top]: {
        picks: [],
        bans: [],
    },
    [Role.Jungle]: {
        picks: [],
        bans: [],
    },
    [Role.Mid]: {
        picks: [],
        bans: [],
    },
    [Role.Bot]: {
        picks: [],
        bans: [],
    },
    [Role.Support]: {
        picks: [],
        bans: [],
    },
};

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let API: LoLApi;

const store = new Store();

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
    require('electron-debug')();
}

unhandled({
    logger: () => {
        console.error();
    },
    showDialog: true,
    reportButton: () => {
        log.info('Report Button Initialized');
    },
});

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
        .default(
            extensions.map((name) => installer[name]),
            forceDownload
        )
        .catch(log.info);
};

async function getLolSummonerAsync(
    credentials: Credentials
): Promise<Summoner> {
    const summonerReq = await request(
        {
            method: 'GET',
            url: '/lol-summoner/v1/current-summoner',
        },
        credentials
    );
    // if request fails, retry after sleeping 5 seconds
    if (summonerReq.status !== 200) {
        await sleep(1000);
        const sum = await getLolSummonerAsync(credentials);
        return sum;
    }
    return (await summonerReq.json()) as Summoner;
}

async function getLolChampionsAsync(
    summoner: Summoner,
    credentials: Credentials
): Promise<RawChampion[]> {
    const championsReq = await request(
        {
            method: 'GET',
            url: `/lol-champions/v1/inventories/${summoner.summonerId}/champions`,
        },
        credentials
    );
    // if request fails, retry after sleeping 5 seconds
    if (championsReq.status !== 200) {
        await sleep(1000);
        const res = await getLolChampionsAsync(summoner, credentials);
        return res;
    }
    return (await championsReq.json()) as RawChampion[];
}

async function mkdirp(dir: string) {
    if (fs.existsSync(dir)) {
        return true;
    }
    const dirname = path.dirname(dir);
    mkdirp(dirname);
    return fs.mkdirSync(dir);
}

async function getAndCacheImages(
    credentials: Credentials,
    champions: RawChampion[]
): Promise<void> {
    // for of loop
    for (const champion of champions) {
        // if the file already exists, continue
        if (
            !fs.existsSync(
                path.join(
                    app.getPath('userData'),
                    'assets',
                    'champion-icons',
                    `./${champion.id}.png`
                )
            )
        ) {
            const imageReq = await request(
                {
                    method: 'GET',

                    url: `/lol-game-data/assets/v1/champion-icons/${champion.id}.png`,
                },
                credentials
            );
            mkdirp(
                path.join(app.getPath('userData'), 'assets', 'champion-icons')
            );
            const pathImg = path.join(
                app.getPath('userData'),
                'assets',
                'champion-icons',
                `./${champion.id}.png`
            );
            await streamPipeline(imageReq.body, createWriteStream(pathImg));
        }
    }
}

async function startLoLApi() {
    try {
        const credentials = await authenticate({ awaitConnection: true });
        await sleep(5000);
        const client = new LeagueClient(credentials);

        const summonerReq = await request(
            {
                method: 'GET',
                url: '/lol-summoner/v1/current-summoner',
            },
            credentials
        );
        let summoner: Summoner;
        if (summonerReq.status === 200) {
            summoner = await summonerReq.json();
            store.set(SUMMONER, summoner);
        } else {
            await sleep(1000);
            summoner = await getLolSummonerAsync(credentials);
        }

        const championsReq = await request(
            {
                method: 'GET',
                url: `/lol-champions/v1/inventories/${summoner.summonerId}/champions`,
            },
            credentials
        );
        let champions: RawChampion[] = ((await store.get(RAWCHAPIONS)) ||
            []) as RawChampion[];
        if (championsReq.status === 200) {
            champions = await championsReq.json();
            store.set(RAWCHAPIONS, champions);
        } else {
            await sleep(10000);
            champions = await getLolChampionsAsync(summoner, credentials);
        }
        getAndCacheImages(credentials, champions);
        const autopickPreferences: AutopickPreferences =
            ((await store.get(AUTOPICK_PREFERENCES)) as AutopickPreferences) ||
            emptyAutopickPreferences;
        console.log(autopickPreferences);
        const sendFunction = (eventName: string, message: FrontendMessage) => {
            mainWindow?.webContents.send(eventName, message);
        };

        const autoPickIsTurnedOn = store.get(AUTOPICK_STATE) as boolean;
        const autoAcceptIsTurnedOn = store.get(AUTOACCEPT_STATE) as boolean;

        API = new LoLApi(
            credentials,
            summoner,
            autopickPreferences,
            autoPickIsTurnedOn,
            autoAcceptIsTurnedOn,
            champions,
            sendFunction
        );

        const summonerSend: SummonerMessage = {
            success: true,
            summoner,
        };
        const championsSend: ChampionsMessage = {
            success: champions.length !== 0,
            champions,
        };

        // Basically we send connect because we found the LoLClient
        // Then we send Summoner and Champions separately
        mainWindow?.webContents.send('connect', {});
        mainWindow?.webContents.send(SUMMONER, summonerSend);
        mainWindow?.webContents.send(RAWCHAPIONS, championsSend);

        const ws = await connect(credentials);

        ws.on('message', (message) => {
            if (typeof message === 'string') {
                API.handleWebSocket(message);
            }
        });

        client.on('connect', (newCredentials) => {
            // newCredentials: Each time the Client is started, new credentials are made
            // this variable contains the new credentials.
            // We need to update the API with the new credentials
            API.setCredentials(newCredentials);
            mainWindow?.webContents.send('connect', {});
            log.info('RECONECTADOOO');
        });

        client.on('disconnect', () => {
            mainWindow?.webContents.send('disconnect', {});
            log.info('disconnected');
        });

        client.start(); // Start listening for process updates
    } catch (error) {
        log.error(error);
        // re try startLoLApi after 5 seconds
        log.info('retying to start LoLApi');
        await sleep(5000);
        startLoLApi();
    }
}

function createTray(icon: string) {
    const appIcon = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show',
            click() {
                mainWindow?.show();
            },
        },
        {
            label: 'Reload',
            click() {
                app.relaunch();
                app.quit();
            },
        },
        {
            label: 'Exit',
            click() {
                isQuitting = true;
                app.quit();
            },
        },
    ]);

    appIcon.on('click', function (event) {
        mainWindow?.show();
    });
    appIcon.setToolTip('Open League Helper');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
}

const createWindow = async () => {
    if (isDebug) {
        await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'assets')
        : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1280,
        height: 720,
        minHeight: 720,
        minWidth: 1280,
        frame: false,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            preload: app.isPackaged
                ? path.join(__dirname, 'preload.js')
                : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', async () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        tray = createTray(getAssetPath('icon.png'));

        // I want to show the windows before connection to league of legends is done
        // thats why the following code block is after this one
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
        mainWindow?.webContents.send(SUMMONER, {
            success: true,
            summoner: await store.get(SUMMONER),
        });
        mainWindow?.webContents.send(RAWCHAPIONS, {
            success: true,
            champions: await store.get(RAWCHAPIONS),
        });
        await startLoLApi();
    });

    app.on('before-quit', () => {
        isQuitting = true;
    });

    mainWindow.on('close', (event: Event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function checkPreferences(pref: any) {
    // This functions checks that the preferences have a valid structure
    // If not, it returns false
    if (!pref[Role.Top]) {
        return false;
    }
    if (!pref[Role.Top].picks) {
        return false;
    }
    if (!pref[Role.Top].bans) {
        return false;
    }

    if (!pref[Role.Jungle]) {
        return false;
    }
    if (!pref[Role.Jungle].picks) {
        return false;
    }
    if (!pref[Role.Jungle].bans) {
        return false;
    }
    if (!pref[Role.Mid]) {
        return false;
    }
    if (!pref[Role.Mid].picks) {
        return false;
    }
    if (!pref[Role.Mid].bans) {
        return false;
    }
    if (!pref[Role.Bot]) {
        return false;
    }
    if (!pref[Role.Bot].picks) {
        return false;
    }
    if (!pref[Role.Bot].bans) {
        return false;
    }
    if (!pref[Role.Support]) {
        return false;
    }
    if (!pref[Role.Support].picks) {
        return false;
    }
    if (!pref[Role.Support].bans) {
        return false;
    }
    return true;
}

app.whenReady()
    .then(() => {
        const template = [
            {
                label: 'Update',
                submenu: [
                    {
                        label: 'Check for updates',
                        click: (a, b, c) => {
                            checkForUpdates(a, b, c);
                        },
                    },
                ],
            },
            {
                label: 'Developer',
                submenu: [
                    {
                        label: 'Toggle DevTools',
                        accelerator: 'CmdOrCtrl+Shift+I',
                        click: (item, focusedWindow) => {
                            if (focusedWindow) {
                                focusedWindow.toggleDevTools();
                            }
                        },
                    },
                ],
            },
        ];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
        protocol.registerFileProtocol('championimage', (requestPath, cb) => {
            const url = requestPath.url.replace('championimage://', '');
            try {
                // eslint-disable-next-line promise/no-callback-in-promise
                return cb(
                    `${app.getPath('userData')}/assets/champion-icons/${url}`
                );
            } catch (error) {
                console.error(
                    'ERROR: registerLocalResourceProtocol: Could not get file path:',
                    error
                );
                return 0;
            }
        });
        const autopickPreferences = store.get(AUTOPICK_PREFERENCES);
        const autopickStatus = store.get(AUTOPICK_STATE);
        const autoacceptStatus = store.get(AUTOACCEPT_STATE);
        if (autopickPreferences === undefined)
            store.set(AUTOPICK_PREFERENCES, emptyAutopickPreferences);
        else if (!checkPreferences(autopickPreferences)) {
            dialog.showMessageBox({
                type: 'info',
                message: 'Invalid Preferences',
                detail: 'Your preferences will be reset, please set them again',
                title: 'Invalid Preferences',
            });
            store.set(AUTOPICK_PREFERENCES, emptyAutopickPreferences);
        }
        if (autopickStatus === undefined) store.set(AUTOPICK_STATE, false);
        if (autoacceptStatus === undefined) store.set(AUTOACCEPT_STATE, false);
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) createWindow();
        });
        createWindow();
    })
    .catch(log.info);

ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (_event, key, val) => {
    if (API) {
        switch (key) {
            case AUTOPICK_PREFERENCES:
                API.setPreferences(val);
                break;
            case AUTOPICK_STATE:
                API.switchAutoPick(val);
                break;
            case AUTOACCEPT_STATE:
                API.switchAutoAccept(val);
                break;
            default:
                break;
        }
    }
    log.info(key, val);
    store.set(key, val);
});
ipcMain.on('electron-store-clear', async () => {
    store.clear();
    log.info('CLEARED');
});

ipcMain.on(SET_AUTO_START, async (_event, val) => {
    if (app.isPackaged) {
        if (val) {
            autoLauncher.enable();
            log.info('Auto start enabled');
        } else {
            autoLauncher.disable();
            log.info('Auto start disabled');
        }
    }
});
ipcMain.on(GET_AUTO_START, async (_event) => {
    const autoStart = await autoLauncher.isEnabled();
    log.info('------------------------------>', autoStart);
    log.info('Auto start:', autoStart);
    mainWindow?.webContents.send('auto-start', autoStart);
});

ipcMain.on('app-minimize', () => {
    mainWindow?.minimize();
});
ipcMain.on('app-maximize', () => {
    mainWindow?.maximize();
});
ipcMain.on('app-close', () => {
    mainWindow?.close();
});
