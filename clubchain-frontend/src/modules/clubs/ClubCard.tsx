"use client";

import { memo } from "react";
import Link from "next/link";
import { Building2, Users, Calendar, ArrowRight, Shield } from "lucide-react";
import type { Club } from "@/src/services/blockchain/getClubs";

type Props = {
  club: Club;
};

export const ClubCard = memo(function ClubCard({ club }: Props) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-elevation-1 transition-all hover:shadow-elevation-3 hover:-translate-y-2 card-interactive overflow-hidden">
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      {/* Icon badge */}
      <div className="relative mb-4 flex items-start justify-between">
        <div className="inline-flex p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-elevation-1 group-hover:scale-110 transition-transform">
          <Building2 className="w-6 h-6 text-blue-600" strokeWidth={2} />
        </div>
        
        {/* ID Badge */}
        <span className="px-2 py-1 text-xs font-mono bg-blue-50 text-blue-600 rounded-full border border-blue-100">
          #{club.id.slice(0, 6)}
        </span>
      </div>

      {/* Club info */}
      <div className="relative mb-3">
        <h3 className="text-xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors mb-2">
          {club.name}
        </h3>
        
        {/* Owner info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span className="font-mono">{club.owner.slice(0, 10)}...</span>
        </div>
      </div>

      {/* Description */}
      <p className="relative flex-grow text-sm text-gray-600 mb-4 line-clamp-2">
        {club.description}
      </p>

      {/* Stats row */}
      <div className="relative flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-4 h-4 text-blue-600" />
          <span>-- members</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>-- events</span>
        </div>
      </div>

      {/* Action button */}
      <Link
        href={`/club/${club.id}`}
        className="relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 hover:shadow-lg group"
      >
        View Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
});
