"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const account = useCurrentAccount();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!session) {
    return null;
  }
  
  const userInitials = session.user?.login
    ? session.user.login.substring(0, 2).toUpperCase()
    : "42";
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Profile Header */}
        <Card className="animate-slideUp">
          <CardBody className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg group-hover:scale-105 transition-transform">
                  {userInitials}
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {session.user?.login || "Student"}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 text-gray-600">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    42 Student
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Active Member
                  </span>
                </div>
                {session.user?.email && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {session.user.email}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-600 hover:bg-red-50"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp animation-delay-200">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-blue-50 rounded-lg inline-flex mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Clubs Joined</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-purple-50 rounded-lg inline-flex mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Events Attended</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-green-50 rounded-lg inline-flex mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Events Created</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-yellow-50 rounded-lg inline-flex mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </CardBody>
          </Card>
        </div>
        
        {/* Connection Status */}
        <div className="grid sm:grid-cols-2 gap-6 animate-slideUp animation-delay-400">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Authentication
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">42 OAuth</span>
                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${account ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <span className="text-sm font-medium text-gray-700">Sui Wallet</span>
                  {account ? (
                    <span className="flex items-center gap-2 text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-orange-600 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Account Details
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="text-sm font-medium text-gray-900">{session.user?.login || "N/A"}</p>
                  </div>
                </div>
                {account && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Wallet Address</p>
                      <p className="text-sm font-medium text-gray-900 font-mono break-all">
                        {account.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


