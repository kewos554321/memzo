# Feature: Authentication

## Overview

Users register and log in with email and password. The system issues JWT tokens delivered via two mechanisms:

- **Web app:** httpOnly session cookie (30-day expiry)
- **Browser extension:** Bearer token returned from a dedicated endpoint

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/register` | Registration page |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Log in, sets session cookie |
| POST | `/api/auth/logout` | None | Clear session cookie |
| GET | `/api/auth/me` | Cookie | Get current user |
| POST | `/api/ext/auth/token` | None | Extension login, returns Bearer token |

## Token Properties

- Algorithm: HS256
- Expiry: 30 days
- Payload: `{ userId: string }`

## Password Policy

- Minimum length: 6 characters
- Stored as bcrypt hash

## Flows

### Web Registration
1. POST `name`, `email`, `password` to `/api/auth/register`
2. Server validates fields and checks for duplicate email
3. Password hashed with bcryptjs
4. JWT set as httpOnly `session` cookie
5. Response: `{ success: true }`

### Web Login
1. POST `email`, `password` to `/api/auth/login`
2. Server verifies credentials
3. JWT set as httpOnly `session` cookie
4. Response: `{ success: true }`

### Extension Login
1. POST `email`, `password` to `/api/ext/auth/token`
2. Server returns `{ token, user }`
3. Extension stores token locally
4. All extension API requests include `Authorization: Bearer <token>`

## Acceptance Criteria

- [ ] User can register with name, email, password (min 6 chars)
- [ ] Duplicate email returns 400 with descriptive error
- [ ] User can log in with valid email and password
- [ ] Invalid credentials return 401
- [ ] Login sets httpOnly `session` cookie
- [ ] Logout clears session cookie and returns `{ success: true }`
- [ ] `GET /api/auth/me` returns current user or 401
- [ ] Unauthenticated access to protected pages redirects to `/login`
- [ ] Extension can get a Bearer token via `/api/ext/auth/token`
