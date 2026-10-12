import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required for OTP token'],
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required']
    },
    attempts: {
      type: Number,
      default: 0
    },
    ip: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index: removes document when current time passes expiresAt
    }
  },
  {
    timestamps: false
  }
);

// Compound index for querying active OTP by email
otpTokenSchema.index({ email: 1, createdAt: -1 });

export const OtpToken = mongoose.model('OtpToken', otpTokenSchema);
