// Network configuration
export const NETWORK = "testnet" as const;

// Package ID - Testnet deployment (Updated: With Donation Box Feature)
export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0x915916cad66896af8926c4948ec1d10321b20e655f1a1d879da272600494e912";

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
// Updated: New deployment with Donation Box Feature
export const MEMBER_REGISTRY_ID =
  process.env.NEXT_PUBLIC_MEMBER_REGISTRY_ID ||
  "0x1dbc4fe611ffa823fdd8d4c3a8644561e107e118070a68ab722afadb5051e0c1";
