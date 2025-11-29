// Network configuration
export const NETWORK = "testnet" as const;

// Package ID - Testnet deployment (Updated: Added register_member function)
export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0xb9b935e5677c3ec73dd793a292ea5d8d5320b00f1be6a74a9740b636e1c53fba";

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
export const MEMBER_REGISTRY_ID =
  process.env.NEXT_PUBLIC_MEMBER_REGISTRY_ID ||
  "0xfc7bbaf3d044aa8621c6eaaf1f5f0db6a776877aedbde628aed21e3d8287afa7";
