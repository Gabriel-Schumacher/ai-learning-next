import React from "react";
import FolderIcon from "@/app/components/customSvg/Folder";
import PencilIcon from "@/app/components/customSvg/Pencil";
import DriveIcon from "@/app/components/customSvg/Drive";
import DataCreationStepper from "@/app/components/DataCreationStepper";

type Props = {
  subject: string;
  setSubject: (v: string) => void;
  numberOfQuestions: number;
  setNumberOfQuestions: (v: number) => void;
  handleKeydown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleCancel: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoadingQuizData: boolean;
  step: number; // Add step prop
};

export default function DataCreationSetupForm({
  subject,
  setSubject,
  numberOfQuestions,
  setNumberOfQuestions,
  handleKeydown,
  handleCancel,
  handleSubmit,
  isLoadingQuizData,
  step,
}: Props) {
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="bg-surface-200 p-12 rounded-lg shadow-md mb-4 flex flex-col gap-3">
        <div className="mb-4">
          <h1 className="text-primary-500 h2">Welcome to Data Creation!</h1>
          <p>How would you like to study?</p>
        </div>
        <DataCreationStepper step={step} />
        <div>
          <label htmlFor="topic" className="text-primary-500">Topic</label>
          <input
            required
            className="input bg-white rounded-xl shadow-lg"
            type="text"
            name="topic"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter a topic to study"
          />
        </div>
        <div>
          <label className="text-primary-500">Number of Questions</label>
          <input
            className="input bg-white rounded-xl shadow-lg"
            type="number"
            name="numQuestions"
            value={numberOfQuestions}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setNumberOfQuestions(isNaN(value) || value < 1 ? 1 : value);
            }}
            min="1"
          />
        </div>
        <div>
          <label className="text-primary-500">Upload</label>
          <div className="flex gap-2">
            <div className="flex gap-4">
                <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl">
                    <div className="w-[24px] h-[24px]"><FolderIcon /></div>File Upload
                </button>
                <button className="bg-primary-500 text-white rounded-full p-2 shadow-lg flex gap-1 hover:bg-primary-300 hover:shadow-xl">
                    <div className="w-[24px] h-[24px]"><PencilIcon /></div>Question Type
                </button>
                <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl">
                    <div className="w-[24px] h-[24px]"><DriveIcon /></div>Google Drive Upload
                </button>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="prompt" className="text-primary-500">Prompt</label>
          <textarea
            onKeyDown={handleKeydown}
            name="message"
            className="textarea bg-white rounded-xl shadow-lg h-28"
            id="prompt"
            placeholder="Paste text or type about what you'd like to study"
          />
        </div>
        <div className="flex justify-end mt-2 gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
            disabled={isLoadingQuizData}
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
}
