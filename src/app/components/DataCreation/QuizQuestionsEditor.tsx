import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import LoadingIcon from "@/app/components/LoadingIcon";
import QuestionEdit from "@/app/components/DataCreation/QuestionEdit";

type Question = { id: number; question: string; answer: string; options?: string[] };

type Props = {
  isLoadingQuizData: boolean;
  questions: Question[];
  editingQuestionId: number | null;
  setEditingQuestionId: (id: number | null) => void;
  saveQuestion: (id: number, localEdit: { question: string; answer: string; options?: string[] }) => void;
  removeQuestion: (id: number) => void;
  addQuestion: () => void;
  handleDragEnd: (event: any) => void;
};

function SortableItem({ id, children }: { id: number; children: React.ReactNode }) {
  // ...implement useSortable logic as in your main file...
  // For brevity, you can keep this logic in the main file and pass it as a prop if needed.
  return <div>{children}</div>;
}

export default function QuizQuestionsEditor({
  isLoadingQuizData,
  questions,
  editingQuestionId,
  setEditingQuestionId,
  saveQuestion,
  removeQuestion,
  addQuestion, 
  handleDragEnd,
}: Props) {
  return (
    <>
      {isLoadingQuizData ? (
        <div className="flex justify-center items-center">
          <LoadingIcon />
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)}>
            {questions.map((question) => (
              <SortableItem key={question.id} id={question.id}>
                <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                  <p className="text-primary-500">Question: {question.id}</p>
                  {editingQuestionId === question.id ? (
                    <QuestionEdit
                      question={question}
                      onSave={(localEdit) => saveQuestion(question.id, localEdit)}
                      onRemove={() => removeQuestion(question.id)}
                    />
                  ) : (
                    <>
                      <p className="text-primary-500 mb-1">{question.question}</p>
                      {question.options && question.options.length > 0 && (
                        <ul className="list-none">
                          {question.options.map((option, index) => (
                            <li key={index} className="text-primary-500 list-none">{option}</li>
                          ))}
                        </ul>
                      )}
                      <p className="text-primary-500 my-1">Answer: {question.answer || "No answer available."}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
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
      )}
      {!isLoadingQuizData && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
          >
            + Question
          </button>
        </div>
      )}
    </>
  );
}
