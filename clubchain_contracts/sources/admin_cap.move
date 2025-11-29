module clubchain::admin_cap {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    /// Error codes
    const E_INVALID_CLUB_ID: u64 = 1;

    /// Capability object granting admin privileges for a specific club
    /// This is an owned object that proves the holder is a club president
    public struct ClubAdminCap has key, store {
        id: UID,
        /// The ID of the club this capability grants admin access to
        club_id: address,
    }

    /// Create a new ClubAdminCap for a given club
    /// This should only be called internally by the club module during club creation
    /// Returns the capability to be transferred to the club creator
    public(package) fun mint_admin_cap(
        club_id: address,
        ctx: &mut TxContext
    ): ClubAdminCap {
        ClubAdminCap {
            id: object::new(ctx),
            club_id,
        }
    }

    /// Verify that a capability is valid for a specific club
    /// Returns true if the cap's club_id matches the provided club_id
    public fun verify_admin(cap: &ClubAdminCap, club_id: address): bool {
        cap.club_id == club_id
    }

    /// Get the club ID that this capability grants admin access to
    public fun get_club_id(cap: &ClubAdminCap): address {
        cap.club_id
    }

    /// Assert that a capability is valid for a specific club
    /// Aborts with E_INVALID_CLUB_ID if verification fails
    public fun assert_admin(cap: &ClubAdminCap, club_id: address) {
        assert!(verify_admin(cap, club_id), E_INVALID_CLUB_ID);
    }
}

