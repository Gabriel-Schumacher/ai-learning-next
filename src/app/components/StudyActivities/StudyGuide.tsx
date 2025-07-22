import React from "react";
import LoadingIcon from "@/app/components/LoadingIcon";

export default function StudyGuide({
  selectedQuizTitle,
  cancelSelectedCollection,
  studyGuideLoading,
  studyGuideError,
  studyGuideHtml,
}: {
  selectedQuizTitle: string;
  cancelSelectedCollection: () => void;
  studyGuideLoading: boolean;
  studyGuideError: string | null;
  studyGuideHtml: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-md items-center">
        <p className="text-xl font-semibold">
          {selectedQuizTitle} - Study Guide
        </p>
        <button className="btn" onClick={cancelSelectedCollection}>
          Back
        </button>
      </div>
      <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md p-4 max-w-2xl min-h-[200px]">
        {studyGuideLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center text-primary-500">
              Generating study guide...
            </div>
            <div>
              <LoadingIcon />
            </div>
          </div>
        )}
        {studyGuideError && (
          <div className="text-center text-red-600">{studyGuideError}</div>
        )}
        {studyGuideHtml && (
          <div
            className="prose max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: studyGuideHtml }}
          />
        )}
      </div>
    </div>
  );
}
