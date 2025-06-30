"use client";
import React, { useState } from "react";
import DriveIcon from "@/app/components/customSvg/Drive";
import PDFUpload from "@/app/components/PDFUpload";

function LibraryPage() {
  const [pdfText, setPdfText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleTextExtracted = (text: string) => {
    setPdfText(text);
    setError(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Library</h1>
      <p className="mb-6">Upload PDF documents to extract their text content.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-8">
        <PDFUpload 
          onTextExtracted={handleTextExtracted} 
          onError={handleError}
        />
      </div>

      <div className="flex items-center gap-2 mt-4 mb-2">
        <div className="w-[24px] h-[24px]">
          <DriveIcon />
        </div>
        <span>Google Drive integration coming soon</span>
      </div>

      {pdfText && (
        <div className="mx-auto">
          <h2 className="text-xl font-bold mb-4">Extracted Text:</h2>
          <p className="bg-gray-100 p-4 rounded w-[3/4]">{pdfText}</p>
        </div>
        
      )}
    </div>
  );
}

export default LibraryPage;
