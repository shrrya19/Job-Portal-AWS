const EMAIL_MESSAGE = "This email address is already registered. Please use another email.";
const PHONE_MESSAGE = "This phone number is already registered. Please use another phone number.";

export const getRegistrationDuplicateError = ({ existingEmail, existingPhone, fullName }) => {
    if (existingEmail && existingPhone) {
        const sameAccount =
            String(existingEmail._id) === String(existingPhone._id) &&
            String(existingEmail.fullName || "").trim().toLowerCase() ===
                String(fullName || "").trim().toLowerCase();

        return {
            message: sameAccount
                ? "User already exists. Please log in instead of registering again."
                : "An account with this email address and phone number already exists.",
            errors: {
                email: EMAIL_MESSAGE,
                phoneNumber: PHONE_MESSAGE
            }
        };
    }

    if (existingEmail) {
        return {
            message: EMAIL_MESSAGE,
            errors: { email: EMAIL_MESSAGE }
        };
    }

    if (existingPhone) {
        return {
            message: PHONE_MESSAGE,
            errors: { phoneNumber: PHONE_MESSAGE }
        };
    }

    return null;
};
