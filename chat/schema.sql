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
    message TEXT NOT NULL DEFAULT '',
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages
    ALTER COLUMN message SET DEFAULT '',
    ADD COLUMN IF NOT EXISTS room_type VARCHAR(20) NOT NULL DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS file_url TEXT,
    ADD COLUMN IF NOT EXISTS file_name TEXT,
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS messages_room_created_at_idx
    ON messages (room, created_at);

CREATE INDEX IF NOT EXISTS messages_room_unread_idx
    ON messages (room, is_read);

CREATE TABLE IF NOT EXISTS custom_emojis (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE custom_emojis
    ADD COLUMN IF NOT EXISTS name VARCHAR(80),
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS custom_emojis_created_by_idx
    ON custom_emojis (created_by);

CREATE TABLE IF NOT EXISTS reactions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji_type VARCHAR(20) NOT NULL CHECK (emoji_type IN ('standard', 'custom')),
    standard_emoji TEXT,
    custom_emoji_id BIGINT REFERENCES custom_emojis(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT reactions_has_one_emoji CHECK (
        (emoji_type = 'standard' AND standard_emoji IS NOT NULL AND custom_emoji_id IS NULL)
        OR
        (emoji_type = 'custom' AND custom_emoji_id IS NOT NULL AND standard_emoji IS NULL)
    )
);

ALTER TABLE reactions
    ADD COLUMN IF NOT EXISTS message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS emoji_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS standard_emoji TEXT,
    ADD COLUMN IF NOT EXISTS custom_emoji_id BIGINT REFERENCES custom_emojis(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS reactions_unique_standard_idx
    ON reactions (message_id, user_id, standard_emoji)
    WHERE standard_emoji IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reactions_unique_custom_idx
    ON reactions (message_id, user_id, custom_emoji_id)
    WHERE custom_emoji_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS reactions_message_id_idx
    ON reactions (message_id);
