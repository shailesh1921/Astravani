import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      trim: true,
      default: ''
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      index: true
    },
    failedOtpAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const User = mongoose.model('User', userSchema);
