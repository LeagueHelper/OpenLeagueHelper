import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'get-assets-path' | 'set-auto-start' | 'get-auto-start';

contextBridge.exposeInMainWorld('electron', {
    store: {
        get(val: any) {
            return ipcRenderer.sendSync('electron-store-get', val);
        },
        set(property: any, val: any) {
            ipcRenderer.send('electron-store-set', property, val);
        },
        clear() {
            ipcRenderer.send('electron-store-clear');
        },
        // Other method you want to add like has(), reset(), etc.
    },
    app: {
        minimize() {
            ipcRenderer.send('app-minimize');
        },
        maximize() {
            ipcRenderer.send('app-maximize');
        },
        close() {
            ipcRenderer.send('app-close');
        },
        setAutoStart(val: boolean) {
            ipcRenderer.send('app-set-auto-start', val);
        },
    },
    ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]) {
            ipcRenderer.send(channel, args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            const subscription = (
                _event: IpcRendererEvent,
                ...args: unknown[]
            ) => func(...args);
            ipcRenderer.on(channel, subscription);

            return () => ipcRenderer.removeListener(channel, subscription);
        },
        once(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
    },
});
