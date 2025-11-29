"use client";

import { useState, ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header onMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
        
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="text-center text-sm text-gray-600">
            <p>Built with ❤️ for the 42 community • Powered by Sui Blockchain</p>
          </div>
        </footer>
      </div>
    </div>
  );
}


