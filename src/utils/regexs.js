const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/; // Minimum 8 chars, 1 uppercase, 1 number, 1 special char
const PHONE_REGEX = /^[0-9]{10}$/; // Exactly 10 digits

export { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX };
