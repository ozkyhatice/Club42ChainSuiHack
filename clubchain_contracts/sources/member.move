module clubchain::member {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use clubchain::member_sbt;

    /// Member profile linked to 42 intra ID
    /// Represents a verified member of the 42 campus community
    public struct UserProfile has key, store {
        id: UID,
        intra_id: u64,          // 42 intra user ID (unique identifier)
        wallet_address: address, // Sui wallet address
        username: String,        // 42 username
        email: String,           // 42 email
        is_registered: bool,     // Registration status
    }

    /// Global registry to enforce one-wallet-per-member policy
    /// Prevents duplicate registrations and maintains identity integrity
    public struct UserRegistry has key {
        id: UID,
        // Maps intra_id -> wallet_address
        intra_to_wallet: Table<u64, address>,
        // Maps wallet_address -> intra_id
        wallet_to_intra: Table<address, u64>,
    }

    /// Initialize the registry (called once on deployment)
    /// Creates a shared registry object accessible to all users
    fun init(ctx: &mut TxContext) {
        let registry = UserRegistry {
            id: object::new(ctx),
            intra_to_wallet: table::new(ctx),
            wallet_to_intra: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    /// Register a new member with their 42 intra credentials
    /// Also mints a ClubMemberSBT (Soul-Bound Token) as proof of verified 42 identity
    /// 
    /// # Arguments
    /// * `registry` - The global UserRegistry shared object
    /// * `intra_id` - 42 intra user ID (must be unique)
    /// * `username` - 42 username
    /// * `email` - 42 email address
    /// * `clock` - Sui Clock object for timestamp
    /// 
    /// # Aborts
    /// * Error code 1: This intra_id is already registered
    /// * Error code 2: This wallet is already registered with another intra_id
    public entry fun register_user(
        registry: &mut UserRegistry,
        intra_id: u64,
        username: String,
        email: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Enforce single registration per intra_id (42 OAuth verification)
        assert!(!table::contains(&registry.intra_to_wallet, intra_id), 1);
        
        // Enforce single registration per wallet
        assert!(!table::contains(&registry.wallet_to_intra, sender), 2);

        // Create member profile
        let profile = UserProfile {
            id: object::new(ctx),
            intra_id,
            wallet_address: sender,
            username,
            email,
            is_registered: true,
        };

        // Update registry mappings
        table::add(&mut registry.intra_to_wallet, intra_id, sender);
        table::add(&mut registry.wallet_to_intra, sender, intra_id);

        // Mint ClubMemberSBT (Soul-Bound Token)
        let current_time = clock::timestamp_ms(clock);
        let sbt = member_sbt::mint_member_sbt(intra_id, username, current_time, ctx);

        // Transfer both profile and SBT to member
        transfer::transfer(profile, sender);
        member_sbt::transfer_to(sbt, sender);
    }

    /// Check if a 42 intra ID is already registered
    public fun is_intra_registered(registry: &UserRegistry, intra_id: u64): bool {
        table::contains(&registry.intra_to_wallet, intra_id)
    }

    /// Check if a wallet address is already registered
    public fun is_wallet_registered(registry: &UserRegistry, wallet: address): bool {
        table::contains(&registry.wallet_to_intra, wallet)
    }

    /// Get wallet address associated with an intra_id
    public fun get_wallet_by_intra(registry: &UserRegistry, intra_id: u64): address {
        *table::borrow(&registry.intra_to_wallet, intra_id)
    }

    /// Get intra_id associated with a wallet address
    public fun get_intra_by_wallet(registry: &UserRegistry, wallet: address): u64 {
        *table::borrow(&registry.wallet_to_intra, wallet)
    }

    #[test_only]
    /// Create a registry for testing purposes
    public fun create_registry_for_testing(ctx: &mut TxContext): UserRegistry {
        UserRegistry {
            id: object::new(ctx),
            intra_to_wallet: table::new(ctx),
            wallet_to_intra: table::new(ctx),
        }
    }
}

