// src/components/ErrorBanner.jsx
export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="card border-red-700/50 bg-red-950/40 text-red-400 px-4 py-3 text-sm flex items-start gap-2 animate-fade-in">
      <span className="text-lg leading-none">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
