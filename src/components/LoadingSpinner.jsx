// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ message = 'טוען…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      <div className="w-12 h-12 rounded-full border-4 border-surface-border border-t-primary-500 animate-spin" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}
