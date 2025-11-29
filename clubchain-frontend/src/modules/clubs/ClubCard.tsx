"use client";

import { memo } from "react";
import Link from "next/link";
import type { Club } from "@/src/services/blockchain/getClubs";

type Props = {
  club: Club;
};

export const ClubCard = memo(function ClubCard({ club }: Props) {
  return (
    <div className="flex flex-col rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-blue-500">
          Club ID: {club.id.slice(0, 8)}...
        </p>
        <h3 className="text-xl font-semibold text-blue-900">{club.name}</h3>
        <p className="text-xs text-gray-500">
          Owner: {club.owner.slice(0, 10)}...
        </p>
      </div>

      <p className="flex-grow text-sm text-gray-600">{club.description}</p>

      <Link
        href={`/club/${club.id}`}
        className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 transition hover:text-blue-800"
      >
        View events →
      </Link>
    </div>
  );
});
