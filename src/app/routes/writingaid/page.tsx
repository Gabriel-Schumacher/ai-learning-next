"use client";
import dynamic from 'next/dynamic';
import React, { useRef, useState } from 'react';
import WritingAidChat from '@/app/components/WritingAidChat';

const RichTextEditor = dynamic(() => import('@/app/components/RichTextEditor'), {
  ssr: false,
});

type RichTextEditorHandle = {
  getContent: () => string;
  setContent: (content: string) => void;
};

function WritingAid() {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [editorContent, setEditorContent] = useState<string>("");

  // On mount, load from localStorage and set editor content
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("writingAidEditorContent");
      if (saved) {
        setEditorContent(saved);
        // Set the editor's content if ref is ready
        if (editorRef.current && editorRef.current.setContent) {
          editorRef.current.setContent(saved);
        }
      }
    }
  }, []);

  // Update content on every change
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      setEditorContent(content);
      // localStorage is updated by the editor itself
    }
  };

  // Optionally keep the Feedback button for manual update
  const handleFeedback = () => {
    if (editorRef.current) {

    }
  };

  return (
   <div className="rounded-lg card w-full h-full grid grid-rows-[1fr_max-content] gap-4 p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <WritingAidChat writingText={editorContent} />
        </div>
        <div className='rounded-lg overflow-hidden bg-surface-950-50 text-surface-50-950'>
          <RichTextEditor ref={editorRef} onChange={handleEditorChange} />
        </div>
      </div>
    </div>
  );
}

export default WritingAid;