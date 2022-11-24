import { Button, Card, Icon, MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import Champion from 'api/entities/Champion';
import { useAppDispatch } from 'renderer/state/hooks';

export interface SelectCardProps {
    availableChampions: Champion[] | any;
    addChampion: (champ: Champion) => void;
    text: string;
}

const ChampSelect = Select.ofType<Champion>();

const AddChamp = ({
    availableChampions,
    addChampion,
    text,
}: SelectCardProps) => {
    const dispatch = useAppDispatch();
    const renderChamp: ItemRenderer<Champion> = (
        champ,
        { handleClick, modifiers, query }
    ) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={champ.name}
                key={champ.id}
                onClick={handleClick}
            />
        );
    };

    const filterChamp: ItemPredicate<Champion> = (query, champ) => {
        return champ.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    };

    return (
        <ChampSelect
            itemPredicate={filterChamp}
            items={availableChampions}
            itemRenderer={renderChamp}
            onItemSelect={addChampion}
            inputProps={{
                placeholder: text,
            }}
        >
            <Button icon={<Icon size={24} icon="plus" />} />
        </ChampSelect>
    );
};

export default AddChamp;
