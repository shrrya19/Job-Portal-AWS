export const EVENT_CATEGORIES = [
  "Workshop",
  "Hackathon",
  "Seminar",
  "Bootcamp",
  "Conference",
  "Webinar",
];

export const EVENT_MODES = ["Online", "Offline", "Hybrid"];

const isHttpUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateEventPayload = (payload, now = new Date()) => {
  const eventDate = new Date(payload.eventDate);
  const registrationDeadline = new Date(payload.registrationDeadline);
  const price = Number(payload.price ?? 0);
  const totalSeats = Number(payload.totalSeats ?? 100);
  const title = String(payload.title ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const speaker = String(payload.speaker ?? "").trim();
  const location = String(payload.location ?? "").trim();
  const registrationLink = String(payload.registrationLink ?? "").trim();
  const banner = String(payload.banner ?? "").trim();

  if (title.length < 3 || title.length > 150) {
    return { error: "Event title must be between 3 and 150 characters." };
  }
  if (description.length < 20 || description.length > 10000) {
    return { error: "Description must be between 20 and 10,000 characters." };
  }
  if (!payload.companyId) {
    return { error: "Select a company for this event." };
  }
  if (!EVENT_CATEGORIES.includes(payload.category)) {
    return { error: "Select a valid event category." };
  }
  if (!EVENT_MODES.includes(payload.mode)) {
    return { error: "Select a valid event mode." };
  }
  if (!location || location.length > 200) {
    return { error: "Enter an event location of 1 to 200 characters." };
  }
  if (Number.isNaN(eventDate.getTime()) || eventDate <= now) {
    return { error: "Choose an event date and time in the future." };
  }
  if (
    Number.isNaN(registrationDeadline.getTime()) ||
    registrationDeadline <= now ||
    registrationDeadline > eventDate
  ) {
    return { error: "Registration deadline must be in the future and no later than the event." };
  }
  if (!Number.isFinite(price) || price < 0 || price > 10000000) {
    return { error: "Enter a valid non-negative event price." };
  }
  if (!Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > 1000000) {
    return { error: "Total seats must be a whole number between 1 and 1,000,000." };
  }
  if (!isHttpUrl(registrationLink) || !isHttpUrl(banner)) {
    return { error: "Registration and banner links must use http or https." };
  }
  if (speaker.length > 150) {
    return { error: "Speaker name cannot exceed 150 characters." };
  }

  return {
    value: {
      title,
      description,
      speaker,
      category: payload.category,
      mode: payload.mode,
      location,
      eventDate,
      registrationDeadline,
      registrationLink,
      banner,
      price,
      totalSeats,
      companyId: String(payload.companyId),
    },
  };
};
