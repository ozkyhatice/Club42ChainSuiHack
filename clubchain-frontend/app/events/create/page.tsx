'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import CreateEventForm from './CreateEventForm';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GamifiedButton from '@/components/ui/GamifiedButton';
import OwnerBadge from '@/components/ui/OwnerBadge';
import { useUserOwnedClubs, useIsAnyClubOwner } from '@/hooks/useClubOwnership';
import { useHasAnyValidClubOwnerBadge } from '@/hooks/useClubOwnerBadge';
import { Crown, AlertTriangle, ArrowLeft, Building2, Sparkles, Shield } from 'lucide-react';

export default function CreateEventPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { data: ownedClubs = [], isLoading: ownedLoading } = useUserOwnedClubs();
  const { isOwner, clubCount } = useIsAnyClubOwner();
  const { data: hasValidBadge, isLoading: isCheckingBadge } = useHasAnyValidClubOwnerBadge();

  // Loading state
  if (ownedLoading || isCheckingBadge) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Checking permissions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Wallet not connected
  if (!account) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-elevation-2 p-8 text-center">
            <div className="inline-flex p-6 bg-orange-50 rounded-2xl mb-6">
              <AlertTriangle className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8">
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

  // Check if user has valid ClubOwnerBadge
  if (!hasValidBadge) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-8 text-center">
            <div className="inline-flex p-6 bg-error/20 rounded-2xl mb-6 border border-error/30">
              <Shield className="w-16 h-16 text-error" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Club Owner Badge Required</h1>
            <p className="text-gray-400 mb-6">
              You need a valid ClubOwnerBadge to create events. This badge proves your club ownership and has an expiration date.
            </p>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">How to get a ClubOwnerBadge?</h3>
                  <p className="text-sm text-gray-400">
                    ClubOwnerBadge is issued by Super Admins. Contact a Super Admin to receive a valid badge for your club.
                    The badge expires after a certain period (default: 90 days) and needs to be renewed.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
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

  // Not a club owner (fallback check)
  if (!isOwner || clubCount === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-8 text-center">
            <div className="inline-flex p-6 bg-warning/20 rounded-2xl mb-6 border border-warning/30">
              <Crown className="w-16 h-16 text-warning" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Owner Access Required</h1>
            <p className="text-gray-400 mb-6">
              Only club owners can create events. You need to own at least one club to create an event.
            </p>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">How to become a club owner?</h3>
                  <p className="text-sm text-gray-400">
                    Create a new club from the dashboard, or have an existing club owner transfer their ClubAdminCap to you.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <GamifiedButton
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                icon={ArrowLeft}
              >
                Back to Dashboard
              </GamifiedButton>
              <GamifiedButton
                variant="primary"
                onClick={() => router.push('/clubs')}
                icon={Building2}
              >
                Browse Clubs
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
        <CreateEventForm ownedClubs={ownedClubs} />
      </div>
    </DashboardLayout>
  );
}

