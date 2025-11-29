module clubchain::club {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;

    /// Club identity on-chain
    public struct Club has key {
        id: UID,
        name: String,
        admin: address,
    }

    /// Create a new club
    public entry fun create_club(
        name: String,
        ctx: &mut TxContext
    ) {
        let club = Club {
            id: object::new(ctx),
            name,
            admin: tx_context::sender(ctx),
        };
        transfer::share_object(club);
    }
}

