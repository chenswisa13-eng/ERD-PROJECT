// src/pages/CourseCatalogPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useCollection, fetchStudentEnrollments, seedInitialData } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import { useToast } from '../components/Toast';

const SEMESTER_CREDIT_GOAL = 18;

// ── סרגל התקדמות ─────────────────────────────────────────────────────────────
function CreditProgressBar({ current, goal }) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const color =
    pct >= 100 ? 'from-emerald-500 to-teal-400' :
    pct >= 75  ? 'from-primary-500 to-purple-500' :
    pct >= 40  ? 'from-amber-500 to-orange-400' :
                 'from-red-500 to-rose-400';

  return (
    <div className="card px-5 py-4 flex flex-col gap-2 min-w-[220px]">
      <div className="flex items-end justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">התקדמות הסמסטר</span>
        <span className="text-xs font-bold text-white">{current} / {goal} נק"ז</span>
      </div>
      <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span>{pct}% הושלם</span>
        {pct >= 100
          ? <span className="text-emerald-400 font-semibold">✓ היעד הושג!</span>
          : <span>נותרו {goal - current} נק"ז</span>}
      </div>
    </div>
  );
}

// ── מסך ריק ───────────────────────────────────────────────────────────────────
function EmptyState({ onSeed, seeding, seedMsg }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 animate-fade-in text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-600/20 to-purple-600/20 border border-primary-600/20 flex items-center justify-center animate-pulse-slow">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600/30 to-purple-600/30 flex items-center justify-center">
            <span className="text-5xl">📚</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-400 shadow-glow animate-bounce" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">אין קורסים עדיין</h2>
      <p className="text-slate-400 max-w-sm mb-2">
        קטלוג הקורסים ריק. טען נתוני דוגמה כדי להתחיל.
      </p>
      <p className="text-slate-600 text-xs mb-8">
        פעולה זו תוסיף 4 מרצים ו-8 קורסים באופן מיידי.
      </p>

      <button
        id="seed-data-btn"
        onClick={onSeed}
        disabled={seeding}
        className="btn-primary px-8 py-3 text-base shadow-glow hover:shadow-glow-lg"
      >
        {seeding ? (
          <>
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            טוען נתונים…
          </>
        ) : <>🌱 טען נתונים ראשוניים</>}
      </button>

      {seedMsg && (
        <p className="mt-4 text-sm text-emerald-400 animate-fade-in">{seedMsg}</p>
      )}
    </div>
  );
}

// ── עמוד ראשי ─────────────────────────────────────────────────────────────────
export default function CourseCatalogPage() {
  const { student }  = useAuth();
  const { addToast } = useToast();
  const { data: courses,     loading: cL, error: cE } = useCollection('Courses');
  const { data: instructors, loading: iL, error: iE } = useCollection('Instructors');

  const [enrolledIds, setEnrolledIds]     = useState(new Set());
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [seeding, setSeeding]             = useState(false);
  const [seedMsg, setSeedMsg]             = useState('');
  const [search, setSearch]               = useState('');
  const [creditFilter, setCreditFilter]   = useState('all');

  const instructorMap = useMemo(() => {
    const map = {};
    instructors.forEach((i) => { map[i.id] = i.name; });
    return map;
  }, [instructors]);

  useEffect(() => {
    if (!student) { setEnrollLoading(false); return; }
    setEnrollLoading(true);
    fetchStudentEnrollments(student.studentId)
      .then((enrollments) => setEnrolledIds(new Set(enrollments.map((e) => e.courseId))))
      .catch(console.error)
      .finally(() => setEnrollLoading(false));
  }, [student]);

  const handleEnrollChange = (courseId, isEnrolled) => {
    setEnrolledIds((prev) => {
      const next = new Set(prev);
      isEnrolled ? next.add(courseId) : next.delete(courseId);
      return next;
    });
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const { instructors: iCount, courses: cCount } = await seedInitialData();
      setSeedMsg(`✅ נוספו ${iCount} מרצים ו-${cCount} קורסים!`);
      addToast('success', `הנתונים נטענו בהצלחה – ${cCount} קורסים ו-${iCount} מרצים.`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setSeedMsg(`❌ ${err.message}`);
      addToast('error', `טעינת הנתונים נכשלה: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (instructorMap[c.instructorId] ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesCredit = creditFilter === 'all' || String(c.credits) === creditFilter;
      return matchesSearch && matchesCredit;
    });
  }, [courses, search, creditFilter, instructorMap]);

  const dataLoading   = cL || iL;
  const error         = cE || iE;
  const creditOptions = [...new Set(courses.map((c) => c.credits))].sort((a, b) => a - b);
  const enrolledCount = enrolledIds.size;
  const totalCredits  = courses
    .filter((c) => enrolledIds.has(c.id))
    .reduce((sum, c) => sum + (c.credits ?? 0), 0);

  return (
    <div className="page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* כותרת */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="section-title">קטלוג קורסים</h1>
            <p className="section-subtitle">עיין בכל הקורסים הזמינים והירשם לסמסטר.</p>
          </div>
          {!dataLoading && courses.length > 0 && (
            <button
              id="reseed-data-btn"
              onClick={handleSeed}
              disabled={seeding}
              className="btn-secondary text-xs self-start"
            >
              {seeding ? '⏳ טוען…' : '🌱 טען מחדש'}
            </button>
          )}
        </div>

        {/* סטטיסטיקות */}
        {!dataLoading && courses.length > 0 && (
          <div className="flex flex-wrap gap-3 items-stretch">
            <div className="card px-5 py-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-primary-400">{enrolledCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">רשום</div>
            </div>
            <div className="card px-5 py-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-emerald-400">{totalCredits}</div>
              <div className="text-xs text-slate-500 mt-0.5">נק"ז</div>
            </div>
            <div className="card px-5 py-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-slate-300">{courses.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">זמינים</div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <CreditProgressBar current={totalCredits} goal={SEMESTER_CREDIT_GOAL} />
            </div>
          </div>
        )}
      </div>

      <ErrorBanner message={error} />

      {dataLoading ? (
        <LoadingSpinner message="טוען קורסים…" />
      ) : courses.length === 0 ? (
        <EmptyState onSeed={handleSeed} seeding={seeding} seedMsg={seedMsg} />
      ) : (
        <>
          {/* חיפוש וסינון */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                id="course-search"
                type="text"
                className="input pr-10"
                placeholder="חפש לפי שם קורס, קוד או מרצה…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              id="credit-filter"
              className="input sm:w-44"
              value={creditFilter}
              onChange={(e) => setCreditFilter(e.target.value)}
            >
              <option value="all">כל נקודות הזכות</option>
              {creditOptions.map((cr) => (
                <option key={cr} value={String(cr)}>{cr} נק"ז</option>
              ))}
            </select>
          </div>

          {/* אין תוצאות */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-5xl mb-4">🔎</p>
              <p className="text-white font-semibold mb-1">לא נמצאו קורסים התואמים לחיפוש</p>
              <p className="text-slate-500 text-sm">נסה לשנות את מילות החיפוש או הסינון.</p>
              <button
                onClick={() => { setSearch(''); setCreditFilter('all'); }}
                className="btn-secondary mt-4"
              >
                נקה סינון
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 mb-4">
                מציג {filtered.length} מתוך {courses.length} קורסים
                {enrollLoading && <span className="mr-2 text-primary-500">· טוען רישומים…</span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((course, index) => (
                  <div
                    key={course.id}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className="animate-slide-up"
                  >
                    <CourseCard
                      course={course}
                      instructorName={instructorMap[course.instructorId]}
                      enrolled={enrolledIds.has(course.id)}
                      onEnrollChange={handleEnrollChange}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
