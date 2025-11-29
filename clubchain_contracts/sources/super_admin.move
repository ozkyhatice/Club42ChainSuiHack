module clubchain::super_admin {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    /// Error codes
    const E_NOT_SUPER_ADMIN: u64 = 1;

    /// Predefined Super Admin address
    const SUPER_ADMIN_ADDRESS: address = @0x958654efa5cbdfecd7e93a1882742cefebfb0234f4fd5d62bda69e6b4b86543e;

    /// Global super admin capability - only one exists
    /// The holder of this can create clubs and assign ownership
    public struct SuperAdminCap has key, store {
        id: UID,
    }

    /// One-time initialization function to create the SuperAdminCap
    /// This should only be called once during deployment
    /// The SuperAdminCap will be transferred to the predefined address
    fun init(ctx: &mut TxContext) {
        let super_admin_cap = SuperAdminCap {
            id: object::new(ctx),
        };
        
        // Transfer to the predefined super admin address
        transfer::public_transfer(super_admin_cap, SUPER_ADMIN_ADDRESS);
    }

    /// Verify that someone owns a SuperAdminCap
    /// Used by other modules to check super admin privileges
    public fun verify_super_admin(_cap: &SuperAdminCap): bool {
        true
    }

    /// Assert that someone has super admin privileges
    public fun assert_super_admin(cap: &SuperAdminCap) {
        assert!(verify_super_admin(cap), E_NOT_SUPER_ADMIN);
    }
}

