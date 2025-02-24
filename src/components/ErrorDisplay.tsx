interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">{error}</div>
  );
}
