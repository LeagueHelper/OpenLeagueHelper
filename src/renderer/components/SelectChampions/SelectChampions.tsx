/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/state/hooks';
import Role from 'api/entities/Role';
import { setAutopickPreferences } from 'renderer/state/slices/preferencesSlice';
import Champion from 'api/entities/Champion';
import ChampCard from '../ChampCard/ChampCard';
import AddChamp from './SelectCard';
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

    const [auxState, setAuxState] = useState<ItemToRender[]>([]);

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

    useEffect(() => {
        const aux = autopickPreferences[role][useCase].map((champId) => {
            return {
                id: champId.toString(),
                content: champions.find((champ) => champ.id === champId),
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
            } as ItemToRender;
        });
        setAuxState(aux);
    }, [autopickPreferences, champions, role, useCase]);
    return (
        <div className={Styles.champSelector}>
            <div className={Styles.title}>
                <h1>{title}</h1>
                <AddChamp
                    text={useCase === 'bans' ? 'Add Ban' : 'Add Pick'}
                    availableChampions={availableChampions}
                    addChampion={addChampion}
                />
            </div>
            <div className={Styles.champList}>
                <DragAndDropList
                    items={auxState}
                    Component={ChampCard}
                    setItems={setAuxState}
                    onDelete={deleteChampion}
                />
            </div>
        </div>
    );
};

export default SelectChampions;
