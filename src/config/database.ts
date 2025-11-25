import { Client } from 'pg';

const client = new Client({
  //connectionString: process.env.DATABASE_URL,
  user: 'admin',
  host: 'localhost',
  database: 'admin_api',
  password: process.env.POSTGRES_PASSWORD || 'adminpass', // ← обязательно как строка
  port: 5432,
});

client.connect();

export default client;