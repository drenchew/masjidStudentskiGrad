-- Add campaign support columns to donations table
ALTER TABLE donations ADD COLUMN IF NOT EXISTS campaign_id BIGINT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) DEFAULT 'GENERAL';
ALTER TABLE donations ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'EUR';
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_purpose ON donations(purpose);

-- Update existing donations to have proper status
UPDATE donations SET payment_status = 'COMPLETED' WHERE payment_status IS NULL AND active = true;
UPDATE donations SET payment_status = 'PENDING' WHERE payment_status IS NULL AND active = false;
UPDATE donations SET purpose = 'GENERAL' WHERE purpose IS NULL;
UPDATE donations SET currency = 'EUR' WHERE currency IS NULL;

COMMIT;
