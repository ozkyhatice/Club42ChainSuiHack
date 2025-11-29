"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { Club } from "@/src/services/blockchain/getClubs";
import { EventList } from "@/src/modules/events/EventList";
import { EventCreateModal } from "@/src/modules/events/EventCreateModal";

export default function ClubPage() {
  const params = useParams<{ id: string }>();
  const account = useCurrentAccount();
  const [club, setClub] = useState<Club | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await fetch(`/api/clubs/${params.id}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Kulüp bulunamadı");
        }
        const data = await response.json();
        setClub(data.club);
        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    fetchClub();
  }, [params.id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl bg-white/60 p-12" />
      </div>
    );
  }

  if (status === "error" || !club) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-100 bg-white/80 p-10 text-center">
          <p className="text-lg font-semibold text-rose-600">
            Kulüp bilgilerine ulaşılamadı.
          </p>
          <p className="text-sm text-rose-400">
            Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  const isOwner =
    !!account?.address &&
    account.address.toLowerCase() === club.owner.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-3xl border border-blue-100 bg-white/80 p-10 shadow-lg">
          <p className="text-xs uppercase tracking-widest text-blue-500">
            Club ID: {club.id}
          </p>
          <h1 className="mt-2 text-4xl font-bold text-blue-900">{club.name}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Owner: {club.owner.slice(0, 10)}...
          </p>
          <p className="mt-6 text-lg text-gray-600">{club.description}</p>

          <EventCreateModal clubId={club.id} isOwner={isOwner} />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-900">
            Etkinlikler
          </h2>
          <EventList events={club.events} />
        </div>
      </div>
    </div>
  );
}

