import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Tv2 } from 'lucide-react';

interface LayoutProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Layout = ({ isLoggedIn, onLogout }: LayoutProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <header className="bg-teal-700 dark:bg-teal-900 text-white shadow-md transition-colors duration-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-2 text-xl font-semibold">
            <Tv2 size={24} />
            <span>Détection PUB / NO PUB</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-teal-600 dark:hover:bg-teal-800 transition-colors duration-200"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isLoggedIn && (
              <button 
                onClick={onLogout} 
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors duration-200"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 py-4 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200 border-t border-gray-200 dark:border-gray-700">
        Made with 💖 by ludo
      </footer>
    </div>
  );
};

export default Layout;