import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
      >
        <Home className="w-5 h-5" />
        <span>Back to Home</span>
      </button>
    </div>
  );
};

export default NotFound;