module clubchain::event {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;
    use clubchain::admin_cap::{Self, ClubAdminCap};
    use clubchain::club::{Self, Club, ClubOwnerBadge};
    use clubchain::super_admin::{Self, SuperAdminCap};

    /// Error codes
    const E_NOT_CLUB_ADMIN: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_EMPTY_TITLE: u64 = 3;
    const E_EMPTY_DESCRIPTION: u64 = 4;
    const E_BADGE_EXPIRED: u64 = 5;
    const E_ALREADY_JOINED: u64 = 100;
    const E_NOT_PARTICIPANT: u64 = 101;

    /// Event struct - shared object
    /// Now includes Walrus blob ID for encrypted content
    public struct Event has key, store {
        id: UID,
        club_id: address,
        created_by: address,
        title: String,
        date: u64,
        description: String,
        participants: vector<address>,
        encrypted_content_blob_id: String, // Walrus blob ID for encrypted event content
    }

    // ============ Participation Badge (Soulbound Token) ============

    /// Soulbound token representing event participation
    /// Only `key` ability ensures it cannot be transferred (Soulbound)
    /// and cannot be discarded easily
    /// Badge name format: "{event_title} {DDMMYY}" (e.g., "toplu kutu oyunları etkinliği 241025")
    public struct ParticipationBadge has key {
        id: UID,
        event_id: address,
        name: String, // Immutable badge name: "{event_title} {DDMMYY}"
        event_title: String, // Full event title
        event_date: u64, // Event date timestamp (immutable)
        image_blob_id: String, // Walrus Blob ID for event photos
        encryption_key_hash: String, // Hash to verify decryption rights on frontend
    }

    /// Mint a ParticipationBadge for a user who joins an event
    /// Badge name format: "{event_title} {DDMMYY}"
    /// Example: "toplu kutu oyunları etkinliği 241025"
    /// This is called internally by join_event
    /// date_ddmmyy: Formatted date string in DDMMYY format (e.g., "241025" for 24.10.2025)
    fun mint_participation_badge(
        event_id: address,
        event_title: String,
        event_date: u64,
        date_ddmmyy: String, // DDMMYY format string from frontend (e.g., "241025")
        image_blob_id: String,
        encryption_key_hash: String,
        ctx: &mut TxContext
    ): ParticipationBadge {
        // Create badge name: "{event_title} {DDMMYY}"
        // Example: "toplu kutu oyunları etkinliği 241025"
        let mut badge_name = event_title;
        std::string::append_utf8(&mut badge_name, b" ");
        std::string::append(&mut badge_name, date_ddmmyy);
        
        ParticipationBadge {
            id: object::new(ctx),
            event_id,
            name: badge_name,
            event_title,
            event_date,
            image_blob_id,
            encryption_key_hash,
        }
    }

    /// Create a new event (requires valid ClubOwnerBadge)
    /// CRITICAL: Now requires a ClubOwnerBadge that must be valid (not expired)
    /// The badge is validated against the Clock to ensure it hasn't expired
    public entry fun create_event(
        owner_badge: &ClubOwnerBadge,
        club: &mut Club,
        title: String,
        description: String,
        date: u64,
        encrypted_content_blob_id: String,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ) {
        let club_id = object::id_address(club);
        let sender = tx_context::sender(ctx);
        
        // Validate the badge: must be valid (not expired) and match the club
        club::assert_badge_valid(owner_badge, club_id, clock);

        // Validate inputs
        assert!(std::string::length(&title) > 0, E_EMPTY_TITLE);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        let event = Event {
            id: object::new(ctx),
            club_id,
            created_by: sender,
            title,
            description,
            date,
            participants: std::vector::empty(),
            encrypted_content_blob_id,
        };
        let event_id = object::id_address(&event);
        transfer::share_object(event);
        club::push_event(club, event_id);
    }

    /// Create a new event using ClubAdminCap (CLUB ADMIN)
    /// Club admin can create events for their own club using ClubAdminCap
    public entry fun create_event_with_cap(
        cap: &ClubAdminCap,
        club_id: address,
        title: String,
        description: String,
        _location: String,
        start_time: u64,
        _end_time: u64,
        _clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ) {
        // Verify the caller has admin capability for this club
        admin_cap::assert_admin(cap, club_id);
        
        let sender = tx_context::sender(ctx);
        
        // Validate inputs
        assert!(std::string::length(&title) > 0, E_EMPTY_TITLE);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        let event = Event {
            id: object::new(ctx),
            club_id,
            created_by: sender,
            title,
            description,
            date: start_time, // Using start_time as the primary event date
            participants: std::vector::empty(),
            encrypted_content_blob_id: std::string::utf8(b""), // Empty for now, can be updated later
        };
        let _event_id = object::id_address(&event);
        transfer::share_object(event);
        
        // Note: We can't call club::push_event here because we don't have the Club object
        // Events will be tracked through queries by club_id
    }

    /// Create a new event (SUPER ADMIN ONLY)
    /// Super Admin can create events for any club without needing a ClubOwnerBadge
    public entry fun create_event_as_admin(
        super_admin: &SuperAdminCap,
        club: &mut Club,
        title: String,
        description: String,
        date: u64,
        encrypted_content_blob_id: String,
        ctx: &mut TxContext
    ) {
        // Verify super admin
        super_admin::assert_super_admin(super_admin);
        
        let sender = tx_context::sender(ctx);
        
        // Validate inputs
        assert!(std::string::length(&title) > 0, E_EMPTY_TITLE);
        assert!(std::string::length(&description) > 0, E_EMPTY_DESCRIPTION);
        
        let club_id = object::id_address(club);
        
        let event = Event {
            id: object::new(ctx),
            club_id,
            created_by: sender,
            title,
            description,
            date,
            participants: std::vector::empty(),
            encrypted_content_blob_id,
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

    public fun get_encrypted_content_blob_id(event: &Event): String {
        event.encrypted_content_blob_id
    }

    // ============ ParticipationBadge Getter Functions ============

    /// Get the badge name (immutable, format: "{event_title} {DDMMYY}")
    public fun get_name(badge: &ParticipationBadge): String {
        badge.name
    }

    /// Get the event ID from a ParticipationBadge
    public fun get_event_id(badge: &ParticipationBadge): address {
        badge.event_id
    }

    /// Get the event title from a ParticipationBadge
    public fun get_event_title(badge: &ParticipationBadge): String {
        badge.event_title
    }

    /// Get the event date timestamp from a ParticipationBadge
    public fun get_event_date(badge: &ParticipationBadge): u64 {
        badge.event_date
    }

    /// Get the image blob ID from a ParticipationBadge
    public fun get_image_blob_id(badge: &ParticipationBadge): String {
        badge.image_blob_id
    }

    /// Get the encryption key hash from a ParticipationBadge
    public fun get_encryption_key_hash(badge: &ParticipationBadge): String {
        badge.encryption_key_hash
    }

    // ============ Participant Management ============

    /// Join an event - any user can join
    /// Mints a ParticipationBadge (SBT) to the user upon joining
    /// Badge name will be: "{event_title} {date_ddmmyy}"
    /// date_ddmmyy: Formatted date string in DDMMYY format (e.g., "241025" for 24.10.2025)
    public entry fun join_event(
        event: &mut Event,
        date_ddmmyy: String, // DDMMYY format: "241025" for 24.10.2025
        image_blob_id: String,
        encryption_key_hash: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if already joined
        assert!(!std::vector::contains(&event.participants, &sender), E_ALREADY_JOINED);
        
        // Add to participants
        std::vector::push_back(&mut event.participants, sender);
        
        // Mint and transfer ParticipationBadge (SBT) to the user
        // Badge name: "{event_title} {date_ddmmyy}" (e.g., "toplu kutu oyunları etkinliği 241025")
        let event_id = object::id_address(event);
        let badge = mint_participation_badge(
            event_id,
            event.title,
            event.date,
            date_ddmmyy,
            image_blob_id,
            encryption_key_hash,
            ctx
        );
        transfer::transfer(badge, sender);
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

