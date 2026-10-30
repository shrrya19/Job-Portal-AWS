import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
    name: "event",
    initialState: {
        allEvents: [],
        singleEvent: null,
        allAdminEvents: [],
        searchEventByText: "",
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

        setSearchEventByText: (state, action) => {
            state.searchEventByText = action.payload;
        },

    }
});

export const { setAllEvents, setSingleEvent, setAllAdminEvents, setSearchEventByText } = eventSlice.actions;

export default eventSlice.reducer;