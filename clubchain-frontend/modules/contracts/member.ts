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

export interface MemberRegistrationData {
  intraId: string;
  username: string;
}

/**
 * Build a transaction to register a new member (self-registration)
 * Anyone can call this function to register themselves
 * 
 * Function signature: register_member(registry: &mut MemberRegistry, intra_id: String, username: String, ctx: &mut TxContext)
 */
export function buildRegisterMemberTx(
  packageId: string,
  registryObjectId: string,
  memberData: MemberRegistrationData
): Transaction {
  if (!packageId || !registryObjectId) {
    throw new Error("Package ID and Registry ID are required");
  }

  if (!memberData.intraId || !memberData.username) {
    throw new Error("Intra ID and username are required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club_system::register_member`,
    arguments: [
      tx.object(registryObjectId), // registry: &mut MemberRegistry
      tx.pure.string(String(memberData.intraId)), // intra_id: String
      tx.pure.string(String(memberData.username)), // username: String
    ],
  });

  // Set gas budget - use a reasonable amount
  tx.setGasBudget(50_000_000); // 50M MIST = 0.05 SUI

  return tx;
}

/**
 * Build a transaction to register a new user (admin only)
 * This will mint both a UserProfile and a ClubMemberSBT
 * 
 * Function signature: issue_member_badge(_: &SuperAdminCap, registry: &mut MemberRegistry, recipient: address, intra_id: String, username: String, ctx: &mut TxContext)
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

