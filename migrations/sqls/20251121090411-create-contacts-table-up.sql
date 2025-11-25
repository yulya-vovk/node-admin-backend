/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT NOT NULL,
  work_schedule TEXT NOT NULL,
  social_media_vk TEXT NOT NULL,
  social_media_ya TEXT NOT NULL,
  social_media_two_gis TEXT NOT NULL
);