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

    // Initialize positions with animation parameters
    setFloatingPhrases(
      phrases.map((phrase) => ({
        id: phrase._id,
        text: phrase.text,
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 80 + 10, // 10-90%
        animationDuration: Math.random() * 10 + 20, // 20-30s
        animationDelay: -Math.random() * 30, // Random start point in the animation
      })),
    );
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
      <div className="text-center text-gray-400 mt-4">
        Heating up the soup...
      </div>
    );

  if (phrases.length === 0)
    return (
      <div className="text-center text-gray-400 mt-4">The soup is empty!</div>
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
              transform: translate(-50%, -50%) translate(30px, 15px);
            }
            50% {
              transform: translate(-50%, -50%) translate(0, 30px);
            }
            75% {
              transform: translate(-50%, -50%) translate(-30px, 15px);
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
          className="absolute bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
          style={{
            left: `${phrase.x}%`,
            top: `${phrase.y}%`,
            animation: `float ${phrase.animationDuration}s infinite ease-in-out`,
            animationDelay: `${phrase.animationDelay}s`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{phrase.text}</span>
            <button
              onClick={() => handleRemove(phrase.id)}
              className="text-white/50 hover:text-white/90 hover:scale-110
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
