"use client";

import { useState } from "react";

export function useReadableStream() {
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null); // Separate error state

    async function request(request: Request, onChunk?: (chunk: string) => void) {
        setLoading(true);
        setText("");
        setError(null);

        try {
            //console.debug("Requesting:", request.body);
            const response = await fetch(request);

            //console.debug("Response:", response);

            if (!response.ok) throw new Error(response.statusText);
            if (!response.body) throw new Error("Response body is null");

            const reader = response.body
                .pipeThrough(new TextDecoderStream())
                .getReader();

            let finaltext = "";

            while (true) {
                const { value: token, done } = await reader.read();

                if (done) break;

                if (token !== undefined) {
                    finaltext += token;
                    setText((prev) => prev + token); // Append to state incrementally

                    if (onChunk) {
                        try {
                            onChunk(token); // Safely call the callback
                        } catch (callbackError) {
                            console.error("Error in onChunk callback:", callbackError);
                        }
                    }
                }
            }

            setLoading(false);
            return finaltext;

        } catch (err: unknown) {
            console.error("Error during request:", err);
            setLoading(false);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
            throw err;
        }
    }

    return {
        get loading() {
            return loading;
        },
        get text() {
            return text;
        },
        get error() {
            return error;
        },
        request,
    };
}