import { useState } from 'react';
import { useAppDispatch } from 'renderer/state/hooks';
import Modal from '../Modal/Modal';

const Settings = () => {
    // This is a modal which is used to display the settings
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setIsOpen(true)}>
                Open Modal
            </button>
            <Modal
                isOpen={isOpen}
                toggle={() => setIsOpen((prev) => !prev)}
                title="Settings"
                content={<div>Settings</div>}
                footer={null}
            />
        </>
    );
};

export default Settings;
