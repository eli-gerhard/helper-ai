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
        className={`fixed md:relative z-10 h-full bg-[var(--background)] border-r border-[var(--foreground)] shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto">
            <div className="py-[10px] px-5 border-b border-[var(--accentrd)] flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md hover:bg-[var(--hover)] transition-colors"
                aria-label="Close menu"
              >
                <Menu className='stroke-[var(--foreground)]'/>
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-3">
                {['Home', 'Conversations', 'Settings', 'Models', 'Account', 'Help'].map((item) => (
                  <li key={item}>
                    <a href="#" className="block p-2 rounded hover:bg-[var(--hover)] transition-colors text-[var(--foreground)]">
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