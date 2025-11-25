/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  eng TEXT NOT NULL,
  title TEXT NOT NULL,
  src TEXT NOT NULL,
  prices TEXT NOT NULL,
  text TEXT NOT NULL
);