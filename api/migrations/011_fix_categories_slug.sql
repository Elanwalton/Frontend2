ALTER TABLE categories ADD COLUMN slug VARCHAR(255) NULL UNIQUE AFTER name;
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
