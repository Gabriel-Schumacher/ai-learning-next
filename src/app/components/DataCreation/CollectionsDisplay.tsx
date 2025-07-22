"use client";

import React, { useState, useEffect } from "react";
import CardIcon from "@/app/components/customSvg/Card";
import ListIcon from "@/app/components/customSvg/List";
import BookIcon from "@/app/components/customSvg/Book";
import EditIcon from "../customSvg/Edit";
import { useToast } from "../ToastContext";
import EditCollection from "./EditCollection";
import CollectionsList from "./CollectionsList"; // Ensure the file exists and is correctly named
import Flashcards from "../StudyActivities/Flashcards";
import Quiz from "../StudyActivities/Quiz";
import StudyGuide from "../StudyActivities/StudyGuide";
import { Marked } from "marked";
import DOMPurify from "dompurify";
import { Activities } from "@/lib/enums/activities"; // <-- Add this import

const marked = new Marked();

function CollectionsDisplay({
  onNewCollection,
}: {
  onNewCollection: () => void;
}) {
    const { showToast } = useToast();
  const [questionLog, setQuestionLog] = useState<any[]>([]);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(
    null
  );
  const [userAnswers, setUserAnswers] = useState<{
    [questionId: number]: string;
  }>({});
  //const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [activity, setActivity] = useState(Activities.None); // <-- Use enum
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz mode state
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizShowFeedback, setQuizShowFeedback] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [editQuestionsMode, setEditQuestionsMode] = useState(false);
  const [editQuestions, setEditQuestions] = useState<any[]>([]);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  const [studyGuideResponse, setStudyGuideResponse] = useState<string | null>(null);
  const [studyGuideLoading, setStudyGuideLoading] = useState(false);
  const [studyGuideError, setStudyGuideError] = useState<string | null>(null);
  const [studyGuideHtml, setStudyGuideHtml] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQuizSets = localStorage.getItem("savedQuizSets");
      try {
        const parsedQuizSets = savedQuizSets ? JSON.parse(savedQuizSets) : [];
        if (Array.isArray(parsedQuizSets)) {
          setQuestionLog(parsedQuizSets);
        } else {
          console.error("Invalid format for savedQuizSets:", parsedQuizSets);
          setQuestionLog([]);
          showToast("Invalid format for saved quiz sets. Please check your data.", true);
        }
      } catch (error) {
        console.error("Error parsing savedQuizSets:", error);
        setQuestionLog([]);
        showToast("Error loading saved quiz sets. Please check your data.", true);
      }
    }
  }, []);

  function cancelSelectedCollection() {
    setStudyMode(false);
    setSelectedQuizIndex(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCurrentIndex(0);
    setActivity(Activities.None); // <-- Use enum
    //setShowCorrectAnswers(false);
  }

  function finishFlashCards() {
    cancelSelectedCollection()
    setActivity(Activities.None); // <-- Use enum
  }

  const handleQuizSelection = (index: number) => {
    setSelectedQuizIndex(index);
    setUserAnswers({});
    //setShowCorrectAnswers(false);
    setStudyMode(true);
  };

  const handleNextQuestion = () => {
    if (isFlipped) {
        setIsFlipped(false); // Reset flip state
        setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) =>
            Math.min(prevIndex + 1, parsedQuestions.length - 1)
        );
        }, 300); // Add a delay to ensure flip animation completes        
    } else {
        setIsFlipped(false); // Reset flip state
        setCurrentQuestionIndex((prevIndex) =>
            Math.min(prevIndex + 1, parsedQuestions.length - 1)
        );
    }
  };

  const handlePreviousQuestion = () => {
    if (isFlipped) {
        setIsFlipped(false); // Reset flip state
        setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }, 300); // Add a delay to ensure flip animation completes        
    } else {
        setIsFlipped(false); // Reset flip state
        setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }

  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const selectedQuiz =
    selectedQuizIndex !== null && questionLog[selectedQuizIndex]
      ? questionLog[selectedQuizIndex].questions
      : null;

  // Simplified logic for parsedQuestions
  const parsedQuestions =
    Array.isArray(selectedQuiz) &&
    selectedQuiz.every((q) => q && q.question && q.options)
      ? selectedQuiz
      : [];

  const selectedQuizTitle =
    selectedQuizIndex !== null && questionLog[selectedQuizIndex]
      ? questionLog[selectedQuizIndex].title || `Quiz ${selectedQuizIndex + 1}`
      : null;

  console.log("Selected Quiz:", selectedQuiz);
  console.log("Parsed Questions:", parsedQuestions);

  // Reset quiz state when entering quiz mode or changing collection
  useEffect(() => {
    if (activity === Activities.PracticeTest && studyMode) { // <-- Use enum
      setQuizCurrentIndex(0);
      setQuizSelectedOption(null);
      setQuizShowFeedback(false);
      setQuizCorrect(null);
      setQuizFinished(false);
      setQuizScore(0);
    }
  }, [activity, studyMode, selectedQuizIndex]);

  const handleQuizOptionSelect = (option: string) => {
    if (!quizShowFeedback) {
      setQuizSelectedOption(option);
    }
  };

  const handleQuizSubmit = () => {
    if (quizSelectedOption !== null && !quizShowFeedback) {
      const correctAnswer = parsedQuestions[quizCurrentIndex].answer;
      const isCorrect = quizSelectedOption === correctAnswer;
      setQuizCorrect(isCorrect);
      setQuizShowFeedback(true);
      if (isCorrect) setQuizScore((prev) => prev + 1);
    }
  };

  const handleQuizNext = () => {
    if (quizCurrentIndex < parsedQuestions.length - 1) {
      setQuizCurrentIndex((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizShowFeedback(false);
      setQuizCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleQuizFinish = () => {
    setQuizFinished(true);
  };

  const handleQuizBackToMenu = () => {
    setActivity(Activities.None); // <-- Use enum
    setStudyMode(false);
    setSelectedQuizIndex(null);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizCurrentIndex(0);
    setQuizSelectedOption(null);
    setQuizShowFeedback(false);
    setQuizCorrect(null);
  };

  // Edit mode handlers
  function enterEditQuestionsMode(index: number) {
    const collection = questionLog[index];
    setEditQuestions(collection.questions.map((q: any) => ({ ...q })));
    setEditTitle(collection.title || `Collection ${index + 1}`);
    setEditQuestionsMode(true);
    setEditingQuestionId(null);
  }

  function handleEditQuestionSave(id: number, localEdit: any) {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...localEdit } : q))
    );
    setEditingQuestionId(null);
  }

  function handleEditQuestionRemove(id: number) {
    setEditQuestions((prev) =>
      prev.filter((q) => q.id !== id)
    );
    setEditingQuestionId(null);
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
  }

  function handleEditDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = editQuestions.findIndex((q) => q.id === active.id);
    const newIndex = editQuestions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(editQuestions, oldIndex, newIndex);
    // Do NOT renumber IDs here!
    setEditQuestions(reordered);
  }

  function handleEditSaveCollection() {
    // Save changes to localStorage
    if (
      selectedQuizIndex !== null &&
      selectedQuizIndex >= 0 &&
      selectedQuizIndex < questionLog.length
    ) {
      // Renumber IDs only when saving
      const renumberedQuestions = editQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
      const updatedLog = [...questionLog];
      updatedLog[selectedQuizIndex] = {
        ...updatedLog[selectedQuizIndex],
        questions: renumberedQuestions,
        title: editTitle,
      };
      setQuestionLog(updatedLog);
      localStorage.setItem("savedQuizSets", JSON.stringify(updatedLog));
    }
    setEditQuestionsMode(false);
  }

  function handleEditCancel() {
    setEditQuestionsMode(false);
  }

  function handleDeleteCollection() {
    if (selectedQuizIndex !== null && selectedQuizIndex >= 0 && selectedQuizIndex < questionLog.length) {
      const updatedLog = questionLog.filter((_, index) => index !== selectedQuizIndex);
      setQuestionLog(updatedLog);
      localStorage.setItem("savedQuizSets", JSON.stringify(updatedLog));
      setSelectedQuizIndex(null);
      setEditQuestionsMode(false);
      setStudyMode(false);
      setActivity(Activities.None); // <-- Use enum
      setUserAnswers({});
      setQuizCurrentIndex(0);
      setQuizSelectedOption(null);
      showToast("Collection deleted successfully.");
    }
  }

  // Study Guide handler
  async function handleStudyGuide() {
    setStudyGuideLoading(true);
    setStudyGuideError(null);
    setStudyGuideResponse(null);
    setStudyGuideHtml(null);
    try {
      const res = await fetch("/api/studyGuide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: parsedQuestions,
          title: selectedQuizTitle,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch study guide.");
      const text = await res.text();
      setStudyGuideResponse(text);

      // Parse and sanitize like in testChat
      const parsed = await marked.parse(text);
      const sanitized = DOMPurify.sanitize(parsed)
        .replace(/<script>/g, "&lt;script&gt;")
        .replace(/<\/script>/g, "&lt;/script&gt;");
      setStudyGuideHtml(sanitized);
    } catch (err: any) {
      setStudyGuideError(err.message || "Unknown error");
    } finally {
      setStudyGuideLoading(false);
    }
  }

  return (
    <>
      {/* Edit Questions Mode */}
      {editQuestionsMode && (
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
          handleDeleteCollection={handleDeleteCollection}
        />
      )}

      {/* Display Available Collections */}
      {studyMode === false && activity === Activities.None && ( // <-- Use enum
        <CollectionsList
          questionLog={questionLog}
          onQuizSelect={handleQuizSelection}
          onNewCollection={onNewCollection}
        />
      )}

      {/* Has selected a collection of data */}
      {selectedQuizIndex !== null &&
        parsedQuestions.length > 0 &&
        activity === Activities.None && // <-- Use enum
        !editQuestionsMode && (
          <>
            <div className="flex justify-between">
              <p className="text-2xl font-semibold text-primary-500">
                {selectedQuizTitle}
              </p>
              <div className="flex items-center gap-2">
                <p>{selectedQuiz.length} Terms</p>
                <button
                  onClick={() => enterEditQuestionsMode(selectedQuizIndex)}
                  title="Edit Questions"
                >
                  <div className="w-[32px] h-[32px] text-primary-500 mx-auto"><EditIcon/></div>
                </button>
              </div>
            </div>
            <div className="text-center my-5">
              <p className="text-xl">How would you like to study?</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div
                className="card bg-surface-50-950 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                onClick={() => setActivity(Activities.Flashcards)} // <-- Use enum
              >
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                    <CardIcon />
                  </div>
                  <p className="text-xl">Flashcards</p>
                </div>
                <p className="mt-8">
                  Make studying fun! Test yourseslf, build speed, and lock in
                  your knowledge.
                </p>
              </div>
              <div className="card bg-surface-50-950 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                onClick={() => setActivity(Activities.PracticeTest)}> {/* <-- Use enum */}
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                    <ListIcon />
                  </div>
                  <p className="text-xl">Practice Tests</p>
                </div>
                <p className="mt-8">
                  Simulate the real thing. Build confidence, find weak spots in
                  your knowledge, and track your progress.
                </p>
              </div>
              <div
                className="card bg-surface-50-950 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                onClick={() => {
                  setActivity(Activities.StudyGuide); // <-- Use enum
                  handleStudyGuide();
                }}
              >
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                    <BookIcon />
                  </div>
                  <p className="text-xl">Study Guide</p>
                </div>
                <p className="mt-8">
                  Break it down, keep it clear. A quick-glance tool to review
                  the most important stuff fast.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn" onClick={cancelSelectedCollection}>
                Back
              </button>
            </div>
          </>
        )}

      {/* Display FlashCards */}
      {studyMode === true && activity === Activities.Flashcards && parsedQuestions.length > 0 && ( // <-- Use enum
        <Flashcards
          parsedQuestions={parsedQuestions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          finishFlashCards={finishFlashCards}
          handleNextQuestion={handleNextQuestion}
          handlePreviousQuestion={handlePreviousQuestion}
          toggleFlip={toggleFlip}
        />
      )}

      {/* Display Quiz */}
      {studyMode === true && activity === Activities.PracticeTest && parsedQuestions.length > 0 && ( // <-- Use enum
        <Quiz
          parsedQuestions={parsedQuestions}
          quizCurrentIndex={quizCurrentIndex}
          setQuizCurrentIndex={setQuizCurrentIndex}
          quizSelectedOption={quizSelectedOption}
          setQuizSelectedOption={setQuizSelectedOption}
          quizShowFeedback={quizShowFeedback}
          setQuizShowFeedback={setQuizShowFeedback}
          quizCorrect={quizCorrect}
          setQuizCorrect={setQuizCorrect}
          quizFinished={quizFinished}
          setQuizFinished={setQuizFinished}
          quizScore={quizScore}
          setQuizScore={setQuizScore}
          handleQuizOptionSelect={handleQuizOptionSelect}
          handleQuizSubmit={handleQuizSubmit}
          handleQuizNext={handleQuizNext}
          handleQuizFinish={handleQuizFinish}
          handleQuizBackToMenu={handleQuizBackToMenu}
        />
      )}

      {/* Study Guide Display */}
      {studyMode === true && activity === Activities.StudyGuide && ( // <-- Use enum
        <StudyGuide
          selectedQuizTitle={selectedQuizTitle}
          cancelSelectedCollection={cancelSelectedCollection}
          studyGuideLoading={studyGuideLoading}
          studyGuideError={studyGuideError}
          studyGuideHtml={studyGuideHtml}
        />
      )}
    </>
  );
}
export default CollectionsDisplay;
function arrayMove(editQuestions: any[], oldIndex: number, newIndex: number) {
  const updatedQuestions = [...editQuestions];
  const [movedItem] = updatedQuestions.splice(oldIndex, 1);
  updatedQuestions.splice(newIndex, 0, movedItem);
  return updatedQuestions;
}

