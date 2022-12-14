import { configureStore } from '@reduxjs/toolkit';
import { dataSlice } from './slices/dataSlice';
import { preferencesSlice } from './slices/preferencesSlice';
import { statusSlice } from './slices/statusSlice';

// ...

const store = configureStore({
    reducer: {
        // settings: settingsReducer,
        preferences: preferencesSlice.reducer,
        data: dataSlice.reducer,
        status: statusSlice.reducer,
        // users: usersReducer,
    },
    devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
