"use client";

import { useState, useEffect } from "react";
import { useReadableStream } from "@/app/components/useReadableStream";
import DataCreationSetupForm from "@/app/components/DataCreation/DataCreationSetupForm";
import QuizQuestionsEditor from "@/app/components/DataCreation/QuizQuestionsEditor";
import EditCollection from "@/app/components/DataCreation/EditCollection"; // <-- Add this import

import { DataCreationStep } from "@/lib/enums/dataCreationSetup";
import { useToast } from "@/app/components/ToastContext";

import { arrayMove } from "@dnd-kit/sortable"; // Import sortable utilities

function DataSetup({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  const response = useReadableStream();
  const { showToast } = useToast();
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
  const [subject, setSubject] = useState<string>("");
  const [step, setStep] = useState<DataCreationStep>(DataCreationStep.Setup);
  const [isLoadingQuizData, setIsLoadingQuizData] = useState<boolean>(false);
  const [firstEdit, setFirstEdit] = useState<boolean>(true);
  const [editedQuestions, setEditedQuestions] = useState<{
    [id: number]: { question: string; answer: string; options?: string[] };
  }>({});
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<
    string | null
  >(null);
  const [questions, setQuestions] = useState<
    { id: number; question: string; answer: string; options?: string[] }[]
  >([]);
  const [editQuestions, setEditQuestions] = useState<any[]>([]);
  const [editTitle, setEditTitle] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      if (quizData) {
        try {
          const parsedData = JSON.parse(quizData);
          if (parsedData.questions && parsedData.questions.length > 0) {
            setQuestions(parsedData.questions);
            setEditQuestions(parsedData.questions.map((q: any) => ({ ...q })));
            setEditTitle(parsedData.subject || parsedData.title || "Untitled Collection");
            setStep(DataCreationStep.Questions);
            setFirstEdit(false); // <-- Set firstEdit true for unsaved collection
          }
        } catch (e) {
          showToast("Error loading quiz data. Please try again.", true);
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
        showToast("Form submitted successfully!", false);
      }
    }
  }

  // Update function signature to accept the extracted form data
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    extractedData?: {
      message?: string;
      topic?: string;
      numQuestions?: string;
      documentId?: string;
      documentTitle?: string;
    }
  ) {
    event.preventDefault();
    if (response.loading) return;
    setIsLoadingQuizData(true);

    // Use extracted data if provided, otherwise get from form
    const formData: FormData = new FormData(event.currentTarget);
    const message =
      extractedData?.message || formData.get("message")?.toString().trim();
    const topicInput =
      extractedData?.topic || formData.get("topic")?.toString().trim();
    const numberInputStr =
      extractedData?.numQuestions ||
      formData.get("numQuestions")?.toString() ||
      "1";
    const numberInput = parseInt(numberInputStr, 10);
    const sanitizedNumQuestions =
      isNaN(numberInput) || numberInput < 1 ? 1 : numberInput;

    // Get document ID from extracted data or form
    const documentId =
      extractedData?.documentId || formData.get("documentId")?.toString();

    // Store the document title for display purposes
    if (extractedData?.documentTitle) {
      setSelectedDocumentTitle(extractedData.documentTitle);
    }

    // Set a default collection name if none provided
    const collectionName =
      topicInput ||
      (selectedDocumentTitle
        ? `Questions from ${selectedDocumentTitle}`
        : "Untitled Collection");

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
              documentTitle: selectedDocumentTitle,
            };
          }
          localStorage.setItem("quizData", JSON.stringify(parsedData));
          setQuestions(parsedData.questions); // update state
          setEditQuestions(parsedData.questions.map((q: any) => ({ ...q }))); // <-- Set editQuestions
          setEditTitle(collectionName); // <-- Set editTitle
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

  // --- EditCollection handlers for initial creation ---
  function handleEditQuestionSave(id: number, localEdit: any) {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...localEdit } : q))
    );
    setEditingQuestionId(null);
    showToast("Question saved successfully!", false);
  }

  function handleEditQuestionRemove(id: number) {
    setEditQuestions((prev) => prev.filter((q) => q.id !== id));
    setEditingQuestionId(null);
    showToast("Question removed successfully!", false);
  }

  function handleEditAddQuestion() {
    setEditQuestions((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 10000), // Unique, stable ID
        question: "",
        answer: "",
        options: [],
      },
    ]);
    setEditingQuestionId(null);
    showToast("New question added!", false);
  }

  function handleEditDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = editQuestions.findIndex((q) => q.id === active.id);
    const newIndex = editQuestions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(editQuestions, oldIndex, newIndex);
    setEditQuestions(reordered);
  }

  function handleEditSaveCollection() {
    // Renumber IDs only when saving
    const renumberedQuestions = editQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
    // Save to localStorage as a new collection
    const savedSets = localStorage.getItem("savedQuizSets");
    const parsedSavedSets = savedSets ? JSON.parse(savedSets) : [];
    const updatedSavedSets = [
      ...parsedSavedSets,
      { title: editTitle || "Untitled Collection", questions: renumberedQuestions },
    ];
    localStorage.setItem("savedQuizSets", JSON.stringify(updatedSavedSets));
    localStorage.removeItem("quizData");
    setQuestions([]);
    setEditQuestions([]);
    setEditTitle("");
    setStep(DataCreationStep.Setup);
    setFirstEdit(false); // <-- Set firstEdit false after saving
    showToast("Collection saved!", false);
    onSave();
  }

  function handleEditCancel() {
    localStorage.removeItem("quizData");
    setQuestions([]);
    setEditQuestions([]);
    setEditTitle("");
    setStep(DataCreationStep.Setup);
    if (onCancel) onCancel();
  }

  function handleCancel() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quizData");
      setStep(DataCreationStep.Setup);
      if (onCancel) onCancel();
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
          <EditCollection
            editQuestions={editQuestions}
            editTitle={editTitle}
            editingQuestionId={editingQuestionId}
            setEditQuestions={setEditQuestions}
            setEditTitle={setEditTitle}
            setEditingQuestionId={setEditingQuestionId}
            handleEditQuestionSave={handleEditQuestionSave}
            handleEditQuestionRemove={handleEditQuestionRemove}
            handleEditAddQuestion={handleEditAddQuestion}
            handleEditDragEnd={handleEditDragEnd}
            handleEditSaveCollection={handleEditSaveCollection}
            handleEditCancel={handleEditCancel}
            loading={isLoadingQuizData} // Pass loading state
            firstEdit={firstEdit} // Pass firstEdit state
          />
        )}
      </div>
    </div>
  );
}

export default DataSetup;
