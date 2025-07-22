"use client";

import { useState, useEffect, useContext } from "react";
import { useReadableStream } from "@/app/components/useReadableStream";
import DataCreationStepper from "@/app/components/DataCreation/DataCreationStepper";
import DataCreationSetupForm from "@/app/components/DataCreation/DataCreationSetupForm";
import QuizQuestionsEditor from "@/app/components/DataCreation/QuizQuestionsEditor";

import { arrayMove } from "@dnd-kit/sortable"; // Import sortable utilities
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import * as Utils from "@/app/context_providers/data_context/data_utils";
import * as Types from "@/lib/types/types_new";
import { options } from "marked";
import LoadingIcon from "../LoadingIcon";


function DataCreation() {

  /*OLD STUFF */
  const response = useReadableStream();
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
  const [subject, setSubject] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [isLoadingQuizData, setIsLoadingQuizData] = useState<boolean>(false);
  const [editedQuestions, setEditedQuestions] = useState<{ [id: number]: { question: string; answer: string; options?: string[] } }>({});
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string | null>(null);

  /**NEW STUFF */
  const [currentQuizFile, setCurrentQuizFile] = useState<Types.QuizFile | null>(null);

  const context = useContext(DataContextProvider);
  if (!context) {
      throw new Error("DataContextProvider must be used within a AiDataProvider");
  }
  const { data, dispatch } = context;

  /* Check if there is a current file, if so, we should be on the customize page instead of the creation page. */
  useEffect(() => {
    if (data && data.sortedData && data.sortedData.currentFileId) {
      const currentFile = Utils.getItemById(data.sortedData.folders, data.sortedData.currentFileId) as Types.BaseDataFile | undefined;
      if (currentFile && currentFile.type === 'quiz') {
        setCurrentQuizFile(currentFile as Types.QuizFile);
      } else {
        setCurrentQuizFile(null);
      }
    }
  }, [data]);

  function handleCreateNewQuizFile(parsedData: JSON, collectionName: string) {
    console.debug("Creating new quiz file with parsed data:", parsedData);
    console.debug("Collection name:", collectionName);

    if (!('questions' in parsedData)) {
      console.error("Parsed data is missing 'questions' field");
      return;
    }

    // Check to see if a folder has been selected. If not, add a folder.
    if (data.sortedData && !data.sortedData.currentFolderId) {
      dispatch({
        type: "ADD_FOLDER",
        payload: {
          setActive: true,
        },
      });
    }

    // Dispatch action to create new quiz file
    dispatch({
      type: "ADD_FILE",
      payload: {
        type: "quiz",
        setActive: true,
      },
    });
    dispatch({
      type: "RENAME_SLOT",
      payload: {
        id: -1,
        newName: collectionName,
      }
    });

    interface questionItem {
      id: string | number; // Ensure id is string or number
      question: string;
      answer: string;
      options: string[];
    }
    const Questions: questionItem[] = parsedData.questions as [];

    try {
      Questions.forEach(item => {
        if (typeof item !== 'object') {
          throw new Error("Invalid question format in parsed data");
        }
        if (!('id' in item) || !('question' in item) || !('answer' in item)) {
          throw new Error("Question object is missing required fields: id, question, or answer");
        }
        const answer = item.answer || "";
        const question = item.question || "";
        const options = item.options || [];

        // Create the Question Item
        const questionItem: Types.QuestionItemsType = {
          question,
          answers: options,
          correctAnswer: answer
        };
        // Add the Question to a Content Item (what the file will contain)
        const newContentItem: Types.QuestionContentItem = {
          id: -1,
          type: "question",
          items: questionItem,
          createdAt: new Date(),
        };
        // Add the item to the file
        dispatch({
          type: "ADD_CONTENT",
          payload: {
            type: "question",
            contentItem: newContentItem
          }
        });

      });
    } catch (error) {
      console.error("Error creating quiz file:", error);
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
      
      setStep(2);

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
          //localStorage.setItem("quizData", JSON.stringify(parsedData));
          handleCreateNewQuizFile(parsedData, collectionName);
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


  /* Don't Think we need anymore? */
  function clearQuizData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quizData");
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
      setStep(1);

      // Use the provided subject or generate a default name
      const collectionName = subject || 'Untitled Collection';

      if (parsedQuizData && parsedQuizData.questions) {
        const updatedSavedSets = [
          ...parsedSavedSets,
          { title: collectionName, questions: parsedQuizData.questions },
        ];
        localStorage.setItem("savedQuizSets", JSON.stringify(updatedSavedSets));
        onSave();
      } else {
        console.error("No quiz data available to save.");
      }
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
    <>
      {/* If there isn't a currently selected quiz, then we should display the quiz creation form */}
      {!isLoadingQuizData && !currentQuizFile && (
        <DataCreationSetupForm
          handleSubmit={handleSubmit}
        />
      )}
      {/* If there is a currently selected quiz, then the user is trying to edit the content */}
      {!isLoadingQuizData && currentQuizFile && (
        <>
          <h1 className="text-primary-500 dark:text-white h2 mb-2">Editing {currentQuizFile.title}</h1>

          {/* If there is a document attached, show it? */}
          {selectedDocumentTitle && (
            <div className="mb-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Document source:</span> {selectedDocumentTitle}
              </p>
            </div>
          )}

          {/* Quiz Questions Editor */}
          <QuizQuestionsEditor
            quizFile={currentQuizFile}
            handleDragEnd={handleDragEnd}
          />
        </>
      )}
      {isLoadingQuizData && (
        <div className="w-full h-full grid place-items-center">
          <LoadingIcon />
        </div>
      )}
    </>
  );
}

export default DataCreation;