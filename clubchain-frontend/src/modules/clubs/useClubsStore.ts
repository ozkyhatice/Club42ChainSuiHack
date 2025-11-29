import { create } from "zustand";
import { Club } from "@/src/services/blockchain/getClubs";

type Status = "idle" | "loading" | "success" | "error";

type ClubsState = {
  clubs: Club[];
  filteredClubs: Club[];
  search: string;
  status: Status;
  error?: string | null;
  fetchClubs: () => Promise<void>;
  setSearch: (value: string) => void;
};

const applyFilter = (clubs: Club[], search: string) => {
  if (!search.trim()) return clubs;
  const term = search.toLowerCase();
  return clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(term) ||
      club.description.toLowerCase().includes(term)
  );
};

export const useClubsStore = create<ClubsState>((set, get) => ({
  clubs: [],
  filteredClubs: [],
  search: "",
  status: "idle",
  error: null,
  fetchClubs: async () => {
    if (get().status === "loading") return;

    set({ status: "loading", error: null });

    try {
      const response = await fetch("/api/clubs", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load clubs from blockchain");
      }
      const { clubs } = await response.json();
      const filtered = applyFilter(clubs, get().search);
      set({ clubs, filteredClubs: filtered, status: "success", error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({
        status: "error",
        error: message,
        clubs: [],
        filteredClubs: [],
      });
    }
  },
  setSearch: (value: string) => {
    const filtered = applyFilter(get().clubs, value);
    set({ search: value, filteredClubs: filtered });
  },
}));

