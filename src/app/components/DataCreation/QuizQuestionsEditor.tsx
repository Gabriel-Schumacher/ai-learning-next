import React, { useContext } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import QuestionEdit from "@/app/components/QuestionEdit";
import * as Types from "@/lib/types/types_new";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";

type Props = {
  quizFile: Types.QuizFile;
  handleDragEnd: (event: any) => void;
};

function SortableItem({ id, children }: { id: number; children: React.ReactNode }) {
  // ...implement useSortable logic as in your main file...
  // For brevity, you can keep this logic in the main file and pass it as a prop if needed.
  return <>{children}</>;
}

export default function QuizQuestionsEditor({quizFile, handleDragEnd}: Props) {
  const [editingQuestionId, setEditingQuestionId] = React.useState<number | null>(null);

  const context = useContext(DataContextProvider);
  if (!context) {
      throw new Error("DataContextProvider must be used within a AiDataProvider");
  }
  const { dispatch } = context;

  const handleSaveQuestion = (questionId: number, localEdit: Types.QuestionContentItem) => {
    console.debug("Saving question:", questionId, localEdit);
    dispatch({
      type: 'UPDATE_ITEM',
      payload: {
        id: questionId,
        contentItem: localEdit
      }
    });
    setEditingQuestionId(null);
  }


  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={quizFile.content.map((q: Types.QuestionContentItem) => q.id)}>
        {quizFile.content.map((question: Types.QuestionContentItem) => (
          <SortableItem key={question.id} id={question.id}>
            <div className="bg-surface-50 p-4 rounded-lg shadow-md w-full hover:bg-surface-300 dark:bg-surface-700 hover:dark:bg-surface-700 transition-all flex flex-col gap-2">
              {/* <p className="text-primary-500 dark:text-white">Question: {question.id}</p> */}
              {editingQuestionId === question.id ? (
                <QuestionEdit
                  question={question}
                  onSave={(localEdit) => handleSaveQuestion(question.id, localEdit)}
                  onRemove={() => dispatch({ type: 'DELETE_ITEM', payload: { id: question.id }})}
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
    </DndContext>
  );
}
