// Study Guide handler
  export async function handleStudyGuide(parsedQuestions:string, selectedQuizTitle:string) {
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

        return text;
    } catch (err) {
        throw new Error((err as Error).message || "Unknown error");
    }
  }