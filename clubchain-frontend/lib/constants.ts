// Deployed package ID from Sui Testnet (Updated with participants functionality)
export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0x26df297777639fb60efaa865462e4fa82d221afca84852e99e7391818676eafa";

// Testnet configuration
export const NETWORK =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "devnet" | undefined) ||
  "testnet";

// Sui Clock object ID (shared object on all Sui networks)
export const CLOCK_OBJECT_ID = "0x6";

// UserRegistry shared object ID (from deployment)
export const REGISTRY_OBJECT_ID =
  process.env.NEXT_PUBLIC_REGISTRY_OBJECT_ID ||
  "0x2847eb19d6076339070a5d2b6b7d1a0e681d5c9d6b31460a13a1d2061a5e2d20";

// Optional ClubRegistry shared object ID (used to list clubs)
export const CLUB_REGISTRY_OBJECT_ID =
  process.env.NEXT_PUBLIC_CLUB_REGISTRY_ID || "";

// Module names
export const MODULES = {
  CLUB: `${PACKAGE_ID}::club`,
  EVENT: `${PACKAGE_ID}::event`,
  MEMBER: `${PACKAGE_ID}::member`,
  ADMIN_CAP: `${PACKAGE_ID}::admin_cap`,
  MEMBER_SBT: `${PACKAGE_ID}::member_sbt`,
};

