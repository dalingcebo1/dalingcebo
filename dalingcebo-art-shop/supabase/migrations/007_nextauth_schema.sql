-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  providerAccountId VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,

  PRIMARY KEY (id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  sessionToken VARCHAR(255) NOT NULL,

  PRIMARY KEY (id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  emailVerified TIMESTAMPTZ,
  image TEXT,

  PRIMARY KEY (id)
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT,
  token TEXT,
  expires TIMESTAMPTZ NOT NULL,

  PRIMARY KEY (identifier, token)
);

-- Create indexes and foreign keys
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_userId_fkey') THEN
        ALTER TABLE accounts ADD CONSTRAINT accounts_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_userId_fkey') THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create unique index on email if it doesn't exist (handled by PRIMARY KEY usually but email should be unique for auth)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_sessionToken_key ON sessions(sessionToken);

-- Create simple trigger to sync new users to customers table
CREATE OR REPLACE FUNCTION public.sync_user_to_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.name,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_to_customer();
