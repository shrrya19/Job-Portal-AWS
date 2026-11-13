export const INTERVIEW_TIME_SLOTS = [
    "09:00 AM - 09:45 AM",
    "10:00 AM - 10:45 AM",
    "11:15 AM - 12:00 PM",
    "02:00 PM - 02:45 PM",
    "03:15 PM - 04:00 PM",
    "04:30 PM - 05:15 PM",
    "06:00 PM - 06:45 PM",
    "07:30 PM - 08:15 PM"
];

export const parseInterviewDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
        ? null
        : date;
};

export const getLocalToday = (timezoneOffset = 0) => {
    const offset = Number(timezoneOffset);
    if (!Number.isInteger(offset) || offset < -840 || offset > 840) return null;
    return new Date(Date.now() - offset * 60_000).toISOString().slice(0, 10);
};

export const getInterviewDayRange = (date) => ({
    start: date,
    end: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1)
});
