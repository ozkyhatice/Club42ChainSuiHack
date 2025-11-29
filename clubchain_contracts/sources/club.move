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
    const E_BADGE_EXPIRED: u64 = 4;
    const E_INVALID_DURATION: u64 = 5;

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

    // ============ Club Owner Badge (Time-Based Access Control) ============

    /// Soulbound token representing club ownership with expiration
    /// Only `key` ability ensures it cannot be transferred (Soulbound)
    public struct ClubOwnerBadge has key {
        id: UID,
        club_id: address,
        expiration_ms: u64,
    }

    /// Issue a ClubOwnerBadge to a user (admin only)
    /// The badge expires after the specified duration in milliseconds
    /// Default duration: 90 days = 90 * 24 * 60 * 60 * 1000 = 7,776,000,000 ms
    public entry fun issue_owner_badge(
        cap: &ClubAdminCap,
        club: &Club,
        recipient: address,
        duration_ms: u64,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ) {
        let club_id = object::id_address(club);
        admin_cap::assert_admin(cap, club_id);
        
        // Validate duration (must be positive and reasonable, e.g., max 1 year)
        assert!(duration_ms > 0, E_INVALID_DURATION);
        assert!(duration_ms <= 31536000000, E_INVALID_DURATION); // Max 1 year
        
        let current_time = sui::clock::timestamp_ms(clock);
        let expiration = current_time + duration_ms;
        
        let badge = ClubOwnerBadge {
            id: object::new(ctx),
            club_id,
            expiration_ms: expiration,
        };
        
        transfer::transfer(badge, recipient);
    }

    /// Issue a ClubOwnerBadge with default 90-day expiration
    public entry fun issue_owner_badge_default(
        cap: &ClubAdminCap,
        club: &Club,
        recipient: address,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ) {
        let duration_90_days = 7776000000; // 90 days in milliseconds
        issue_owner_badge(cap, club, recipient, duration_90_days, clock, ctx);
    }

    /// Check if a ClubOwnerBadge is valid (not expired)
    /// Returns true if badge exists and is not expired
    public fun is_badge_valid(badge: &ClubOwnerBadge, clock: &sui::clock::Clock): bool {
        let current_time = sui::clock::timestamp_ms(clock);
        current_time < badge.expiration_ms
    }

    /// Get the expiration timestamp of a badge
    public fun get_expiration(badge: &ClubOwnerBadge): u64 {
        badge.expiration_ms
    }

    /// Get the club ID from a badge
    public fun get_club_id(badge: &ClubOwnerBadge): address {
        badge.club_id
    }

    /// Assert that a badge is valid and matches the club
    /// Aborts if badge is expired or doesn't match the club
    public fun assert_badge_valid(
        badge: &ClubOwnerBadge,
        club_id: address,
        clock: &sui::clock::Clock
    ) {
        assert!(badge.club_id == club_id, E_NOT_CLUB_ADMIN);
        let current_time = sui::clock::timestamp_ms(clock);
        assert!(current_time < badge.expiration_ms, E_BADGE_EXPIRED);
    }
}

