import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    family: {
      type: String,
      required: true,
      index: true
    },
    isRevoked: {
      type: Boolean,
      default: false
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
      index: { expires: 0 } // TTL index: auto delete after 7 days
    }
  },
  {
    timestamps: false
  }
);

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
