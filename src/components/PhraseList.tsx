import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState, useRef } from "react";

interface PhraseListProps {
  onError: (error: unknown) => void;
  onSearch: (text: string) => Promise<void>;
  searchText: string;
}

interface FloatingPhrase {
  id: Id<"phrases">;
  text: string;
  x: number;
  y: number;
  animationDuration: number;
  animationDelay: number;
  isNew?: boolean;
}

export function PhraseList({ onError, onSearch, searchText }: PhraseListProps) {
  const phrases = useQuery(api.phrases.list);
  const [floatingPhrases, setFloatingPhrases] = useState<FloatingPhrase[]>([]);
  const [newPhraseIds, setNewPhraseIds] = useState<Set<string>>(new Set());
  const searchTextRef = useRef(searchText);
  const prevLastPhraseIdRef = useRef("");

  // Update ref when searchText changes
  useEffect(() => {
    searchTextRef.current = searchText;
  }, [searchText]);

  // Initialize the prevLastPhraseIdRef when phrases are first loaded
  useEffect(() => {
    if (phrases?.length && prevLastPhraseIdRef.current === "")
      prevLastPhraseIdRef.current = phrases[phrases.length - 1]._id.toString();
  }, [phrases]);

  // Trigger search when phrases change
  useEffect(() => {
    if (!phrases?.length) return;

    // Get the last phrase
    const lastPhrase = phrases[phrases.length - 1];
    if (!lastPhrase.text.trim()) return;

    // Only run search if this is a new phrase, not on initial load
    const isNewPhrase =
      lastPhrase._id.toString() !== prevLastPhraseIdRef.current;

    // Store the current last phrase ID
    prevLastPhraseIdRef.current = lastPhrase._id.toString();

    // Only trigger automatic search for new phrases AND when it's not coming from search text changes
    if (isNewPhrase && prevLastPhraseIdRef.current !== "") {
      // Auto-search with the new phrase text without considering searchText
      onSearch(lastPhrase.text);
    }
  }, [phrases?.length, onSearch]);

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
      const currentIds = new Set(phrases.map((p) => p._id.toString()));

      // Clear out old phrases from newPhraseIds
      setNewPhraseIds((prev) => {
        const next = new Set(prev);
        for (const id of prev) {
          if (!currentIds.has(id)) next.delete(id);
        }
        return next;
      });

      return phrases.map((phrase) => {
        const existing = existingPhrases.get(phrase._id.toString());
        if (existing) return existing;

        // Mark as new if we haven't seen it before
        const isNew = !existingPhrases.has(phrase._id.toString());
        if (isNew) {
          setNewPhraseIds((prev) => new Set(prev).add(phrase._id.toString()));
          // Remove the new status after animation
          setTimeout(() => {
            setNewPhraseIds((prev) => {
              const next = new Set(prev);
              next.delete(phrase._id.toString());
              return next;
            });
          }, 1000);
        }

        // Only generate new positions for new phrases
        return {
          id: phrase._id,
          text: phrase.text,
          x: Math.random() * 40 + 30, // 30-70%
          y: Math.random() * 40 + 30, // 30-70%
          animationDuration: Math.random() * 10 + 20, // 20-30s
          animationDelay: -Math.random() * 30, // Random start point in the animation
          isNew,
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
            0% { transform: translate(-50%, -50%) translate(0, 0); }
            25% { transform: translate(-50%, -50%) translate(15px, 10px); }
            50% { transform: translate(-50%, -50%) translate(0, 20px); }
            75% { transform: translate(-50%, -50%) translate(-15px, 10px); }
            100% { transform: translate(-50%, -50%) translate(0, 0); }
          }
          @keyframes dropIn {
            0% { 
              opacity: 0;
              transform: translate(-50%, -200%) scale(0.3);
            }
            50% {
              transform: translate(-50%, -30%) scale(1.2);
            }
            70% {
              transform: translate(-50%, -60%) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
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
            animation: newPhraseIds.has(phrase.id.toString())
              ? "dropIn 0.6s ease-out forwards"
              : `float ${phrase.animationDuration}s infinite ease-in-out`,
            animationDelay: newPhraseIds.has(phrase.id.toString())
              ? "0s"
              : `${phrase.animationDelay}s`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">
              {phrase.text}
            </span>
            <button
              onClick={() => handleRemove(phrase.id)}
              disabled={newPhraseIds.has(phrase.id.toString())}
              className="text-rose-500 hover:text-rose-700 hover:scale-110
                         transform active:scale-95 transition-all
                         disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
