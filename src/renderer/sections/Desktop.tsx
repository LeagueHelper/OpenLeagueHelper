import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Checkbox, Spinner, Switch } from '@blueprintjs/core';
import { useAppDispatch, useAppSelector } from 'renderer/state/hooks';
import Role from 'api/entities/Role';
import {
    setAutoAcceptIsTurnedOn,
    setAutoPickIsTurnedOn,
    setAutoStartOnWindowsStartup,
    setSelectedRole,
} from 'renderer/state/slices/preferencesSlice';

const Desktop = () => {
    const autoAcceptIsTurnedOn = useAppSelector(
        (state) => state.preferences.autoAcceptIsTurnedOn
    );
    const autoPickIsTurnedOn = useAppSelector(
        (state) => state.preferences.autoPickIsTurnedOn
    );
    // const [autoacceptIsOn, setAutoacceptIsOn] = useState(autoAcceptIsTurnedOn);
    // const [autopickIsOn, setAutopickIsOn] = useState(autoPickIsTurnedOn);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const connected = useAppSelector((state) => state.status.connected);
    const role = useAppSelector((state) => state.preferences.selectedRole);
    const autoStartOnWindowsStartup = useAppSelector(
        (state) => state.preferences.autoStartOnWindowsStartup
    );
    const user = useAppSelector((state) => state.data.user);
    console.log(user);
    const [lolConnected, setLolConnected] = React.useState(connected);

    useEffect(() => {
        if (!lolConnected) {
            setTimeout(() => {
                setLolConnected(connected);
            }, 2000);
        } else {
            setLolConnected(connected);
        }
    }, [connected, lolConnected]);

    // useEffect(() => {
    //     dispatch(setAutoPickIsTurnedOn(autopickIsOn));
    //     dispatch(setAutoAcceptIsTurnedOn(autoacceptIsOn));
    // }, [autopickIsOn, autoacceptIsOn]);

    return (
        <div className="desktop">
            <div className="desktop-switches">
                <Checkbox
                    label="Start on windows startup"
                    checked={autoStartOnWindowsStartup}
                    onChange={() => {
                        window.electron.ipcRenderer.sendMessage(
                            'set-auto-start',
                            !autoStartOnWindowsStartup
                        );
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
                        autoPickIsTurnedOn ? 'Auto-Pick On' : 'Auto-Pick Off'
                    }
                    onChange={() => {
                        dispatch(setAutoPickIsTurnedOn(!autoPickIsTurnedOn));
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
                            setAutoAcceptIsTurnedOn(!autoAcceptIsTurnedOn)
                        );
                    }}
                />
            </div>
            <select
                value={role}
                name="role"
                id="role"
                onChange={(r) =>
                    dispatch(setSelectedRole(r.target.value as Role))
                }
            >
                {Object.values(Role).map((value) => {
                    return (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    );
                })}
            </select>
            {!lolConnected && (
                <div className={`above-all ${connected ? 'connected' : ''}`}>
                    <Spinner intent="primary" />
                    <h5>Waiting for League of Legends to start...</h5>
                </div>
            )}
            <Card
                className="ban-card card"
                onClick={() => {
                    navigate(`/bans?role=${role}`, { replace: true });
                }}
            >
                <h5>
                    <p>Ban priority</p>
                </h5>
                <p>Card content</p>
            </Card>

            <Card
                className="pick-card card"
                onClick={() => {
                    navigate(`/picks?role=${role}`, { replace: true });
                }}
            >
                <h5>
                    <p>Pick priority</p>
                </h5>
                <p>Card content</p>
            </Card>
            <h1> Welcome {user.displayName}</h1>
        </div>
    );
};

export default Desktop;
