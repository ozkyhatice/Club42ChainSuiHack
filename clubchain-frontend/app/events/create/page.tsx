'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import CreateEventForm from './CreateEventFormSimple';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GamifiedButton from '@/components/ui/GamifiedButton';
import OwnerBadge from '@/components/ui/OwnerBadge';
import { useUserOwnedClubs, useIsAnyClubOwner } from '@/hooks/useClubOwnership';
import { getClubs } from '@/src/services/blockchain/getClubs';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';

export default function CreateEventPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { data: ownedClubs = [], isLoading: ownedLoading } = useUserOwnedClubs();
  const { isOwner, clubCount } = useIsAnyClubOwner();
  
  // Debug logging
  if (account) {
    console.log("CreateEventPage - Club Ownership Check:", {
      account: account.address,
      ownedClubsCount: ownedClubs.length,
      clubCount,
      isOwner,
      ownedLoading,
    });
  }
  
  // Available clubs - just use owned clubs since we don't have SuperAdmin system
  const availableClubs = ownedClubs;

  // Wallet not connected - check this first before any loading checks
  if (!account) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-8 text-center">
            <div className="inline-flex p-6 bg-warning/20 rounded-2xl mb-6 border border-warning/30">
              <AlertTriangle className="w-16 h-16 text-warning" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8">
              Please connect your Sui wallet to create events on the blockchain.
            </p>
            <GamifiedButton
              variant="primary"
              onClick={() => router.push('/dashboard')}
              icon={ArrowLeft}
            >
              Back to Dashboard
            </GamifiedButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state - wait for club ownership check
  if (ownedLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Checking club ownership...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user owns any clubs (has ClubAdminCap)
  if (!isOwner || ownedClubs.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-8 text-center">
            <div className="inline-flex p-6 bg-error/20 rounded-2xl mb-6 border border-error/30">
              <AlertTriangle className="w-16 h-16 text-error" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">No Club Admin Access</h1>
            <p className="text-gray-400 mb-6">
              You need to be the admin of at least one club to create events. Create a club first to get admin access.
            </p>
            <div className="flex gap-3 justify-center">
              <GamifiedButton
                variant="primary"
                onClick={() => router.push('/clubs/create')}
                icon={Sparkles}
              >
                Create a Club
              </GamifiedButton>
              <GamifiedButton
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                icon={ArrowLeft}
              >
                Back to Dashboard
              </GamifiedButton>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Owner - can create event
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/events" className="text-[#6b5b95] hover:underline flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </Link>
          <OwnerBadge />
        </div>
        
        {/* Title Section */}
        <div className="bg-primary rounded-xl p-8 text-white shadow-elevation-3 mb-6 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 animate-icon-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold">Create New Event</h1>
          </div>
          <p className="text-white/90">
            Create an event for one of your {clubCount} club{clubCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Form */}
        <CreateEventForm ownedClubs={availableClubs} />
      </div>
    </DashboardLayout>
  );
}

