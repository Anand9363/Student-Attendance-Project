import React from 'react';
import { Menu, Moon, Sun, UserPlus, UserCheck, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed w-full bg-white dark:bg-gray-800 shadow-md z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div 
            className="font-bold text-xl text-blue-600 dark:text-blue-400 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span>Face</span>
            <span className="text-green-500 dark:text-green-400">Attendance</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button 
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate('/register')}
          >
            <UserPlus className="w-5 h-5" />
            <span>Register</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate('/attendance')}
          >
            <UserCheck className="w-5 h-5" />
            <span>Attendance</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate('/records')}
          >
            <BarChart className="w-5 h-5" />
            <span>Records</span>
          </button>
        </div>

        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-white dark:bg-gray-800 py-4 px-6 md:hidden">
          <div className="flex flex-col space-y-3">
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                navigate('/register');
                setIsMobileMenuOpen(false);
              }}
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
            >
              <BarChart className="w-5 h-5" />
              <span>Records</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;