// src/components/Layout.tsx
import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      {/* Header */}
      <Header />

      {/* Sidebar + Main content */}
      <div className="flex">
        {/* Sidebar (sticky for medium+ screens) */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 pt-24 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
