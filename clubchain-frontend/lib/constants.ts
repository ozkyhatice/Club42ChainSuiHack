// Network configuration
export const NETWORK = "testnet" as const;

// Package ID - Testnet deployment (Updated: With amount parameter in donation)
export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0x80bc462b79096c6b2b50d0c9bb95c3edf9c5f27595b5d08355871ad3a4f79a57";

// UserRegistry Object ID - Testnet deployment  
export const CLUB_REGISTRY_OBJECT_ID =
  process.env.NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID ||
  "0x96dc4d0ba61f3dd744047853ec573fac03c913b381017ce531557650439ed738";

// Admin Cap Object ID - User specific, no default
export const ADMIN_CAP_OBJECT_ID = process.env.NEXT_PUBLIC_ADMIN_CAP_OBJECT_ID || "";

// Sui Clock Object ID - Standard shared object for timestamps
export const CLOCK_OBJECT_ID = "0x6";

// User Registry Object ID - Testnet deployment (for member registration) - DEPRECATED
export const USER_REGISTRY_ID =
  process.env.NEXT_PUBLIC_USER_REGISTRY_ID ||
  "0x96dc4d0ba61f3dd744047853ec573fac03c913b381017ce531557650439ed738";

// Member Registry Object ID - Testnet deployment (for member badge registration)
// Updated: New deployment with amount parameter in donation on testnet
export const MEMBER_REGISTRY_ID =
  process.env.NEXT_PUBLIC_MEMBER_REGISTRY_ID ||
  "0x70360a6ed3b138f12f695a193229c218922b7d72f12d3ec8f2868677b7b04db6";
