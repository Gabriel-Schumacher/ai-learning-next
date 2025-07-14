import React, { useState, FormEvent } from 'react';

interface SearchDocumentsProps {
  selectedDocId: string | null;
}

export default function SearchDocuments({ selectedDocId }: SearchDocumentsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Create search URL with parameters
      const searchUrl = new URL('/api/search', window.location.origin);
      searchUrl.searchParams.append('query', query.trim());
      
      if (selectedDocId) {
        searchUrl.searchParams.append('documentId', selectedDocId);
      }
      
      console.log('Searching:', searchUrl.toString());
      
      // Make the GET request
      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Search API error:', errorData || errorText);
        throw new Error(`Search failed: ${response.status} ${errorData?.error || ''}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedDocId 
              ? "Search within selected document..." 
              : "Search across all documents..."}
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Results ({results.length})</h3>
          {results.map((result, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow">
              <div className="mb-2">
                <span className="text-sm text-gray-500">
                  {result.documentTitle || 'Unknown document'} 
                  {result.score && ` • Score: ${(result.score * 100).toFixed(1)}%`}
                </span>
              </div>
              <p className="text-gray-800">{result.text}</p>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="text-center p-4">Searching...</div>
      ) : query.trim() ? (
        <div className="text-center p-4">No results found</div>
      ) : null}
    </div>
  );
}
