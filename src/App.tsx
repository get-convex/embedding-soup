"use client";

import { AddPhrase } from "./components/AddPhrase";
import { PhraseList } from "./components/PhraseList";
import { SearchPhrases } from "./components/SearchPhrases";
import { Toaster } from "./components/ui/toaster";
import { ToastProvider } from "./components/ui/toast";

export default function App() {
  return (
    <ToastProvider>
      <div className="h-screen bg-[#E2EEEA] overflow-hidden">
        <div className="h-full container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-rose-700 to-rose-900 relative z-30 leading-relaxed py-2">
            Embedding Soup
          </h1>

          <div className="flex gap-8 justify-center items-start relative">
            {/* Left side - Add phrases */}
            <div className="w-96 relative z-10">
              <AddPhrase />
            </div>

            {/* Center - Soup Bowl */}
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              <div className="absolute w-[1200px] h-[1200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <img
                  src="/soup.png"
                  alt="Soup Bowl"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-[15%] rounded-full overflow-hidden">
                  <PhraseList />
                </div>
              </div>
            </div>

            {/* Right side - Search */}
            <div className="w-96 relative z-10">
              <SearchPhrases />
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </ToastProvider>
  );
}
