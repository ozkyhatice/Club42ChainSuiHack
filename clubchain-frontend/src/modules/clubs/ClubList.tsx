"use client";

import { useEffect } from "react";
import { ClubCard } from "@/src/modules/clubs/ClubCard";
import { useClubsStore } from "@/src/modules/clubs/useClubsStore";

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
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Discover Clubs
          </p>
          <h2 className="text-3xl font-bold text-blue-900">
            Explore what&apos;s happening on-chain
          </h2>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clubs..."
          className="w-full max-w-sm rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          ⚠️ Blockchain bağlantısı başarısız: {error}
        </div>
      )}

      {showSkeleton && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonItems.map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-40 animate-pulse rounded-2xl bg-blue-50/60"
            />
          ))}
        </div>
      )}

      {showEmptyState && (
        <div className="rounded-2xl border border-blue-100 bg-white/80 p-10 text-center text-blue-700">
          <p className="text-lg font-semibold">No clubs yet</p>
          <p className="text-sm text-blue-500">
            Be the first to create a club and lead your community.
          </p>
        </div>
      )}

      {!showSkeleton && filteredClubs.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}
    </section>
  );
}

