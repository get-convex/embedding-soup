import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { InfoBox } from "./InfoBox";
import { Soup } from "lucide-react";

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
    <div className="w-full">
      <InfoBox icon={<Soup className="w-5 h-5" />}>
        Add words or phrases to the soup. Each ingredient will be transformed
        into a vector embedding, allowing you to find similar meanings later.
      </InfoBox>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add an ingredient to the soup..."
            className="w-full px-6 py-3 bg-white/80 rounded-full text-gray-800 placeholder-gray-500
                       border border-gray-200 focus:border-rose-600 focus:outline-none
                       shadow-sm backdrop-blur-sm transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700
                       text-white rounded-full disabled:opacity-50 hover:from-rose-700 hover:to-rose-800
                       transition-all transform hover:scale-105 active:scale-95 shadow-sm"
          >
            Drop In
          </button>
        </div>
      </form>
    </div>
  );
}
