// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/catalog',  label: 'קטלוג קורסים', icon: '📚' },
  { to: '/schedule', label: 'לוח הזמנים שלי', icon: '📅' },
];

export default function Navbar() {
  const { user, student } = useAuth();
  const location          = useLocation();
  const navigate          = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* לוגו */}
        <Link to="/catalog" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-glow group-hover:shadow-glow-lg transition-shadow">
            E
          </span>
          <span className="font-bold text-white text-lg tracking-tight">
            EduPortal
          </span>
        </Link>

        {/* קישורי ניווט – מסך רחב */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-surface-raised'}`}
              >
                <span>{icon}</span> {label}
              </Link>
            );
          })}
        </nav>

        {/* אזור משתמש */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-white leading-none">{student?.name ?? user.email}</span>
              {student?.major && (
                <span className="text-xs text-slate-500 leading-none mt-0.5">{student.major}</span>
              )}
            </div>
            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              התנתקות
            </button>
          </div>
        )}
      </div>

      {/* ניווט מובייל */}
      <div className="sm:hidden flex border-t border-surface-border">
        {NAV_LINKS.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors
                ${active ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="text-base">{icon}</span> {label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
