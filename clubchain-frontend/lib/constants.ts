// Network configuration
export const NETWORK = "testnet" as const;

// Package ID - Testnet deployment (Updated: Added create_event_with_cap function)
export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0xcc94bce00d6c602317ccfa3e5089c2bae6300e8b6df0809f4d510725c0736c70";

// UserRegistry Object ID - Testnet deployment  
export const CLUB_REGISTRY_OBJECT_ID =
  process.env.NEXT_PUBLIC_CLUB_REGISTRY_OBJECT_ID ||
  "0x96dc4d0ba61f3dd744047853ec573fac03c913b381017ce531557650439ed738";

// Admin Cap Object ID - User specific, no default
export const ADMIN_CAP_OBJECT_ID = process.env.NEXT_PUBLIC_ADMIN_CAP_OBJECT_ID || "";

// Sui Clock Object ID - Standard shared object for timestamps
export const CLOCK_OBJECT_ID = "0x6";

// User Registry Object ID - Testnet deployment (for member registration)
export const USER_REGISTRY_ID =
  process.env.NEXT_PUBLIC_USER_REGISTRY_ID ||
  "0x96dc4d0ba61f3dd744047853ec573fac03c913b381017ce531557650439ed738";
