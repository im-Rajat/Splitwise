# API Contracts: Authentication

**Base path**: `/api/auth`

## POST /api/auth/register

Create a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Rahul Kumar"
}
```

**Validation**:
- `email`: valid email format, max 255 chars
- `password`: min 8 chars, max 128 chars
- `name`: non-empty, max 100 chars

**Response 201**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Rahul Kumar",
  "createdAt": "2026-06-04T10:00:00Z"
}
```

**Response 409** (email already exists):
```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

---

## POST /api/auth/login

Authenticate and receive tokens.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response 200**:
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 900
}
```

**Response 401**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

## POST /api/auth/refresh

Refresh an expired access token.

**Request**:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response 200**:
```json
{
  "accessToken": "new-jwt-access-token",
  "expiresIn": 900
}
```

**Response 401**:
```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
  }
}
```
