import { FormEvent, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type SearchResult = {
  _id: Id<"phrases">;
  text: string;
  score: number;
};

interface SearchPhrasesProps {
  onError: (error: unknown) => void;
}

export function SearchPhrases({ onError }: SearchPhrasesProps) {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchPhrases = useAction(api.phrases.search);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    try {
      setIsSearching(true);
      const results = await searchPhrases({ text: searchText.trim() });
      setSearchResults(results);
    } catch (err) {
      onError(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Search</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search for similar phrases"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400"
          disabled={isSearching}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Results:</h3>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="p-3 bg-gray-800 rounded text-white"
              >
                <div className="flex justify-between items-center">
                  <span>{result.text}</span>
                  <span className="text-sm text-gray-400">
                    Similarity: {(result.score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
