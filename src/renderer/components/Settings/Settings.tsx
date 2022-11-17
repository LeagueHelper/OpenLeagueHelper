import { Switch } from '@blueprintjs/core';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/state/hooks';
import {
    setAutoAcceptIsTurnedOn,
    setAutoPickIsTurnedOn,
    setAutoStartOnWindowsStartup,
} from 'renderer/state/slices/preferencesSlice';
import Modal from '../Modal/Modal';

interface SettingsProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Settings = ({ isOpen, setIsOpen }: SettingsProps) => {
    const autoAcceptIsTurnedOn = useAppSelector(
        (state) => state.preferences.autoAcceptIsTurnedOn
    );
    const autoPickIsTurnedOn = useAppSelector(
        (state) => state.preferences.autoPickIsTurnedOn
    );
    const autoStartOnWindowsStartup = useAppSelector(
        (state) => state.preferences.autoStartOnWindowsStartup
    );

    const dispatch = useAppDispatch();
    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={() => setIsOpen((prev) => !prev)}
                title="Settings"
                content={
                    <div>
                        <Switch
                            large
                            className="switch"
                            label="Start on windows startup"
                            alignIndicator="right"
                            checked={autoStartOnWindowsStartup}
                            onChange={() => {
                                dispatch(
                                    setAutoStartOnWindowsStartup(
                                        !autoStartOnWindowsStartup
                                    )
                                );
                            }}
                        />
                        <Switch
                            large
                            alignIndicator="right"
                            className="switch"
                            checked={autoPickIsTurnedOn}
                            label={
                                autoPickIsTurnedOn
                                    ? 'Auto-Pick On'
                                    : 'Auto-Pick Off'
                            }
                            onChange={() => {
                                dispatch(
                                    setAutoPickIsTurnedOn(!autoPickIsTurnedOn)
                                );
                            }}
                        />
                        <Switch
                            large
                            alignIndicator="right"
                            className="switch"
                            checked={autoAcceptIsTurnedOn}
                            label={
                                autoAcceptIsTurnedOn
                                    ? 'Auto-Accept On'
                                    : 'Auto-Accept Off'
                            }
                            onChange={() => {
                                dispatch(
                                    setAutoAcceptIsTurnedOn(
                                        !autoAcceptIsTurnedOn
                                    )
                                );
                            }}
                        />
                    </div>
                }
                footer={null}
            />
        </>
    );
};

export default Settings;
