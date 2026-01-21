ALTER TABLE reviews ADD COLUMN images JSON AFTER comment;
ALTER TABLE reviews ADD COLUMN pros TEXT AFTER images;
ALTER TABLE reviews ADD COLUMN cons TEXT AFTER pros;
ALTER TABLE reviews ADD COLUMN would_recommend BOOLEAN DEFAULT TRUE AFTER cons;
ALTER TABLE reviews ADD COLUMN verified_purchase BOOLEAN DEFAULT FALSE AFTER would_recommend;
ALTER TABLE reviews ADD INDEX idx_verified (verified_purchase);
