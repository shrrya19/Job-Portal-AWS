import React, { useEffect, useState } from "react";

const CountdownTimer = ({ eventDate }) => {
    const calculateTimeLeft = () => {
        const difference = new Date(eventDate) - new Date();

        if (difference <= 0) {
            return null;
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [eventDate]);

    if (!timeLeft) {
        return (
            <div className="bg-red-100 text-red-600 text-center py-3 rounded-lg font-semibold">
                Event Started / Registration Closed
            </div>
        );
    }

    return (
        <div className="bg-violet-50 border rounded-xl p-4 mt-4">

            <h3 className="text-center font-semibold mb-3">
                ⏳ Event Starts In
            </h3>

            <div className="grid grid-cols-4 gap-3">

                <div className="bg-white rounded-lg shadow p-3 text-center">
                    <p className="text-2xl font-bold">{timeLeft.days}</p>
                    <span className="text-sm text-gray-500">Days</span>
                </div>

                <div className="bg-white rounded-lg shadow p-3 text-center">
                    <p className="text-2xl font-bold">{timeLeft.hours}</p>
                    <span className="text-sm text-gray-500">Hours</span>
                </div>

                <div className="bg-white rounded-lg shadow p-3 text-center">
                    <p className="text-2xl font-bold">{timeLeft.minutes}</p>
                    <span className="text-sm text-gray-500">Minutes</span>
                </div>

                <div className="bg-white rounded-lg shadow p-3 text-center">
                    <p className="text-2xl font-bold">{timeLeft.seconds}</p>
                    <span className="text-sm text-gray-500">Seconds</span>
                </div>

            </div>

        </div>
    );
};

export default CountdownTimer;