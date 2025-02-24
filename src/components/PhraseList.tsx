import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";

interface PhraseListProps {
  onError: (error: unknown) => void;
}

interface FloatingPhrase {
  id: Id<"phrases">;
  text: string;
  x: number;
  y: number;
  animationDuration: number;
  animationDelay: number;
}

export function PhraseList({ onError }: PhraseListProps) {
  const phrases = useQuery(api.phrases.list);
  const [floatingPhrases, setFloatingPhrases] = useState<FloatingPhrase[]>([]);

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

  useEffect(() => {
    if (!phrases) return;

    // Keep existing positions and only generate for new phrases
    setFloatingPhrases((prev) => {
      const existingPhrases = new Map(prev.map((p) => [p.id.toString(), p]));

      return phrases.map((phrase) => {
        const existing = existingPhrases.get(phrase._id.toString());
        if (existing) return existing;

        // Only generate new positions for new phrases
        return {
          id: phrase._id,
          text: phrase.text,
          x: Math.random() * 40 + 30, // 30-70%
          y: Math.random() * 40 + 30, // 30-70%
          animationDuration: Math.random() * 10 + 20, // 20-30s
          animationDelay: -Math.random() * 30, // Random start point in the animation
        };
      });
    });
  }, [phrases?.length]);

  const handleRemove = async (id: Id<"phrases">) => {
    try {
      await removePhrase({ id });
    } catch (err) {
      onError(err);
    }
  };

  if (phrases === undefined)
    return (
      <div className="text-center text-gray-600 mt-4">
        Heating up the soup...
      </div>
    );

  if (phrases.length === 0)
    return (
      <div className="text-center text-gray-600 mt-4">The soup is empty!</div>
    );

  return (
    <div className="relative w-full h-full">
      <style>
        {`
          @keyframes float {
            0% {
              transform: translate(-50%, -50%) translate(0, 0);
            }
            25% {
              transform: translate(-50%, -50%) translate(15px, 10px);
            }
            50% {
              transform: translate(-50%, -50%) translate(0, 20px);
            }
            75% {
              transform: translate(-50%, -50%) translate(-15px, 10px);
            }
            100% {
              transform: translate(-50%, -50%) translate(0, 0);
            }
          }
        `}
      </style>
      {floatingPhrases.map((phrase) => (
        <div
          key={phrase.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group
                     bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm
                     transition-colors duration-200"
          style={{
            left: `${phrase.x}%`,
            top: `${phrase.y}%`,
            animation: `float ${phrase.animationDuration}s infinite ease-in-out`,
            animationDelay: `${phrase.animationDelay}s`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">
              {phrase.text}
            </span>
            <button
              onClick={() => handleRemove(phrase.id)}
              className="text-rose-500 hover:text-rose-700 hover:scale-110
                         transform active:scale-95 transition-all"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
