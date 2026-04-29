CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('girl', 'mentor', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    otp TEXT,
    otp_expires TIMESTAMPTZ,
    online BOOLEAN NOT NULL DEFAULT false,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS otp TEXT,
    ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS online BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS mentor_requests (
    id BIGSERIAL PRIMARY KEY,
    girl_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT mentor_requests_unique_pair UNIQUE (girl_id, mentor_id),
    CONSTRAINT mentor_requests_not_self CHECK (girl_id <> mentor_id)
);

ALTER TABLE mentor_requests
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS mentor_requests_mentor_status_idx
    ON mentor_requests (mentor_id, status);

CREATE INDEX IF NOT EXISTS mentor_requests_girl_status_idx
    ON mentor_requests (girl_id, status);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room VARCHAR(255) NOT NULL,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('general', 'girls', 'mentor', 'dm')),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS room_type VARCHAR(20) NOT NULL DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS messages_room_created_at_idx
    ON messages (room, created_at);

CREATE INDEX IF NOT EXISTS messages_room_unread_idx
    ON messages (room, is_read);
