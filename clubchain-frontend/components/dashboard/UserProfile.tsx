"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useSynchronizedSignOut } from "@/hooks/useSynchronizedSignOut";

export default function UserProfile() {
  const { data: session } = useSession();
  const { handleSignOut } = useSynchronizedSignOut();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const userInitials = session.user.login
    ? session.user.login.substring(0, 2).toUpperCase()
    : "42";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
          {userInitials}
        </div>
        
        {/* User info (hidden on mobile) */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-foreground">{session.user.login}</p>
          <p className="text-xs text-success">✓ Verified Student</p>
        </div>
        
        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-secondary py-2 animate-scaleUp z-50">
          {/* User info in dropdown (mobile) */}
          <div className="md:hidden px-4 py-3 border-b border-secondary">
            <p className="text-sm font-bold text-foreground">{session.user.login}</p>
            <p className="text-xs text-success">✓ Verified Student</p>
          </div>
          
          {/* Menu items */}
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              window.location.href = "/profile";
            }}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <span>👤</span>
            My Profile
          </button>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              // Navigate to settings (to be implemented)
            }}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <span>⚙️</span>
            Settings
          </button>
          
          <div className="border-t border-secondary my-2"></div>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              handleSignOut("/");
            }}
            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/20 transition-colors flex items-center gap-2"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

