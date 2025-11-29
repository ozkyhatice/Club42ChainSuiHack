"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Users, Shield, Crown, Zap, Search } from "lucide-react";

export default function MyClubsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
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
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Clubs</h1>
            <p className="text-gray-600">Clubs you've joined and manage</p>
          </div>
          <Link href="/clubs">
            <Button variant="primary">
              Browse All Clubs
            </Button>
          </Link>
        </div>
        
        {/* Clubs grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for empty state */}
          <Card className="col-span-full hover-lift">
            <CardBody className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-4">
                <Users className="w-16 h-16 text-blue-600 animate-icon-pulse" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No clubs yet</h3>
              <p className="text-gray-600 mb-6">Join clubs to see them here</p>
              <Link href="/clubs">
                <Button variant="primary" className="gap-2">
                  <Search className="w-4 h-4" />
                  Explore Clubs
                </Button>
              </Link>
            </CardBody>
          </Card>
          
          {/* Example club card (this would be populated with real data) */}
          {/* <Card hover>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Club Name</h3>
                  <p className="text-sm text-gray-600">Role: Member</p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 mb-4">
                Club description goes here...
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="primary" size="sm" className="flex-1">
                  Manage
                </Button>
              </div>
            </CardBody>
          </Card> */}
        </div>
        
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-blue-50 rounded-lg mb-2">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Clubs Joined</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-yellow-50 rounded-lg mb-2">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Admin Roles</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-green-50 rounded-lg mb-2">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Active Memberships</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

