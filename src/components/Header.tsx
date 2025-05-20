import React from 'react';
import { Menu, Moon, Sun, UserPlus, UserCheck, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="fixed w-full bg-white dark:bg-gray-800 shadow-md z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left side: Hamburger + Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu toggle */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo / Title */}
          <div
            className="font-bold text-xl text-blue-600 dark:text-blue-400 cursor-pointer select-none"
            onClick={() => navigate('/')}
            aria-label="Go to home"
          >
            <span>Face</span>
            <span className="text-green-500 dark:text-green-400">Attendance</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate('/register')}
            aria-label="Register student"
          >
            <UserPlus className="w-5 h-5" />
            <span>Register</span>
          </button>
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate('/attendance')}
            aria-label="Take attendance"
          >
            <UserCheck className="w-5 h-5" />
            <span>Attendance</span>
          </button>
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate('/records')}
            aria-label="View attendance records"
          >
            <BarChart className="w-5 h-5" />
            <span>Records</span>
          </button>
        </nav>

        {/* Theme toggle desktop */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-gray-800" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <nav className="bg-white dark:bg-gray-800 py-4 px-6 md:hidden">
          <div className="flex flex-col space-y-3">
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                navigate('/register');
                setIsMobileMenuOpen(false);
              }}
              aria-label="Register student"
            >
              <UserPlus className="w-5 h-5" />
              <span>Register</span>
            </button>
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                navigate('/attendance');
                setIsMobileMenuOpen(false);
              }}
              aria-label="Take attendance"
            >
              <UserCheck className="w-5 h-5" />
              <span>Attendance</span>
            </button>
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                navigate('/records');
                setIsMobileMenuOpen(false);
              }}
              aria-label="View attendance records"
            >
              <BarChart className="w-5 h-5" />
              <span>Records</span>
            </button>

            {/* Mobile theme toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle light/dark theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-gray-800" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
