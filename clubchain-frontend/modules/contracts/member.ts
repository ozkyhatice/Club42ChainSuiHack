import { Transaction } from "@mysten/sui/transactions";

/**
 * Member Contract SDK
 * Transaction builders for user registration
 */

export interface UserRegistrationData {
  intraId: number;
  username: string;
  email: string;
}

/**
 * Build a transaction to register a new user
 * This will mint both a UserProfile and a ClubMemberSBT
 */
export function buildRegisterUserTx(
  packageId: string,
  clockObjectId: string,
  registryObjectId: string,
  userData: UserRegistrationData
): Transaction {
  if (!packageId || !clockObjectId || !registryObjectId) {
    throw new Error("Package ID, Clock ID, and Registry ID are required");
  }

  if (!userData.intraId || !userData.username || !userData.email) {
    throw new Error("Complete user data is required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club_system::issue_member_badge`,
    arguments: [
      tx.object(registryObjectId),
      tx.pure.u64(userData.intraId),
      tx.pure.string(userData.username),
      tx.pure.string(userData.email),
      tx.object(clockObjectId),
    ],
  });

  return tx;
}

