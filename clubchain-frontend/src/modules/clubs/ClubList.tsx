"use client";

import { useEffect } from "react";
import { ClubCard } from "@/src/modules/clubs/ClubCard";
import { useClubsStore } from "@/src/modules/clubs/useClubsStore";
import { Search, Sparkles, Building2, AlertCircle } from "lucide-react";

const skeletonItems = Array.from({ length: 6 });

export function ClubList() {
  const filteredClubs = useClubsStore((state) => state.filteredClubs);
  const status = useClubsStore((state) => state.status);
  const error = useClubsStore((state) => state.error);
  const search = useClubsStore((state) => state.search);
  const setSearch = useClubsStore((state) => state.setSearch);
  const fetchClubs = useClubsStore((state) => state.fetchClubs);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const showSkeleton = status === "loading" && !filteredClubs.length;
  const showEmptyState =
    status === "success" && filteredClubs.length === 0 && !search;

  return (
    <section className="mt-16 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-slideUp">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-icon-pulse" />
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Discover Clubs
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
            Explore what&apos;s happening on-chain
          </h2>
        </div>
        
        {/* Search bar */}
        <div className="relative animate-slideUp animation-delay-200">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clubs..."
            className="w-full sm:w-80 rounded-full border border-blue-100 bg-white/80 pl-11 pr-4 py-3 text-sm shadow-elevation-1 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 hover:shadow-elevation-2 transition-all"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3 animate-slideUp">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Blockchain Connection Failed</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {showSkeleton && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonItems.map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-80 animate-pulse rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-elevation-1"
            />
          ))}
        </div>
      )}

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
      {!showSkeleton && filteredClubs.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club, index) => (
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
    </section>
  );
}

