import assert from "node:assert/strict";
import { normalizeApplicationStatus } from "./utils/applicationStatus.js";

assert.equal(normalizeApplicationStatus("under review"), "under review");
assert.equal(normalizeApplicationStatus("interview"), "interview scheduled");
assert.equal(normalizeApplicationStatus("offer extended"), "offer issued");
assert.equal(normalizeApplicationStatus("accepted"), "offer accepted");
assert.equal(normalizeApplicationStatus("declined"), "offer rejected");
assert.equal(normalizeApplicationStatus("INTERVIEW CLEARED"), "interview cleared");

console.log("ALL APPLICATION STATUS TESTS PASSED SUCCESSFULLY!");
