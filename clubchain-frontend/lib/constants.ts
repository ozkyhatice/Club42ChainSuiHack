// Deployed package ID from Sui Devnet
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0xcc94bce00d6c602317ccfa3e5089c2bae6300e8b6df0809f4d510725c0736c70";

// Devnet configuration
export const NETWORK = "devnet";

// Sui Clock object ID (shared object on all Sui networks)
export const CLOCK_OBJECT_ID = "0x6";

// UserRegistry shared object ID (from deployment)
export const REGISTRY_OBJECT_ID = process.env.NEXT_PUBLIC_REGISTRY_OBJECT_ID || "0x96dc4d0ba61f3dd744047853ec573fac03c913b381017ce531557650439ed738";

// Module names
export const MODULES = {
  CLUB: `${PACKAGE_ID}::club`,
  EVENT: `${PACKAGE_ID}::event`,
  MEMBER: `${PACKAGE_ID}::member`,
  ADMIN_CAP: `${PACKAGE_ID}::admin_cap`,
  MEMBER_SBT: `${PACKAGE_ID}::member_sbt`,
};

