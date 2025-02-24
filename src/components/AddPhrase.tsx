import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface AddPhraseProps {
  onError: (error: unknown) => void;
}

export function AddPhrase({ onError }: AddPhraseProps) {
  const [text, setText] = useState("");
  const addPhrase = useMutation(api.phrases.add).withOptimisticUpdate(
    (localStore, args) => {
      const { text } = args;
      const existingPhrases = localStore.getQuery(api.phrases.list);
      if (existingPhrases !== undefined) {
        const optimisticId = crypto.randomUUID() as Id<"phrases">;
        localStore.setQuery(api.phrases.list, {}, [
          ...existingPhrases,
          { _id: optimisticId, text },
        ]);
      }
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addPhrase({ text });
      setText("");
    } catch (err) {
      onError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a phrase..."
          className="flex-1 p-2 bg-gray-800 rounded text-white"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
