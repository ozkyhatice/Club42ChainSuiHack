#[test_only]
module clubchain::event_participants_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use std::string;
    use clubchain::club::{Self, Club};
    use clubchain::event::{Self, Event};
    use clubchain::admin_cap::{Self, ClubAdminCap};

    // Test addresses
    const CLUB_OWNER: address = @0xA;
    const USER_1: address = @0xB;
    const USER_2: address = @0xC;
    const USER_3: address = @0xD;

    // Helper function to create a club and get its admin cap
    fun setup_club(scenario: &mut Scenario): (address, address) {
        ts::next_tx(scenario, CLUB_OWNER);
        {
            club::create_club(
                string::utf8(b"Test Club"),
                string::utf8(b"A test club for participants"),
                ts::ctx(scenario)
            );
        };

        ts::next_tx(scenario, CLUB_OWNER);
        let club = ts::take_shared<Club>(scenario);
        let club_id = object::id_address(&club);
        let admin_cap = ts::take_from_sender<ClubAdminCap>(scenario);
        let cap_id = object::id_address(&admin_cap);
        
        ts::return_to_sender(scenario, admin_cap);
        ts::return_shared(club);
        
        (club_id, cap_id)
    }

    // Helper function to create an event
    fun setup_event(scenario: &mut Scenario, club_id: address, cap_id: address, clock: &Clock): address {
        ts::next_tx(scenario, CLUB_OWNER);
        {
            let club = ts::take_shared_by_id<Club>(scenario, object::id_from_address(club_id));
            let admin_cap = ts::take_from_sender_by_id<ClubAdminCap>(scenario, object::id_from_address(cap_id));

            event::create_event(
                &admin_cap,
                &mut club,
                string::utf8(b"Test Event"),
                string::utf8(b"A test event for participants"),
                1234567890,
                ts::ctx(scenario)
            );

            ts::return_to_sender(scenario, admin_cap);
            ts::return_shared(club);
        };

        ts::next_tx(scenario, CLUB_OWNER);
        let event = ts::take_shared<Event>(scenario);
        let event_id = object::id_address(&event);
        ts::return_shared(event);
        
        event_id
    }

    #[test]
    fun test_user_can_join_event() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // User 1 joins the event
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            
            // Verify user is in participants
            let participants = event::get_participants(&event);
            assert!(std::vector::length(participants) == 1, 0);
            assert!(std::vector::contains(participants, &USER_1), 1);
            
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_multiple_users_can_join_event() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // User 1 joins
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User 2 joins
        ts::next_tx(&mut scenario, USER_2);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User 3 joins
        ts::next_tx(&mut scenario, USER_3);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            
            // Verify all users are participants
            let participants = event::get_participants(&event);
            assert!(std::vector::length(participants) == 3, 0);
            assert!(std::vector::contains(participants, &USER_1), 1);
            assert!(std::vector::contains(participants, &USER_2), 2);
            assert!(std::vector::contains(participants, &USER_3), 3);
            
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = clubchain::event::E_ALREADY_JOINED)]
    fun test_cannot_join_event_twice() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // User joins first time
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User tries to join again - should fail
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario)); // Should abort with E_ALREADY_JOINED
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_user_can_leave_event() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // User joins
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User leaves
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::leave_event(&mut event, ts::ctx(&mut scenario));
            
            // Verify user is no longer in participants
            let participants = event::get_participants(&event);
            assert!(std::vector::length(participants) == 0, 0);
            assert!(!std::vector::contains(participants, &USER_1), 1);
            
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = clubchain::event::E_NOT_PARTICIPANT)]
    fun test_cannot_leave_event_not_joined() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // User tries to leave without joining - should fail
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::leave_event(&mut event, ts::ctx(&mut scenario)); // Should abort with E_NOT_PARTICIPANT
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_user_can_rejoin_after_leaving() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // User joins
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User leaves
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::leave_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User rejoins
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            
            // Verify user is back in participants
            let participants = event::get_participants(&event);
            assert!(std::vector::length(participants) == 1, 0);
            assert!(std::vector::contains(participants, &USER_1), 1);
            
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_leave_event_with_multiple_participants() {
        let mut scenario = ts::begin(CLUB_OWNER);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Setup
        let (club_id, cap_id) = setup_club(&mut scenario);
        let event_id = setup_event(&mut scenario, club_id, cap_id, &clock);

        // All users join
        ts::next_tx(&mut scenario, USER_1);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        ts::next_tx(&mut scenario, USER_2);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        ts::next_tx(&mut scenario, USER_3);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::join_event(&mut event, ts::ctx(&mut scenario));
            ts::return_shared(event);
        };

        // User 2 leaves
        ts::next_tx(&mut scenario, USER_2);
        {
            let mut event = ts::take_shared_by_id<Event>(&mut scenario, object::id_from_address(event_id));
            event::leave_event(&mut event, ts::ctx(&mut scenario));
            
            // Verify only USER_1 and USER_3 remain
            let participants = event::get_participants(&event);
            assert!(std::vector::length(participants) == 2, 0);
            assert!(std::vector::contains(participants, &USER_1), 1);
            assert!(!std::vector::contains(participants, &USER_2), 2);
            assert!(std::vector::contains(participants, &USER_3), 3);
            
            ts::return_shared(event);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}


