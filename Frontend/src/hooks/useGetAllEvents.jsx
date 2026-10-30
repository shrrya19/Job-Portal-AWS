import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { setAllEvents } from "@/redux/eventSlice";

const useGetAllEvents = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const res = await axios.get(EVENT_API_ENDPOINT, {
                    withCredentials: true,
                });

                if (res.data.success) {
                    dispatch(setAllEvents(res.data.events));
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAllEvents();
    }, [dispatch]);
};

export default useGetAllEvents;