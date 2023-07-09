import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as XLSX from 'xlsx';

const Lists = () => {
  const [lists, setLists] = useState([]);

  const [editable, setEditable] = useState({});

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reorder the cards within the same list
      const list = lists.find((list) => list.id === source.droppableId);
      const cards = Array.from(list.cards);
      const [removed] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, removed);

      const updatedLists = lists.map((list) =>
        list.id === source.droppableId ? { ...list, cards } : list
      );

      setLists(updatedLists);
    } else {
      // Move the card to a different list
      const sourceList = lists.find((list) => list.id === source.droppableId);
      const destinationList = lists.find(
        (list) => list.id === destination.droppableId
      );

      const sourceCards = Array.from(sourceList.cards);
      const destinationCards = Array.from(destinationList.cards);

      const [removed] = sourceCards.splice(source.index, 1);
      destinationCards.splice(destination.index, 0, removed);

      const updatedLists = lists.map((list) => {
        if (list.id === source.droppableId) {
          return { ...list, cards: sourceCards };
        } else if (list.id === destination.droppableId) {
          return { ...list, cards: destinationCards };
        }
        return list;
      });

      setLists(updatedLists);
    }
  };

  const handleAddList = () => {
    const input = window.prompt('Enter list title:');
    if (input) {
      const newList = { id: Date.now().toString(), title: input, cards: [] };
      setLists([...lists, newList]);
    }
  };

  const handleAddCard = (listId) => {
    const input = window.prompt('Enter card title:');
    if (input) {
      const updatedLists = lists.map((list) => {
        if (list.id === listId) {
          const updatedCards = [...list.cards, { id: Date.now().toString(), title: input }];
          return { ...list, cards: updatedCards };
        }
        return list;
      });

      setLists(updatedLists);
    }
  };
  
  const handleExportList = (list) => {
    const worksheet = XLSX.utils.json_to_sheet(list.cards);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'List');
    XLSX.writeFile(workbook, 'list.xlsx');
  };

  const handleDeleteTask = (listId, taskId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        const updatedCards = list.cards.filter((card) => card.id !== taskId);
        return { ...list, cards: updatedCards };
      }
      return list;
    });

    setLists(updatedLists);
  };

  const handleUpdateTask = (listId, taskId, newTitle) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        const updatedCards = list.cards.map((card) => {
          if (card.id === taskId) {
            return { ...card, title: newTitle };
          }
          return card;
        });
        return { ...list, cards: updatedCards };
      }
      return list;
    });

    setLists(updatedLists);
    setEditable({});
  };

  const handleEditTask = (listId, taskId) => {
    setEditable({ [`${listId}-${taskId}`]: true });
  };

  return (
    <div className='p-2 m-2'>
      <button className='rounded-md bg-red-400 p-3 text-white font-bold m-5 text-2xl w-96' onClick={handleAddList}>Add List</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        {lists.map((list) => (
          <div className='bg-yellow-200 p-3 m-8 rounded-lg ' key={list.id}>
            <h2 className='text-2xl font-bold p-2 m-3'>{list.title}</h2>
            <Droppable droppableId={list.id}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} >
                {list.cards.map((card, index) => (
                    <Draggable
                      draggableId={card.id}
                      index={index}
                      key={card.id}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                               {editable[`${list.id}-${card.id}`] ? (
                            <input
                              type="text"
                              className=' p-2 m-2 rounded-lg ' 
                              value={card.title}
                              onChange={(e) =>
                                handleUpdateTask(
                                  list.id,
                                  card.id,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <div className='border border-black bg-white p-8 rounded-xl m-5 flex flex-row'>
                              <span className='p-4 m-4 bg-slate-50 rounded-lg'>{card.title}</span>
                              <button
                              className='  rounded-md bg-red-200 w-36 h-10 -mr-2.5 '
                                onClick={() => handleEditTask(list.id, card.id)}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                          <button
                          className='rounded-md bg-blue-500 p-3 w-32 m-3 text-white font-medium'
                            onClick={() => handleDeleteTask(list.id, card.id)}
                          >
                            Delete Card
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div  className='flex flex-col justify-items-start '>
            <button className='rounded-md bg-teal-800 text-white p-3 w-32 m-3 font-semibold' onClick={() => handleAddCard(list.id)}>Add Card</button>
            <button className='rounded-md  bg-teal-800 text-white p-3 w-32 m-3 font-semibold' onClick={() => handleExportList(list)}>Export List</button>
            </div>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default Lists;
