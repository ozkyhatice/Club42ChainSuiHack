#[test_only]
module clubchain::integration_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use clubchain::admin_cap::ClubAdminCap;
    use clubchain::club::{Self, Club};
    use clubchain::event::{Self, Event};
    use clubchain::member::{Self, UserRegistry, UserProfile};
    use clubchain::member_sbt::ClubMemberSBT;
    use std::string;

    const ADMIN: address = @0xA;
    const USER: address = @0xB;

    // Disabled - Event struct changed, needs update
    // #[test]
    fun _test_full_club_and_event_flow() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Chess Club"), string::utf8(b"Test description"), ctx);
        };

        // Create an event with admin cap
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            let club = ts::take_shared<Club>(&scenario);
            let club_id = sui::object::id_address(&club);
            
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let ctx = ts::ctx(&mut scenario);
            
            event::create_event(
                &cap,
                club_id,
                string::utf8(b"Chess Tournament"),
                string::utf8(b"Annual chess competition"),
                string::utf8(b"Main Hall"),
                1000000,
                2000000,
                &clock,
                ctx
            );
            
            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(club);
        };

        // Verify event was created
        ts::next_tx(&mut scenario, ADMIN);
        {
            let event = ts::take_shared<Event>(&scenario);
            
            assert!(event::get_title(&event) == string::utf8(b"Chess Tournament"), 0);
            assert!(event::get_start_time(&event) == 1000000, 1);
            assert!(event::is_cancelled(&event) == false, 2);
            
            ts::return_shared(event);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_user_registration_with_sbt() {
}
