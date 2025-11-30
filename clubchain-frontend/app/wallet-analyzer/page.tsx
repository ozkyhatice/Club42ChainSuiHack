'use client';

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { PACKAGE_ID } from '@/lib/constants';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import { useState } from 'react';

export default function WalletAnalyzerPage() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [showAllObjects, setShowAllObjects] = useState(false);

  // Get all objects owned by user
  const { data: allObjects = [], isLoading: objectsLoading } = useQuery({
    queryKey: ["wallet-all-objects", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];

      try {
        let allObjects: any[] = [];
        let hasNextPage = true;
        let cursor: string | null = null;

        while (hasNextPage) {
          const result = await suiClient.getOwnedObjects({
            owner: account.address,
            options: {
              showContent: true,
              showType: true,
            },
            cursor: cursor || undefined,
            limit: 50,
          });

          allObjects = [...allObjects, ...result.data];
          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }

        console.log("All owned objects:", allObjects);
        return allObjects;
      } catch (error) {
        console.error("Error getting owned objects:", error);
        return [];
      }
    },
    enabled: !!account?.address,
    staleTime: 10000,
  });

  // Filter specific NFT types
  const superAdminCaps = allObjects.filter(obj => 
    obj.data?.type?.includes('super_admin::SuperAdminCap') || 
    obj.data?.type?.includes('SuperAdminCap')
  );

  const clubOwnerBadges = allObjects.filter(obj => 
    obj.data?.type?.includes('club::ClubOwnerBadge') ||
    obj.data?.type?.includes('ClubOwnerBadge')
  );

  const clubAdminCaps = allObjects.filter(obj => 
    obj.data?.type?.includes('admin_cap::ClubAdminCap') ||
    obj.data?.type?.includes('ClubAdminCap')
  );

  const userProfiles = allObjects.filter(obj => 
    obj.data?.type?.includes('member::UserProfile') ||
    obj.data?.type?.includes('UserProfile')
  );

  const memberSBTs = allObjects.filter(obj => 
    obj.data?.type?.includes('member_sbt::ClubMemberSBT') ||
    obj.data?.type?.includes('ClubMemberSBT')
  );

  if (!account) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-10">
          <p className="text-xl text-gray-500">Please connect your wallet to analyze NFTs</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Wallet NFT Analyzer</h1>
          <button
            onClick={() => setShowAllObjects(!showAllObjects)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showAllObjects ? 'Hide' : 'Show'} All Objects
          </button>
        </div>
        
        {/* Account Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <p><strong>Address:</strong> {account.address}</p>
          <p><strong>Package ID:</strong> {PACKAGE_ID}</p>
          <p><strong>Total Objects:</strong> {objectsLoading ? 'Loading...' : allObjects.length}</p>
        </Card>

        {/* SuperAdmin Caps */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">🔥 SuperAdmin Caps ({superAdminCaps.length})</h2>
          {superAdminCaps.length === 0 ? (
            <p className="text-gray-500">No SuperAdmin Caps found</p>
          ) : (
            <div className="space-y-2">
              {superAdminCaps.map((obj, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                  <p><strong>Object ID:</strong> {obj.data?.objectId}</p>
                  <p><strong>Type:</strong> {obj.data?.type}</p>
                  <p><strong>Content:</strong> {JSON.stringify(obj.data?.content, null, 2)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Club Owner Badges */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">🏆 Club Owner Badges ({clubOwnerBadges.length})</h2>
          {clubOwnerBadges.length === 0 ? (
            <p className="text-gray-500">No Club Owner Badges found</p>
          ) : (
            <div className="space-y-2">
              {clubOwnerBadges.map((obj, index) => {
                const content = obj.data?.content;
                const fields = content && 'fields' in content ? content.fields as any : null;
                const expirationMs = fields?.expiration_ms ? Number(fields.expiration_ms) : null;
                const isExpired = expirationMs ? expirationMs <= Date.now() : null;
                
                return (
                  <div key={index} className={`p-3 border rounded ${isExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <p><strong>Object ID:</strong> {obj.data?.objectId}</p>
                    <p><strong>Type:</strong> {obj.data?.type}</p>
                    {fields && (
                      <>
                        <p><strong>Club ID:</strong> {fields.club_id}</p>
                        <p><strong>Expiration:</strong> {expirationMs ? new Date(expirationMs).toLocaleString() : 'Unknown'}</p>
                        <p><strong>Status:</strong> {isExpired === null ? 'Unknown' : isExpired ? '❌ EXPIRED' : '  VALID'}</p>
                        <p><strong>Time Until Expiry:</strong> {expirationMs ? Math.max(0, expirationMs - Date.now()) : 'Unknown'} ms</p>
                      </>
                    )}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">Full Content</summary>
                      <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(obj.data?.content, null, 2)}</pre>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Club Admin Caps */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">⚙️ Club Admin Caps ({clubAdminCaps.length})</h2>
          {clubAdminCaps.length === 0 ? (
            <p className="text-gray-500">No Club Admin Caps found</p>
          ) : (
            <div className="space-y-2">
              {clubAdminCaps.map((obj, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p><strong>Object ID:</strong> {obj.data?.objectId}</p>
                  <p><strong>Type:</strong> {obj.data?.type}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">Full Content</summary>
                    <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(obj.data?.content, null, 2)}</pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* User Profiles */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">👤 User Profiles ({userProfiles.length})</h2>
          {userProfiles.length === 0 ? (
            <p className="text-gray-500">No User Profiles found</p>
          ) : (
            <div className="space-y-2">
              {userProfiles.map((obj, index) => (
                <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p><strong>Object ID:</strong> {obj.data?.objectId}</p>
                  <p><strong>Type:</strong> {obj.data?.type}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">Full Content</summary>
                    <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(obj.data?.content, null, 2)}</pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Member SBTs */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">🎯 Member SBTs ({memberSBTs.length})</h2>
          {memberSBTs.length === 0 ? (
            <p className="text-gray-500">No Member SBTs found</p>
          ) : (
            <div className="space-y-2">
              {memberSBTs.map((obj, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p><strong>Object ID:</strong> {obj.data?.objectId}</p>
                  <p><strong>Type:</strong> {obj.data?.type}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">Full Content</summary>
                    <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(obj.data?.content, null, 2)}</pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* All Objects (if toggled) */}
        {showAllObjects && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">🔍 All Objects ({allObjects.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allObjects.map((obj, index) => (
                <div key={index} className="p-2 bg-gray-50 border rounded text-xs">
                  <p><strong>ID:</strong> {obj.data?.objectId}</p>
                  <p><strong>Type:</strong> {obj.data?.type}</p>
                  {obj.data?.content && (
                    <details>
                      <summary className="cursor-pointer">Content</summary>
                      <pre className="mt-1">{JSON.stringify(obj.data.content, null, 2)}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Current Time */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">⏰ Current Time</h2>
          <p><strong>Timestamp:</strong> {Date.now()}</p>
          <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
