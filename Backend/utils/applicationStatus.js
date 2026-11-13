const LEGACY_STATUS_MAP = {
    pending: "applied",
    interview: "interview scheduled",
    "offer extended": "offer issued",
    hired: "offer accepted",
    accepted: "offer accepted",
    declined: "offer rejected"
};

export const normalizeApplicationStatus = (status) => {
    const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
    return LEGACY_STATUS_MAP[normalized] || normalized;
};
