'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles

export type RichTextEditorHandle = {
  getContent: () => string;
  setContent: (value: string) => void;
};

type RichTextEditorProps = {
  onChange?: () => void;
};

const LOCAL_STORAGE_KEY = "writingAidEditorContent";

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({ onChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  // Set content helper
  const setContent = (value: string) => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML = value;
    }
  };

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
        },
        placeholder: 'Write something...',
      });

      // Restore from localStorage
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setContent(saved);
        }
      }

      // Listen for text changes and call onChange
      quillRef.current.on('text-change', () => {
        if (onChange) onChange();
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, quillRef.current!.root.innerHTML);
        }
      });
    }

    return () => {
      quillRef.current = null;
    };
  }, []); // ...existing code...

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML;
      }
      return '';
    },
    setContent,
  }));

  return (
    <>
      <style>
        {`
          /* Set Quill toolbar icon color to white */
          .ql-toolbar .ql-stroke {
            stroke: #fff !important;
          }
          .ql-toolbar .ql-fill {
            fill: #fff !important;
          }
          .ql-toolbar .ql-picker,
          .ql-toolbar .ql-picker-label,
          .ql-toolbar .ql-picker-item,
          .ql-toolbar button {
            color: #fff !important;
          }
        `}
      </style>
      <div className="bg-white text-black" ref={editorRef} style={{ height: '400px' }} />
    </>
  );
});

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;

