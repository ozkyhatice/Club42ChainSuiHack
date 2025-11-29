module clubchain::member_sbt {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use std::string::String;

    /// Soul-Bound Token (SBT) representing verified 42 member status
    /// This token is non-transferable and serves as proof of 42 identity
    /// Having only `key` (not `store`) makes it non-transferable
    public struct ClubMemberSBT has key {
        id: UID,
        /// 42 intra user ID (unique identifier)
        intra_id: u64,
        /// 42 username
        username: String,
        /// Timestamp when the SBT was minted
        minted_at: u64,
    }

    /// Mint a new ClubMemberSBT for a verified 42 member
    /// This should only be called internally by the member module during registration
    /// Returns the SBT to be transferred to the member
    public(package) fun mint_member_sbt(
        intra_id: u64,
        username: String,
        minted_at: u64,
        ctx: &mut TxContext
    ): ClubMemberSBT {
        ClubMemberSBT {
            id: object::new(ctx),
            intra_id,
            username,
            minted_at,
        }
    }

    /// Transfer the SBT to a recipient
    /// This is a package-private function since the SBT should only be transferred
    /// during minting (soul-bound property)
    public(package) fun transfer_to(sbt: ClubMemberSBT, recipient: address) {
        sui::transfer::transfer(sbt, recipient);
    }

    // ============ Getter Functions ============

    /// Get the 42 intra ID from the SBT
    public fun get_intra_id(sbt: &ClubMemberSBT): u64 {
        sbt.intra_id
    }

    /// Get the username from the SBT
    public fun get_username(sbt: &ClubMemberSBT): String {
        sbt.username
    }

    /// Get the minting timestamp from the SBT
    public fun get_minted_at(sbt: &ClubMemberSBT): u64 {
        sbt.minted_at
    }

    /// Verify that an SBT belongs to a specific intra ID
    public fun verify_intra_id(sbt: &ClubMemberSBT, intra_id: u64): bool {
        sbt.intra_id == intra_id
    }
}

