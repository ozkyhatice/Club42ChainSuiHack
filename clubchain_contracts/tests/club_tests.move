#[test_only]
module clubchain::club_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use clubchain::admin_cap::ClubAdminCap;
    use clubchain::club::{Self, Club};
    use std::string;

    const ADMIN: address = @0xA;
    const USER: address = @0xB;

    #[test]
    fun test_create_club() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Test Club"), string::utf8(b"Test description"), ctx);
        };

        // Verify club was created and shared
        ts::next_tx(&mut scenario, ADMIN);
        {
            let club = ts::take_shared<Club>(&scenario);
            
            assert!(club::get_name(&club) == string::utf8(b"Test Club"), 0);
            assert!(club::get_admin(&club) == ADMIN, 1);
            
            ts::return_shared(club);
        };

        // Verify admin cap was transferred to creator
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_update_club_name() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Original Name"), string::utf8(b"Test description"), ctx);
        };

        // Update club name with admin cap
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            let mut club = ts::take_shared<Club>(&scenario);
            
            club::update_club_name(&cap, &mut club, string::utf8(b"New Name"));
            
            assert!(club::get_name(&club) == string::utf8(b"New Name"), 0);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(club);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = club::E_EMPTY_NAME)]
    fun test_create_club_empty_name() {
        let mut scenario = ts::begin(ADMIN);
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            // Should abort with E_EMPTY_NAME
            club::create_club(string::utf8(b""), string::utf8(b"Test description"), ctx);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = club::E_EMPTY_NAME)]
    fun test_update_club_empty_name() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Original Name"), string::utf8(b"Test description"), ctx);
        };

        // Try to update with empty name - should fail
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            let mut club = ts::take_shared<Club>(&scenario);
            
            // Should abort with E_EMPTY_NAME
            club::update_club_name(&cap, &mut club, string::utf8(b""));
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(club);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_delete_club() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Test Club"), string::utf8(b"Test description"), ctx);
        };

        // Delete the club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            let club = ts::take_shared<Club>(&scenario);
            
            club::delete_club(&cap, club);
            
            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }
}


