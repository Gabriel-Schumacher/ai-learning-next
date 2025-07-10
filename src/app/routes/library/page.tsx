"use client";
import React, { useState, useEffect } from "react";
//import DriveIcon from "@/app/components/customSvg/Drive";
import PDFUpload from "@/app/components/PDFUpload";
import SearchDocuments from "@/app/components/SearchDocuments";
import DocumentList from "@/app/components/DocumentList";
import ClientOnly from "@/app/components/ClientOnly";

function LibraryPage() {
  const [pdfText, setPdfText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Fetch existing documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        console.error("Failed to fetch documents");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleTextExtracted = async (text: string, fileName: string) => {
    setPdfText(text);
    setError(null);
    setIsProcessing(true);

    try {
      // Process the extracted text - chunk and vectorize
      const response = await fetch("/api/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          fileName,
          metadata: {
            uploadedAt: new Date().toISOString(),
            fileType: "pdf",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      await fetchDocuments(); // Refresh document list
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Error processing document");
      setIsProcessing(false);
    }
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleDocumentSelect = (docId: string | null) => {
      setSelectedDoc(docId);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Library</h1>
      <p className="mb-6">
        Upload PDF documents to extract and vectorize their content.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-8">
        <ClientOnly>
          <PDFUpload
            onTextExtracted={handleTextExtracted}
            onError={handleError}
          />
        </ClientOnly>

        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-lg flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing document...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Search Your Documents</h2>
          <SearchDocuments selectedDocId={selectedDoc} />
        </div>
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
          <DocumentList
            documents={documents}
            onSelect={handleDocumentSelect}
            selectedDocId={selectedDoc}
          />
        </div>
      </div>

      {pdfText && (
        <div className="mx-auto mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Extracted Text Preview:</h2>
          <p className="bg-gray-100 p-4 rounded max-h-80 overflow-y-auto">
            {pdfText.length > 1000
              ? `${pdfText.substring(0, 1000)}...`
              : pdfText}
          </p>
        </div>
      )}
    </div>
  );
}

export default LibraryPage;
