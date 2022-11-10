import React from 'react';

import { Button, Card } from '@blueprintjs/core';
import Champion from 'api/entities/Champion';

export interface ChampCardProps {
    style: Record<string, any>;
    id: number;
    champ: Champion;
    onDelete: (id: number) => void;
}

const ChampCard = (props: ChampCardProps) => {
    const { style, id, champ, onDelete } = props;

    return (
        <Card style={style}>
            <img src={`championImage://${id}.png`} alt={champ.name} />
            {champ.name}
            <Button onClick={() => onDelete(champ.id)}>X</Button>
        </Card>
    );
};

export default ChampCard;
