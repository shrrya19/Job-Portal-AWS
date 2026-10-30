import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { setAllAdminEvents } from "@/redux/eventSlice";

const useGetAllAdminEvents = () => {
    const dispatch = useDispatch();

    useEffect(() => {

        const fetchAllAdminEvents = async () => {
            try {

                const res = await axios.get(
                    `${EVENT_API_ENDPOINT}/admin`,
                    {
                        withCredentials: true,
                    }
                );

                if (res.data.success) {
                    dispatch(setAllAdminEvents(res.data.events));
                }

            } catch (error) {
                console.log(error);
            }
        };

        fetchAllAdminEvents();

    }, [dispatch]);
};

export default useGetAllAdminEvents;