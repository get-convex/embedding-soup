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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an ingredient to the soup..."
          className="w-full px-6 py-3 bg-white/5 rounded-full text-white placeholder-gray-400
                     border border-white/10 focus:border-purple-400 focus:outline-none
                     backdrop-blur-sm transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500
                     text-white rounded-full disabled:opacity-50 hover:from-purple-600 hover:to-pink-600
                     transition-all transform hover:scale-105 active:scale-95"
        >
          Drop In
        </button>
      </div>
    </form>
  );
}
