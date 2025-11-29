module clubchain::event {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::string::String;

    /// Event struct - shared object
    public struct Event has key, store {
        id: UID,
        club_id: address,
        title: String,
        description: String,
        location: String,
        start_time: u64,  // Unix timestamp in milliseconds
        end_time: u64,
        creator: address,
        created_at: u64,
    }

    /// Create a new event
    public entry fun create_event(
        club_id: address,
        title: String,
        description: String,
        location: String,
        start_time: u64,
        end_time: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let event = Event {
            id: object::new(ctx),
            club_id,
            title,
            description,
            location,
            start_time,
            end_time,
            creator: tx_context::sender(ctx),
            created_at: clock::timestamp_ms(clock),
        };
        transfer::share_object(event);
    }

    /// Getter functions for frontend
    public fun get_title(event: &Event): String {
        event.title
    }

    public fun get_start_time(event: &Event): u64 {
        event.start_time
    }

    public fun get_end_time(event: &Event): u64 {
        event.end_time
    }

    public fun get_club_id(event: &Event): address {
        event.club_id
    }

    public fun get_description(event: &Event): String {
        event.description
    }

    public fun get_location(event: &Event): String {
        event.location
    }

    public fun get_creator(event: &Event): address {
        event.creator
    }

    public fun get_created_at(event: &Event): u64 {
        event.created_at
    }

    /// Check if two events have time conflict
    public fun has_conflict(event1: &Event, event2: &Event): bool {
        let start1 = event1.start_time;
        let end1 = event1.end_time;
        let start2 = event2.start_time;
        let end2 = event2.end_time;

        // Events conflict if one starts before the other ends
        (start1 < end2 && end1 > start2)
    }

    /// Check if event is in the future
    public fun is_future_event(event: &Event, current_time: u64): bool {
        event.start_time > current_time
    }

    /// Check if event is currently happening
    public fun is_ongoing(event: &Event, current_time: u64): bool {
        event.start_time <= current_time && event.end_time > current_time
    }
}

