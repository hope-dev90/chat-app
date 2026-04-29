# Chat Backend API Guide

Base URL: `http://localhost:3000`

All JSON requests must include:

```http
Content-Type: application/json
```

Protected endpoints must also include:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create the PostgreSQL tables:

```bash
psql -U YOUR_DB_USER -d YOUR_DB_NAME -f schema.sql
```

3. Configure `.env`:

```env
PORT=3000
JWT_SECRET=change_this_secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

4. Start the server:

```bash
npm run dev
```

The server prints OTP codes in the terminal for registration and password reset.

If startup says `password authentication failed`, check `DB_USER` and `DB_PASSWORD` in `.env`. The default PostgreSQL superuser is usually `postgres`, not `postgress`.

## Health Check

### GET `/`

Checks whether the server is running.

```bash
curl http://localhost:3000/
```

## Auth APIs

### POST `/auth/register`

Creates a girl or mentor account.

Body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "girl"
}
```

Success: `201`

```json
{
  "success": true,
  "message": "Registration successful! Check your email for OTP",
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "girl"
  }
}
```

### POST `/auth/verify-email`

Verifies the account using the OTP printed in the server terminal.

Body:

```json
{
  "email": "alice@example.com",
  "otp": "123456"
}
```

Success: `200`

### POST `/auth/login`

Logs in a verified user.

Body:

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

Success: `200`

Save the returned `token` for protected routes.

### GET `/auth/profile`

Returns the logged-in user profile.

Headers:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Success: `200`

### POST `/auth/forgot-password`

Creates a password reset OTP and prints it in the server terminal.

Body:

```json
{
  "email": "alice@example.com"
}
```

Success: `200`

### POST `/auth/reset-password`

Resets a password using the OTP.

Body:

```json
{
  "email": "alice@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

Success: `200`

## Mentor APIs

### GET `/mentor/all`

Girl-only. Lists all mentors.

Headers:

```http
Authorization: Bearer GIRL_TOKEN
```

Success: `200`

### POST `/mentor/request`

Girl-only. Sends a request to a mentor.

Headers:

```http
Authorization: Bearer GIRL_TOKEN
```

Body:

```json
{
  "mentorId": 2
}
```

Success: `201`

### GET `/mentor/my-requests`

Girl-only. Lists the girl's mentor requests.

Headers:

```http
Authorization: Bearer GIRL_TOKEN
```

Success: `200`

### GET `/mentor/my-mentor`

Girl-only. Returns the girl's approved mentor.

Headers:

```http
Authorization: Bearer GIRL_TOKEN
```

Success: `200`

If no mentor is approved yet: `404`.

### GET `/mentor/pending`

Mentor-only. Lists pending requests for the mentor.

Headers:

```http
Authorization: Bearer MENTOR_TOKEN
```

Success: `200`

### PUT `/mentor/approve/:requestId`

Mentor-only. Approves a mentor request.

Headers:

```http
Authorization: Bearer MENTOR_TOKEN
```

Example:

```bash
curl -X PUT http://localhost:3000/mentor/approve/1 \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

Success: `200`

### PUT `/mentor/reject/:requestId`

Mentor-only. Rejects a mentor request.

Headers:

```http
Authorization: Bearer MENTOR_TOKEN
```

Success: `200`

### GET `/mentor/my-mentees`

Mentor-only. Lists approved mentees for the mentor.

Headers:

```http
Authorization: Bearer MENTOR_TOKEN
```

Success: `200`

## Socket.IO Testing

Connect with:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

### Events You Emit

`joinRoom`

```js
socket.emit("joinRoom", {
  roomType: "general"
});
```

For a mentor/girl approved chat:

```js
socket.emit("joinRoom", {
  roomType: "mentor",
  otherUserId: 2
});
```

`sendMessage`

```js
socket.emit("sendMessage", {
  roomType: "general",
  message: "Hello everyone"
});
```

`deleteMessage`

```js
socket.emit("deleteMessage", {
  messageId: 1
});
```

`typing`, `stopTyping`, and `leaveRoom` receive a `room` value such as `general`, `girls`, `mentor_2_1`, or `dm_1_2`.

### Events You Receive

- `chatHistory`
- `receiveMessage`
- `messageDeleted`
- `unreadCount`
- `userOnline`
- `userOffline`
- `userTyping`
- `userStopTyping`
- `error`

## Common Error Responses

`400`: missing fields, invalid OTP, invalid credentials, duplicate request.

`401`: missing or invalid token.

`403`: wrong role for the endpoint.

`404`: route, mentor request, or approved mentor not found.

`500`: database/server error.
