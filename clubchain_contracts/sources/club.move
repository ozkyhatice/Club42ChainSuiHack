module clubchain::club {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;
    use std::vector;
    use clubchain::admin_cap::{Self, ClubAdminCap};

    /// Error codes
    const E_NOT_CLUB_ADMIN: u64 = 1;
    const E_EMPTY_NAME: u64 = 2;
    const E_EMPTY_DESCRIPTION: u64 = 3;

    /// Club identity on-chain
    public struct Club has key {
        id: UID,
        owner: address,
        name: String,
        description: String,
        events: vector<address>,
    }

    /// Create a new club and mint admin capability for the creator
    /// The creator receives a ClubAdminCap proving their admin status
    public entry fun create_club(
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        assert!(std::string::length(&name) > 0, E_EMPTY_NAME);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        let sender = tx_context::sender(ctx);
        let club = Club {
            id: object::new(ctx),
            owner: sender,
            name,
            description,
            events: vector::empty(),
        };
        
        let club_id = object::id_address(&club);
        
        // Share the club object so anyone can read it
        transfer::share_object(club);
        
        // Mint and transfer admin capability to creator
        let admin_cap = admin_cap::mint_admin_cap(club_id, ctx);
        transfer::public_transfer(admin_cap, sender);
    }

    /// Update club name (admin only)
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

    /// Delete a club (admin only)
    /// Note: This consumes the club object, making it permanently inaccessible
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

    /// Get club name
    public fun get_name(club: &Club): String {
        club.name
    }

    /// Get club owner (backwards compat)
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

