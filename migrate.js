
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function getDbConfig(database = 'capybaradb') {
  return {
    host: process.env.POSTGRES_SERVICE_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database,
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
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