import assert from "node:assert/strict";
import { validateEventPayload } from "./utils/eventValidation.js";

const now = new Date("2030-01-01T00:00:00.000Z");
const validPayload = {
  title: "Modern Web Development Workshop",
  description: "A practical workshop covering modern frontend and backend development.",
  companyId: "507f1f77bcf86cd799439011",
  category: "Workshop",
  mode: "Online",
  location: "Online",
  eventDate: "2030-02-01T10:00:00.000Z",
  registrationDeadline: "2030-01-31T10:00:00.000Z",
  registrationLink: "https://example.com/register",
  banner: "",
  price: 0,
  totalSeats: 50,
};

const valid = validateEventPayload(validPayload, now);
assert.equal(valid.error, undefined);
assert.equal(valid.value.title, validPayload.title);
assert.equal(valid.value.totalSeats, 50);

assert.match(validateEventPayload({ ...validPayload, title: "" }, now).error, /title/i);
assert.match(validateEventPayload({ ...validPayload, category: "Invalid" }, now).error, /category/i);
assert.match(validateEventPayload({ ...validPayload, eventDate: "2029-12-01T10:00:00.000Z" }, now).error, /future/i);
assert.match(validateEventPayload({ ...validPayload, registrationDeadline: "2030-02-02T10:00:00.000Z" }, now).error, /deadline/i);
assert.match(validateEventPayload({ ...validPayload, totalSeats: 1.5 }, now).error, /whole number/i);
assert.match(validateEventPayload({ ...validPayload, registrationLink: "javascript:alert(1)" }, now).error, /http or https/i);

console.log("ALL EVENT VALIDATION TESTS PASSED SUCCESSFULLY!");
