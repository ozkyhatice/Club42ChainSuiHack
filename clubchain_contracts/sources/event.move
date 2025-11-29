module clubchain::event {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;
    use clubchain::admin_cap::{Self, ClubAdminCap};
    use clubchain::club::{Self, Club};

    /// Error codes
    const E_NOT_CLUB_ADMIN: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_EMPTY_TITLE: u64 = 3;
    const E_EMPTY_DESCRIPTION: u64 = 4;
    const E_ALREADY_JOINED: u64 = 100;
    const E_NOT_PARTICIPANT: u64 = 101;

    /// Event struct - shared object
    public struct Event has key, store {
        id: UID,
        club_id: address,
        created_by: address,
        title: String,
        date: u64,
        description: String,
        participants: vector<address>,
    }

    /// Create a new event (admin only)
    /// Requires the caller to provide a ClubAdminCap for the specified club
    public entry fun create_event(
        cap: &ClubAdminCap,
        club: &mut Club,
        title: String,
        description: String,
        date: u64,
        ctx: &mut TxContext
    ) {
        let club_id = object::id_address(club);
        // Verify the caller has admin capability for this club
        admin_cap::assert_admin(cap, club_id);

        let owner = club::get_owner(club);
        let sender = tx_context::sender(ctx);
        assert!(sender == owner, E_NOT_OWNER);

        // Validate inputs
        assert!(std::string::length(&title) > 0, E_EMPTY_TITLE);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        let event = Event {
            id: object::new(ctx),
            club_id,
            created_by: owner,
            title,
            description,
            date,
            participants: std::vector::empty(),
        };
        let event_id = object::id_address(&event);
        transfer::share_object(event);
        club::push_event(club, event_id);
    }

    /// Update event details (admin only)
    public entry fun update_event(
        cap: &ClubAdminCap,
        event: &mut Event,
        title: String,
        description: String,
        date: u64,
    ) {
        // Verify the caller has admin capability for this event's club
        admin_cap::assert_admin(cap, event.club_id);
        
        // Validate inputs
        assert!(std::string::length(&title) > 0, E_EMPTY_TITLE);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        event.title = title;
        event.description = description;
        event.date = date;
    }

    // ============ Getter Functions ============

    /// Getter functions for frontend
    public fun get_title(event: &Event): String {
        event.title
    }

    public fun get_club_id(event: &Event): address {
        event.club_id
    }

    public fun get_created_by(event: &Event): address {
        event.created_by
    }

    public fun get_description(event: &Event): String {
        event.description
    }

    public fun get_date(event: &Event): u64 {
        event.date
    }

    public fun get_participants(event: &Event): &vector<address> {
        &event.participants
    }

    // ============ Participant Management ============

    /// Join an event - any user can join
    public entry fun join_event(
        event: &mut Event,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if already joined
        assert!(!std::vector::contains(&event.participants, &sender), E_ALREADY_JOINED);
        
        // Add to participants
        std::vector::push_back(&mut event.participants, sender);
    }

    /// Leave an event - must be a participant
    public entry fun leave_event(
        event: &mut Event,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if participant
        let (contains, index) = std::vector::index_of(&event.participants, &sender);
        assert!(contains, E_NOT_PARTICIPANT);
        
        // Remove from participants
        std::vector::remove(&mut event.participants, index);
    }
}

