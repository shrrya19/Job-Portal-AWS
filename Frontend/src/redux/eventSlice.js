import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
    name: "event",
    initialState: {
        allEvents: [],
        singleEvent: null,
        allAdminEvents: [],
        searchEventByText: "",
        eventFilters: {
            category: "",
            mode: "",
            price: "",
        },
    },
    reducers: {
        setAllEvents: (state, action) => {
            state.allEvents = action.payload;
        },

        setSingleEvent: (state, action) => {
            state.singleEvent = action.payload;
        },

        setAllAdminEvents: (state, action) => {
            state.allAdminEvents = action.payload;
        },

        setEventRegistration: (state, action) => {
            const { eventId, isRegistered, seatsLeft, registrationCount } = action.payload;
            state.allEvents = state.allEvents.map((event) =>
                event._id === eventId
                    ? { ...event, isRegistered, seatsLeft, registrationCount }
                    : event
            );
            if (state.singleEvent?._id === eventId) {
                state.singleEvent = {
                    ...state.singleEvent,
                    isRegistered,
                    seatsLeft,
                    registrationCount,
                };
            }
        },

        setSearchEventByText: (state, action) => {
            state.searchEventByText = action.payload;
        },

        setEventFilters: (state, action) => {
            state.eventFilters = { ...state.eventFilters, ...action.payload };
        },

    }
});

export const {
    setAllEvents,
    setSingleEvent,
    setAllAdminEvents,
    setEventRegistration,
    setSearchEventByText,
    setEventFilters,
} = eventSlice.actions;

export default eventSlice.reducer;