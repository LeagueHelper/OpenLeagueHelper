import { Button, Icon } from '@blueprintjs/core';
import { useState } from 'react';
import Settings from 'renderer/components/Settings/Settings';
import cx from 'classnames';
import Styles from './AppFrame.module.scss';

const AppFrame = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    return (
        <div className={Styles.AppFrame}>
            <Button
                className={cx(Styles.AppFrame_settings, Styles.AppFrame_button)}
                icon="cog"
                onClick={() => setIsSettingsOpen(true)}
            />
            <Settings isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
            <Button
                className={cx(
                    Styles.AppFrame_button,
                    Styles.AppFrame_window_button
                )}
                id="min-btn"
                icon="minus"
                onClick={() => {
                    window.electron.app.minimize();
                }}
            />
            <Button
                className={cx(
                    Styles.AppFrame_button,
                    Styles.AppFrame_window_button
                )}
                id="max-btn"
                icon={<Icon icon="square" size={10} />}
                onClick={() => {
                    window.electron.app.maximize();
                }}
            />
            <Button
                className={cx(
                    Styles.AppFrame_button,
                    Styles.AppFrame_window_button
                )}
                id="close-btn"
                icon="cross"
                onClick={() => {
                    window.electron.app.close();
                }}
            />
        </div>
    );
};

export default AppFrame;
