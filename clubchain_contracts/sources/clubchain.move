module clubchain::club_system {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::string::String;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    // === Error Codes ===
    const ENotAuthorized: u64 = 1;
    const EBadgeExpired: u64 = 2;
    const EWrongClub: u64 = 3;
    const EAlreadyJoined: u64 = 4;
    const EAlreadyRegistered: u64 = 5;
    const EInsufficientBalance: u64 = 6;
    const EInvalidAmount: u64 = 7;
    // === Badges ===
    /// Super Admin Cap (can create clubs and issue badges)
    public struct SuperAdminCap has key, store {
        id: UID
    }
    /// Club Owner Badge (Soulbound, not transferable)
    public struct ClubOwnerBadge has key {
        id: UID,
        club_id: ID,
        expiration_ms: u64,
        name: String
    }
    /// Member Badge (Soulbound, not transferable)
    public struct MemberBadge has key {
        id: UID,
        intra_id: String,
        username: String
    }
    /// Participation Badge (proof of event participation)
    public struct ParticipationBadge has key {
        id: UID,
        event_id: ID,
        event_title: String,
        image_blob_id: String
    }
    // === Main Objects ===
    public struct Club has key, store {
        id: UID,
        name: String,
        description: String,
        balance: u64,
        treasury: Coin<SUI>,
    }
    public struct Event has key, store {
        id: UID,
        club_id: ID,
        title: String,
        start_time: u64,
        end_time: u64,
        encrypted_blob_id: String,
        description: String
    }

    // EventCreated signal for frontend
    public struct EventCreated has copy, drop {
        event_id: ID,
        club_id: ID,
        title: String
    }

    // Donation event
    public struct DonationEvent has copy, drop {
        club_id: ID,
        donor: address,
        amount: u64
    }

    // Withdrawal event
    public struct WithdrawalEvent has copy, drop {
        club_id: ID,
        owner: address,
        amount: u64
    }

    /// Registry to track registered members (prevent duplicate badges)
    public struct MemberRegistry has key {
        id: UID,
        intra_to_wallet: Table<String, address>,
        wallet_to_intra: Table<address, String>,
    }

    // === Functions ===
    /// Initialize: Give SuperAdminCap to sender and create MemberRegistry
    fun init(ctx: &mut TxContext) {
        transfer::transfer(SuperAdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
        
        // Create and share MemberRegistry
        let registry = MemberRegistry {
            id: object::new(ctx),
            intra_to_wallet: table::new(ctx),
            wallet_to_intra: table::new(ctx),
        };
        transfer::share_object(registry);
    }
    /// Create Club (Anyone can create)
    /// Automatically issues ClubOwnerBadge to the creator (valid for 365 days)
    public entry fun create_club(
        name: String,
        desc: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let club = Club {
            id: object::new(ctx),
            name,
            description: desc,
            balance: 0,
            treasury: coin::zero<SUI>(ctx)
        };
        let club_id = object::uid_to_inner(&club.id);
        transfer::share_object(club);
        
        // Automatically issue ClubOwnerBadge to the creator (valid for 365 days)
        let expiration = clock::timestamp_ms(clock) + (365 * 86400000); // 365 days in milliseconds
        let badge = ClubOwnerBadge {
            id: object::new(ctx),
            club_id,
            expiration_ms: expiration,
            name
        };
        transfer::transfer(badge, sender);
    }

    /// Issue Club Owner Badge (Admin only, soulbound)
    public entry fun issue_owner_badge(
        _: &SuperAdminCap,
        club: &Club,
        recipient: address,
        days_valid: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let expiration = clock::timestamp_ms(clock) + (days_valid * 86400000);
        let badge = ClubOwnerBadge {
            id: object::new(ctx),
            club_id: object::uid_to_inner(&club.id),
            expiration_ms: expiration,
            name: club.name
        };
        // Soulbound: Only mint, no transfer function for badge
        transfer::transfer(badge, recipient);
    }

    /// Register and Issue Member Badge (Anyone can call, soulbound)
    /// Prevents duplicate registrations (same intra_id or wallet)
    public entry fun register_member(
        registry: &mut MemberRegistry,
        intra_id: String,
        username: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if intra_id is already registered
        assert!(!table::contains(&registry.intra_to_wallet, intra_id), EAlreadyRegistered);
        
        // Check if wallet is already registered
        assert!(!table::contains(&registry.wallet_to_intra, sender), EAlreadyRegistered);
        
        // Create and transfer badge
        let badge = MemberBadge {
            id: object::new(ctx),
            intra_id,
            username
        };
        transfer::transfer(badge, sender);
        
        // Update registry
        table::add(&mut registry.intra_to_wallet, intra_id, sender);
        table::add(&mut registry.wallet_to_intra, sender, intra_id);
    }

    /// Issue Member Badge (Admin only, for manual assignment)
    public entry fun issue_member_badge(
        _: &SuperAdminCap,
        registry: &mut MemberRegistry,
        recipient: address,
        intra_id: String,
        username: String,
        ctx: &mut TxContext
    ) {
        // Check if intra_id is already registered
        assert!(!table::contains(&registry.intra_to_wallet, intra_id), EAlreadyRegistered);
        
        // Check if wallet is already registered
        assert!(!table::contains(&registry.wallet_to_intra, recipient), EAlreadyRegistered);
        
        let badge = MemberBadge {
            id: object::new(ctx),
            intra_id,
            username
        };
        transfer::transfer(badge, recipient);
        
        // Update registry
        table::add(&mut registry.intra_to_wallet, intra_id, recipient);
        table::add(&mut registry.wallet_to_intra, recipient, intra_id);
    }

    /// Create Event (Only valid club owner)
    public entry fun create_event(
        badge: &ClubOwnerBadge,
        club: &Club,
        title: String,
        start_time: u64,
        end_time: u64,
        blob_id: String,
        description: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(badge.club_id == object::uid_to_inner(&club.id), EWrongClub);
        assert!(clock::timestamp_ms(clock) < badge.expiration_ms, EBadgeExpired);

        let id = object::new(ctx);
        let event_id = object::uid_to_inner(&id);

        let new_event = Event {
            id,
            club_id: object::uid_to_inner(&club.id),
            title: title,
            start_time,
            end_time,
            encrypted_blob_id: blob_id,
            description
        };

        transfer::share_object(new_event);

        event::emit(EventCreated {
            event_id,
            club_id: object::uid_to_inner(&club.id),
            title
        });
    }

    /// Join Event (Only with MemberBadge, prevent double join)
    public entry fun join_event(
        _: &MemberBadge,
        event: &Event,
        ctx: &mut TxContext
    ) {
        // Not implemented: Check if already joined (would require on-chain storage)
        // For now, just mint participation badge
        let proof = ParticipationBadge {
            id: object::new(ctx),
            event_id: object::uid_to_inner(&event.id),
            event_title: event.title,
            image_blob_id: event.encrypted_blob_id
        };
        transfer::transfer(proof, tx_context::sender(ctx));
    }

    /// Donate to Club (Only members with MemberBadge can donate)
    public entry fun donate_to_club(
        _: &MemberBadge,
        club: &mut Club,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let donor = tx_context::sender(ctx);
        let amount = coin::value(&payment);
        
        // Validate amount > 0
        assert!(amount > 0, EInvalidAmount);
        
        // Add amount to club balance
        club.balance = club.balance + amount;
        
        // Merge payment coin into treasury
        coin::join(&mut club.treasury, payment);
        
        // Emit donation event
        event::emit(DonationEvent {
            club_id: object::uid_to_inner(&club.id),
            donor,
            amount
        });
    }

    /// Withdraw Donations (Only club owner can withdraw)
    public entry fun withdraw_donations(
        owner_badge: &ClubOwnerBadge,
        club: &mut Club,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let club_id = object::uid_to_inner(&club.id);
        
        // Validate owner_badge.club_id == club.id
        assert!(owner_badge.club_id == club_id, EWrongClub);
        
        // Validate amount <= club.balance
        assert!(amount <= club.balance, EInsufficientBalance);
        
        // Validate amount > 0
        assert!(amount > 0, EInvalidAmount);
        
        // Validate treasury has enough coins
        let treasury_balance = coin::value(&club.treasury);
        assert!(amount <= treasury_balance, EInsufficientBalance);
        
        // Subtract amount from club balance
        club.balance = club.balance - amount;
        
        // Split coin from treasury
        let coin_to_transfer = coin::split(&mut club.treasury, amount, ctx);
        
        // Transfer coin to owner
        transfer::public_transfer(coin_to_transfer, owner);
        
        // Emit withdrawal event
        event::emit(WithdrawalEvent {
            club_id,
            owner,
            amount
        });
    }
}
