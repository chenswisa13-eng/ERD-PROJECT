// src/components/CourseCard.jsx
import { useState } from 'react';
import { registerForCourse, unregisterFromCourse } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const SUBJECT_COLORS = {
  cs:   'from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30',
  ma:   'from-purple-600/20 to-violet-600/20 hover:from-purple-600/30 hover:to-violet-600/30',
  ph:   'from-cyan-600/20 to-teal-600/20 hover:from-cyan-600/30 hover:to-teal-600/30',
  en:   'from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30',
  default: 'from-primary-600/10 to-purple-600/10 hover:from-primary-600/20 hover:to-purple-600/20',
};

function getSubjectGradient(courseId = '') {
  const prefix = courseId.toLowerCase().slice(0, 2);
  return SUBJECT_COLORS[prefix] || SUBJECT_COLORS.default;
}

const CREDIT_COLORS = {
  2: 'bg-slate-800 text-slate-300 border-slate-600',
  3: 'bg-primary-900/60 text-primary-300 border-primary-700/40',
  4: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/40',
};

export default function CourseCard({ course, instructorName, enrolled, onEnrollChange }) {
  const { student }  = useAuth();
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!student) return;
    setBusy(true);
    try {
      const result = await registerForCourse(student.studentId, course.id);
      if (result.success) {
        addToast('success', `נרשמת בהצלחה ל-"${course.name}"!`);
        onEnrollChange?.(course.id, true);
      } else {
        addToast('info', 'כבר רשום לקורס זה.');
      }
    } catch (err) {
      addToast('error', `שגיאה בהרשמה: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = async () => {
    if (!student) return;
    setBusy(true);
    try {
      await unregisterFromCourse(student.studentId, course.id);
      addToast('warning', `בוטלה הרשמה ל-"${course.name}".`);
      onEnrollChange?.(course.id, false);
    } catch (err) {
      addToast('error', `שגיאה בביטול: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const gradient    = getSubjectGradient(course.id);
  const creditColor = CREDIT_COLORS[course.credits] ?? CREDIT_COLORS[3];
  const creditLabel = `${course.credits} נק"ז`;

  return (
    <div
      className={`
        group relative flex flex-col gap-3 p-5 rounded-2xl border border-surface-border
        bg-gradient-to-br ${gradient}
        transition-all duration-300 ease-out
        hover:border-primary-500/50 hover:shadow-glow hover:-translate-y-1 hover:scale-[1.02]
        animate-slide-up cursor-default
      `}
    >
      {/* נקודת ירוקה – רשום */}
      {enrolled && (
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse-slow" />
      )}

      {/* שם הקורס */}
      <h3 className="font-semibold text-white text-base leading-snug pr-4
                     group-hover:text-primary-200 transition-colors duration-200">
        {course.name}
      </h3>

      {/* תגית נקודות זכות */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${creditColor}`}>
          {creditLabel}
        </span>
      </div>

      {/* מרצה */}
      <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
        <div className="w-6 h-6 rounded-full bg-surface-raised border border-surface-border flex items-center justify-center text-xs shrink-0">
          👤
        </div>
        <span className="truncate">{instructorName ?? <span className="italic opacity-50">טוען…</span>}</span>
      </div>

      {/* קוד קורס */}
      <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        {course.id}
      </div>

      <div className="flex-1" />

      {/* פעולה */}
      {enrolled ? (
        <div className="flex gap-2">
          <span className="btn-success flex-1 pointer-events-none text-xs py-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            רשום
          </span>
          <button
            id={`drop-${course.id}`}
            onClick={handleDrop}
            disabled={busy}
            className="btn-danger px-3 py-2 text-xs"
            title="בטל הרשמה"
          >
            {busy
              ? <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full" />
              : 'ביטול'}
          </button>
        </div>
      ) : (
        <button
          id={`register-${course.id}`}
          onClick={handleRegister}
          disabled={busy}
          className="btn-primary w-full py-2 text-sm group-hover:shadow-glow transition-shadow duration-300"
        >
          {busy ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              הרשמה
            </>
          )}
        </button>
      )}
    </div>
  );
}
