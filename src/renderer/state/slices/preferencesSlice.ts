import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AutopickPreferences } from 'api/entities/AutopickPreferences';
import Role from 'api/entities/Role';
import {
    AUTOPICK_PREFERENCES,
    AUTOPICK_STATE,
    AUTOACCEPT_STATE,
    SET_AUTO_START,
} from 'common/constants';

// Define a type for the slice state
export interface PreferencesState {
    autopickPreferences: AutopickPreferences;
    autoAcceptIsTurnedOn: boolean;
    autoPickIsTurnedOn: boolean;
    selectedRole: Role;
    autoStartOnWindowsStartup: boolean;
}

// Define the initial state using that type
const initialState: PreferencesState = {
    autopickPreferences: {
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
    },
    autoAcceptIsTurnedOn: false,
    autoPickIsTurnedOn: false,
    selectedRole: Role.Top,
    autoStartOnWindowsStartup: true,
} as PreferencesState;

const reducer = {
    setAutopickPreferences: (
        state: PreferencesState,
        action: PayloadAction<AutopickPreferences>
    ) => {
        state.autopickPreferences = action.payload;
        window.electron.store.set(AUTOPICK_PREFERENCES, action.payload);
    },
    setAutoAcceptIsTurnedOn: (
        state: PreferencesState,
        action: PayloadAction<boolean>
    ) => {
        state.autoAcceptIsTurnedOn = action.payload;
        window.electron.store.set(AUTOACCEPT_STATE, action.payload);
    },
    setAutoPickIsTurnedOn: (
        state: PreferencesState,
        action: PayloadAction<boolean>
    ) => {
        state.autoPickIsTurnedOn = action.payload;
        window.electron.store.set(AUTOPICK_STATE, action.payload);
    },
    setSelectedRole: (state: PreferencesState, action: PayloadAction<Role>) => {
        state.selectedRole = action.payload;
    },
    setAutoStartOnWindowsStartup: (
        state: PreferencesState,
        action: PayloadAction<boolean>
    ) => {
        state.autoStartOnWindowsStartup = action.payload;
        window.electron.app.setAutoStart(action.payload);
    },
};
export const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: reducer,
});

// Action creators are generated for each case reducer function
export const {
    setAutopickPreferences,
    setAutoAcceptIsTurnedOn,
    setAutoPickIsTurnedOn,
    setSelectedRole,
    setAutoStartOnWindowsStartup,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
