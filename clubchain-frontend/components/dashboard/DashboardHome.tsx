"use client";

import { useSession } from "next-auth/react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import ModuleCard from "./ModuleCard";
import Card, { CardBody } from "@/components/ui/Card";
import { 
  Users, 
  Calendar, 
  Building2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Award
} from "lucide-react";

export default function DashboardHome() {
  const { data: session } = useSession();
  const account = useCurrentAccount();
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 sm:p-8 text-white shadow-lg animate-slideUp relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 animate-icon-pulse" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Welcome back, {session?.user?.login || "Student"}!
            </h1>
          </div>
          <p className="text-blue-100 text-base sm:text-lg">
            Ready to explore clubs and events on campus? Let's make it happen! 🚀
          </p>
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="grid sm:grid-cols-2 gap-4 animate-slideUp animation-delay-200">
        {/* 42 Auth Status */}
        <Card className="hover-lift">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">42 Authentication</p>
                <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Connected
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Wallet Status */}
        <Card className="hover-lift">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sui Wallet</p>
                {account ? (
                  <>
                    <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Connected
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-orange-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Not Connected
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${account ? 'bg-green-50' : 'bg-orange-50'}`}>
                <TrendingUp className={`w-8 h-8 ${account ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Modular Dashboard Cards */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slideUp animation-delay-400">
        {/* My Clubs Module */}
        <ModuleCard
          title="My Clubs"
          description="Manage your club memberships and explore new communities"
          icon={Users}
          iconColor="text-blue-600"
          stats={[
            { label: "Clubs Joined", value: "--" },
            { label: "Admin Roles", value: "--" }
          ]}
          actions={[
            { label: "View All", href: "/dashboard/my-clubs", variant: "secondary" },
            { label: "Browse Clubs", href: "/clubs", variant: "primary" }
          ]}
          badge={{ label: "Active", color: "bg-green-100 text-green-800" }}
          onClick={() => router.push("/dashboard/my-clubs")}
        />
        
        {/* My Events Module */}
        <ModuleCard
          title="My Events"
          description="Track your registered events and create new ones"
          icon={Calendar}
          iconColor="text-purple-600"
          stats={[
            { label: "Registered", value: "--" },
            { label: "Created", value: "--" }
          ]}
          actions={[
            { label: "My Events", href: "/dashboard/my-events", variant: "secondary" },
            { label: "Create Event", href: "/events/create", variant: "primary" }
          ]}
          badge={{ label: "Upcoming", color: "bg-purple-100 text-purple-800" }}
          onClick={() => router.push("/dashboard/my-events")}
        />
        
        {/* All Clubs Module */}
        <ModuleCard
          title="Club Directory"
          description="Discover all clubs on campus and find your community"
          icon={Building2}
          iconColor="text-indigo-600"
          stats={[
            { label: "Total Clubs", value: "--" },
            { label: "Active", value: "--" }
          ]}
          actions={[
            { label: "Explore Clubs", href: "/clubs", variant: "primary" }
          ]}
          onClick={() => router.push("/clubs")}
        />
        
        {/* All Events Module */}
        <ModuleCard
          title="Event Listings"
          description="Browse upcoming events and register to participate"
          icon={Sparkles}
          iconColor="text-pink-600"
          stats={[
            { label: "Upcoming", value: "--" },
            { label: "This Week", value: "--" }
          ]}
          actions={[
            { label: "View Events", href: "/events", variant: "primary" }
          ]}
          badge={{ label: "Live", color: "bg-pink-100 text-pink-800" }}
          onClick={() => router.push("/events")}
        />
      </div>
    </div>
  );
}

