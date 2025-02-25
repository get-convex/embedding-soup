"use client";

import { useState } from "react";
import { AddPhrase } from "./components/AddPhrase";
import { PhraseList } from "./components/PhraseList";
import { SearchPhrases } from "./components/SearchPhrases";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export type SearchResult = {
  _id: Id<"phrases">;
  text: string;
  score: number;
};

export default function App() {
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchPhrases = useAction(api.phrases.search);

  const handleError = (err: unknown) =>
    setError(err instanceof Error ? err.message : "An error occurred");

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;

    try {
      setIsSearching(true);
      const results = await searchPhrases({ text: text.trim() });
      setSearchResults(results);
    } catch (err) {
      handleError(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Don't automatically search when searchText changes
  const setSearchTextSafe = (text: string) => {
    setSearchText(text);
    // No automatic search here - only when user submits the form
  };

  return (
    <div className="h-screen bg-[#E2EEEA] overflow-hidden">
      <div className="h-full container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-rose-700 to-rose-900 relative z-20">
          Embedding Soup
        </h1>

        <ErrorDisplay error={error} />

        <div className="flex gap-8 justify-center items-start relative">
          {/* Left side - Add phrases */}
          <div className="w-96 relative z-10">
            <AddPhrase onError={handleError} />
          </div>

          {/* Center - Soup Bowl */}
          <div className="relative w-[500px] h-[500px] flex items-center justify-center">
            <div className="absolute w-[1200px] h-[1200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <img
                src="/soup.png"
                alt="Soup Bowl"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-[15%] rounded-full overflow-hidden">
                <PhraseList
                  onError={handleError}
                  onSearch={handleSearch}
                  searchText={searchText}
                />
              </div>
            </div>
          </div>

          {/* Right side - Search */}
          <div className="w-96 relative z-10">
            <SearchPhrases
              onError={handleError}
              searchText={searchText}
              setSearchText={setSearchTextSafe}
              isSearching={isSearching}
              searchResults={searchResults}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
