import assert from "node:assert/strict";
import { getRegistrationDuplicateError } from "./utils/registrationDuplicates.js";

const emailUser = { _id: "user-1", fullName: "Alex Rivera" };
const phoneUser = { _id: "user-1", fullName: "Alex Rivera" };

assert.equal(
    getRegistrationDuplicateError({ existingEmail: null, existingPhone: null, fullName: "Alex Rivera" }),
    null
);
assert.deepEqual(
    getRegistrationDuplicateError({ existingEmail: emailUser, existingPhone: null, fullName: "Someone Else" }),
    {
        message: "This email address is already registered. Please use another email.",
        errors: { email: "This email address is already registered. Please use another email." }
    }
);
assert.deepEqual(
    getRegistrationDuplicateError({ existingEmail: null, existingPhone: phoneUser, fullName: "Someone Else" }),
    {
        message: "This phone number is already registered. Please use another phone number.",
        errors: { phoneNumber: "This phone number is already registered. Please use another phone number." }
    }
);
assert.equal(
    getRegistrationDuplicateError({ existingEmail: emailUser, existingPhone: phoneUser, fullName: "alex rivera" }).message,
    "User already exists. Please log in instead of registering again."
);
assert.equal(
    getRegistrationDuplicateError({
        existingEmail: emailUser,
        existingPhone: { _id: "user-2", fullName: "Someone Else" },
        fullName: "Alex Rivera"
    }).message,
    "An account with this email address and phone number already exists."
);
assert.equal(
    getRegistrationDuplicateError({ existingEmail: null, existingPhone: null, fullName: "Alex Rivera" }),
    null,
    "Matching name alone must not block registration"
);

console.log("ALL REGISTRATION DUPLICATE TESTS PASSED SUCCESSFULLY!");
