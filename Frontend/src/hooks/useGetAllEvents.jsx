import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { setAllEvents } from "@/redux/eventSlice";

const useGetAllEvents = () => {
    const dispatch = useDispatch();
    const user = useSelector((store) => store.auth.user);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const res = await axios.get(EVENT_API_ENDPOINT, { withCredentials: true });
                if (res.data.success) {
                    let registeredIds = new Set();
                    if (user?.role === "student") {
                        try {
                            const registrationRes = await axios.get(`${EVENT_API_ENDPOINT}/registered`, { withCredentials: true });
                            registeredIds = new Set(registrationRes.data.eventIds || []);
                        } catch (error) {
                            console.error("Student event registrations could not be loaded:", error);
                        }
                    }
                    dispatch(setAllEvents((res.data.events || []).map((event) => ({
                        ...event,
                        isRegistered: registeredIds.has(event._id),
                    }))));
                }
            } catch (error) {
                console.error("Public event loading failed:", error);
            }
        };

        fetchAllEvents();
    }, [dispatch, user?._id, user?.role]);
};

export default useGetAllEvents;