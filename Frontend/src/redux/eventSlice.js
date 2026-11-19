import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
    category: "",
    mode: "",
    price: "",
};

const initialState = {
    allEvents: [],
    singleEvent: null,
    allAdminEvents: [],
    searchEventByText: "",
    eventFilters: initialFilters,
};

const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        setAllEvents: (state, action) => {
            state.allEvents = Array.isArray(action.payload) ? action.payload : [];
        },

        setSingleEvent: (state, action) => {
            state.singleEvent = action.payload;
        },

        setAllAdminEvents: (state, action) => {
            state.allAdminEvents = Array.isArray(action.payload) ? action.payload : [];
        },

        setEventRegistration: (state, action) => {
            const { eventId, isRegistered, seatsLeft, registrationCount } = action.payload;
            state.allEvents = (state.allEvents || []).map((event) =>
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
            state.searchEventByText = typeof action.payload === "string" ? action.payload : "";
        },

        setEventFilters: (state, action) => {
            state.eventFilters = { ...(state.eventFilters || initialFilters), ...(action.payload || {}) };
        },

        resetEventFilters: (state) => {
            state.eventFilters = { ...initialFilters };
            state.searchEventByText = "";
        },
    },
    extraReducers: (builder) => {
        builder.addCase("persist/REHYDRATE", (state, action) => {
            if (action.payload?.event) {
                return {
                    ...initialState,
                    ...action.payload.event,
                    eventFilters: {
                        ...initialFilters,
                        ...(action.payload.event.eventFilters || {}),
                    },
                    searchEventByText: action.payload.event.searchEventByText || "",
                    allEvents: Array.isArray(action.payload.event.allEvents) ? action.payload.event.allEvents : [],
                };
            }
        });
    },
});

export const {
    setAllEvents,
    setSingleEvent,
    setAllAdminEvents,
    setEventRegistration,
    setSearchEventByText,
    setEventFilters,
    resetEventFilters,
} = eventSlice.actions;

export default eventSlice.reducer;