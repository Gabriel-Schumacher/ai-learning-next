import React, { useEffect, useState } from "react";
import * as Types from "@/lib/types/types_new";

type Props = {
  question: Types.QuestionContentItem;
  onSave: (editedQuestion: Types.QuestionContentItem) => void;
  onRemove: () => void;
};

export default function QuestionEdit({ question, onSave, onRemove }: Props) {
  const [editedQuestion, setEditedQuestion] = useState<Types.QuestionContentItem>({
    ...question,
  });

  return (
    <>

      {/* Question Text */}
      <label htmlFor="questionText" className="flex flex-col gap-1">
        <span className="font-bold text-surface-950">Question:</span>
        <input
          className="input text-primary-500 bg-white rounded-xl shadow-lg mb-2"
          type="text"
          value={editedQuestion.items.question}
          onChange={(e) => setEditedQuestion((prev) => ({ ...prev, items: { ...prev.items, question: e.target.value } }))}
          placeholder="Edit question"
          data-drag-disabled
        />
      </label>

      {/* Answers */}
      <div className="flex flex-col gap-1">
        <span className="font-bold text-surface-950">Answers:</span>
        {editedQuestion.items.answers && editedQuestion.items.answers.length > 0 && (
          <ul className="list-none">
            {editedQuestion.items.answers.map((option, index) => (
              <li key={index} className="text-primary-500 list-none mb-2">
                <input
                  className="input bg-white rounded-xl shadow-lg"
                  type="text"
                  value={editedQuestion.items.answers[index]}
                  onChange={(e) => {
                    const newAnswers = [...editedQuestion.items.answers];
                    newAnswers[index] = e.target.value;
                    setEditedQuestion((prev: Types.QuestionContentItem) => ({ ...prev, items: { ...prev.items, answers: newAnswers } }));
                  }}
                  placeholder={`Edit option ${index + 1}`}
                  data-drag-disabled
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <label htmlFor="correctAnswer" className="flex flex-col gap-1">
        <span className="font-bold text-surface-950">Correct Answer:</span>
        <input
          className="input text-primary-500 bg-white rounded-xl shadow-lg mb-2"
          type="text"
          value={editedQuestion.items.correctAnswer}
          onChange={(e) => setEditedQuestion((prev) => ({ ...prev, items: { ...prev.items, correctAnswer: e.target.value } }))}
          placeholder="Edit answer"
          data-drag-disabled
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn"
          onClick={() => onSave(editedQuestion)}
        >
          Save
        </button>
        <button
          type="button"
          className="btn btn-error"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </>
  );
}
