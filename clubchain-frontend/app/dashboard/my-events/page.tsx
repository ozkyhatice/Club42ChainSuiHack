"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, Sparkles, CheckCircle, Clock, Plus, Search } from "lucide-react";
import { useCanCreateEvent } from "@/hooks/useBadgeAuth";

export default function MyEventsPage() {
  const canCreateEvent = useCanCreateEvent();
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Events</h1>
            <p className="text-gray-400">Events you've created or joined</p>
          </div>
          {canCreateEvent && (
            <Link href="/events/create">
              <Button variant="primary" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-secondary">
          <button className="px-4 py-2 font-medium text-primary border-b-2 border-primary">
            Registered
          </button>
          <button className="px-4 py-2 font-medium text-gray-400 hover:text-foreground">
            Created
          </button>
          <button className="px-4 py-2 font-medium text-gray-400 hover:text-foreground">
            Past Events
          </button>
        </div>
        
        {/* Events list */}
        <div className="space-y-4">
          {/* Placeholder for empty state */}
          <Card className="col-span-full hover-lift">
            <CardBody className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 border border-primary/20">
                <Calendar className="w-16 h-16 text-primary animate-icon-pulse" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No events yet</h3>
              <p className="text-gray-400 mb-6">
                {canCreateEvent 
                  ? "Register for events or create your own"
                  : "Register for events to get started"
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/events">
                  <Button variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    Browse Events
                  </Button>
                </Link>
                {canCreateEvent && (
                  <Link href="/events/create">
                    <Button variant="primary" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Button>
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>
          
          {/* Example event card (this would be populated with real data) */}
          {/* <Card hover>
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-[#7c6ba0] to-[#6b5b95] rounded-lg flex flex-col items-center justify-center text-white">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-xs">DEC</div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Event Title</h3>
                  <p className="text-sm text-gray-600 mb-2">Event description...</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>📍 Location</span>
                    <span>🕐 Time</span>
                    <span>👥 50 attendees</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardBody>
          </Card> */}
        </div>
        
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mt-8">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-[#f5f3f8] rounded-lg mb-2">
                <Calendar className="w-8 h-8 text-[#6b5b95]" />
              </div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-gray-400">Registered</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-[#f5f3f8] rounded-lg mb-2">
                <Sparkles className="w-8 h-8 text-[#6b5b95]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Created</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-green-50 rounded-lg mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Attended</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-orange-50 rounded-lg mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

