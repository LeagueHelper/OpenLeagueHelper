/* eslint-disable import/prefer-default-export */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

import {
    authenticate,
    createHttp1Request,
    createWebSocketConnection,
    Credentials,
    DEPRECATED_request,
    LeagueClient,
    LeagueWebSocket,
} from 'league-connect';

import fs, { createWriteStream } from 'node:fs';

import Store from 'electron-store';
import log from 'electron-log';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import {
    AUTOACCEPT_STATE,
    AUTOPICK_PREFERENCES,
    AUTOPICK_STATE,
    RAWCHAPIONS,
    SUMMONER,
} from '../common/constants';
import { Summoner } from '../api/entities/Summoner';
import Role from '../api/entities/Role';
import { AutopickPreferences } from '../api/entities/AutopickPreferences';
import LoLApi from '../api/LolApi';
import {
    ChampionsMessage,
    SummonerMessage,
} from '../api/MessageTypes/InitialMessage';
import { FrontendMessage } from '../api/MessageTypes/FrontendMessage';
import { RawChampion } from '../api/entities/RawChampion';

const store = new Store();

export const emptyAutopickPreferences: AutopickPreferences = {
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
async function getLolSummonerAsync(
    credentials: Credentials
): Promise<Summoner> {
    const summonerReq = await createHttp1Request(
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
    const championsReq = await createHttp1Request(
        {
            method: 'GET',
            url: `/lol-champions/v1/owned-champions-minimal`,
        },
        credentials
    );
    // if request fails, retry after sleeping 5 seconds
    if (championsReq.status !== 200) {
        await sleep(1000);
        const res = await getLolChampionsAsync(summoner, credentials);
        return res;
    }
    const aux = (await championsReq.json()) as Record<string, any>[];
    for (const champion of aux) {
        delete champion.skins;
    }
    return aux as RawChampion[];
}

async function mkdirp(dir: string) {
    if (fs.existsSync(dir)) {
        return true;
    }
    const dirname = path.dirname(dir);
    mkdirp(dirname);
    return fs.mkdirSync(dir);
}
const streamPipeline = promisify(pipeline);

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
            const imageReq = await DEPRECATED_request(
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

let ws: LeagueWebSocket | null = null;

export async function startLoLApi(mainWindow: BrowserWindow): Promise<LoLApi> {
    try {
        const credentials = await authenticate({ awaitConnection: true });
        console.log(credentials);
        await sleep(5000);
        const client = new LeagueClient(credentials);

        const summonerReq = await createHttp1Request(
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
        // Manage champions
        let champions: RawChampion[] = ((await store.get(RAWCHAPIONS)) ||
            []) as RawChampion[];
        champions = await getLolChampionsAsync(summoner, credentials);
        store.set(RAWCHAPIONS, champions);

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

        const API = new LoLApi(
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
        ws = await createWebSocketConnection({
            authenticationOptions: {},
            pollInterval: 1000,
        });
        ws.on('message', (message) => {
            console.log(message.toString());
            API.handleWebSocket(message.toString());
        });

        // Basically we send connect because we found the LoLClient
        // Then we send Summoner and Champions separately
        mainWindow?.webContents.send('connect', {});
        mainWindow?.webContents.send(SUMMONER, summonerSend);
        mainWindow?.webContents.send(RAWCHAPIONS, championsSend);
        client.on('connect', async (newCredentials: Credentials) => {
            // newCredentials: Each time the Client is started, new credentials are made
            // this variable contains the new credentials.
            // We need to update the API with the new credentials
            ws?.close();
            API.setCredentials(newCredentials);
            console.log('restarting web socket');
            await sleep(15000);
            ws = await createWebSocketConnection({
                authenticationOptions: {},
                pollInterval: 1000,
            });
            ws.on('message', (message) => {
                console.log(message.toString());
                API.handleWebSocket(message.toString());
            });

            mainWindow?.webContents.send('connect', {});
            log.info('LOL Client connected, credentials updated');
        });

        client.on('disconnect', () => {
            mainWindow?.webContents.send('disconnect', {});
            log.info('LOL Client disconnected');
        });

        client.start(); // Start listening for process updates
        return API;
    } catch (error) {
        log.error(error);
        // re try startLoLApi after 5 seconds
        log.info('retying to start LoLApi');
        await sleep(5000);
        return startLoLApi(mainWindow);
    }
}

export function checkPreferences(pref: any) {
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
