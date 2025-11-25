/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS galleries (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  hidden BOOLEAN DEFAULT FALSE
);