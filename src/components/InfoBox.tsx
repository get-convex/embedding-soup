import React from "react";

interface InfoBoxProps {
  children: React.ReactNode;
  icon: React.ReactNode;
}

export function InfoBox({ children, icon }: InfoBoxProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">{children}</p>
    </div>
  );
}
