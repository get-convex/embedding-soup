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
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative flex items-center mb-6">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search for flavors in the soup..."
          className="w-full px-6 py-3 bg-white/80 rounded-full text-gray-800 placeholder-gray-500
                     border border-gray-200 focus:border-rose-600 focus:outline-none
                     shadow-sm backdrop-blur-sm transition-colors"
          disabled={isSearching}
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700
                     text-white rounded-full disabled:opacity-50 hover:from-rose-700 hover:to-rose-800
                     transition-all transform hover:scale-105 active:scale-95 shadow-sm"
          disabled={isSearching}
        >
          {isSearching ? "Tasting..." : "Taste"}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-600">
            Similar flavors found:
          </h3>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200
                           hover:border-rose-400/50 transition-colors shadow-sm"
              >
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-800">{result.text}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-rose-700 rounded-full"
                        style={{ width: `${result.score * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {(result.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
