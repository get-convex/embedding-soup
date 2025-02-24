import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PhraseListProps {
  onError: (error: unknown) => void;
}

export function PhraseList({ onError }: PhraseListProps) {
  const phrases = useQuery(api.phrases.list);
  const removePhrase = useMutation(api.phrases.remove).withOptimisticUpdate(
    (localStore, args) => {
      const { id } = args;
      const existingPhrases = localStore.getQuery(api.phrases.list);
      if (existingPhrases !== undefined)
        localStore.setQuery(
          api.phrases.list,
          {},
          existingPhrases.filter((p) => p._id !== id),
        );
    },
  );

  const handleRemove = async (id: Id<"phrases">) => {
    try {
      await removePhrase({ id });
    } catch (err) {
      onError(err);
    }
  };

  if (phrases === undefined)
    return <div className="text-gray-400">Loading phrases...</div>;

  if (phrases.length === 0)
    return <div className="text-gray-400">No phrases added yet</div>;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Phrases</h2>
      <div className="space-y-2">
        {phrases.map((phrase) => (
          <div
            key={phrase._id}
            className="flex items-center justify-between p-3 bg-gray-800 rounded"
          >
            <span className="text-white">{phrase.text}</span>
            <button
              onClick={() => handleRemove(phrase._id)}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
