import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
export interface DataState {
    connected: boolean;
}

// Define the initial state using that type
const initialState: DataState = {
    connected: false,
    assetsPath: '',
} as DataState;

const reducer = {
    setConnected: (state: DataState, action: PayloadAction<boolean>) => {
        state.connected = action.payload;
    },
};
export const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: reducer,
});

// Action creators are generated for each case reducer function
export const { setConnected } = statusSlice.actions;

export default statusSlice.reducer;
