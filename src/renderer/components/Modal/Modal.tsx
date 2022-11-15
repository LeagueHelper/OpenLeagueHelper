import { Button } from '@blueprintjs/core';
import Styles from './Modal.module.scss';

interface ModalProps {
    isOpen: boolean;
    toggle: () => void;
    title: string;
    content: JSX.Element;
    footer: JSX.Element | null;
}

const Modal = ({ isOpen, toggle, title, content, footer }: ModalProps) => {
    if (!isOpen) {
        return null;
    }
    return (
        <div className={Styles.modal}>
            <div className={Styles.modalContent}>
                <div className={Styles.modalHeader}>
                    <h3>{title}</h3>
                    <Button icon="cross" onClick={toggle} />
                </div>
                <div className={Styles.modalBody}>{content}</div>
                <div className={Styles.modalFooter}>{footer}</div>
            </div>
        </div>
    );
};

export default Modal;
