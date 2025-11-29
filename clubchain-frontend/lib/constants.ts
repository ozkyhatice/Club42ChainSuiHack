// Network configuration
export const NETWORK = "testnet" as const;

// Package ID - Testnet deployment (Updated with Super Admin system + club_v2)
export const PACKAGE_ID = 
  process.env.NEXT_PUBLIC_PACKAGE_ID || 
  "0x11f1111a939b699e98d05265c37ac405162f9f41a3289bdd6f867ec32ffb3763";

// UserRegistry Object ID - Testnet deployment
export const CLUB_REGISTRY_OBJECT_ID = 
  process.env.NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID || 
  "0xc4cf6bc0153d1ea52fa5e4ef451647c0b3bdad5dedde9b700b19a67039dba880";

// Admin Cap Object ID - User specific, no default
export const ADMIN_CAP_OBJECT_ID = process.env.NEXT_PUBLIC_ADMIN_CAP_OBJECT_ID || "";

// Sui Clock Object ID - Standard shared object for timestamps
export const CLOCK_OBJECT_ID = "0x6";

// User Registry Object ID - Testnet deployment (for member registration)
export const USER_REGISTRY_ID = 
  process.env.NEXT_PUBLIC_USER_REGISTRY_ID || 
  "0xc4cf6bc0153d1ea52fa5e4ef451647c0b3bdad5dedde9b700b19a67039dba880";
