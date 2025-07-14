"use client";
import React, { useState, ChangeEvent, useEffect } from 'react';

// Define props interface for component
interface PDFUploadProps {
  onTextExtracted: (text: string, fileName: string) => void;
  onError: (error: string) => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onTextExtracted, onError }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  useEffect(() => {
    // Only import pdfjs on the client side
    if (typeof window !== 'undefined') {
      const loadPdfjs = async () => {
        try {
          // Dynamically import the PDF.js library
          const pdfjs = await import('pdfjs-dist');
          
          // Get the version number
          const version = pdfjs.version;
          console.log(`PDF.js version: ${version}`);
          
          // Set worker with fallbacks
          try {
            // First try our API endpoint
            pdfjs.GlobalWorkerOptions.workerSrc = '/api/pdf-worker';
          } catch (workerError) {
            // If API fails, try local public file
            console.warn('Falling back to local worker file:', workerError);
            try {
              pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
            } catch (localError) {
              // Finally fall back to CDN
              console.warn('Falling back to CDN for PDF.js worker:', localError);
              pdfjs.GlobalWorkerOptions.workerSrc = 
                `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.js`;
            }
          }
          
          setPdfjsLib(pdfjs);
          setIsScriptLoaded(true);
        } catch (err) {
          console.error("Failed to load PDF.js:", err);
          onError("Failed to load PDF processing library");
        }
      };
      
      loadPdfjs();
    }
  }, [onError]);

  // Handle file selection
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onError("Please select a PDF file");
      return;
    }

    if (!pdfjsLib) {
      onError("PDF processing library is not loaded yet. Please try again in a moment.");
      return;
    }

    setIsProcessing(true);

    try {
      // Get PDF as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

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

      onTextExtracted(fullText, file.name);
    } catch (err) {
      console.error("PDF extraction error:", err);
      onError("Failed to extract text from PDF. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:bg-surface-200 bg-surface-400 rounded-md p-4 text-center">
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
        {isProcessing ? 'Processing...' : isScriptLoaded ? 'Select PDF' : 'Loading PDF.js...'}
      </label>

      <p className="mt-2 text-sm text-gray-800">
        {isScriptLoaded ? 'Click to select a PDF file' : 'Loading PDF processor...'}
      </p>
    </div>
  );
};

export default PDFUpload;
