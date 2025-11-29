#[test_only]
module clubchain::admin_cap_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;
    use clubchain::admin_cap::{Self, ClubAdminCap};
    use clubchain::club;
    use std::string;

    const ADMIN: address = @0xA;
    const USER: address = @0xB;

    #[test]
    fun test_mint_admin_cap() {
        let mut scenario = ts::begin(ADMIN);
        let club_id = @0x123;

        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            let cap = admin_cap::mint_admin_cap(club_id, ctx);
            
            // Verify cap properties
            assert!(admin_cap::get_club_id(&cap) == club_id, 0);
            assert!(admin_cap::verify_admin(&cap, club_id), 1);
            
            test_utils::destroy(cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_verify_admin_valid() {
        let mut scenario = ts::begin(ADMIN);
        let club_id = @0x123;

        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            let cap = admin_cap::mint_admin_cap(club_id, ctx);
            
            // Should verify successfully for the correct club
            assert!(admin_cap::verify_admin(&cap, club_id), 0);
            
            test_utils::destroy(cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_verify_admin_invalid() {
        let mut scenario = ts::begin(ADMIN);
        let club_id = @0x123;
        let wrong_club_id = @0x456;

        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            let cap = admin_cap::mint_admin_cap(club_id, ctx);
            
            // Should fail verification for a different club
            assert!(!admin_cap::verify_admin(&cap, wrong_club_id), 0);
            
            test_utils::destroy(cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_club_creation_with_admin_cap() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Test Club"), string::utf8(b"Test description"), ctx);
        };

        // Verify admin cap was transferred to creator
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            
            // Admin should have received the cap
            assert!(admin_cap::get_club_id(&cap) != @0x0, 0);
            
            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = admin_cap::E_INVALID_CLUB_ID)]
    fun test_assert_admin_failure() {
        let mut scenario = ts::begin(ADMIN);
        let club_id = @0x123;
        let wrong_club_id = @0x456;

        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            let cap = admin_cap::mint_admin_cap(club_id, ctx);
            
            // This should abort with E_INVALID_CLUB_ID
            admin_cap::assert_admin(&cap, wrong_club_id);
            
            test_utils::destroy(cap);
        };

        ts::end(scenario);
    }
}


