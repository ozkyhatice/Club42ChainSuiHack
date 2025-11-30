'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useBadgeAuth } from '@/hooks/useBadgeAuth';
import { useIsSuperAdmin } from '@/hooks/useSuperAdmin';
import { useHasAnyValidClubOwnerBadge, useUserClubOwnerBadges } from '@/hooks/useClubOwnerBadge';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';

export default function DebugBadgePage() {
  const account = useCurrentAccount();
  const badgeAuth = useBadgeAuth();
  const { data: isSuperAdmin, isLoading: superAdminLoading } = useIsSuperAdmin();
  const { data: hasValidBadge, isLoading: badgeLoading } = useHasAnyValidClubOwnerBadge();
  const { data: clubOwnerBadges = [], isLoading: badgesLoading } = useUserClubOwnerBadges();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Badge System Debug</h1>
        
        {/* Account Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <p><strong>Address:</strong> {account?.address || 'Not connected'}</p>
        </Card>

        {/* Badge Auth State */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Badge Auth State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Is Super Admin:</strong> {badgeAuth.isSuperAdmin ? '  Yes' : '❌ No'}</p>
              <p><strong>Is Club Owner:</strong> {badgeAuth.isClubOwner ? '  Yes' : '❌ No'}</p>
              <p><strong>Is Member:</strong> {badgeAuth.isMember ? '  Yes' : '❌ No'}</p>
              <p><strong>Is Loading:</strong> {badgeAuth.isLoading ? '⏳ Yes' : '  No'}</p>
            </div>
            <div>
              <p><strong>Owned Club IDs:</strong> {badgeAuth.ownedClubIds.length > 0 ? badgeAuth.ownedClubIds.join(', ') : 'None'}</p>
            </div>
          </div>
        </Card>

        {/* Individual Hook States */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Individual Hook States</h2>
          <div className="space-y-3">
            <div>
              <p><strong>useIsSuperAdmin:</strong></p>
              <p className="ml-4">Data: {isSuperAdmin ? '  True' : '❌ False'}</p>
              <p className="ml-4">Loading: {superAdminLoading ? '⏳ Yes' : '  No'}</p>
            </div>
            <div>
              <p><strong>useHasAnyValidClubOwnerBadge:</strong></p>
              <p className="ml-4">Data: {hasValidBadge ? '  True' : '❌ False'}</p>
              <p className="ml-4">Loading: {badgeLoading ? '⏳ Yes' : '  No'}</p>
            </div>
            <div>
              <p><strong>useUserClubOwnerBadges:</strong></p>
              <p className="ml-4">Badges Count: {clubOwnerBadges.length}</p>
              <p className="ml-4">Loading: {badgesLoading ? '⏳ Yes' : '  No'}</p>
              {clubOwnerBadges.length > 0 && (
                <div className="ml-4 mt-2">
                  <p><strong>Badge Details:</strong></p>
                  {clubOwnerBadges.map((badge, index) => (
                    <div key={index} className="ml-8 p-2 bg-gray-50 rounded mt-1">
                      <p>Object ID: {badge.objectId}</p>
                      <p>Club ID: {badge.clubId}</p>
                      <p>Expiration: {new Date(badge.expirationMs).toLocaleString()}</p>
                      <p>Valid: {badge.expirationMs > Date.now() ? '  Yes' : '❌ Expired'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Event Creation Permission */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Event Creation Permission</h2>
          <div>
            <p><strong>Can Create Events:</strong> {(badgeAuth.isSuperAdmin || badgeAuth.isClubOwner) ? '  Yes' : '❌ No'}</p>
            <p className="text-sm text-gray-600 mt-2">
              Logic: isSuperAdmin ({badgeAuth.isSuperAdmin ? 'true' : 'false'}) || isClubOwner ({badgeAuth.isClubOwner ? 'true' : 'false'})
            </p>
          </div>
        </Card>

        {/* Current Time */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Current Time</h2>
          <p><strong>Timestamp:</strong> {Date.now()}</p>
          <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
