import React, { useState, useEffect } from 'react';
import LoadingIcon from '@/app/components/LoadingIcon';

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
        
        <h2 className="text-xl font-semibold text-primary-500 mb-2">Select a Document</h2>
        
        {loading ? (
          <LoadingIcon />
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : documents.length === 0 ? (
          <span className="py-4 text-center text-surface-950-50">No documents found. Please upload a document first.</span>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => onSelect(doc)}
                className="p-3 border rounded-lg cursor-pointer bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                <h3 className="h5 font-medium text-surface-950">{doc.title}</h3>
                {doc.description && (
                  <span className="text-sm text-surface-900">{doc.description}</span>
                )}
                {doc.createdAt && (
                  <span className="text-xs text-surface-900 mt-1">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-full rounded hover:bg-primary-800 transition-all disabled:text-surface-50 disabled:bg-surface-950 dark:disabled:bg-surface-300 dark:disabled:text-surface-800 bg-primary-500 text-white px-6 py-2 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
