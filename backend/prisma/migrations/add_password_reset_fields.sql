-- Add password reset fields to users table
ALTER TABLE "users" 
ADD COLUMN "password_reset_token" TEXT,
ADD COLUMN "password_reset_expires" TIMESTAMP(3);

-- Create index for faster password reset token lookups
CREATE INDEX "idx_users_password_reset_token" ON "users"("password_reset_token");