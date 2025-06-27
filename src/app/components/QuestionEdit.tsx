import React, { useState } from "react";

type Props = {
  question: any;
  onSave: (edit: any) => void;
  onRemove: () => void;
};

export default function QuestionEdit({ question, onSave, onRemove }: Props) {
  const [localEdit, setLocalEdit] = useState({
    question: question.question ?? "",
    answer: question.answer ?? "",
    options: Array.isArray(question.options) ? [...question.options] : [],
  });

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
            <li key={index} className="text-primary-500 list-none mb-2">
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
            </li>
          ))}
        </ul>
      )}
      <input
        className="input bg-white rounded-xl shadow-lg mb-2"
        type="text"
        value={localEdit.answer}
        onChange={(e) => setLocalEdit((prev) => ({ ...prev, answer: e.target.value }))}
        placeholder="Edit answer"
        data-drag-disabled
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
          onClick={() => onSave(localEdit)}
        >
          Save
        </button>
        <button
          type="button"
          className="bg-white text-primary-500 rounded-full px-4 py-2 shadow-lg hover:bg-surface-100 hover:shadow-xl"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </>
  );
}
