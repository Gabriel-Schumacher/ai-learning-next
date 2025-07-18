import React from "react";
import PlusIcon from "./customSvg/Plus";
import ButtonLink from "./ButtonLink";

export default function CollectionsList({
  questionLog,
  onQuizSelect,
  onNewCollection,
}: {
  questionLog: any[];
  onQuizSelect: (index: number) => void;
  onNewCollection: () => void;
}) {
  if (questionLog.length === 0) {
    return (
      <div className="text-center mt-4">
        <p className="mb-4">You don&#39;t have any study collections yet!</p>
        <button className="btn" onClick={onNewCollection}>
          <div className="w-[24px] h-[24px]">
            <PlusIcon color={"text-surface-50"} />
          </div>
          New Collection
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_auto]">
        <h2 className="text-2xl font-semibold">Your study collections</h2>
        <ButtonLink local_href="LIBRARY">Library</ButtonLink>
      </div>
      <ul className="flex flex-col gap-4">
        {questionLog.map((quizSet, index) => (
          <li
            className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg shadow-md w-full hover:shadow-xl hover:bg-surface-300 dark:bg-surface-700 hover:dark:bg-surface-700 hover:cursor-pointer hover:shadow-xl"
            key={index}
            onClick={() => onQuizSelect(index)}
          >
            <div className="flex justify-between">
              <p className="text-lg font-medium">
                {quizSet.title
                  ? `Collection ${index + 1}: ${quizSet.title}`
                  : `Quiz ${index + 1}`}
              </p>
              <p>{quizSet.questions.length} Terms</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-center mt-4">
        <button className="btn" onClick={onNewCollection}>
          <div className="w-[24px] h-[24px]">
            <PlusIcon color={"text-surface-50"} />
          </div>
          New Collection
        </button>
      </div>
    </>
  );
}
