
import { Client } from 'pg';
import fs from 'fs';

function getDbConfig(database = 'capybaradb') {
  const sslEnabled = /^(1|true|yes|on)$/i.test(process.env.DB_SSL || '');
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    ssl: sslEnabled
      ? {
          rejectUnauthorized: false
        }
      : undefined
  };
}

async function createdb() {
  const adminClient = new Client(getDbConfig('postgres'));
  try {
    await adminClient.connect();
    await adminClient.query(
      "CREATE DATABASE capybaradb WITH ENCODING 'UTF8' TEMPLATE template0"
    );
    console.log('Database capybaradb created successfully.');
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

async function migrate() {
  const dbClient = new Client(getDbConfig('capybaradb'));
  try {
    await dbClient.connect();
    const sql = fs.readFileSync('capybara.sql', 'utf8');
    await dbClient.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

async function main() {
  await createdb();
  await migrate();
}

main();