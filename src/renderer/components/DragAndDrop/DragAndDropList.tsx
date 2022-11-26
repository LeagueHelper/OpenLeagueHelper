/* eslint-disable react/jsx-props-no-spreading */
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from 'react-beautiful-dnd';
import Styles from './DragAndDropList.module.scss';
import Colors from '../../scss/colors.module.scss';

export interface DragAndDropListProps {
    onDelete: (id: number) => void;
    items: ItemToRender[];
    setItems: (items: ItemToRender[]) => void;
    Component: React.FC<{
        onDelete: (id: number) => void;
        style: Record<string, any>;
        element: any;
        id: number | string;
        listIndex: number | undefined;
    }>;
}

export interface ItemToRender {
    id: string;
    content: any;
}

const DragAndDropList = (props: DragAndDropListProps) => {
    const { onDelete, items, setItems, Component } = props;

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

        const aux = reorder(
            items,
            result.source.index,
            result.destination.index
        );
        setItems(items);
    }

    const getListStyle = (isDraggingOver: boolean) => ({
        background: Colors.background,
        padding: 8,
    });

    const getItemStyle = (
        isDragging: boolean,
        draggableStyle: Record<string, string | number> | undefined
    ) => ({
        // styles we need to apply on draggables
        transform: isDragging ? 'scale(1.2)' : undefined,
        ...draggableStyle,
    });
    if (items.length === 0) {
        return (
            <>
                <p>None yet!</p>
            </>
        );
    }
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <div
                        className={Styles.dropable}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {items &&
                            items.map((itemToRender, index) => {
                                return (
                                    <Draggable
                                        key={itemToRender.id.toString()}
                                        draggableId={itemToRender.id.toString()}
                                        index={index}
                                    >
                                        {(providedI, snapshotI) => (
                                            <div
                                                ref={providedI.innerRef}
                                                {...providedI.draggableProps}
                                                {...providedI.dragHandleProps}
                                            >
                                                <Component
                                                    style={getItemStyle(
                                                        snapshotI.isDragging,
                                                        undefined
                                                    )}
                                                    id={itemToRender.id}
                                                    element={
                                                        itemToRender.content
                                                    }
                                                    onDelete={onDelete}
                                                    listIndex={index}
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
    );
};

export default DragAndDropList;
