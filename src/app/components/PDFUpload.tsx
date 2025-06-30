"use client";
import React, { useState } from 'react';
import Script from 'next/script';

// Define props interface for component
interface PDFUploadProps {
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
}

function PDFUpload({ onTextExtracted, onError }: PDFUploadProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      onError("Please select a PDF file");
      return;
    }
    
    if (!isScriptLoaded || typeof window === 'undefined' || !(window as any).pdfjsLib) {
      onError("PDF processing library is still loading. Please wait a moment and try again.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get PDF as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Use the globally loaded PDF.js
      const pdfjsLib = (window as any).pdfjsLib;
      
      // Load document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += pageText + '\n';
      }
      
      onTextExtracted(fullText);
    } catch (err) {
      console.error("PDF extraction error:", err);
      onError("Failed to extract text from PDF. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      {/* Load PDF.js from CDN using Next.js Script component */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={() => setIsScriptLoaded(true)}
        onError={() => onError("Failed to load PDF processing library")}
        strategy="lazyOnload"
      />
      
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={!isScriptLoaded || isProcessing}
          className="hidden"
          id="pdf-upload"
        />
        <label 
          htmlFor="pdf-upload"
          className={`inline-block px-4 py-2 rounded-lg cursor-pointer ${
            isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isProcessing ? 'Processing...' : isScriptLoaded ? 'Select PDF' : 'Loading...'}
        </label>
        
        <p className="mt-2 text-sm text-gray-600">
          {isScriptLoaded ? 'Click to select a PDF file' : 'Loading PDF processor...'}
        </p>
      </div>
    </>
  );
}

export default PDFUpload;
