/**
 * Twilio SMS helper – sends OTP for e-sign verification.
 * Falls back to console.log when credentials are not configured.
 */

export async function sendOtpSms(to: string, otp: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn(
      `[SMS STUB] OTP ${otp} would be sent to ${to} (Twilio not configured)`
    );
    return;
  }

  // Dynamic import so Twilio client is only loaded server-side
  const twilio = (await import("twilio")).default;
  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body: `Your RTPS signing code: ${otp}. Valid for 10 minutes.`,
    from,
    to,
  });
}

export function generateOtp(): string {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}
