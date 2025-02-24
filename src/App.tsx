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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Vector Search Demo</h1>

        <ErrorDisplay error={error} />

        <div className="space-y-8">
          <AddPhrase onError={handleError} />
          <PhraseList onError={handleError} />
          <SearchPhrases onError={handleError} />
        </div>
      </div>
    </div>
  );
}
