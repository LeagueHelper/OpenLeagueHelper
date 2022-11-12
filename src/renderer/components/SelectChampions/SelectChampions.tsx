/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/state/hooks';
import Role from 'api/entities/Role';
import { setAutopickPreferences } from 'renderer/state/slices/preferencesSlice';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from 'react-beautiful-dnd';
import Champion from 'api/entities/Champion';
import ChampCard from '../ChampCard/ChampCard';
import SelectCard from './SelectCard';
import Styles from './SelectChampions.module.scss';

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
        autopickPreferences[role][useCase]
    );

    // save an item
    const addChampion = (item: Champion) => {
        const aux = Array.from(auxState);
        if (aux.some((id: number) => id === item.id)) {
            return;
        }
        aux.push(item.id);
        setAuxState(aux);
        const toSave = {
            ...autopickPreferences,
            [role]: {
                ...autopickPreferences[role],
                [useCase]: aux,
            },
        };
        dispatch(setAutopickPreferences(toSave));
    };

    const deleteChampion = (id: number) => {
        let aux = Array.from(auxState);
        aux = aux.filter((champId) => champId !== id);
        setAuxState(aux);
        const toSave = {
            ...autopickPreferences,
            [role]: {
                ...autopickPreferences[role],
                [useCase]: aux,
            },
        };
        dispatch(setAutopickPreferences(toSave));
    };
    const grid = 8;

    const reorder = (list: number[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result as number[];
    };

    const getItemStyle = (
        isDragging: boolean,
        draggableStyle: Record<string, string | number> | undefined
    ) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        margin: `0 0 ${grid}px 0`,
        // change background colour if dragging
        background: isDragging ? 'lightgreen' : 'white',
        // styles we need to apply on draggables
        ...draggableStyle,
    });
    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? 'lightblue' : 'lightgrey',
        padding: grid,
    });

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

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
                            {auxState &&
                                auxState.map((id, index) => {
                                    const champ = champions.find(
                                        (champion) => champion.id === id
                                    );
                                    return (
                                        <Draggable
                                            key={champ.id.toString()}
                                            draggableId={champ.id.toString()}
                                            index={index}
                                        >
                                            {(providedI, snapshotI) => (
                                                <div
                                                    ref={providedI.innerRef}
                                                    {...providedI.draggableProps}
                                                    {...providedI.dragHandleProps}
                                                >
                                                    <ChampCard
                                                        style={getItemStyle(
                                                            snapshotI.isDragging,
                                                            undefined
                                                        )}
                                                        id={id}
                                                        champ={champ}
                                                        onDelete={
                                                            deleteChampion
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default SelectChampions;
