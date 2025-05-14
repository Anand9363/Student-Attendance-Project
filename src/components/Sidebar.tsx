import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserPlus, UserCheck, BarChart, Database, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-[64px] w-64 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 shadow-md transition-all duration-200 z-40 hidden md:block">
      <div className="px-6 py-8">
        <nav className="space-y-6">
          <div>
            <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-3">Main</h3>
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/register" 
                  className={({ isActive }) => 
                    `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Register Student</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/attendance" 
                  className={({ isActive }) => 
                    `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Take Attendance</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/records" 
                  className={({ isActive }) => 
                    `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <BarChart className="w-5 h-5" />
                  <span>View Records</span>
                </NavLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-3">Management</h3>
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/students" 
                  className={({ isActive }) => 
                    `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Database className="w-5 h-5" />
                  <span>Student Database</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => 
                    `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;