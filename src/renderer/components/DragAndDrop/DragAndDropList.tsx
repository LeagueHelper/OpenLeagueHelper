/* eslint-disable react/jsx-props-no-spreading */
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from 'react-beautiful-dnd';

export interface DragAndDropListProps {
    onDragEnd: (result: DropResult) => void;
    onDelete: (id: number) => void;

    items: ItemToRender[];
    Component: React.FC<{
        onDelete: (id: number) => void;
        style: Record<string, any>;
        element: any;
        id: number | string;
    }>;
}

export interface ItemToRender {
    id: string;
    content: any;
}

const DragAndDropList = (props: DragAndDropListProps) => {
    const { onDragEnd, onDelete, items, Component } = props;

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? 'lightblue' : 'lightgrey',
    });

    const getItemStyle = (
        isDragging: boolean,
        draggableStyle: Record<string, string | number> | undefined
    ) => ({
        // styles we need to apply on draggables
        transform: isDragging ? 'scale(1.2)' : undefined,
        ...draggableStyle,
    });

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <div
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
