import './App.scss';
import { useEffect } from 'react';

import { HashRouter, Route, Routes } from 'react-router-dom';

import { ChampionsMessage } from 'api/MessageTypes/InitialMessage';
import { AutopickPreferences } from 'api/entities/AutopickPreferences';
import { Summoner } from 'api/entities/Summoner';
import {
    AUTOACCEPT_STATE,
    AUTOPICK_PREFERENCES,
    AUTOPICK_STATE,
    RAWCHAPIONS,
    SUMMONER,
} from '../common/constants';
import { useAppDispatch } from './state/hooks';
import {
    setAutoAcceptIsTurnedOn,
    setAutoPickIsTurnedOn,
    setAutopickPreferences,
    setAutoStartOnWindowsStartup,
} from './state/slices/preferencesSlice';
import BansAndPicks from './sections/BansAndPicks';
import { setChampions, setUserInfo } from './state/slices/dataSlice';
import { setConnected } from './state/slices/statusSlice';

function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const autopickPreferences: AutopickPreferences =
            window.electron.store.get(AUTOPICK_PREFERENCES);
        const autoPickIsTurnedOn = window.electron.store.get(AUTOPICK_STATE);
        const autoAcceptIsTurnedOn =
            window.electron.store.get(AUTOACCEPT_STATE);
        const windowsStartup = window.electron.ipcRenderer.sendMessage(
            'get-auto-start',
            []
        );

        dispatch(setAutopickPreferences(autopickPreferences));
        dispatch(setAutoPickIsTurnedOn(autoPickIsTurnedOn));
        dispatch(setAutoAcceptIsTurnedOn(autoAcceptIsTurnedOn));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    window.electron.ipcRenderer.on('auto-start', (event, arg) => {
        dispatch(setAutoStartOnWindowsStartup(event as boolean));
    });
    window.electron.ipcRenderer.on('connect', (event, data) => {
        dispatch(setConnected(true));
    });

    window.electron.ipcRenderer.on(SUMMONER, (event, data) => {
        dispatch(setUserInfo(event.summoner as Summoner));
    });

    window.electron.ipcRenderer.on(RAWCHAPIONS, (event, data) => {
        dispatch(setChampions((event as ChampionsMessage).champions));
    });

    window.electron.ipcRenderer.on('disconnect', (event, data) => {
        dispatch(setConnected(false));
    });

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<BansAndPicks />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
