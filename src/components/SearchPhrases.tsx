import { FormEvent } from "react";
import { InfoBox } from "./InfoBox";
import { Search } from "lucide-react";
import { SearchResult } from "../App";

interface SearchPhrasesProps {
  onError: (error: unknown) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  isSearching: boolean;
  searchResults: SearchResult[];
  onSearch: (text: string) => Promise<void>;
}

export function SearchPhrases({
  searchText,
  setSearchText,
  isSearching,
  searchResults,
  onSearch,
}: SearchPhrasesProps) {
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await onSearch(searchText);
  };

  return (
    <div className="w-full">
      <InfoBox icon={<Search className="w-5 h-5" />}>
        Search for ingredients with similar meanings. The search uses vector
        similarity to find phrases that are semantically related, even if they
        use different words.
      </InfoBox>
      <form onSubmit={handleSearch} className="relative flex items-center">
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
          <h3 className="text-sm mt-4 font-medium text-gray-600">
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
