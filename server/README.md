# Production-Ready Authentication System (Google Sign-In + Email OTP)

A zero-cost, security-hardened authentication architecture built with **Node.js, Express, MongoDB (Mongoose), React (Vite), and Tailwind CSS**. Runs completely on free tiers with **no SMS gateways and no paid services**.

---

## Architecture Overview

- **Authentication Methods:**
  1. **Google Identity Services (GSI):** Frontend 1-Tap / Button credential verified on backend via `google-auth-library`.
  2. **Email OTP (Passwordless):** Cryptographic 6-digit OTP generated via `crypto.randomInt`, hashed via HMAC-SHA256, delivered via **Resend** (3,000 free/mo) or **Brevo** (300 free/day) with Nodemailer SMTP fallback.
- **Account Linking:** Users sharing the same verified email automatically link to one unified account. Zero duplicate users.
- **Sessions & Storage:**
  - Short-lived JWT Access Token (15 minutes).
  - Refresh Token Rotation (RTR) stored hashed (SHA-256) with 7-day MongoDB TTL index.
  - Stored strictly in `httpOnly`, `Secure`, `SameSite` cookies (immune to XSS token theft).
  - **Theft / Reuse Detection:** Replay of a revoked refresh token immediately invalidates the entire session family.
- **Security Hardening:** Helmet headers, CSRF barrier headers, strict rate limiting per IP and email, constant-time `crypto.timingSafeEqual` comparison, anti-enumeration generic responses, disposable email domain blocking, and security audit log.

---

## 1. Project Folder Structure

```text
├── server/                              # Node.js + Express Backend
│   ├── .env.example                     # Environment template
│   ├── package.json                     # Express, Mongoose, Zod, Helmet, Resend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                   # Strongly typed environment configuration
│   │   │   └── db.js                    # MongoDB Mongoose lifecycle & autoIndex
│   │   ├── models/
│   │   │   ├── User.js                  # User schema (emailVerified, googleId, lockUntil)
│   │   │   ├── OtpToken.js              # HMAC-SHA256 hash storage with MongoDB TTL (5m)
│   │   │   ├── RefreshToken.js          # Hashed refresh token persistence with TTL (7d)
│   │   │   └── LoginEvent.js            # Security audit log (IP, userAgent, method, status)
│   │   ├── utils/
│   │   │   ├── cryptoUtils.js           # crypto.randomInt, HMAC, timingSafeEqual
│   │   │   └── disposableEmailCheck.js  # Blocks temporary email domains (Mailinator, etc.)
│   │   ├── services/
│   │   │   ├── email/
│   │   │   │   ├── emailTemplates.js    # Responsive branded HTML email template
│   │   │   │   └── emailService.js      # Resend, Brevo, and Nodemailer SMTP abstraction
│   │   │   ├── googleAuthService.js     # google-auth-library ID token verification
│   │   │   └── tokenService.js          # JWT access tokens, refresh tokens & cookies
│   │   ├── middleware/
│   │   │   ├── auth.js                  # requireAuth JWT verification middleware
│   │   │   ├── rateLimiter.js           # Global & endpoint rate limiters
│   │   │   ├── validate.js              # Strict Zod schema validation
│   │   │   └── errorHandler.js          # Leak-proof error handling
│   │   ├── controllers/
│   │   │   ├── emailAuthController.js   # /auth/email/request & /auth/email/verify
│   │   │   ├── googleAuthController.js  # /auth/google & account linking
│   │   │   └── sessionController.js     # /auth/refresh, /logout, /me, /profile, /account
│   │   ├── routes/
│   │   │   └── authRoutes.js            # Express API router
│   │   ├── app.js                       # Express app configuration
│   │   └── server.js                    # Server entry point
│   └── tests/
│       ├── emailOtp.test.js             # Email OTP test suite (8 tests)
│       ├── googleAuth.test.js           # Google login & account linking (4 tests)
│       └── sessionAndRefresh.test.js    # RTR, reuse detection & sessions (9 tests)
│
├── src/                                 # Frontend (Vite + React + Tailwind CSS)
│   ├── services/
│   │   ├── apiClient.ts                 # Axios withCredentials & silent refresh interceptor
│   │   └── authApi.ts                   # Strongly-typed auth endpoint calls
│   ├── context/
│   │   └── AuthContext.tsx              # React Context for user state & audit logs
│   └── components/auth/
│       ├── AuthCard.tsx                 # Google + Email OTP card with 6-box input
│       ├── LoginPage.tsx                # Split-layout branding login page
│       ├── ProtectedRoute.tsx           # Route shield wrapper
│       └── ProfilePage.tsx              # Profile, multi-device sessions & audit log
```

---

## 2. API Endpoint Reference

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/email/request` | No | Request 6-digit OTP code (anti-enumeration, 30s cooldown, max 5/hr) |
| `POST` | `/auth/email/verify` | No | Verify 6-digit OTP, create/login user, set `httpOnly` cookies |
| `POST` | `/auth/google` | No | Verify Google ID token, link account, set `httpOnly` cookies |
| `POST` | `/auth/refresh` | Cookie | Rotate refresh token with theft/reuse detection |
| `POST` | `/auth/logout` | No | Revoke current refresh token and clear cookies |
| `POST` | `/auth/logout-all` | Yes | Revoke all active sessions across all devices |
| `GET` | `/auth/me` | Yes | Get user profile & 10 recent login audit events |
| `PATCH`| `/auth/profile` | Yes | Update user name or avatar |
| `DELETE`| `/auth/account` | Yes | Permanently delete user account and associated sessions |
| `GET` | `/health` | No | Server health check |

---

## 3. Step-by-Step Provider Setup Guides (Free Tiers)

### A. Google OAuth 2.0 Client ID (Free)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `auth-production-app`).
3. Navigate to **APIs & Services > OAuth consent screen**:
   - User Type: **External**
   - App name: Your App Name (e.g., `AstraVani`)
   - User support email: your email
   - Developer contact email: your email
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   - Publish App (or add your testing emails in Testing mode).
4. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Web Client Auth`.
   - **Authorized JavaScript origins (CRITICAL):**
     - `http://localhost:5173` (for local Vite dev)
     - `https://your-frontend.vercel.app` (your production frontend domain)
     - `https://astravani.in` (if using custom domain)
   - Click **Create**.
5. Copy your **Client ID** (format: `xxxx-xxxx.apps.googleusercontent.com`).
   - Add to `server/.env`: `GOOGLE_CLIENT_ID=xxxx`
   - Add to frontend `.env`: `VITE_GOOGLE_CLIENT_ID=xxxx`

---

### B. Free Email Providers

#### Option 1: Resend (Recommended - 3,000 emails/month free)
1. Sign up free at [resend.com](https://resend.com).
2. Go to **API Keys** and click **Create API Key**.
3. Copy the key (`re_xxxxxxxx`).
4. Set in `server/.env`:
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxx
   EMAIL_FROM="Your App <onboarding@resend.dev>"  # For testing without domain
   # Once you add and verify your custom domain in Resend DNS (SPF/DKIM):
   # EMAIL_FROM="Your App <auth@yourdomain.com>"
   ```

#### Option 2: Brevo (300 emails/day free)
1. Sign up at [brevo.com](https://www.brevo.com).
2. Go to **Account > SMTP & API > API Keys** and generate a key.
3. Set in `server/.env`:
   ```bash
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=xkeysib-xxxxxxxx
   EMAIL_FROM="Your App <your-registered-email@gmail.com>"
   ```

#### Option 3: Local Nodemailer SMTP Fallback
In local development, if no API key is provided, the backend simulates delivery and logs the OTP directly to the server terminal:
```text
[SERVER DEV LOG] 6-DIGIT EMAIL OTP FOR: user@example.com
[CODE]: >>> 474954 <<<
Valid for 5 minutes. Generated via crypto.randomInt
```

---

### C. MongoDB Atlas (Free M0 Cluster)
1. Sign up free at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Sandbox cluster** (512MB free forever).
3. Under **Database Access**, create a user (e.g., `app_admin`) with a strong password.
4. Under **Network Access**, click **Add IP Address**:
   - For production deployment on Render/Vercel: Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect > Drivers (Node.js)** and copy your connection string:
   ```bash
   MONGODB_URI="mongodb+srv://app_admin:<password>@cluster0.mongodb.net/auth_db?retryWrites=true&w=majority"
   ```

---

## 4. Deployment Instructions

### Backend: Render.com (Free Web Service)
1. Push your repository to GitHub.
2. Sign up at [render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. In **Environment Variables**, add:
   ```bash
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-frontend.vercel.app
   MONGODB_URI=mongodb+srv://...
   JWT_ACCESS_SECRET=long_random_hex_string
   JWT_REFRESH_SECRET=long_random_hex_string
   OTP_SECRET=long_random_hex_string
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxx
   EMAIL_FROM="Auth App <auth@yourdomain.com>"
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```
6. Click **Deploy Web Service**. Render gives you a URL (e.g. `https://my-auth-api.onrender.com`).

---

### Frontend: Vercel (Free Hobby Tier)
1. In your project root, add your environment variable in `.env.production` or in Vercel project settings:
   ```bash
   VITE_API_URL=https://my-auth-api.onrender.com
   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```
2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```
3. Set your production domain in `CLIENT_URL` on Render to allow CORS with credentials.

---

## 5. Production Security Hardening Checklist

- [x] **Zero Plaintext OTPs:** Only salted HMAC-SHA256 hashes stored in MongoDB.
- [x] **Timing-Attack Resistance:** `crypto.timingSafeEqual` used for constant-time hash comparisons.
- [x] **Cross-Site Scripting (XSS) Immunity:** Tokens stored in `httpOnly`, `Secure` cookies inaccessible to JavaScript.
- [x] **Cross-Origin Cookie Configuration:** In production, cookies set `sameSite: 'none'` and `secure: true` for cross-subdomain communication.
- [x] **Refresh Token Rotation (RTR):** Single-use refresh tokens; replay triggers immediate invalidation of the entire family.
- [x] **Anti-Account Enumeration:** Generic response messages on OTP requests prevent checking whether an email is registered.
- [x] **Brute-Force & Denial-of-Service Defense:**
  - Rate limiting on OTP requests (5 per hour per email & IP).
  - 30-second resend cooldown.
  - Maximum 5 attempts per OTP code before auto-deletion.
  - User lockout (`lockUntil`) after repeated failed attempts.
- [x] **CSRF Defense:** `X-Requested-With: XMLHttpRequest` header verified on all state-changing API requests.
- [x] **Disposable Email Filtering:** Blocks disposable temporary inboxes to protect email reputation.
- [x] **Zero Token Leakage:** The OTP code never appears in API responses or client-accessible payloads.
