"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phrases = useQuery(api.phrases.list);
  const addPhrase = useAction(api.phrases.add);
  const removePhrase = useMutation(api.phrases.remove);
  const searchPhrases = useAction(api.phrases.search);

  const [searchResults, setSearchResults] = useState<
    {
      _id: Id<"phrases">;
      text: string;
    }[]
  >([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      setIsAdding(true);
      setError(null);
      await addPhrase({ text: inputText.trim() });
      setInputText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add phrase");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    try {
      setIsSearching(true);
      setError(null);
      const results = await searchPhrases({ text: searchText.trim() });
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search phrases");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Vector Search Demo</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Phrases</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter a word or phrase"
            className="flex-1 px-3 py-2 border rounded"
            disabled={isAdding}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Phrases</h2>
        {phrases === undefined ? (
          <div className="text-gray-500">Loading phrases...</div>
        ) : phrases.length === 0 ? (
          <div className="text-gray-500">No phrases added yet</div>
        ) : (
          <div className="space-y-2">
            {phrases.map((phrase) => (
              <div
                key={phrase._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <span>{phrase.text}</span>
                <button
                  onClick={() => removePhrase({ id: phrase._id })}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search</h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search for similar phrases"
            className="flex-1 px-3 py-2 border rounded"
            disabled={isSearching}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
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
                <div key={result._id} className="p-3 bg-gray-50 rounded">
                  {result.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
