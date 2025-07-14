import React, { useState, useEffect } from 'react';

type Document = {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

type DocumentSelectionModalProps = {
  onClose: () => void;
  onSelect: (document: Document) => void;
};

export default function DocumentSelectionModal({ onClose, onSelect }: DocumentSelectionModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data.documents);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-500">Select a Document</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <div className="py-4 text-center">Loading documents...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : documents.length === 0 ? (
          <div className="py-4 text-center">No documents found. Please upload a document first.</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => onSelect(doc)}
                className="p-3 border rounded-lg cursor-pointer hover:bg-primary-50 transition-colors"
              >
                <div className="font-medium">{doc.title}</div>
                {doc.description && (
                  <div className="text-sm text-gray-600">{doc.description}</div>
                )}
                {doc.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 rounded-full px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
