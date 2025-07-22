import React, { useState } from "react";
import FolderIcon from "@/app/components/customSvg/Folder";
import PencilIcon from "@/app/components/customSvg/Pencil";
import DriveIcon from "@/app/components/customSvg/Drive";
import DataCreationStepper from "@/app/components/DataCreation/DataCreationStepper";
import DocumentSelectionModal from "@/app/components/DocumentSelectionModal";
import * as Types from "@/lib/types/types_new";
import ButtonLink from "../ButtonLink";

type Document = {
  id: string;
  title: string;
  description?: string;
};

type DataCreationSetupFormProps = {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>,
    extractedData?: { message?: string; topic?: string; numQuestions?: string; documentId?: string, documentTitle?: string }) => void;
};

export default function DataCreationSetupForm({ handleSubmit }: DataCreationSetupFormProps) {

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // New stuff
  const [quizInfo, setQuizInfo] = useState<{
    subject: string;
    numberOfQuestions: number | "";
  }>({
    subject: "",
    numberOfQuestions: 0,
  });

  function handleKeydown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const form = target.closest("form");
      if (form) {
        const syntheticEvent = {
          ...event,
          currentTarget: form,
          preventDefault: () => event.preventDefault(),
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(syntheticEvent);
      }
    }
  }

  /* We handle the question count change up here so we can check if the value is a number or empty string.
  If the value isn't that, then we should have the change still be set to the current value */
  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || !isNaN(Number(value)) && Number(value) >= 1) {
      setQuizInfo({ ...quizInfo, numberOfQuestions: value === "" ? "" : Number(value) });
    } else {
      e.target.value = String(quizInfo.numberOfQuestions); // Reset to last valid value
    }
  }

  // Simplified form handler
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    const topic = quizInfo.subject;
    const numQuestions = quizInfo.numberOfQuestions;
    
    // Validate that either prompt or document is provided
    if ((!message || message.trim() === '') && !selectedDocument) {
      setValidationError("Please provide either a prompt or select a document.");
      return;
    }
    // Validate that number of questions is a positive integer if provided
    function checkIfValidNumber(value: string | number): boolean {
      return !isNaN(Number(value)) && Number.isInteger(Number(value)) && Number(value) > 0;
    }
    if (numQuestions && !checkIfValidNumber(numQuestions)) {
      setValidationError("Please enter a valid number of questions.");
      return;
    }

    // Clear any validation errors
    setValidationError(null);
    
    // Extract all the data we need 
    const formDataExtracted = {
      message: message,
      topic: topic,
      numQuestions: checkIfValidNumber(numQuestions) ? String(numQuestions) : '1',
      documentId: selectedDocument?.id,
      documentTitle: selectedDocument?.title
    };
    // Reset the form
    setQuizInfo({ subject: "", numberOfQuestions: 0 });
    setSelectedDocument(null);
    // Call the parent's submit function with the form element and extracted data
    handleSubmit(e, formDataExtracted);
  };

  return (
    <form className="flex flex-col gap-4 [&>label]:flex-col [&>label]:flex [&>label]:gap-1" onSubmit={handleFormSubmit}>
      <h1 className="text-primary-500 dark:text-white h2">Welcome to Data Creation!</h1>
      <p>How would you like to study?</p>

      {/* Remove for now. Indicates what page of the document creation we are on.
        <DataCreationStepper step={step} /> 
      */}

      {/* Collection Name */}
      <label htmlFor="topic" className="text-primary-500 dark:text-white flex flex-col gap-1">
        <span>Collection Name <span className="text-sm text-gray-500 ml-2">(Optional)</span></span>
        <input
          className="input bg-white rounded-xl shadow-lg dark:text-black dark:placeholder:text-gray-500"
          type="text"
          name="topic"
          value={quizInfo.subject}
          onChange={(e) => setQuizInfo({ ...quizInfo, subject: e.target.value })}
          placeholder="Name your collection (e.g. 'Chapter 3 Review')"
        />
      </label>

      {/* Amount of questions you want. */}
      <label className="text-primary-500 dark:text-white flex flex-col gap-1">
        <span>Number of Questions</span>
        <input
        className="input bg-white rounded-xl shadow-lg dark:text-black dark:placeholder:text-gray-500"
        type="text"
        name="numQuestions"
        placeholder="How many questions would you like to create?"
        value={quizInfo.numberOfQuestions}
        onChange={(e) => {
          handleQuestionCountChange(e)
        }}
      />
      </label>
      
      {/* Add Sources (like pdfs) */}
      <label className="text-primary-500 dark:text-white">
        <span>Content Source</span>
        <div className="flex gap-2">
              <button 
                type="button"
                className="bg-white text-primary-500 rounded-full p-2 transition-all shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"
              >
                  <div className="w-[24px] h-[24px]"><FolderIcon /></div>File Upload
              </button>
              <button 
                type="button"
                onClick={() => setShowDocumentModal(true)}
                className="bg-primary-500 text-white rounded-full p-2 transition-all shadow-lg flex gap-1 hover:bg-primary-800 hover:shadow-xl"
              >
                  <div className="w-[24px] h-[24px]"><PencilIcon /></div>Library
              </button>
              <button 
                type="button"
                className="bg-white text-primary-500 rounded-full p-2 transition-all shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"
              >
                  <div className="w-[24px] h-[24px]"><DriveIcon /></div>Google Drive Upload
              </button>
        </div>
      </label>

      {selectedDocument && (
        <div className="mt-2 p-2 bg-primary-100 rounded-lg">
          <p className="text-sm">Using document: <span className="font-medium">{selectedDocument.title}</span></p>
          <input type="hidden" name="documentId" value={selectedDocument.id} />
        </div>
      )}

      {/* Prompt */}
      <div>
        <label htmlFor="prompt" className="text-primary-500 dark:text-white">
          Prompt {!selectedDocument && <span className="text-red-500">*</span>}
          <span className="text-sm text-gray-500 ml-2">{selectedDocument ? '(Optional)' : '(Required)'}</span>
        </label>
        <textarea
          onKeyDown={handleKeydown}
          name="message"
          className="textarea bg-white rounded-xl shadow-lg h-28 dark:text-black dark:placeholder:text-gray-500"
          id="prompt"
          placeholder="Paste text or type about what you'd like to study"
        />
        <p className="text-xs text-gray-500 mt-1">
          Either select a document from your library or provide a prompt.
        </p>
      </div>

      {/* Error Message */}
      {validationError && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md">
          {validationError}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end mt-2 gap-2">
        <div className="grid grid-cols-2 w-full max-w-[400px] gap-2"> {/* Groups the buttons and prevents them from growing too much */}
          <ButtonLink local_href="STUDY" className="bg-primary-500 text-white px-6 py-2 shadow-lg hover:shadow-xl">Cancel</ButtonLink>
          <button
            type="submit"
            className="w-full rounded hover:bg-primary-800 transition-all disabled:text-surface-50 disabled:bg-surface-950 dark:disabled:bg-surface-300 dark:disabled:text-surface-800 bg-primary-500 text-white px-6 py-2 shadow-lg hover:shadow-xl"
          >
            Create Collection
          </button>
        </div>
      </div>
      
      
      {showDocumentModal && (
        <DocumentSelectionModal 
          onClose={() => setShowDocumentModal(false)}
          onSelect={(document) => {
            setSelectedDocument(document);
            setShowDocumentModal(false);
            setValidationError(null); // Clear validation error when document is selected
          }}
        />
      )}
    </form>
  );
}
