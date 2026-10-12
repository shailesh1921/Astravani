/**
 * Clean, branded, responsive HTML template for Email OTP verification
 */
export const getOtpEmailTemplate = (otp, expiryMinutes = 5) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="480px" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Secure Verification Code
              </h1>
              <p style="margin: 6px 0 0; color: #e0e7ff; font-size: 13px; font-weight: 500;">
                One-time password for authentication
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #334155;">
                Use the following 6-digit code to complete your login or registration. This code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>

              <!-- 6-Digit OTP Box -->
              <div style="margin: 28px 0; padding: 18px 24px; background-color: #f1f5f9; border-radius: 12px; border: 2px dashed #cbd5e1; display: inline-block;">
                <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b; display: block; line-height: 1;">
                  ${otp}
                </span>
              </div>

              <p style="margin: 20px 0 0; font-size: 13px; color: #64748b; line-height: 20px;">
                Never share this verification code with anyone. Our support team will never ask for your code.
              </p>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px;" />

              <!-- Security Notice -->
              <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px 16px; text-align: left;">
                <p style="margin: 0; font-size: 12px; color: #991b1b; line-height: 18px;">
                  <strong>Didn't request this?</strong> If you did not attempt to sign in, you can safely ignore this email. No action is needed and your account is secure.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Automated security transmission • 256-bit encrypted delivery
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Your 6-Digit Verification Code: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not request this verification code, please ignore this email. Your account is completely secure.
  `.trim();

  return { html, text };
};
