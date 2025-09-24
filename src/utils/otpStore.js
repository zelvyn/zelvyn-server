// Simple in-memory OTP store (use Redis in production)
const otpStore = new Map();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const storeOTP = (email, otp, type = "email_verification") => {
  const key = `${email}_${type}`;
  otpStore.set(key, {
    otp,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
};

export const verifyOTP = (email, otp, type = "email_verification") => {
  const key = `${email}_${type}`;
  const stored = otpStore.get(key);

  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return false;
  }
  if (stored.otp !== otp) return false;

  otpStore.delete(key); // OTP used, remove it
  return true;
};

export const clearOTP = (email, type = "email_verification") => {
  const key = `${email}_${type}`;
  otpStore.delete(key);
};
