// src/pages/MySchedulePage.jsx
import { useState, useEffect, useMemo } from 'react';
import { fetchStudentEnrollments, unregisterFromCourse } from '../hooks/useFirestore';
import { useCollection } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import { useToast } from '../components/Toast';

export default function MySchedulePage() {
  const { student }            = useAuth();
  const { addToast }           = useToast();
  const { data: courses }      = useCollection('Courses');
  const { data: instructors }  = useCollection('Instructors');

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [dropping, setDropping]       = useState(null);

  const instructorMap = useMemo(() => {
    const map = {};
    instructors.forEach((i) => { map[i.id] = i.name; });
    return map;
  }, [instructors]);

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach((c) => { map[c.id] = c; });
    return map;
  }, [courses]);

  const fetchEnrollments = () => {
    if (!student) return;
    setLoading(true);
    fetchStudentEnrollments(student.studentId)
      .then(setEnrollments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEnrollments(); }, [student]);

  const handleDrop = async (enrollment) => {
    setDropping(enrollment.id);
    try {
      await unregisterFromCourse(student.studentId, enrollment.courseId);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id));
      addToast('warning', `בוטלה הרשמה ל-"${courseMap[enrollment.courseId]?.name ?? enrollment.courseId}".`);
    } catch (err) {
      setError(err.message);
      addToast('error', `שגיאה בביטול: ${err.message}`);
    } finally {
      setDropping(null);
    }
  };

  const enrolledCourses = enrollments
    .map((e) => ({ enrollment: e, course: courseMap[e.courseId] }))
    .filter((x) => x.course);

  const totalCredits = enrolledCourses.reduce((sum, { course }) => sum + (course.credits ?? 0), 0);

  return (
    <div className="page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* כותרת */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">לוח הזמנים שלי</h1>
          <p className="section-subtitle">הקורסים שנרשמת אליהם בסמסטר זה.</p>
        </div>
        {!loading && (
          <div className="flex gap-3">
            <div className="card px-4 py-2 text-center">
              <div className="text-xl font-bold text-primary-400">{enrolledCourses.length}</div>
              <div className="text-xs text-slate-500">קורסים</div>
            </div>
            <div className="card px-4 py-2 text-center">
              <div className="text-xl font-bold text-emerald-400">{totalCredits}</div>
              <div className="text-xs text-slate-500">נק"ז</div>
            </div>
          </div>
        )}
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner message="טוען את לוח הזמנים שלך…" />
      ) : enrolledCourses.length === 0 ? (
        /* מצב ריק */
        <div className="card p-12 text-center animate-fade-in">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-white mb-2">טרם נרשמת לקורסים</h2>
          <p className="text-slate-400 text-sm mb-6">עבור לקטלוג הקורסים כדי להירשם לקורסים.</p>
          <a href="/catalog" className="btn-primary inline-flex mx-auto">
            ← לקטלוג הקורסים
          </a>
        </div>
      ) : (
        <>
          {/* טבלה – מסך רחב */}
          <div className="hidden md:block card overflow-hidden animate-slide-up">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-right">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">שם הקורס</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">קוד</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">מרצה</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">נק"ז</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">תאריך הרשמה</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ציון</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">פעולה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {enrolledCourses.map(({ enrollment, course }) => (
                  <tr key={enrollment.id} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{course.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 uppercase">{course.id}</td>
                    <td className="px-6 py-4 text-slate-300">{instructorMap[course.instructorId] ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className="badge-primary">{course.credits} נק"ז</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {enrollment.enrollmentDate?.toDate
                        ? enrollment.enrollmentDate.toDate().toLocaleDateString('he-IL')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.grade
                        ? <span className="badge-emerald">{enrollment.grade}</span>
                        : <span className="text-slate-600 text-xs">ממתין</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        id={`drop-schedule-${course.id}`}
                        onClick={() => handleDrop(enrollment)}
                        disabled={dropping === enrollment.id}
                        className="btn-danger px-3 py-1.5 text-xs"
                      >
                        {dropping === enrollment.id ? '…' : 'ביטול'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-surface-border bg-surface-raised/30">
                  <td colSpan={3} className="px-6 py-3 text-xs text-slate-500 font-semibold">סה"כ</td>
                  <td className="px-6 py-3">
                    <span className="badge-emerald">{totalCredits} נק"ז</span>
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* כרטיסים – מובייל */}
          <div className="md:hidden flex flex-col gap-3 animate-slide-up">
            {enrolledCourses.map(({ enrollment, course }) => (
              <div key={enrollment.id} className="card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-sm leading-snug">{course.name}</h3>
                  <span className="badge-primary shrink-0">{course.credits} נק"ז</span>
                </div>
                <div className="text-xs text-slate-500 font-mono uppercase">{course.id}</div>
                <div className="text-sm text-slate-400">
                  👤 {instructorMap[course.instructorId] ?? '—'}
                </div>
                {enrollment.grade && (
                  <span className="badge-emerald self-start">ציון: {enrollment.grade}</span>
                )}
                <button
                  id={`drop-mobile-${course.id}`}
                  onClick={() => handleDrop(enrollment)}
                  disabled={dropping === enrollment.id}
                  className="btn-danger w-full mt-1"
                >
                  {dropping === enrollment.id ? 'מבטל…' : 'בטל הרשמה'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
