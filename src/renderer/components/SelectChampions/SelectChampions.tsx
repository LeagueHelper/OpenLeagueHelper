/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/state/hooks';
import Role from 'api/entities/Role';
import { setAutopickPreferences } from 'renderer/state/slices/preferencesSlice';
import { DropResult } from 'react-beautiful-dnd';
import Champion from 'api/entities/Champion';
import ChampCard from '../ChampCard/ChampCard';
import SelectCard from './SelectCard';
import Styles from './SelectChampions.module.scss';
import DragAndDropList, { ItemToRender } from '../DragAndDrop/DragAndDropList';

export interface SelectChampionsPropTypes {
    title: string;
    role: Role;
    useCase: 'bans' | 'picks';
}

const SelectChampions = (props: SelectChampionsPropTypes) => {
    const { title, role, useCase } = props;
    const dispatch = useAppDispatch();

    const champions = useAppSelector((state) => state.data.champions);
    const ownedChampions = useAppSelector((state) => state.data.ownedChampions);
    const autopickPreferences = useAppSelector(
        (state) => state.preferences.autopickPreferences
    );

    const availableChampions = useCase === 'bans' ? champions : ownedChampions;

    const [auxState, setAuxState] = useState(
        autopickPreferences[role][useCase].map((champId) => {
            return {
                id: champId.toString(),
                content: champions.find((champ) => champ.id === champId),
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                onDelete: deleteChampion,
            } as ItemToRender;
        })
    );

    // save an item
    const addChampion = (item: Champion) => {
        const aux = Array.from(auxState);
        if (aux.some((champ) => champ.id === item.id.toString())) {
            return;
        }
        aux.push({
            id: item.id.toString(),
            content: item,
        });
        setAuxState(aux);
        const toSave = {
            ...autopickPreferences,
            [role]: {
                ...autopickPreferences[role],
                [useCase]: aux.map((champ) => parseInt(champ.id, 10)),
            },
        };
        dispatch(setAutopickPreferences(toSave));
    };

    function deleteChampion(id: number) {
        let aux = auxState;
        aux = aux.filter((champId) => champId.id !== id.toString());
        setAuxState(aux);
        const toSave = {
            ...autopickPreferences,
            [role]: {
                ...autopickPreferences[role],
                [useCase]: aux.map((champ) => parseInt(champ.id, 10)),
            },
        };
        dispatch(setAutopickPreferences(toSave));
    }

    const reorder = (
        list: ItemToRender[],
        startIndex: number,
        endIndex: number
    ) => {
        const result = list;
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result as ItemToRender[];
    };

    function onDragEnd(result: DropResult) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            auxState,
            result.source.index,
            result.destination.index
        );
        setAuxState(items);
    }

    return (
        <div className={Styles.champSelector}>
            <h1>{title}</h1>

            <SelectCard
                availableChampions={availableChampions}
                addChampion={addChampion}
            />

            <DragAndDropList
                items={auxState}
                Component={ChampCard}
                onDragEnd={onDragEnd}
                onDelete={deleteChampion}
            />
        </div>
    );
};

export default SelectChampions;
