"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useSynchronizedSignOut } from "@/hooks/useSynchronizedSignOut";
import { User, LogOut, CheckCircle2, ChevronUp } from "lucide-react";

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
          <p className="text-sm font-semibold text-foreground">{session.user.login}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-success" />
            <p className="text-xs text-success font-medium">Verified Student</p>
          </div>
        </div>
        
        {/* Dropdown arrow */}
        <ChevronUp
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "rotate-180"}`}
        />
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-elevation-3 border border-border-light py-2 animate-scaleUp z-50 overflow-hidden">
          {/* User info in dropdown (mobile) */}
          <div className="md:hidden px-4 py-3 border-b border-secondary">
            <p className="text-sm font-semibold text-foreground">{session.user.login}</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <p className="text-xs text-success font-medium">Verified Student</p>
            </div>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                window.location.href = "/profile";
              }}
              className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-all duration-200 flex items-center gap-3 group"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">My Profile</span>
            </button>
            
            <div className="border-t border-secondary my-1.5"></div>
            
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                handleSignOut("/");
              }}
              className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-all duration-200 flex items-center gap-3 group"
            >
              <div className="p-1.5 rounded-lg bg-error/10 group-hover:bg-error/20 transition-colors">
                <LogOut className="w-4 h-4 text-error" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

