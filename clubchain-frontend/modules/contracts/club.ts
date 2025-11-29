import { Transaction } from "@mysten/sui/transactions";

/**
 * Club Contract SDK
 * Transaction builders for club-related operations
 */

export interface ClubData {
  name: string;
}

/**
 * Build a transaction to create a new club
 * The creator will receive a ClubAdminCap for the new club
 */
export function buildCreateClubTx(
  packageId: string,
  clubName: string
): Transaction {
  if (!packageId) {
    console.error("buildCreateClubTx: packageId is undefined");
    throw new Error("Package ID is required");
  }

  if (!clubName || clubName.trim() === "") {
    console.error("buildCreateClubTx: clubName is empty");
    throw new Error("Club name is required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::create_club`,
    arguments: [tx.pure.string(clubName)],
  });

  console.log("✅ Transaction built:", {
    function: "create_club",
    packageId,
    clubName,
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
    console.error("buildUpdateClubNameTx: missing required parameters", {
      packageId,
      adminCapId,
      clubId,
      newName,
    });
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

  console.log("✅ Transaction built:", {
    function: "update_club_name",
    packageId,
    adminCapId,
    clubId,
    newName,
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
    console.error("buildDeleteClubTx: missing required parameters", {
      packageId,
      adminCapId,
      clubId,
    });
    throw new Error("All parameters are required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club::delete_club`,
    arguments: [tx.object(adminCapId), tx.object(clubId)],
  });

  console.log("✅ Transaction built:", {
    function: "delete_club",
    packageId,
    adminCapId,
    clubId,
  });

  return tx;
}

