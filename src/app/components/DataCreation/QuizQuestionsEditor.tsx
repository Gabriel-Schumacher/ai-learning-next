import React, { useContext, useReducer, useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import QuestionEdit from "@/app/components/DataCreation/QuestionEdit";
import * as Types from "@/lib/types/types_new";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";

type Props = {
  quizFile: Types.QuizFile;
  handleDragEnd: (event: any) => void;
};

function SortableItem({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : "auto",
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {children}
      <button {...attributes} {...listeners} className="cursor-grab absolute top-2 right-2">Drag</button>
    </div>
  );
}

export default function QuizQuestionsEditor({quizFile, handleDragEnd}: Props) {
  const [editingQuestionId, setEditingQuestionId] = React.useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [forceUpdateValue, forceUpdate] = useState(0);

  const activeQuestion = quizFile.content.find(q => q.id === activeId);

  const context = useContext(DataContextProvider);
  if (!context) {
      throw new Error("DataContextProvider must be used within a AiDataProvider");
  }
  const { dispatch } = context;

  const checkForEmptyOptions = (question: Types.QuestionContentItem) => {
    if (!question.items.answers || question.items.answers.length === 0) {
      return true; // No answers available
    }
    return question.items.answers.some(answer => answer.trim() === ""); // Check if any answer is empty
  }
  const removeEmptyOptions = (question: Types.QuestionContentItem) => {
    if (!question.items.answers || question.items.answers.length === 0) {
      return question; // No answers available
    }
    const filteredAnswers = question.items.answers.filter(answer => answer.trim() !== "");
    return {
      ...question,
      items: {
        ...question.items,
        answers: filteredAnswers,
      },
    };
  }

  const handleSaveQuestion = (questionId: number, localEdit: Types.QuestionContentItem, setNull=true) => {
    console.debug("Saving question:", questionId, localEdit);

    // Check if there are empty options, and remove them if necessary.
    if (checkForEmptyOptions(localEdit)) {
      localEdit = removeEmptyOptions(localEdit);
    }

    // If there are no answers left after removing empty options, delete the question.
    // Else, update the question in the context.
    if (localEdit.items.answers.length === 0) {
      dispatch({ type: 'DELETE_ITEM', payload: { id: questionId } });
    } else {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: {
          id: questionId,
          contentItem: localEdit
        }
      });
    }

    // How should the UI react? If setNull is true, we reset the editing state (make it back to normal),
    // else, we force a re-render to update the UI so that the editable question shows the latest changes.
    if (setNull) {
      setEditingQuestionId(null);
    } else {
      forceUpdate(prev => prev + 1); //  Force a re-render to update the UI to reflect the new context.
    }
  }

  return (
    <DndContext
          collisionDetection={closestCenter}
          onDragEnd={event => {
            handleDragEnd(event);
            setActiveId(null);
          }}
          onDragStart={event => {
            setActiveId(event.active.id as number);
          }}
        >
      <SortableContext items={quizFile.content.map((q: Types.QuestionContentItem) => q.id)} strategy={rectSortingStrategy}>
        {quizFile.content.map((question: Types.QuestionContentItem) => (
          <SortableItem key={question.id} id={question.id}>
            <div className="relative bg-surface-50 p-4 rounded-lg shadow-md w-full hover:bg-surface-300 dark:bg-surface-700 hover:dark:bg-surface-700 transition-all flex flex-col gap-2">
              {/* <p className="text-primary-500 dark:text-white">Question: {question.id}</p> */}
              {editingQuestionId === question.id ? (
                <QuestionEdit
                  question={question}
                  onSave={(localEdit) => handleSaveQuestion(question.id, localEdit)}
                  onRemove={() => dispatch({ type: 'DELETE_ITEM', payload: { id: question.id }})}
                  onDeleteAnswer={(index) => {
                    const newAnswers = [...question.items.answers];
                    newAnswers.splice(index, 1);
                    handleSaveQuestion(question.id, { ...question, items: { ...question.items, answers: newAnswers } }, false);
                  }}
                  key={forceUpdateValue}
                />
              ) : (
                <>
                  <h4 className="h5 text-primary-500 dark:text-white">{question.items.question}</h4>
                  <div className="flex flex-col gap-1">
                    <span className="text-surface-900-100 font-bold">Options:</span>
                    {question.items.answers && question.items.answers.length > 0 && (
                      <ul className="list-disc pl-4 text-primary-500 dark:text-white">
                        {question.items.answers.map((option:string, index:number) => ( 
                          <li key={index} className="text-primary-500 dark:text-white">{option}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-surface-900-100 font-bold">Correct Answer:</span>
                    <span className="text-primary-500 dark:text-white">{question.items.correctAnswer || "No answer available."}</span>
                  </div>
                  <div className="flex flex-row-reverse w-full gap-2">
                    <button
                      type="button"
                      className="btn w-16"
                      onClick={() => setEditingQuestionId(question.id)}
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          </SortableItem>
        ))}
      </SortableContext>
      <DragOverlay>
            {activeQuestion ? (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border-2 border-blue-400">
                <p className="text-primary-500">
                  Question: {quizFile.content.findIndex(q => q.id === activeQuestion.id) + 1}
                </p>
                <p className="text-primary-500 mb-1">{activeQuestion.items.question}</p>
                {activeQuestion.items.answers && activeQuestion.items.answers.length > 0 && (
                  <ul className="list-none">
                    {activeQuestion.items.answers.map((option, index) => (
                      <li key={index} className="text-primary-500 list-none">{option}</li>
                    ))}
                  </ul>
                )}
                <p className="text-primary-500 my-1">Answer: {activeQuestion.items.correctAnswer || "No answer available."}</p>
              </div>
            ) : null}
      </DragOverlay>
    </DndContext>
  );
}