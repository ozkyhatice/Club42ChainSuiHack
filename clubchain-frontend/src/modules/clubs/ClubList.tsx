"use client";

import { ClubCard } from "@/src/modules/clubs/ClubCard";
import { Building2 } from "lucide-react";
import type { Club } from "@/src/services/blockchain/getClubs";

interface ClubListProps {
  clubs: Club[];
}

export function ClubList({ clubs }: ClubListProps) {
  const showEmptyState = clubs.length === 0;

  return (
    <div>
      {/* Empty state */}
      {showEmptyState && (
        <div className="rounded-2xl border border-blue-100 bg-white/80 p-12 text-center shadow-elevation-1 hover-lift">
          <div className="inline-flex p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-4">
            <Building2 className="w-16 h-16 text-blue-600 animate-icon-pulse" />
          </div>
          <p className="text-xl font-bold text-blue-900 mb-2">No clubs yet</p>
          <p className="text-sm text-gray-600">
            Be the first to create a club and lead your community on-chain.
          </p>
        </div>
      )}

      {/* Clubs grid */}
      {clubs.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club, index) => (
            <div 
              key={club.id}
              className="animate-bounceIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ClubCard club={club} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

