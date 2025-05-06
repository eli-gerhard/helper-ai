'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSmallScreen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  isSmallScreen 
}) => {
  return (
    <>
      <div 
        className={`fixed md:relative z-10 h-full bg-gray-900 border-r border-white shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto">
            <div className="py-[10px] px-5 border-b border-red-700 flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <Menu className='stroke-white'/>
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-3">
                {['Home', 'Conversations', 'Settings', 'Models', 'Account', 'Help'].map((item) => (
                  <li key={item}>
                    <a href="#" className="block p-2 rounded hover:bg-gray-900 transition-colors text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
      
      {/* Darkening overlay for small screens */}
      {isSidebarOpen && isSmallScreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[5] md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;