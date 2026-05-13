// src/pages/LoginPage.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate             = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [mode, setMode]      = useState('login');

  const [form, setForm]           = useState({ name: '', major: '', email: '', password: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[EduPortal] מצב:', mode);
    console.log('[EduPortal] אימייל:', form.email);
    console.log('[EduPortal] אורך סיסמה:', form.password?.length ?? 0);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(user, { displayName: form.name });
        await setDoc(doc(db, 'Students', user.uid), {
          name:  form.name  || form.email,
          major: form.major || 'לא הוגדר',
        });
      }
      navigate('/catalog');
    } catch (err) {
      console.error('[EduPortal] קוד שגיאה:', err.code);
      console.error('[EduPortal] הודעת שגיאה:', err.message);
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/catalog');
    } catch (err) {
      console.error('[EduPortal] שגיאת Google:', err.code, err.message);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyError(err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* לוגו */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow-lg mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-white">EduPortal</h1>
          <p className="text-slate-400 mt-1 text-sm">מערכת הרשמה לקורסים</p>
        </div>

        {/* כרטיס */}
        <div className="card p-8">
          {/* בורר מצב */}
          <div className="flex rounded-xl overflow-hidden border border-surface-border mb-6">
            {[
              { key: 'login',    label: 'כניסה'      },
              { key: 'register', label: 'הרשמה' },
            ].map(({ key, label }) => (
              <button
                key={key}
                id={`tab-${key}`}
                onClick={() => { setMode(key); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-150
                  ${mode === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-raised text-slate-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* כניסה עם Google */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                       bg-white text-gray-700 font-semibold text-sm
                       border border-gray-200 shadow-sm
                       hover:bg-gray-50 hover:shadow-md
                       active:scale-[0.98] transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {googleLoading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            ) : <GoogleLogo />}
            {googleLoading ? 'מתחבר…' : `${mode === 'login' ? 'כניסה' : 'הרשמה'} עם Google`}
          </button>

          {/* מפריד */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-slate-600 font-medium">או המשך עם אימייל</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* טופס */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">שם מלא</label>
                  <input id="name" name="name" className="input" placeholder="ישראל ישראלי" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="major" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">תחום לימוד</label>
                  <input id="major" name="major" className="input" placeholder="מדעי המחשב" value={form.major} onChange={handleChange} />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">אימייל</label>
              <input id="email" name="email" type="email" className="input" placeholder="student@university.ac.il" value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">סיסמה</label>
              <input id="password" name="password" type="password" className="input" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-950/40 border border-red-700/40 rounded-xl px-4 py-2 animate-fade-in">
                {error}
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full py-3 text-base mt-1"
            >
              {loading ? (
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          מופעל על ידי Firebase • EduPortal © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function getFriendlyError(code) {
  const messages = {
    'auth/invalid-credential':     'אימייל או סיסמה שגויים.',
    'auth/user-not-found':         'לא נמצא חשבון עם אימייל זה.',
    'auth/wrong-password':         'סיסמה שגויה.',
    'auth/email-already-in-use':   'חשבון עם אימייל זה כבר קיים.',
    'auth/weak-password':          'הסיסמה חייבת להכיל לפחות 6 תווים.',
    'auth/invalid-email':          'נא להזין כתובת אימייל תקינה.',
    'auth/too-many-requests':      'יותר מדי ניסיונות. נסה שוב מאוחר יותר.',
    'auth/network-request-failed': 'שגיאת רשת. בדוק את החיבור לאינטרנט.',
    'auth/popup-blocked':          'החלון הנחסם. אנא אפשר חלונות קופצים לאתר זה.',
    'auth/account-exists-with-different-credential': 'חשבון קיים עם שיטת כניסה אחרת.',
  };
  return messages[code] ?? 'אירעה שגיאה. נסה שוב.';
}
