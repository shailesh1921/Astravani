import { z } from 'zod';

export const requestOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters')
});

export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  otp: z
    .string({ required_error: 'Verification code is required' })
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits')
});

export const googleAuthSchema = z
  .object({
    idToken: z.string().optional(),
    credential: z.string().optional()
  })
  .refine((data) => Boolean(data.idToken || data.credential), {
    message: 'Google ID token (or credential) is required'
  })
  .transform((data) => ({
    idToken: data.idToken || data.credential
  }));


export const validateBody = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.errors[0];
      return res.status(400).json({
        success: false,
        error: firstIssue?.message || 'Invalid input data',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Invalid request body'
    });
  }
};
