// Network configuration
export const NETWORK = "testnet" as const;

// Package ID - Testnet deployment (Updated: Auto-issue ClubOwnerBadge to creator)
export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0xf54b3ea54115a173c263c86207cd95f18d4befa0f1faf9512d45933c5fc8c32c";

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
// Updated: New deployment with auto ClubOwnerBadge feature
export const MEMBER_REGISTRY_ID =
  process.env.NEXT_PUBLIC_MEMBER_REGISTRY_ID ||
  "0x14a78d4a3c20f95817b5b5d85eaaf61fbe146b32119c6713f67e589653cc6d69";
