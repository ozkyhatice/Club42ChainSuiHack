"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, Building2, Sparkles, PlusCircle, TrendingUp } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Users,
      label: "My Clubs",
      href: "/dashboard/my-clubs",
    },
    {
      icon: Calendar,
      label: "My Events",
      href: "/dashboard/my-events",
    },
    {
      icon: Building2,
      label: "All Clubs",
      href: "/clubs",
    },
    {
      icon: Sparkles,
      label: "All Events",
      href: "/events",
    },
    {
      icon: PlusCircle,
      label: "Create Event",
      href: "/events/create",
      highlight: true,
    },
  ];
  
  const isActive = (href: string) => pathname === href;
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fadeIn"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64 flex flex-col
        `}
      >
        {/* Sidebar header (mobile only) */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group
                      ${isActive(item.href)
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : item.highlight
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover-lift"
                        : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                      }
                    `}
                  >
                    <Icon 
                      className={`w-5 h-5 ${isActive(item.href) ? "animate-icon-pulse" : "group-hover:scale-110"} transition-transform`} 
                      strokeWidth={2}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Quick Stats (optional) */}
          <div className="mt-8 px-4 py-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100 hover-lift">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Quick Stats
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Activity: Active
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                Clubs: --
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Events: --
              </p>
            </div>
          </div>
        </nav>
        
        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all group hover:scale-105"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Back to Landing</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

