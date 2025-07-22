import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LoadingIcon from "../LoadingIcon";

function SortableItem({ id, children }: { id: number; children: React.ReactNode; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style as React.CSSProperties}>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-[.75rem] cursor-move"
      >
        <span className="drag-handle-icon">☰</span>
      </div>
      {children}
    </div>
  );
}

function QuestionEdit({ question, onSave, onRemove }: { question: any, onSave: (edit: any) => void, onRemove: () => void }) {
  const [localEdit, setLocalEdit] = React.useState({
    question: question.question ?? "",
    answer: question.answer ?? "",
    options: Array.isArray(question.options) && question.options.length > 0
      ? [...question.options]
      : [""], // Ensure at least one option
  });

  // Add option (max 4)
  const handleAddOption = () => {
    if (localEdit.options.length < 4) {
      setLocalEdit((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  // Remove option (min 1)
  const handleRemoveOption = (index: number) => {
    if (localEdit.options.length > 1) {
      setLocalEdit((prev) => {
        const newOptions = [...prev.options];
        newOptions.splice(index, 1);
        return { ...prev, options: newOptions };
      });
    }
  };

  return (
    <>
      <input
        className="input bg-white rounded-xl shadow-lg mb-2"
        type="text"
        value={localEdit.question}
        onChange={(e) => setLocalEdit((prev) => ({ ...prev, question: e.target.value }))}
        placeholder="Edit question"
        data-drag-disabled
      />
      {localEdit.options && localEdit.options.length > 0 && (
        <ul className="list-none">
          {localEdit.options.map((option, index) => (
            <li key={index} className="text-primary-500 list-none mb-2 flex gap-2 items-center">
              <input
                className="input bg-white rounded-xl shadow-lg"
                type="text"
                value={localEdit.options[index]}
                onChange={(e) => {
                  const newOptions = [...localEdit.options];
                  newOptions[index] = e.target.value;
                  setLocalEdit((prev) => ({ ...prev, options: newOptions }));
                }}
                placeholder={`Edit option ${index + 1}`}
                data-drag-disabled
              />
              <button
                type="button"
                className="bg-red-500 text-white rounded-full px-2 py-1 ml-2 text-xs"
                onClick={() => handleRemoveOption(index)}
                disabled={localEdit.options.length <= 1}
                title={localEdit.options.length <= 1 ? "At least one option required" : "Remove option"}
              >
                &minus;
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex mb-2">
        <button
          type="button"
          className="bg-primary-500 text-white rounded-full px-3 py-1 text-xs shadow hover:bg-primary-300"
          onClick={handleAddOption}
          disabled={localEdit.options.length >= 4}
          title={localEdit.options.length >= 4 ? "Maximum 4 options" : "Add option"}
        >
          + Option
        </button>
      </div>
      <input
        className="input bg-white rounded-xl shadow-lg mb-2"
        type="text"
        value={localEdit.answer}
        onChange={(e) => setLocalEdit((prev) => ({ ...prev, answer: e.target.value }))}
        placeholder="Edit answer"
        data-drag-disabled
      />
      <div className="flex justify-between gap-2">
        <button
          type="button"
          className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
          onClick={() => onSave(localEdit)}
        >
          Save Question
        </button>
        <button
          type="button"
          className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </>
  );
}

export default function EditCollection({
  editQuestions,
  editTitle,
  editingQuestionId,
  setEditQuestions,
  setEditTitle,
  setEditingQuestionId,
  handleEditQuestionSave,
  handleEditQuestionRemove,
  handleEditAddQuestion,
  handleEditDragEnd,
  handleEditSaveCollection,
  handleEditCancel,
  handleDeleteCollection,
  loading, // <-- destructure loading from props
  firstEdit,
}: any) {
  return (
    <div className="bg-surface-200 dark:bg-surface-800 p-12 rounded-lg mb-4 flex flex-col gap-4">

      {!loading ? (
      <div>
      <h2 className="text-primary-500 mb-4">Edit Collection: {editTitle}</h2>        
      <div className="flex justify-between mb-2 gap-2">

        <div>
          {/* Only show Delete button if NOT firstEdit */}
          {!firstEdit && (
            <button
              type="button"
              className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
              onClick={handleDeleteCollection}
            >Delete this Collection</button>            
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
            onClick={handleEditCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
            onClick={handleEditSaveCollection}
          >
            Save Collection
          </button>
        </div>
      </div>        
      <DndContext collisionDetection={closestCenter} onDragEnd={handleEditDragEnd}>
        <SortableContext items={editQuestions.map((q: any) => q.id)}>
          {editQuestions.map((question: any) => (
            <SortableItem key={question.id} id={question.id}>
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                <p className="text-primary-500">Question: {question.id}</p>
                {editingQuestionId === question.id ? (
                  <QuestionEdit
                    question={question}
                    onSave={(localEdit) => handleEditQuestionSave(question.id, localEdit)}
                    onRemove={() => handleEditQuestionRemove(question.id)}
                  />
                ) : (
                  <>
                    <p className="text-primary-500 mb-1">{question.question}</p>
                    {question.options && question.options.length > 0 && (
                      <ul className="list-none">
                        {question.options.map((option: string, index: number) => (
                          <li key={index} className="text-primary-500 list-none">{option}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-primary-500 my-1">Answer: {question.answer || "No answer available."}</p>
                    <div className="flex gap-2">
                      {/* Only show Edit button if loading is not true */}
                      {!loading && (
                        <button
                          type="button"
                          className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                          onClick={() => setEditingQuestionId(question.id)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleEditAddQuestion}
          className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
        >
          + Question
        </button>
      </div>
      {/* Add this closing div to match the opening <div> after {!loading ? ( */}
      </div>
      ) : (
        <div className="flex flex-col justify-center text-center items-center gap-4">
          <p className="text-gray-500">Loading questions...</p>
          <LoadingIcon />
        </div>
      )}
    </div>
  );
}

