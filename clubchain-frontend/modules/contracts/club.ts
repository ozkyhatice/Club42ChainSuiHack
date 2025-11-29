import { Transaction } from "@mysten/sui/transactions";

/**
 * Club Contract SDK
 * Transaction builders for club-related operations
 */

/**
 * Build a transaction to create a new club
 * The creator will receive a ClubAdminCap for the new club
 */
export function buildCreateClubTx(
  packageId: string,
  clubName: string,
  description: string
): Transaction {
  if (!packageId) {
    throw new Error("Package ID is required");
  }

  if (!clubName || clubName.trim() === "") {
    throw new Error("Club name is required");
  }

  if (!description || description.trim() === "") {
    throw new Error("Club description is required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::create_club`,
    arguments: [tx.pure.string(clubName), tx.pure.string(description)],
  });

  return tx;
}

/**
 * Build a transaction to update a club's name (admin only)
 */
export function buildUpdateClubNameTx(
  packageId: string,
  adminCapId: string,
  clubId: string,
  newName: string
): Transaction {
  if (!packageId || !adminCapId || !clubId || !newName) {
    throw new Error("All parameters are required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::update_club_name`,
    arguments: [
      tx.object(adminCapId),
      tx.object(clubId),
      tx.pure.string(newName),
    ],
  });

  return tx;
}

/**
 * Build a transaction to delete a club (admin only)
 */
export function buildDeleteClubTx(
  packageId: string,
  adminCapId: string,
  clubId: string
): Transaction {
  if (!packageId || !adminCapId || !clubId) {
    throw new Error("All parameters are required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::delete_club`,
    arguments: [tx.object(adminCapId), tx.object(clubId)],
  });

  return tx;
}

