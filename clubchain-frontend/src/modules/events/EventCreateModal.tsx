"use client";

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { buildCreateEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";
import { useAdminCapForClub } from "@/modules/admin/useAdminCap";

type EventForm = {
  title: string;
  description: string;
  date: string;
};

type Props = {
  clubId: string;
  isOwner: boolean;
};

export function EventCreateModal({ clubId, isOwner }: Props) {
  const account = useCurrentAccount();
  const { capId } = useAdminCapForClub(clubId);
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    date: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOwner) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account) {
      setError("Lütfen önce cüzdanınızı bağlayın.");
      return;
    }
    if (!capId) {
      setError("Admin yetkisi bulunamadı.");
      return;
    }
    if (!form.date) {
      setError("Lütfen tarih seçin.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          walletAddress: account.address,
          title: form.title,
          description: form.description,
          date: new Date(form.date).getTime(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Yetki doğrulanamadı.");
        return;
      }

      const tx = buildCreateEventTx(PACKAGE_ID, capId, clubId, {
        title: form.title,
        description: form.description,
        clubId: clubId,
        date: new Date(form.date), // Date objesi gönder
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setSuccess("Etkinlik oluşturuldu!");
            setOpen(false);
          },
          onError: (err) => {
            setError(err.message);
          },
        }
      );
    } catch (err) {
      setError("Etkinlik oluşturulamadı.");
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Create Event
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/30 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-blue-900">
              Yeni Etkinlik
            </h3>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-blue-800">
                  Başlık
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-800">
                  Tarih
                </label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-800">
                  Açıklama
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  disabled={isPending}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? "Gönderiliyor..." : "Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

