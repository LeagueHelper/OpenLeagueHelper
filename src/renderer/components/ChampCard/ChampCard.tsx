import React from 'react';

import { Card, Icon, IconSize } from '@blueprintjs/core';
import Champion from 'api/entities/Champion';
import Styles from './ChampCard.module.scss';
import Button from '../../UI/Button/Button';

export interface ChampCardProps {
    style: Record<string, any>;
    id: number | string;
    element: Champion;
    onDelete: (id: number) => void;
    listIndex: number | undefined;
}

const ChampCard: React.FC<ChampCardProps> = (props: ChampCardProps) => {
    const { style, id, element, onDelete, listIndex } = props;
    const num = listIndex !== undefined ? listIndex + 1 : 0;
    const champ = element;
    if (champ) {
        return (
            <div className={Styles.card} style={style}>
                <div className={Styles.imageDiv}>
                    <img src={`championImage://${id}.png`} alt={champ.name} />
                </div>
                <p className={Styles.ChampName}>{champ.name}</p>
                {num && <p className={Styles.ChampIndex}> {`#${num}`} </p>}
                <Button
                    className={Styles.Delete}
                    onClick={() => onDelete(champ.id)}
                >
                    <Icon
                        className={Styles.trashIcon}
                        icon="trash"
                        iconSize={15}
                    />
                </Button>
            </div>
        );
    }
    return null;
};

export default ChampCard;
