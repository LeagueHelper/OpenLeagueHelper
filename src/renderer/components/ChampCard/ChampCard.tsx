import React from 'react';

import { Button, Card, Icon, IconSize } from '@blueprintjs/core';
import Champion from 'api/entities/Champion';
import Styles from './ChampCard.module.scss';

export interface ChampCardProps {
    style: Record<string, any>;
    id: number | string;
    element: Champion;
    onDelete: (id: number) => void;
}

const ChampCard: React.FC<ChampCardProps> = (props: ChampCardProps) => {
    const { style, id, element, onDelete } = props;
    const champ = element;
    if (champ) {
        return (
            <div className={Styles.card} style={style}>
                <div className={Styles.imageDiv}>
                    <img src={`championImage://${id}.png`} alt={champ.name} />
                </div>
                <p className={Styles.ChampName}>{champ.name}</p>
                <Button
                    className={Styles.Delete}
                    onClick={() => onDelete(champ.id)}
                    icon={
                        <Icon
                            className={Styles.trashIcon}
                            icon="trash"
                            iconSize={15}
                        />
                    }
                />
            </div>
        );
    }
    return null;
};

export default ChampCard;
