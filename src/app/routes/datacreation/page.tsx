"use client";

import { useState, useEffect } from "react"; // Add useEffect import
import { useReadableStream } from "../../components/useReadableStream";
import LoadingIcon from "../../components/LoadingIcon";
//import { numberOfQustions } from "@/app/api/dataCreation/route";

import PencilIcon from "@/app/components/customSvg/Pencil";
import DriveIcon from "@/app/components/customSvg/Drive"; 
import FolderIcon from "@/app/components/customSvg/Folder";
import OneIcon from "@/app/components/customSvg/One";
import TwoIcon from "@/app/components/customSvg/Two";

function DataCreation() {
  const response = useReadableStream();
  //const [dataHistory, setDataHistory] = useState<ChatMessage[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1); // Add state for number of questions
  const [subject, setSubject] = useState<string>(""); // Initialize subject to an empty string
  //const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // Add state for step tracking
  const [isLoadingQuizData, setIsLoadingQuizData] = useState<boolean>(false); // Add loading state
  const [editedQuestions, setEditedQuestions] = useState<{ [id: number]: { question: string; answer: string; options?: string[] } }>({}); // Track edits
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null); // Track which question is being edited

  useEffect(() => {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      if (quizData) {
        try {
          const parsedData = JSON.parse(quizData);
          if (parsedData.questions && parsedData.questions.length > 0) {
            setStep(2); // Automatically switch to step 2 if quizData exists
          }
        } catch (e) {
          console.error("Error parsing quizData during initialization:", e);
        }
      }
    }
  }, []); // Run only once on component mount

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (response.loading) return;

    setIsLoadingQuizData(true); // Start loading
  
    const formData: FormData = new FormData(event.currentTarget);
    const message = formData.get("message")?.toString().trim();
    const topicInput = formData.get("topic")?.toString().trim();
    const numberInput = parseInt(formData.get("numQuestions")?.toString() || "1", 10);
    const sanitizedNumQuestions = isNaN(numberInput) || numberInput < 1 ? 1 : numberInput;
  
    if (topicInput) {
      setSubject(topicInput);
    }
  
    if (!message) return;
  
    setNumberOfQuestions(sanitizedNumQuestions);
  
    const updatedChatHistory = [
      // Uncomment and use dataHistory if needed
      // ...dataHistory,
      { role: "user", content: message },
    ];
  
    try {
      const answer = response.request(
        new Request("/api/dataCreation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chats: updatedChatHistory,
            systemPrompt: "jsondata",
            subject: topicInput || subject,
            numberOfQuestions: sanitizedNumQuestions,
            deepSeek: false,
          }),
        })
      );
  
      event.currentTarget.reset();
      setStep(2); // Move to step 2 after submission
  
      const answerText = (await answer) as string;
  
      try {
        const parsedData = JSON.parse(answerText);
        if (parsedData && parsedData.questions) {
          localStorage.setItem("quizData", JSON.stringify(parsedData));
          // setDataHistory((prev: ChatMessage[]): ChatMessage[] => [
          //   ...prev,
          //   { role: "assistant", content: "Quiz data saved." },
          // ]);
        } else {
          throw new Error("Missing 'questions' key in parsed data");
        }
      } catch (e) {
        console.error("Error parsing response JSON:", e);
        // setDataHistory((prev: ChatMessage[]): ChatMessage[] => [
        //   ...prev,
        //   { role: "assistant", content: "Failed to parse quiz data." },
        // ]);
      }
      setIsLoadingQuizData(false); // Stop loading after data is fetched
    } catch (e) {
      console.error("Error in handleSubmit:", e);
      setIsLoadingQuizData(false); // Stop loading on error
    }
  }

  function clearQuizData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quizData");
      console.log("Quiz data cleared.");
      //setDataHistory([]); // Clear the user display by resetting the chat history
      setStep(1); // Reset to step 1
    }
  }

  function getQuizQuestions(): { id: number; question: string; answer: string; options?: string[] }[] {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      if (quizData) {
        try {
          const parsedData = JSON.parse(quizData);
          return Array.isArray(parsedData.questions) ? parsedData.questions : []; // Ensure questions is an array
        } catch (e) {
          console.error("Error parsing quizData:", e);
        }
      }
    }
    return []; // Return an empty array if no quiz data is found
  }

  function saveData() {
    if (typeof window !== "undefined") {
      const quizData = localStorage.getItem("quizData");
      const savedSets = localStorage.getItem("savedQuizSets");
      const parsedQuizData = quizData ? JSON.parse(quizData) : null;
      const parsedSavedSets = savedSets ? JSON.parse(savedSets) : [];
      localStorage.removeItem("quizData");
      setStep(1); // Reset to step 1
  
      if (parsedQuizData && parsedQuizData.questions) {
        const updatedSavedSets = [
          ...parsedSavedSets,
          { title: subject, questions: parsedQuizData.questions }, // Include topic as title
        ];
        localStorage.setItem("savedQuizSets", JSON.stringify(updatedSavedSets));
        console.log(`Quiz data saved to savedQuizSets with title: ${subject}`);
      } else {
        console.error("No quiz data available to save.");
      }
    }
  }

  function handleEditQuestion(id: number, field: string, value: string) {
    setEditedQuestions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  }

  function handleEditOption(id: number, optionIndex: number, value: string) {
    setEditedQuestions((prev) => {
      const updatedOptions = prev[id]?.options ? [...prev[id].options] : [];
      updatedOptions[optionIndex] = value;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          options: updatedOptions,
        },
      };
    });
  }

  function saveQuestion(id: number) {
    const quizData = localStorage.getItem("quizData");
    if (quizData) {
      try {
        const parsedData = JSON.parse(quizData);
        const updatedQuestions = parsedData.questions.map((question: any) =>
          question.id === id ? { ...question, ...editedQuestions[id] } : question
        );
        localStorage.setItem("quizData", JSON.stringify({ ...parsedData, questions: updatedQuestions }));
        console.log(`Question ${id} saved.`);
        setEditingQuestionId(null); // Exit edit mode
      } catch (e) {
        console.error("Error saving question:", e);
      }
    }
  }

  //End of Logic-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  return (
    <div>
      <div className="flex flex-col">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="bg-surface-200 p-12 rounded-lg shadow-md mb-4 flex flex-col gap-4">
            <div className="mb-4">
              <h1 className="text-primary-500 h2">Welcome to Data Creation!</h1>
              <p>How would you like to study?</p>
            </div>   
            <div className="flex gap-4">
              <div className={`flex gap-1 ${step === 1 ? "text-primary-500" : "text-surface-700"}`}><div className="w-[24px] h-[24px]"><OneIcon color={step === 1 ? "text-primary-500" : "text-surface-700"} /></div>Setup</div>
              <div className={`flex gap-1 ${step === 2 ? "text-primary-500" : "text-surface-700"}`}><div className="w-[24px] h-[24px]"><TwoIcon color={step === 2 ? "text-primary-500" : "text-surface-700"} /></div>Customize</div>
            </div>      
            { step === 1 && (
            <div>
              <div>
                <label htmlFor="topic" className="text-primary-500">Topic</label>
                <input 
                  required
                  className="input bg-white rounded-xl shadow-lg" 
                  type="text" 
                  name="topic"
                  value={subject} // Controlled input
                  onChange={(e) => setSubject(e.target.value)} // Update state on change
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
                    setNumberOfQuestions(isNaN(value) || value < 1 ? 1 : value); // Ensure valid number
                  }}
                  min="1"
                />
              </div>
              <div>
                <label className="text-primary-500">Upload</label>
                <div className="flex gap-2 mb-2">
                  <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"><div className="w-[24px] h-[24px]"><FolderIcon /></div>File Upload</button>
                  <button className="bg-primary-500 text-white rounded-full p-2 shadow-lg flex gap-1 hover:bg-primary-300 hover:shadow-xl"><div className="w-[24px] h-[24px]"><PencilIcon /></div>Question Type</button>
                  <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"><div className="w-[24px] h-[24px]"><DriveIcon /></div>Google Drive Upload</button>
  
                </div>
                <textarea onKeyDown={handleKeydown} name="message" className="textarea bg-white rounded-xl shadow-lg h-28" id="prompt" placeholder="Paste text or type about what you'd like to study"></textarea>
              </div>        
              <div className="flex justify-end mt-2">
                <button type="submit" className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl">Next</button>
              </div>  
            </div>               
            )  } 
            {/* Step 1 Ends here */}
            { step === 2 && (
            <div>    
                <h2 className="text-primary-500 mb-4">Topic: {subject}</h2> {/* Display topic */}
                {!isLoadingQuizData && (
                <div className="flex justify-end mb-2 gap-2">
                  <button
                    type="button"
                    className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                    onClick={clearQuizData}>
                    Back
                  </button>              
                  <button
                    type="button"
                    className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                    onClick={saveData}>
                    Save Collection
                  </button>    
                </div>                  
                  )}
                {isLoadingQuizData ? (
                  <div className="flex justify-center items-center">
                    <LoadingIcon /> {/* Show loading icon while data is loading */}
                  </div>
                ) : (
                  getQuizQuestions().map((question) => (
                    <div key={question.id} className="bg-white rounded-xl shadow-lg p-4 mb-4">
                      <p className="text-primary-500">Question: {question.id}</p>
                      {editingQuestionId === question.id ? (
                        <>
                          <input
                            className="input bg-white rounded-xl shadow-lg mb-2"
                            type="text"
                            value={editedQuestions[question.id]?.question || question.question}
                            onChange={(e) => handleEditQuestion(question.id, "question", e.target.value)}
                            placeholder="Edit question"
                          />
                          {question.options && question.options.length > 0 && (
                            <ul className="list-none">
                              {question.options.map((option, index) => (
                                <li key={index} className="text-primary-500 list-none mb-2">
                                  <input
                                    className="input bg-white rounded-xl shadow-lg"
                                    type="text"
                                    value={editedQuestions[question.id]?.options?.[index] || option}
                                    onChange={(e) => handleEditOption(question.id, index, e.target.value)}
                                    placeholder={`Edit option ${index + 1}`}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                          <input
                            className="input bg-white rounded-xl shadow-lg mb-2"
                            type="text"
                            value={editedQuestions[question.id]?.answer || question.answer}
                            onChange={(e) => handleEditQuestion(question.id, "answer", e.target.value)}
                            placeholder="Edit answer"
                          />
                          <button
                            type="button"
                            className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                            onClick={() => saveQuestion(question.id)}
                          >
                            Save Question
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-primary-500 mb-1">{question.question}</p>
                          {question.options && question.options.length > 0 && (
                            <ul className="list-none">
                              {question.options.map((option, index) => (
                                <li key={index} className="text-primary-500 list-none">{option}</li>
                              ))}
                            </ul>
                          )}
                          <p className="text-primary-500 mt-1">Answer: {question.answer || "No answer available."}</p>
                          <button
                            type="button"
                            className="bg-primary-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                            onClick={() => setEditingQuestionId(question.id)}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
                {!isLoadingQuizData && (
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    type="button"
                    className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                    onClick={clearQuizData}>
                    Back
                  </button>              
                  <button
                    type="button"
                    className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl"
                    onClick={saveData}>
                    Save Collection
                  </button>    
                </div>                  
                  )}
            </div>              
            )}
          </div>
  

                    

       
        </form>
      </div>
    </div>
  );
}
export default DataCreation;
