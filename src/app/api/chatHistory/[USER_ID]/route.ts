import { NextRequest, NextResponse } from 'next/server';
import type { Conversation, ChatResponse, Quiz, QuizQuestion } from '@/lib/types/types';

// Generate a fake chat response
const generateFakeResponse = (): ChatResponse => ({
  id: Math.floor(Math.random() * 1000),
  type: 'response',
  time: new Date(),
  body: 'This is a test message.',
  isAiResponse: Math.random() < 0.5,
});

// Generate a fake quiz
const generateFakeQuiz = (): Quiz => {
  const quiz = [
    {
      id: 1,
      question: "What is the most widely grown variety of apple in the United States?",
      options: ["Fuji", "Granny Smith", "Gala", "Red Delicious"],
      answer: "Red Delicious",
    },
    {
      id: 2,
      question: "Which part of the apple contains the seeds?",
      options: ["Stem", "Skin", "Core", "Flesh"],
      answer: "Core",
    },
    {
      id: 3,
      question: "What is the original region of the apple tree?",
      options: ["Africa", "Central Asia", "North America", "Europe"],
      answer: "Central Asia",
    },
    {
      id: 4,
      question: "What nutrient are apples particularly high in?",
      options: ["Vitamin C", "Fiber", "Iron", "Calcium"],
      answer: "Fiber",
    },
    {
      id: 5,
      question: "What is the scientific name for the apple tree?",
      options: ["Malus domestica", "Pyrus communis", "Prunus persica", "Citrus sinensis"],
      answer: "Malus domestica",
    },
  ];

  const convertQuizToQuizQuestions = (param: typeof quiz): QuizQuestion[] =>
    param.map((q) => ({
      id: q.id,
      type: "question",
      question: q.question,
      answers: q.options,
      correct_answer: q.answer,
    }));

  return {
    id: Math.floor(Math.random() * 1000),
    title: `Quiz ${Math.floor(Math.random() * 1000)}`,
    type: 'quiz',
    responses: convertQuizToQuizQuestions(quiz),
    current: false,
  };
};

// Generate a fake conversation
const createFakeConversation = (): Conversation => {
  const id = Math.floor(Math.random() * 1000);
  const responses: ChatResponse[] = Array.from({ length: 2 }, generateFakeResponse);
  return {
    type: 'conversation',
    id,
    title: `Conversation ${Math.floor(Math.random() * 100)}`,
    responses,
  };
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ USER_ID: string }> }
  ) {
    const { USER_ID } = await context.params;
  
    console.log("Testing!");
    console.log(`Fetching chat history for user: ${USER_ID}`);
  
    // Simulate fetching data
    const conversationsOne = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => createFakeConversation()
    );
    const conversationsTwo = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => createFakeConversation()
    );
    const fakeQuiz = [generateFakeQuiz()];
  
    const folders = [
      {
        id: 1,
        name: "Starting Folder",
        attached_items: [...conversationsOne, ...fakeQuiz],
      },
      {
        id: 2,
        name: "Second Folder",
        attached_items: conversationsTwo,
      },
    ];
  
    return NextResponse.json({ folders });
  }