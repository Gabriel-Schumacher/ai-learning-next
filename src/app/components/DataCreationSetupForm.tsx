import React, { useState } from "react";
import FolderIcon from "@/app/components/customSvg/Folder";
import PencilIcon from "@/app/components/customSvg/Pencil";
import DriveIcon from "@/app/components/customSvg/Drive";
import DataSetupStepper from "@/app/components/DataSetupStepper";
import DocumentSelectionModal from "@/app/components/DocumentSelectionModal";

type Document = {
  id: string;
  title: string;
  description?: string;
};

type Props = {
  subject: string;
  setSubject: (v: string) => void;
  numberOfQuestions: number;
  setNumberOfQuestions: (v: number) => void;
  handleKeydown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleCancel: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, formData: any) => void;
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Simplified form handler
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    const topic = formData.get("topic") as string;
    const numQuestions = formData.get("numQuestions") as string;
    
    // Validate that either prompt or document is provided
    if ((!message || message.trim() === '') && !selectedDocument) {
      setValidationError("Please provide either a prompt or select a document.");
      return;
    }
    
    // Clear any validation errors
    setValidationError(null);
    
    // Extract all the data we need
    const formDataExtracted = {
      message: message,
      topic: topic,
      numQuestions: numQuestions,
      documentId: selectedDocument?.id,
      documentTitle: selectedDocument?.title
    };
    
    // Call the parent's submit function with the form element and extracted data
    handleSubmit(e, formDataExtracted);
  };

  return (
    <form className="space-y-4" onSubmit={handleFormSubmit}>
      <div className="bg-surface-200 p-12 rounded-lg shadow-md mb-4 flex flex-col gap-3">
        <div className="mb-4">
          <h1 className="text-primary-500 h2">Welcome to Data Creation!</h1>
          <p>How would you like to study?</p>
        </div>
        <DataSetupStepper step={step} />
        <div>
          <label htmlFor="topic" className="text-primary-500">
            Collection Name
            <span className="text-sm text-gray-500 ml-2">(Optional)</span>
          </label>
          <input
            className="input bg-white rounded-xl shadow-lg"
            type="text"
            name="topic"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Name your collection (e.g. 'Chapter 3 Review')"
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
          <label className="text-primary-500">Content Source</label>
          <div className="flex gap-2">
            <div className="flex gap-4">
                <button 
                  type="button"
                  className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"
                >
                    <div className="w-[24px] h-[24px]"><FolderIcon /></div>File Upload
                </button>
                <button 
                  type="button"
                  onClick={() => setShowDocumentModal(true)}
                  className="bg-primary-500 text-white rounded-full p-2 shadow-lg flex gap-1 hover:bg-primary-300 hover:shadow-xl"
                >
                    <div className="w-[24px] h-[24px]"><PencilIcon /></div>Library
                </button>
                <button 
                  type="button"
                  className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"
                >
                    <div className="w-[24px] h-[24px]"><DriveIcon /></div>Google Drive Upload
                </button>
            </div>
          </div>
          
          {selectedDocument && (
            <div className="mt-2 p-2 bg-primary-100 rounded-lg">
              <p className="text-sm">Using document: <span className="font-medium">{selectedDocument.title}</span></p>
              <input type="hidden" name="documentId" value={selectedDocument.id} />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="prompt" className="text-primary-500">
            Prompt {!selectedDocument && <span className="text-red-500">*</span>}
            <span className="text-sm text-gray-500 ml-2">{selectedDocument ? '(Optional)' : '(Required)'}</span>
          </label>
          <textarea
            onKeyDown={handleKeydown}
            name="message"
            className="textarea bg-white rounded-xl shadow-lg h-28"
            id="prompt"
            placeholder="Paste text or type about what you'd like to study"
          />
          <p className="text-xs text-gray-500 mt-1">
            Either select a document from your library or provide a prompt.
          </p>
        </div>
        
        {validationError && (
          <div className="p-2 bg-red-100 text-red-700 rounded-md">
            {validationError}
          </div>
        )}
        
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
