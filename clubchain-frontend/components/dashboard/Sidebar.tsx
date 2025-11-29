"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, Building2, Sparkles, PlusCircle, Shield, User } from "lucide-react";
import { useIsAnyClubOwner } from "@/hooks/useClubOwnership";
import { useIsSuperAdmin } from "@/hooks/useSuperAdmin";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isOwner } = useIsAnyClubOwner();
  const { data: isSuperAdmin } = useIsSuperAdmin();
  
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
      label: "Browse Clubs",
      href: "/clubs",
    },
    {
      icon: Sparkles,
      label: "Browse Events",
      href: "/events",
    },
    {
      icon: Building2,
      label: "Create Club",
      href: "/clubs/create",
      highlight: true,
    },
    ...(isOwner ? [
      {
        icon: PlusCircle,
        label: "Create Event",
        href: "/events/create",
        highlight: true,
      },
      {
        icon: Shield,
        label: "Admin Panel",
        href: "/admin",
        ownerOnly: true,
      },
    ] : []),
    ...(isSuperAdmin ? [
      {
        icon: Shield,
        label: "Super Admin",
        href: "/super-admin",
        superAdmin: true,
      },
    ] : []),
    {
      icon: User,
      label: "Profile",
      href: "/profile",
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
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
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
                        : (item as any).ownerOnly
                        ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 shadow-md hover-lift"
                        : (item as any).superAdmin
                        ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-md hover-lift animate-pulse-glow"
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

