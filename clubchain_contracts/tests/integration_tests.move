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

    #[test]
    fun test_full_club_and_event_flow() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Chess Club"), ctx);
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
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize registry (happens in init)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            // Manually create registry for testing
            let registry = member::create_registry_for_testing(ctx);
            sui::transfer::share_object(registry);
        };

        // Register a user
        ts::next_tx(&mut scenario, USER);
        {
            let mut registry = ts::take_shared<UserRegistry>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let ctx = ts::ctx(&mut scenario);
            
            member::register_user(
                &mut registry,
                42,
                string::utf8(b"testuser"),
                string::utf8(b"test@student.42.fr"),
                &clock,
                ctx
            );
            
            clock::destroy_for_testing(clock);
            ts::return_shared(registry);
        };

        // Verify user received both profile and SBT
        ts::next_tx(&mut scenario, USER);
        {
            let profile = ts::take_from_sender<UserProfile>(&scenario);
            let sbt = ts::take_from_sender<ClubMemberSBT>(&scenario);
            
            // Verify SBT properties
            assert!(clubchain::member_sbt::get_intra_id(&sbt) == 42, 0);
            assert!(clubchain::member_sbt::get_username(&sbt) == string::utf8(b"testuser"), 1);
            
            ts::return_to_sender(&scenario, profile);
            ts::return_to_sender(&scenario, sbt);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_event_cancellation() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Sports Club"), ctx);
        };

        // Create an event
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
                string::utf8(b"Basketball Game"),
                string::utf8(b"Match against rivals"),
                string::utf8(b"Gym"),
                1000000,
                2000000,
                &clock,
                ctx
            );
            
            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(club);
        };

        // Cancel the event
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            let mut event = ts::take_shared<Event>(&scenario);
            
            event::cancel_event(&cap, &mut event);
            assert!(event::is_cancelled(&event) == true, 0);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(event);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_update_event() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create a club
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            club::create_club(string::utf8(b"Music Club"), ctx);
        };

        // Create an event
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
                string::utf8(b"Concert"),
                string::utf8(b"Rock concert"),
                string::utf8(b"Auditorium"),
                1000000,
                2000000,
                &clock,
                ctx
            );
            
            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(club);
        };

        // Update the event
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<ClubAdminCap>(&scenario);
            let mut event = ts::take_shared<Event>(&scenario);
            
            event::update_event(
                &cap,
                &mut event,
                string::utf8(b"Jazz Concert"),
                string::utf8(b"Jazz evening"),
                string::utf8(b"Main Hall"),
                1500000,
                2500000
            );
            
            assert!(event::get_title(&event) == string::utf8(b"Jazz Concert"), 0);
            assert!(event::get_start_time(&event) == 1500000, 1);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(event);
        };

        ts::end(scenario);
    }
}

