"use client";

import { useState } from "react";
import { AddPhrase } from "./components/AddPhrase";
import { PhraseList } from "./components/PhraseList";
import { SearchPhrases } from "./components/SearchPhrases";
import { ErrorDisplay } from "./components/ErrorDisplay";

export default function App() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    setError(err instanceof Error ? err.message : "An error occurred");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Embedding Soup
        </h1>

        <ErrorDisplay error={error} />

        <div className="flex gap-8 justify-center items-start">
          {/* Left side - Add phrases */}
          <div className="w-96">
            <AddPhrase onError={handleError} />
          </div>

          {/* Center - Soup Bowl */}
          <div className="relative w-[500px] h-[500px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl overflow-hidden">
              <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-purple-600/80 to-pink-600/80">
                <PhraseList onError={handleError} />
              </div>
            </div>
          </div>

          {/* Right side - Search */}
          <div className="w-96">
            <SearchPhrases onError={handleError} />
          </div>
        </div>
      </div>
    </div>
  );
}
