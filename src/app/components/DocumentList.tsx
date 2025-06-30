import React from 'react';

interface Document {
  _id: string;
  fileName: string;
  createdAt: string;
  chunkCount: number;
}

interface DocumentListProps {
  documents: Document[];
  onSelect: (docId: string) => void;
  selectedDocId: string | null;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelect, selectedDocId }) => {
  if (documents.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        No documents found. Upload a PDF to get started.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-96 border rounded-lg">
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li 
            key={doc._id} 
            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDocId === doc._id ? 'bg-blue-50' : ''}`}
            onClick={() => onSelect(doc._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="truncate font-medium">{doc.fileName}</span>
              </div>
              <span className="text-xs text-gray-500">{doc.chunkCount} chunks</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(doc.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
