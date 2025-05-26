import { NextRequest, NextResponse } from 'next/server';
import type { Conversation, ChatResponse, Quiz, QuizQuestion } from '@/lib/types/types';

const generateFakeResponse = (): ChatResponse => {
    const response: ChatResponse = {
        id: Math.floor(Math.random() * 1000),
        type: 'text',
        time: new Date(),
        body: 'This is a test message.',
        isAiResponse: Math.random() < 0.5,
    };
    return response;
};

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
    function convertQuizToQuizQuestions(param: typeof quiz): QuizQuestion[] {
        return param.map((question) => ({
            id: question.id,
            question: question.question,
            answers: question.options,
            correct_answer: question.answer,
        }));
    }
    const quizQuestions = convertQuizToQuizQuestions(quiz);
    const returnQuiz: Quiz = {
        id: Math.floor(Math.random() * 1000),
        title: `Quiz ${Math.floor(Math.random() * 1000)}`,
        type: 'quiz',
        responses: quizQuestions,
        current: false,
    };
    return returnQuiz;
};

function createFakeConversation(): Conversation {
    const IDS: number[] = [];
    function generateRandomID() {
        let id = Math.floor(Math.random() * 1000);
        while (IDS.includes(id)) {
            id = Math.floor(Math.random() * 1000);
        }
        IDS.push(id);
        return id;
    }
    const Responses: ChatResponse[] = Array.from({ length: Math.floor(1) + 1 }, () => generateFakeResponse());
    const convo: Conversation = {
        type: 'conversation',
        id: generateRandomID(),
        title: `Conversation ${Math.floor(Math.random() * 100)}`,
        responses: Responses,
    };
    return convo;
}

export async function GET(req: NextRequest, context: { params: { USER_ID: string } }) {
    console.log("Testing!");

    // Destructure USER_ID from context.params
    const { USER_ID } = await context.params;
    console.log(`Fetching chat history for user: ${USER_ID}`);

    // Simulate fetching data from a database or another source
    const conversationsOne = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => createFakeConversation());
    const conversationsTwo = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => createFakeConversation());
    const fakeQuiz = [generateFakeQuiz()];

    const folders = [
        { id: 1, name: 'Starting Folder', attached_items: [...conversationsOne, ...fakeQuiz] },
        { id: 2, name: 'Second Folder', attached_items: conversationsTwo },
    ];

    return NextResponse.json({ folders });
}