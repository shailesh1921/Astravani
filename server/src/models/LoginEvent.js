import mongoose from 'mongoose';

const loginEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    method: {
      type: String,
      enum: ['email_otp', 'google'],
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true
    },
    failureReason: {
      type: String,
      default: ''
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
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

export const LoginEvent = mongoose.model('LoginEvent', loginEventSchema);
