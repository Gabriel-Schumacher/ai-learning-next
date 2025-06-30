import React, { useState } from 'react';

interface SearchResult {
  text: string;
  score: number;
  documentName: string;
  metadata: {
    page?: number;
    [key: string]: any;
  };
}

interface SearchDocumentsProps {
  selectedDocId: string | null;
}

const SearchDocuments: React.FC<SearchDocumentsProps> = ({ selectedDocId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [answer, setAnswer] = useState<string>('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults([]);
    setAnswer('');
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          documentId: selectedDocId || undefined,
          limit: 5
        }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const generateAnswer = async () => {
    if (results.length === 0) return;
    
    setIsGeneratingAnswer(true);
    
    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          chunks: results.map(r => r.text)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate answer');
      }
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error generating answer:', error);
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={selectedDocId ? "Search in selected document..." : "Search across all documents..."}
            className="flex-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {results.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Search Results</h3>
            <button
              className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-green-400"
              onClick={generateAnswer}
              disabled={isGeneratingAnswer}
            >
              {isGeneratingAnswer ? 'Generating...' : 'Generate Answer'}
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between mb-1 text-sm text-gray-500">
                  <span>Document: {result.documentName}</span>
                  <span>Score: {result.score.toFixed(2)}</span>
                </div>
                <p className="text-sm">{result.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {answer && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold mb-2">AI Answer:</h3>
          <p className="text-sm">{answer}</p>
        </div>
      )}
      
      {!selectedDocId && !results.length && !isSearching && (
        <div className="text-center text-gray-500 py-8">
          <p>Select a document from the list to search within it,</p>
          <p>or search across all documents.</p>
        </div>
      )}
    </div>
  );
};

export default SearchDocuments;
