import { FormEvent, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AddPhraseProps {
  onError: (error: unknown) => void;
}

export function AddPhrase({ onError }: AddPhraseProps) {
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const addPhrase = useAction(api.phrases.add);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      setIsAdding(true);
      await addPhrase({ text: inputText.trim() });
      setInputText("");
    } catch (err) {
      onError(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Add Phrases</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter a word or phrase"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400"
          disabled={isAdding}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
