import classNames from 'classnames';
import React from 'react';
import Styles from './Button.module.scss';

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    className: string | undefined;
}

const Button = ({ children, onClick, className }: ButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={classNames(Styles.button, className)}
        >
            {children}
        </button>
    );
};

export default Button;
