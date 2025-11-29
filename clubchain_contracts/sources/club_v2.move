/// Updated Club module with Super Admin control
/// Only the holder of SuperAdminCap can create clubs and assign ownership
module clubchain::club_v2 {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use std::string::String;
    use std::vector;
    use clubchain::admin_cap::{Self, ClubAdminCap};
    use clubchain::super_admin::{Self, SuperAdminCap};

    /// Error codes
    const E_NOT_CLUB_ADMIN: u64 = 1;
    const E_EMPTY_NAME: u64 = 2;
    const E_EMPTY_DESCRIPTION: u64 = 3;
    const E_NOT_SUPER_ADMIN: u64 = 4;

    /// Club identity on-chain
    public struct Club has key {
        id: UID,
        owner: address,
        name: String,
        description: String,
        events: vector<address>,
    }

    /// Create a new club (SUPER ADMIN ONLY)
    /// Only the holder of SuperAdminCap can call this
    /// The owner_address parameter specifies who will receive the ClubAdminCap
    public entry fun create_club_as_admin(
        super_admin: &SuperAdminCap,
        name: String,
        description: String,
        owner_address: address,
        ctx: &mut TxContext
    ) {
        // Verify super admin
        super_admin::assert_super_admin(super_admin);
        
        assert!(std::string::length(&name) > 0, E_EMPTY_NAME);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        let club = Club {
            id: object::new(ctx),
            owner: owner_address,
            name,
            description,
            events: vector::empty(),
        };
        
        let club_id = object::id_address(&club);
        
        // Share the club object so anyone can read it
        transfer::share_object(club);
        
        // Mint and transfer admin capability to the specified owner
        let admin_cap = admin_cap::mint_admin_cap(club_id, ctx);
        transfer::public_transfer(admin_cap, owner_address);
    }

    /// Transfer club ownership (SUPER ADMIN ONLY)
    /// Mints a new ClubAdminCap for the new owner
    /// The old owner's cap will need to be burned/discarded manually
    public entry fun transfer_club_ownership(
        super_admin: &SuperAdminCap,
        club: &mut Club,
        new_owner: address,
        ctx: &mut TxContext
    ) {
        super_admin::assert_super_admin(super_admin);
        
        // Update the club's owner field
        club.owner = new_owner;
        
        // Mint a new admin cap for the new owner
        let club_id = object::id_address(club);
        let new_admin_cap = admin_cap::mint_admin_cap(club_id, ctx);
        transfer::public_transfer(new_admin_cap, new_owner);
    }

    /// Update club name (club admin only)
    public entry fun update_club_name(
        cap: &ClubAdminCap,
        club: &mut Club,
        new_name: String,
    ) {
        let club_id = object::id_address(club);
        admin_cap::assert_admin(cap, club_id);
        assert!(std::string::length(&new_name) > 0, E_EMPTY_NAME);
        
        club.name = new_name;
    }

    /// Delete a club (club admin only)
    public entry fun delete_club(
        cap: &ClubAdminCap,
        club: Club,
    ) {
        let club_id = object::id_address(&club);
        admin_cap::assert_admin(cap, club_id);
        
        let Club { id, owner: _, name: _, description: _, events: _ } = club;
        object::delete(id);
    }

    // ============ Getter Functions ============

    public fun get_name(club: &Club): String {
        club.name
    }

    public fun get_admin(club: &Club): address {
        club.owner
    }

    public fun get_owner(club: &Club): address {
        club.owner
    }

    public fun get_description(club: &Club): String {
        club.description
    }

    public fun get_events(club: &Club): &vector<address> {
        &club.events
    }

    public(package) fun push_event(club: &mut Club, event_id: address) {
        vector::push_back(&mut club.events, event_id);
    }
}


