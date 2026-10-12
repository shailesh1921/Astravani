import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { config } from '../../config/env.js';
import { getOtpEmailTemplate } from './emailTemplates.js';

let resendClient = null;
if (config.email.resendApiKey) {
  resendClient = new Resend(config.email.resendApiKey);
}

let nodemailerTransporter = null;
if (config.email.smtp.user && config.email.smtp.pass) {
  nodemailerTransporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465,
    auth: {
      user: config.email.smtp.user,
      pass: config.email.smtp.pass
    }
  });
}

/**
 * Send an email via configured provider (Resend, Brevo, or Nodemailer fallback)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const from = config.email.from;

  // 1. Resend Provider (Free Tier)
  if (config.email.provider === 'resend' && resendClient) {
    try {
      const response = await resendClient.emails.send({
        from,
        to,
        subject,
        html,
        text
      });
      if (response.error) {
        console.warn('[Email Service] Resend error:', response.error);
      } else {
        return { success: true, provider: 'resend', id: response.data?.id };
      }
    } catch (err) {
      console.error('[Email Service] Resend dispatch error:', err.message);
    }
  }

  // 2. Brevo Provider (Free Tier: 300/day)
  if (config.email.provider === 'brevo' && config.email.brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': config.email.brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: from.includes('<') ? from.match(/<([^>]+)>/)[1] : from, name: 'Auth Service' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, provider: 'brevo', messageId: data.messageId };
      }
      console.warn('[Email Service] Brevo notice:', data);
    } catch (err) {
      console.error('[Email Service] Brevo dispatch error:', err.message);
    }
  }

  // 3. Nodemailer SMTP Fallback (Development/Testing)
  if (nodemailerTransporter) {
    try {
      const info = await nodemailerTransporter.sendMail({
        from,
        to,
        subject,
        html,
        text
      });
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error('[Email Service] Nodemailer dispatch error:', err.message);
    }
  }

  // 4. Fallback in development when no SMTP keys configured
  if (config.nodeEnv !== 'production') {
    console.log(`[Email Service Simulation] Sent email to ${to} (Subject: ${subject})`);
    return { success: true, provider: 'simulated' };
  }

  throw new Error('No email provider available to send message.');
};

/**
 * Send 6-Digit Email OTP with development console logging
 */
export const sendOtpEmail = async (email, otp, expiryMinutes = 5) => {
  const { html, text } = getOtpEmailTemplate(otp, expiryMinutes);
  const subject = `${otp} is your verification code`;

  // CRITICAL SECURITY REQUIREMENT:
  // In development only, log it to the SERVER console, guarded by NODE_ENV !== 'production'.
  // The OTP must NEVER appear in any API response or browser-visible output.
  if (config.nodeEnv !== 'production') {
    console.log('\n======================================================');
    console.log(`[SERVER DEV LOG] 6-DIGIT EMAIL OTP FOR: ${email}`);
    console.log(`[CODE]: >>> ${otp} <<<`);
    console.log(`Valid for ${expiryMinutes} minutes. Generated via crypto.randomInt`);
    console.log('======================================================\n');
  }

  return sendEmail({
    to: email,
    subject,
    html,
    text
  });
};
