// src/components/OnboardingModal.jsx
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const MAJORS = [
  'מדעי המחשב',
  'הנדסת תוכנה',
  'מתמטיקה',
  'פיזיקה',
  'מדע הנתונים',
  'הנדסת חשמל',
  'מנהל עסקים',
  'פסיכולוגיה',
  'ביולוגיה',
  'אחר',
];

export default function OnboardingModal({ onComplete }) {
  const { user }  = useAuth();
  const [name, setName]     = useState(user?.displayName || '');
  const [major, setMajor]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !major) {
      setError('נא למלא את שני השדות.');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'Students', user.uid), { name: name.trim(), major }, { merge: true });
      onComplete({ name: name.trim(), major });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative card p-8 w-full max-w-md animate-slide-up shadow-2xl shadow-black/50">
        {/* פס צבעוני עליון */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />

        {/* אייקון */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-glow-lg">
            <span className="text-3xl">🎓</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-1">ברוך הבא ל-EduPortal!</h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          השלם את הפרופיל שלך כדי להתחיל. זה לוקח רק שנייה.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label htmlFor="onboard-name" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              שם מלא
            </label>
            <input
              id="onboard-name"
              type="text"
              className="input"
              placeholder="ישראל ישראלי"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="onboard-major" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              תחום לימוד
            </label>
            <select
              id="onboard-major"
              className="input"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
            >
              <option value="" disabled>בחר תחום לימוד…</option>
              {MAJORS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-700/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            id="onboard-save-btn"
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 mt-1"
          >
            {saving ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : '🚀 שמור פרופיל'}
          </button>
        </form>
      </div>
    </div>
  );
}
