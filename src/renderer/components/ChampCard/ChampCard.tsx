import React from 'react';

import { Button, Card } from '@blueprintjs/core';
import Champion from 'api/entities/Champion';
import Styles from './ChampCard.module.scss';

export interface ChampCardProps {
    style: Record<string, any>;
    id: number;
    champ: Champion;
    onDelete: (id: number) => void;
}

const ChampCard = (props: ChampCardProps) => {
    const { style, id, champ, onDelete } = props;

    return (
        <div className={Styles.card} style={style}>
            <img src={`championImage://${id}.png`} alt={champ.name} />
            <p className={Styles.ChampName}>{champ.name}</p>
            <Button
                className={Styles.Delete}
                onClick={() => onDelete(champ.id)}
            >
                X
            </Button>
        </div>
    );
};

export default ChampCard;
