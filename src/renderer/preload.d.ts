import { Channels } from 'main/preload';

declare global {
    interface Window {
        electron: {
            store: {
                get: (key: string) => any;
                set: (key: string, val: any) => void;
                clear: () => void;
                // any other methods you've defined...
            };
            app: {
                getVersion: () => string;
                minimize: () => void;
                maximize: () => void;
                close: () => void;
                setAutoStart: (val: boolean) => void;
            };
            ipcRenderer: {
                sendMessage(channel: Channels, args: unknown[]): void;
                on(
                    channel: string,
                    func: (...args: unknown[]) => void
                ): (() => void) | undefined;
                once(channel: string, func: (...args: unknown[]) => void): void;
            };
        };
    }
}

export {};
