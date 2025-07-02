import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react'; // Make sure to install lucide-react

type Document = {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  chunkCount?: number;
};

interface DocumentListProps {
  documents?: Document[];
  onSelect?: (docId: string) => void;
  selectedDocId?: string | null;
}

export default function DocumentList({ documents: externalDocuments, onSelect, selectedDocId }: DocumentListProps = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(!externalDocuments);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const fetchDocuments = async () => {
    // If external documents are provided, use those instead of fetching
    if (externalDocuments) {
      setDocuments(externalDocuments);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (externalDocuments) {
      setDocuments(externalDocuments);
      setLoading(false);
    } else {
      fetchDocuments();
    }
  }, [externalDocuments]);
  
  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };
  
  const handleDocumentClick = (document: Document) => {
    if (onSelect) {
      onSelect(document.id);
    }
  };
  
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/documents?id=${documentToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      // Refresh the document list
      await fetchDocuments();
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during deletion');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading documents...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  
  if (documents.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">No documents found.</p>
        <p>
          <Link href="/routes/upload" className="text-primary-500 hover:underline">
            Upload a document
          </Link> to get started.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <div 
            key={document.id} 
            className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative cursor-pointer ${
              selectedDocId === document.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleDocumentClick(document)}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(document);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              aria-label="Delete document"
            >
              <Trash2 size={16} />
            </button>
            
            <h3 className="font-medium text-lg mb-2 pr-6">{document.title}</h3>
            {document.description && (
              <p className="text-sm text-gray-600 mb-3">{document.description}</p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {document.chunkCount ? `${document.chunkCount} chunks` : 'Processing...'}
              </span>
              {document.createdAt && (
                <span>
                  {new Date(document.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Delete Document</h3>
            <p className="mb-6">
              Are you sure you want to delete <strong>{documentToDelete?.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
