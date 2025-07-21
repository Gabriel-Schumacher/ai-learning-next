import React, { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : "auto",
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
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
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeQuestion = questions.find(q => q.id === activeId);

  return (
    <>
      {isLoadingQuizData ? (
        <div className="flex justify-center items-center">
          <LoadingIcon />
        </div>
      ) : (
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
          <SortableContext items={questions.map((q) => q.id)} strategy={rectSortingStrategy}>
            {questions.map((question, idx) => (
              <SortableItem key={question.id} id={question.id}>
                <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                  <p className="text-primary-500">Question: {idx + 1}</p>
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
          <DragOverlay>
            {activeQuestion ? (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border-2 border-blue-400">
                <p className="text-primary-500">
                  Question: {questions.findIndex(q => q.id === activeQuestion.id) + 1}
                </p>
                <p className="text-primary-500 mb-1">{activeQuestion.question}</p>
                {activeQuestion.options && activeQuestion.options.length > 0 && (
                  <ul className="list-none">
                    {activeQuestion.options.map((option, index) => (
                      <li key={index} className="text-primary-500 list-none">{option}</li>
                    ))}
                  </ul>
                )}
                <p className="text-primary-500 my-1">Answer: {activeQuestion.answer || "No answer available."}</p>
              </div>
            ) : null}
          </DragOverlay>
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
