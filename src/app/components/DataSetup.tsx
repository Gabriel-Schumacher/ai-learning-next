"use client";

import { useState, useEffect } from "react";
import { useReadableStream } from "@/app/components/useReadableStream";
import DataCreationSetupForm from "@/app/components/DataCreationSetupForm";
import QuizQuestionsEditor from "@/app/components/QuizQuestionsEditor";

import { DataCreationStep } from "@/lib/enums/dataCreationSetup";
import { useToast } from "@/app/components/ToastContext";

import { arrayMove } from "@dnd-kit/sortable"; // Import sortable utilities



function DataSetup({ onSave, onCancel }: { onSave: () => void; onCancel: () => void; }) {
  const response = useReadableStream();
  const { showToast } = useToast();
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
  const [subject, setSubject] = useState<string>("");
  const [step, setStep] = useState<DataCreationStep>(DataCreationStep.Setup);
  const [isLoadingQuizData, setIsLoadingQuizData] = useState<boolean>(false);
  const [editedQuestions, setEditedQuestions] = useState<{ [id: number]: { question: string; answer: string; options?: string[] } }>({});
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      if (quizData) {
        try {
          const parsedData = JSON.parse(quizData);
          if (parsedData.questions && parsedData.questions.length > 0) {
            setStep(DataCreationStep.Questions);
          }
        } catch (e) {
          console.error("Error parsing quizData during initialization:", e);
        }
      }
    }
  }, []);

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

  // Update function signature to accept the extracted form data
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    extractedData?: { message?: string; topic?: string; numQuestions?: string; documentId?: string, documentTitle?: string }
  ) {
    event.preventDefault();
    if (response.loading) return;
    setIsLoadingQuizData(true);

    // Use extracted data if provided, otherwise get from form
    const formData: FormData = new FormData(event.currentTarget);
    const message = extractedData?.message || formData.get("message")?.toString().trim();
    const topicInput = extractedData?.topic || formData.get("topic")?.toString().trim();
    const numberInputStr = extractedData?.numQuestions || formData.get("numQuestions")?.toString() || "1";
    const numberInput = parseInt(numberInputStr, 10);
    const sanitizedNumQuestions = isNaN(numberInput) || numberInput < 1 ? 1 : numberInput;
    
    // Get document ID from extracted data or form
    const documentId = extractedData?.documentId || formData.get("documentId")?.toString();
    
    // Store the document title for display purposes
    if (extractedData?.documentTitle) {
      setSelectedDocumentTitle(extractedData.documentTitle);
    }

    // Set a default collection name if none provided
    const collectionName = topicInput || (selectedDocumentTitle ? 
      `Questions from ${selectedDocumentTitle}` : 
      'Untitled Collection');
    
    setSubject(collectionName);
    
    if (!message && !documentId) return; // Return if no message and no document
    setNumberOfQuestions(sanitizedNumQuestions);

    const userPrompt = message ? [{ role: "user", content: message }] : [];

    try {
      console.log("Sending request with documentId:", documentId);
      
      // Add debug logging to trace the issue
      if (documentId) {
        console.log("Using document ID:", documentId);
      }
      
      const answer = response.request(
        new Request("/api/dataCreation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userPrompt,
            systemPrompt: "jsondata",
            subject: collectionName,
            numberOfQuestions: sanitizedNumQuestions,
            deepSeek: false,
            documentId: documentId, // Include document ID in the API request
          }),
        })
      );
      
      // Only reset the form if we're using the actual form element
      if (!extractedData) {
        event.currentTarget.reset();
      }
      
      setStep(DataCreationStep.Questions);

      const answerText = (await answer) as string;
      try {
        const parsedData = JSON.parse(answerText);
        if (parsedData && parsedData.questions) {
          // Store metadata about source if using document
          if (documentId && selectedDocumentTitle) {
            parsedData.metadata = {
              documentId,
              documentTitle: selectedDocumentTitle
            };
          }
          localStorage.setItem("quizData", JSON.stringify(parsedData));
        } else {
          throw new Error("Missing 'questions' key in parsed data");
        }
      } catch (e) {
        console.error("Error parsing response JSON:", e);
      }
      setIsLoadingQuizData(false);
    } catch (e) {
      console.error("Error in handleSubmit:", e);
      setIsLoadingQuizData(false);
    }
  }

  function clearQuizData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quizData");
      setStep(DataCreationStep.Setup);
    }
  }

  function getQuizQuestions(): { id: number; question: string; answer: string; options?: string[] }[] {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      if (quizData) {
        try {
          const parsedData = JSON.parse(quizData);
          return Array.isArray(parsedData.questions) ? parsedData.questions : [];
        } catch (e) {
          console.error("Error parsing quizData:", e);
        }
      }
    }
    return [];
  }

  function saveData() {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      const savedSets = localStorage.getItem("savedQuizSets");
      const parsedQuizData = quizData ? JSON.parse(quizData) : null;
      const parsedSavedSets = savedSets ? JSON.parse(savedSets) : [];
      localStorage.removeItem("quizData");
      setStep(DataCreationStep.Setup);

      // Use the provided subject or generate a default name
      const collectionName = subject || 'Untitled Collection';

      if (parsedQuizData && parsedQuizData.questions) {
        const updatedSavedSets = [
          ...parsedSavedSets,
          { title: collectionName, questions: parsedQuizData.questions },
        ];
        localStorage.setItem("savedQuizSets", JSON.stringify(updatedSavedSets));
        // Optionally show a toast on save
        showToast("Collection saved!", false);
        onSave();
      } else {
        // Optionally show a toast on error
        showToast("No quiz data available to save.", true);
        console.error("No quiz data available to save.");
      }
    }
  }

  function handleCancel() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quizData");
      setStep(DataCreationStep.Setup);
      if (onCancel) onCancel();
    }
  }

  function reorderQuestionIds(questions: { id: number; question: string; answer: string; options?: string[] }[]) {
    return questions.map((question, index) => ({
      ...question,
      id: index + 1,
    }));
  }

  function saveQuestion(id: number, localEdit: { question: string; answer: string; options?: string[] }) {
    const quizData = localStorage.getItem("quizData");
    if (quizData) {
      try {
        const parsedData = JSON.parse(quizData);
        const updatedQuestions = parsedData.questions.map((question: any) => {
          if (question.id === id) {
            let mergedOptions = question.options;
            if (Array.isArray(question.options)) {
              mergedOptions = localEdit.options ?? question.options;
            }
            return {
              ...question,
              ...localEdit,
              options: mergedOptions,
              id: question.id,
            };
          }
          return question;
        });
        const reorderedQuestions = reorderQuestionIds(updatedQuestions);
        localStorage.setItem("quizData", JSON.stringify({ ...parsedData, questions: reorderedQuestions }));
        setEditedQuestions((prev) => {
          const updatedEditedQuestions = { ...prev };
          delete updatedEditedQuestions[id];
          return updatedEditedQuestions;
        });
        setEditingQuestionId(null);
      } catch (e) {
        console.error("Error saving question:", e);
      }
    }
  }

  function removeQuestion(id: number) {
    if (isLoadingQuizData) return;
    const quizData = localStorage.getItem("quizData");
    if (quizData) {
      try {
        const parsedData = JSON.parse(quizData);
        const updatedQuestions = parsedData.questions.filter((question: any) => question.id !== id);
        const reorderedQuestions = reorderQuestionIds(updatedQuestions);
        localStorage.setItem("quizData", JSON.stringify({ ...parsedData, questions: reorderedQuestions }));
        setEditedQuestions((prev) => {
          const newEditedQuestions = { ...prev };
          delete newEditedQuestions[id];
          return newEditedQuestions;
        });
        if (editingQuestionId === id) {
          setEditingQuestionId(null);
        }
      } catch (e) {
        console.error("Error removing question:", e);
      }
    }
  }

  function addQuestion() {
    const quizData = localStorage.getItem("quizData");
    const parsedData = quizData ? JSON.parse(quizData) : { questions: [] };
    const lastQuestionId = parsedData.questions.length > 0
      ? parsedData.questions[parsedData.questions.length - 1].id
      : 0;
    const newQuestion = {
      id: lastQuestionId + 1,
      question: "",
      answer: "",
      options: [],
    };
    const updatedQuestions = [...parsedData.questions, newQuestion];
    localStorage.setItem("quizData", JSON.stringify({ ...parsedData, questions: updatedQuestions }));
    setEditedQuestions((prev) => ({
      ...prev,
      [newQuestion.id]: newQuestion,
    }));
    setEditingQuestionId(newQuestion.id);
    getQuizQuestions();
    setStep((prevStep) => prevStep);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const quizData = localStorage.getItem("quizData");
    if (quizData) {
      try {
        const parsedData = JSON.parse(quizData);
        const oldIndex = parsedData.questions.findIndex((q: any) => q.id === active.id);
        const newIndex = parsedData.questions.findIndex((q: any) => q.id === over.id);
        const reorderedQuestions = arrayMove(parsedData.questions, oldIndex, newIndex);
        const updatedQuestions = reorderQuestionIds(reorderedQuestions as { id: number; question: string; answer: string; options?: string[] }[]);
        localStorage.setItem("quizData", JSON.stringify({ ...parsedData, questions: updatedQuestions }));
        setStep((prevStep) => prevStep);
      } catch (e) {
        console.error("Error reordering questions:", e);
      }
    }
  }

  // UI
  return (
    <div>
      <div className="flex flex-col">
        {step === DataCreationStep.Setup && (
          <DataCreationSetupForm
            subject={subject}
            setSubject={setSubject}
            numberOfQuestions={numberOfQuestions}
            setNumberOfQuestions={setNumberOfQuestions}
            handleKeydown={handleKeydown}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
            isLoadingQuizData={isLoadingQuizData}
            step={step} // Pass step to the form
          />
        )}
        {step === DataCreationStep.Questions && (
          <div>
            <h2 className="text-primary-500 mb-4">Topic: {subject}</h2>
            {selectedDocumentTitle && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Document source:</span> {selectedDocumentTitle}
                </p>
              </div>
            )}
            <div className="flex justify-end mb-2 gap-2">
              <button
                type="button"
                className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                onClick={clearQuizData}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                onClick={saveData}
              >
                Save Collection
              </button>
            </div>
            <QuizQuestionsEditor
              isLoadingQuizData={isLoadingQuizData}
              questions={getQuizQuestions()}
              editingQuestionId={editingQuestionId}
              setEditingQuestionId={setEditingQuestionId}
              saveQuestion={saveQuestion}
              removeQuestion={removeQuestion}
              addQuestion={addQuestion}
              handleDragEnd={handleDragEnd}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DataSetup;