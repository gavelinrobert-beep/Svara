import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, getBusiness } from '../lib/auth';
import { api } from '../lib/api';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const business = getBusiness();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Inkorg' },
    { to: '/dashboard/pipeline', label: 'Pipeline' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-semibold text-accent-700">
                Svara
              </Link>
              <nav className="flex gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                      location.pathname === link.to
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {business && (
                <span className="text-sm text-gray-600">{business.name}</span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
