import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_db',
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_do_not_use_in_prod_12345678',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_do_not_use_in_prod_87654321',
    accessExpiresIn: '15m',
    refreshExpiresInDays: 7
  },

  otp: {
    secret: process.env.OTP_SECRET || 'dev_otp_hmac_secret_key_change_in_production_99999',
    length: 6,
    expiryMinutes: 5,
    cooldownSeconds: 30,
    maxPerHourPerEmail: 5,
    maxPerHourPerIp: 5,
    maxAttempts: 5
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    from: process.env.EMAIL_FROM || 'Auth App <noreply@resend.dev>',
    resendApiKey: process.env.RESEND_API_KEY || '',
    brevoApiKey: process.env.BREVO_API_KEY || '',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  }
};
