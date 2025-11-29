"use client";

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { buildCreateEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";
import { useAdminCapForClub } from "@/modules/admin/useAdminCap";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { Sparkles } from "lucide-react";

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
    <div>
      <GamifiedButton
        onClick={() => setOpen(true)}
        variant="primary"
        size="md"
        icon={Sparkles}
      >
        Create Event
      </GamifiedButton>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-8 shadow-elevation-3">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">
                Create New Event
              </h3>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-error bg-error/10 p-3 text-sm text-error-light">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-success bg-success/10 p-3 text-sm text-success-light">
                {success}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl bg-input-bg border border-input-border px-4 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-focus"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl bg-input-bg border border-input-border px-4 py-2 text-sm text-foreground focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-focus"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">
                  Description
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
                  className="mt-1 w-full rounded-2xl bg-input-bg border border-input-border px-4 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-focus resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <GamifiedButton
                  type="button"
                  onClick={() => setOpen(false)}
                  variant="secondary"
                  size="md"
                  disabled={isPending}
                >
                  Cancel
                </GamifiedButton>
                <GamifiedButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isPending}
                  disabled={isPending}
                >
                  {isPending ? "Creating..." : "Create Event"}
                </GamifiedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

