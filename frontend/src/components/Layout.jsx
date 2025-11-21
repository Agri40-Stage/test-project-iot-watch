import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header />
      <main className="p-4 md:p-8">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;